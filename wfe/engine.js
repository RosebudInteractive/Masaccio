if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
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
        './Gateways/exclusiveGateway'
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
        ExclusiveGateway
    ) {
        var Engine = UObject.extend({

            className: "Engine",
            classGuid: UCCELLO_CONFIG.classGuids.Engine,
            metaFields: [{fname: "Name", ftype: "string"}, {fname: "State", ftype: "string"}],
            metaCols: [],

            definitions: [],
            processes: [],
            //requests: [],

            /**
             * @constructs
             * @param cm {ControlMgr} - менеджер контролов, к которому привязан данный контрол
             * @param params
             */

            /* FIELDS */
            init: function (cm, params) {
                this._super(cm, params);

                this.notifier = new Notify(cm)
                this.activeProcesses = [];
                this.requestStorage = new RequestStorage(cm);
            },

            name: function (value) {
                return this._genericSetter("Name", value);
            },

            state: function (value) {
                return this._genericSetter("State", value);
            },

            /*  ----- Definitions ----- */
            findDefinition: function (definitionID)
            {
                for (var i in this.definitions) {
                    if (!this.definitions.hasOwnProperty(i)) continue;

                    var _def = this.definitions[i];

                    if (_def.definitionID == definitionID) {
                        return _def;
                    }
                }
            },

            addProcessDefinition : function(definiton)
            {
                var _def = this.findDefinition(definiton.definitionID)
                if ((_def === null) || (_def === undefined))
                {
                    this.definitions.push(definiton);
                    console.log('Добавлено описание процесса [%s]', definiton.name)
                }

            },
            /*  ----- Definitions ----- */


            startProcessInstance : function(definitionID)
            {
                console.log('Создание процесса definitionID [%s]', definitionID);
                var _process = this.createNewProcess(definitionID);
                console.log('запуск процесса processID [%s]', _process.processID);
                this.runProcess(_process, function(result){
                    console.log(result + ' [%s]', _process.processID)
                });

                return _process.ProcessID;
            },

                createNewProcess: function (definitionID)
                {
                    console.log('Создание инстанса процесса %s', definitionID);
                    var _def = this.findDefinition(definitionID);
                    if ((_def !== null) && (_def !== undefined))
                    {
                        return new Process(this.pvt.controlMgr, {}, _def)
                    }
                },

                runProcess : function(processInstance, callback)
                {
                this.processes.push(processInstance);

                this.defineTokens(processInstance);

                this.activeProcesses.push(processInstance);

                var _startToken = processInstance.dequeueToken();
                _startToken.currentNode.state = FlowNode.state.Initialized;
                var result = _startToken.execute();

                callback(result);
            },

                findProcess: function (processID) {
                for (i = 0; i < this.processes.length; i++) {
                    if (this.processes[i].processID == processID) {return this.processes[i]}
                };

                return null;
            },

                defineTokens: function (processInstance) {
                var _token = new Token(this.pvt.controlMgr, {}, processInstance);
                _token.currentNode = processInstance.getStartNode();
                _token.state = Token.state.alive;
                processInstance.enqueueToken(_token);
            },

            getProcessInstance : function(processID)
            {
                for (var i in this.processes) {
                    if (!this.processes.hasOwnProperty(i)) continue;

                    var _process = this.processes[i];

                    if (_process.processID == processID) { return _process; }
                }

                return null;
            },

            activateProcess : function(processID) {
                var _process = this.findProcess(processID);
                if (_process !== null) {
                    console.log('Процесс [%s] активирован', _process.processID);
                    _process.state = Process.state.Running;
                    return _process;
                }
                else {
                    throw 'Неизвестный ID процесса'
                }
            },

            deactivateProcess: function (processInstance) {
                console.log('Процесс [%s] деактивирован', processInstance.processID);
                processInstance.state = Process.state.Waiting;
            },

            switchToken : function(token) {
                //throw 'NotImplementedException';
                var _newToken = null;

                var _process = token.processInstance;
                var _outgoingNodes = token.currentNode.getOutgoingNodes();

                var _isGateway = token.currentNode === Gateway;
                var _isExclusiveGateWay = token.currentNode === ExclusiveGateway;
                var _hasSingleIn = token.currentNode.incoming <= 1;
                var _hasSingleOut = _outgoingNodes.length == 1;

                var _needNewToken = _isGateway && !_isExclusiveGateWay && !(_hasSingleIn && !_hasSingleOut);

                if (_needNewToken) {
                    for (var i = 0; i < _outgoingNodes.length; i++){
                        _newToken = new Token(this.pvt.controlMgr, {}, _process);
                        _newToken.currentNode = _outgoingNodes[i];
                        _newToken.state = Token.state.alive;
                        _newToken.copyNodePropsFromToken(token);
                        _process.enqueueToken(_newToken);
                    }
                } else {
                    token.currentNode.close();
                    token.currentNode = _outgoingNodes[0];
                    token.currentNode.state = FlowNode.state.Initialized;
                    _process.enqueueToken(token);
                }

                this.continueProcess(token);
            },

            continueProcess : function (token) {
                var _process = this.getActiveProcess(token.processInstance.processID)

                if (_process !== null) {
                    var _newToken = _process.dequeueToken();
                    if (_newToken !== null) {
                        _newToken.execute();
                    }
                    else {
                        this.deactivateProcess(token.processInstance);
                    }
                } else {
                    if (!token.processInstance.isAllTokensDead()) {
                        token.currentNode.state = FlowNode.state.Closed;
                        token.execute();
                    }
                }
            },

            getActiveProcess : function(processID) {
                for (var i = 0; this.processes.length; i++) {
                    if (this.processes[i].processID == processID && this.processes[i].state == Process.state.Running){
                        return this.processes[i];
                    }
                };

                return null;
            },

            exposeRequest : function(request, eventParams, callback){
                this.requestStorage.addRequest(request, callback);
                console.log('Выставлен request [%s]', request.name);
                this.notifier.notify(eventParams);
            },

            submitResponse : function(response) {
                var _processID = response.processID;
                /* Todo : сделать RequestStorage */
                if (this.requestStorage.isRequestExists(response.ID)) {
                    var _process = this.activateProcess(_processID);
                    var _token = _process.getToken(response.tokenID);
                    _token.addResponse(response);

                    var _receivingNode = _token.currentNode;
                    /* Todo ТОКЕN!!!  Может быть много токенов, возможно надо передавать токен в execute() */
                    _receivingNode.execute();
                    var _callback = this.requestStorage.getCallback(response.ID);
                    _callback(_token);
                }
            }
        });

        return Engine;
    }
);
