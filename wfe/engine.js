if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', './process', './processDefinition',
        './flowNode', './Token', './notify', './requestStorage'],
    function(UObject, Process, Definition, FlowNode, Token, Notify, RequestStorage) {
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
                _token.state = Token.tokenState.alive;
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
                    console.log('Процесс [%s] активирован', _process.processID)
                    return _process;
                }
                else {
                    throw 'Неизвестный ID процесса'
                }
            },

            deactivateProcess: function (processInstance) {
                console.log('Процесс [%s] деактивирован', processInstance.processID)
            },

            continueProcess : function (token) {
                var _newToken = token.processInstance.dequeueToken();
                if (_newToken !== null && _newToken.tokenID != token.tokenID){
                    _newToken.execute();
                }
                else {
                    this.deactivateProcess(token.processInstance);
                }
            },

            exposeRequest : function(request, eventParams, callback){
                this.requestStorage.addRequest(request, callback);
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
