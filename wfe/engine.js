if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    //var Class = require('class.extend');
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        './process',
        './processDefinition',
        './flowNode',
        './token',
        './notify',
        './requestStorage',
        './Gateways/gateway',
        './Gateways/exclusiveGateway',
        'fs',
        './engineInitializer'
    ],
    function(
        UObject,
        Process,
        Definition,
        FlowNode,
        Token,
        Notify,
        RequestStorage,
        Gateway,
        ExclusiveGateway,
        fs,
        Initializer
    ) {
        var Engine = UObject.extend({

            className: "Engine",
            classGuid: UCCELLO_CONFIG.classGuids.Engine,
            metaFields: [
                //{
                //    fname: "Notifier",
                //    ftype: {
                //        type: "ref",
                //        res_elem_type: UCCELLO_CONFIG.classGuids.Notifier
                //    }
                //},
                {
                    fname: "RequestStorage", ftype: {
                    type: "ref",
                    res_elem_type: UCCELLO_CONFIG.classGuids.RequestStorage
                }
                }
            ],
            metaCols: [
                {'cname' : 'Definitions', 'ctype' : 'ProcessDefinition'},
                {'cname' : 'Processes', 'ctype' : 'Process'}
            ],

            /**
             * @constructs
             * @param cm {ControlMgr} - менеджер контролов, к которому привязан данный контрол
             * @param params
             */

            //init: function (cm, params) {
            init: function (initParams) {
                this.db = Initializer.createInternalDb(initParams.dbController);
                this.controlManager = Initializer.createControlManager(this.db);
                this.constructHolder = initParams.constructHolder;
                Initializer.registerTypes(this.controlManager);

                UccelloClass.super.apply(this, [this.controlManager, {}]);

                this.notifier = new Notify();
                this.requestStorage = new RequestStorage();
                this.uploadedProcesses = [];
                this.tokensArchive = [];
            },

            //<editor-fold desc="MetaFields & MetaCols">
            definitions : function() {
                return this.getCol('Definitions');
            },

            processes : function() {
                return this.getCol('Processes');
            },
            //</editor-fold>

            /*  ----- Definitions ----- */
            findDefinition: function (definitionID)
            {
                for (var i = 0; i < this.definitions().count(); i++) {
                    var _def = this.definitions().get(i);
                    if (_def.definitionID() == definitionID) {
                        return _def;
                    }
                }
            },

            addProcessDefinition : function(definiton)
            {
                var _def = this.findDefinition(definiton.definitionID())
                if (!_def) {
                    this.definitions()._add(definiton);
                    console.log('[%s] : => Добавлено описание процесса [%s]', (new Date()).toLocaleTimeString(), definiton.name())
                }

            },
            /*  ----- Definitions ----- */


            startProcessInstance : function(definitionID)
            {
                console.log('[%s] : => Создание процесса definitionID [%s]', (new Date()).toLocaleTimeString(), definitionID);
                var _process = this.createNewProcess(definitionID);
                if (_process) {
                    console.log('[%s] : => запуск процесса processID [%s]', (new Date()).toLocaleTimeString(), _process.processID());
                    this.runProcess(_process, function (result) {
                        //console.log(result + ' [%s]', _process.processID)
                    });

                    return _process.processID();
                } else {
                    console.log('[%s] : => не удалось создать процесс', (new Date()).toLocaleTimeString());
                }
            },

                createNewProcess: function (definitionID)
                {
                    console.log('[%s] : => Создание инстанса процесса %s', (new Date()).toLocaleTimeString(), definitionID);
                    var _def = this.findDefinition(definitionID);
                    if (_def) {
                        return new Process(this.pvt.controlMgr, {}, _def)
                    }
                },

                runProcess : function(processInstance, callback)
                {
                    this.processes()._add(processInstance);

                    this.defineTokens(processInstance);

                    processInstance.activate();
                    var _startToken = processInstance.dequeueToken();
                    _startToken.currentNode().state(FlowNode.state.Initialized);
                    var result = _startToken.execute();

                    callback(result);
                },

                findProcess: function (processID) {
                    for (var i = 0; i < this.processes().count(); i++) {
                        if (this.processes().get(i).processID() == processID) {return this.processes().get(i)}
                    };

                    for (var i = 0; i < this.uploadedProcesses.length; i++) {
                        if (this.uploadedProcesses[i] == processID) {
                            var _process = this.deserializeProcess(processID, this.createComponentFunction);
                            this.processes()._add(_process);
                            this.uploadedProcesses.splice(i, 1);

                            return _process;
                        }
                    }

                    return null;
                },

                defineTokens: function (processInstance) {
                    var _token = new Token(this.getControlManager(), {parent  : processInstance, colName : 'Tokens'});
                    var _node = processInstance.getStartNode();
                    if (!_node) {
                        throw 'Неопределен стартовый узел для процесса'
                    }
                    _token.currentNode(_node.getInstance(_token));
                    _token.state(Token.state.Alive);
                    processInstance.enqueueToken(_token);
                },

            getProcessInstance : function(processID)
            {
                for (var i = 0; i < this.processes().count(); i++) {
                    var _process = this.processes().get(i);
                    if (_process.processID() == processID) { return _process; }
                }

                return null;
            },

            activateProcess : function(processID) {
                var _process = this.findProcess(processID);
                if (_process) {
                    _process.activate();
                    return _process;
                }
                else {
                    throw 'Неизвестный ID процесса'
                }
            },

            deactivateProcess: function (processInstance) {
                if (!processInstance.isAllTokensDead()) {
                    console.log('[%s] : => Процесс [%s] деактивирован', (new Date()).toLocaleTimeString(), processInstance.processID());
                    if (!processInstance.isWaitingScriptAnswer())
                        processInstance.wait();
                } else {
                    processInstance.finish();
                }

            },

            startOutgoingNodes : function(token) {
                var _newToken = null;

                var _process = token.processInstance();
                var _outgoingNodes = token.currentNode().getOutgoingNodes();

                if (_outgoingNodes.length > 0) {
                    var _isGateway = (token.currentNode() instanceof Gateway);
                    var _isExclusiveGateWay = (token.currentNode() instanceof ExclusiveGateway);
                    var _hasSingleIn = token.currentNode().incoming().count() <= 1;
                    var _hasSingleOut = _outgoingNodes.length == 1;

                    var _needNewToken = _isGateway && !_isExclusiveGateWay && (_hasSingleIn && !_hasSingleOut);

                    if (_needNewToken) {
                        token.die();
                        for (var i = 0; i < _outgoingNodes.length; i++){
                            _newToken = new Token(this.getControlManager(), {parent  : _process, colName : 'Tokens'});
                            _newToken.currentNode(_outgoingNodes[i].getInstance(_newToken));
                            _newToken.currentNode().state(FlowNode.state.Initialized);
                            _newToken.state(Token.state.Alive);
                            _newToken.copyNodePropsFromToken(token);
                            _process.enqueueToken(_newToken);
                            _process.activate()
                        }
                    } else {
                        token.currentNode().close();
                        token.currentNode(_outgoingNodes[0].getInstance(token));
                        token.currentNode().state(FlowNode.state.Initialized);
                        _process.enqueueToken(token);
                        _process.activate()
                    }
                } else {
                    token.die();
                    token.currentNode().close();
                }

                this.switchTokens(token);
            },

            switchTokens : function(token){
                var _process = this.getActiveProcess(token.processInstance().processID());
                var _token;

                if (_process !== null) {
                    var _newToken = _process.dequeueToken();
                    if (_newToken && _process.canContinue()) {
                        _token = _newToken
                    } else {
                        _token = token
                    }

                    _process.currentToken(_token);
                    _token.execute()
                } else {
                    /* Todo : здесь какая-то лажа!!!! */
                    if (!token.processInstance().isWaiting()) {
                        if (!token.processInstance().isAllTokensDead()) {
                            token.currentNode().close();
                            token.execute();
                        }
                    }
                }
            },

            getActiveProcess : function(processID) {
                for (var i = 0; i < this.processes().count(); i++) {
                    var _process = this.processes().get(i);
                    if (_process.processID() == processID && _process.isRunning()){
                        return _process;
                    }
                };

                return null;
            },

            exposeRequest : function(request, eventParams){
                this.requestStorage.addRequest(request);
                console.log('[%s] : => Выставлен request [%s]', (new Date()).toLocaleTimeString(), request.name());
                this.notifier.notify(eventParams);
            },

            submitResponse : function(response, callback) {
                var _processID = response.processID();
                if (this.requestStorage.isRequestExists(response.ID())) {

                    var _process = this.findProcess(_processID);
                    if (_process.canContinue()) {
                        _process = this.activateProcess(_processID);
                    }

                    var _token = _process.getToken(response.tokenID());
                    _token.addResponse(response);

                    var _receivingNode = _token.currentNode();
                    if (_process.isRunning()){
                        /* Todo ТОКЕN!!!  Может быть много токенов, возможно надо передавать токен в execute() */
                        _receivingNode.execute(function() {
                            _token.execute();
                        });
                    } else {
                        if (!_process.isTokenInQueue(_token)) {
                            _process.enqueueToken(_token)
                        }

                        _receivingNode.execute();
                    }
                    setTimeout(function() {
                        /* Todo : результат в callback */
                        if (callback) {callback};
                        _token.execute();
                    }, 0);
                }
            },

            saveProcess : function(processID) {
                this.serializeProcess(processID);
                for (var i = 0; i < this.processes().count();i++) {
                    var _process = this.processes().get(i);
                    if (_process.processID() == processID) {
                        this.processes()._del(_process);
                        this.uploadedProcesses.push(processID);
                    }
                }
            },

            serializeProcess : function(processID) {
                var _process = this.getProcessInstance(processID);

                if (_process) {
                    var _obj = _process.pvt.db.serialize(_process);
                    if (_obj) {
                        fs.writeFileSync(UCCELLO_CONFIG.processStorage + processID + '.txt', JSON.stringify(_obj));
                        console.log('[%s] : {{ Процесс [%s] выгружен из памяти', (new Date()).toLocaleTimeString(), processID)
                    }
                }
            },

            deserializeProcess : function(processID, callback){
                var _obj = fs.readFileSync(UCCELLO_CONFIG.processStorage + processID + '.txt');
                _obj = JSON.parse(_obj);

                var _process = this.pvt.db.deserialize(_obj, {}, callback);
                console.log('[%s] : }} Процесс [%s] восстановлен', (new Date()).toLocaleTimeString(), processID);
                fs.unlink(UCCELLO_CONFIG.processStorage + processID + '.txt');

                return _process;
            },

            getControlManager : function() {
                return this.controlManager;
            },

            archiveToken : function(token) {
                var _process = this.findProcess(token.processInstance().processID());
                this.tokensArchive.push({processID : _process.processID(), token : token})
                _process.tokens()._del(token);
            }
        });

        return Engine;
    }
);
