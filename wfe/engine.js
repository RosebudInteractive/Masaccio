if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

var engineInstance;

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', './process', './processDefinition', './Activities/activity',
        './flowNode', './sequenceFlow', './Token', './notify', './Activities/userTask', './requestStorage'],
    function(UObject, Process, Definition, Activity, FlowNode, SequenceFlow, Token, Notify, UserTask, RequestStorage) {
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
            init: function (cm, params) {
                this._super(cm, params);

                this.notifier = new Notify(cm)
                this.activeProcesses = [];
                this.requestStorage = new RequestStorage(cm);
                //var _id = this.testAddProcessDefinition();
                //this.startProcessInstance(_id);
            },

            name: function (value) {
                return this._genericSetter("Name", value);
            },

            state: function (value) {
                return this._genericSetter("State", value);
            },

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

            runProcess : function(processInstance, callback)
            {
                this.processes.push(processInstance);

                this.defineTokens(processInstance);

                this.activeProcesses.push(processInstance);

                //this.activeProcesses.forEach()

                var _startToken = processInstance.dequeueToken();
                _startToken.currentNode.state = FlowNode.state.Initialized;
                var result = _startToken.execute();

                callback(result);
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

            addRequest : function (request) {
                /* В калипсо была доп проверка на существование реквеста в хранилище */
                this.requests.push(request)
            },

            deactivateProcess: function (processInstance) {
                console.log('Процесс [%s] деактивирован', processInstance.processID)
            },

            findProcess: function (processID) {
                for (i = 0; i < this.processes.length; i++) {
                    if (this.processes[i].processID == processID) {return this.processes[i]}
                };

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

            continueProcess : function (token) {
                var _newToken = token.processInstance.dequeueToken();
                if (_newToken !== null && _newToken.tokenID != token.tokenID){
                    _newToken.execute();
                }
                else {
                    this.deactivateProcess(token.processInstance);
                }
            },

            submitResponse : function(response) {
                var _processID = response.processID;
                /* Todo : сделать RequestStorage */
                if (this.isRequestExists()) {
                    var _process = this.activateProcess(_processID);
                    var _token = _process.getToken(response.tokenID);
                    _token.addResponse(response);

                    var _receivingNode = _token.currentNode;
                    /* Todo ТОКЕN!!!  Может быть много токенов, возможно надо передавать токен в execute() */
                    _receivingNode.execute();
                }
            },

            isRequestExists : function(requestID) {
                return (this.getRequest(requestID) !== null);
            },

            getRequest : function(requestID){
                for (var i = 0; i < this.requests.length; i++) {
                    if (this.requests[i].ID = requestID) {return this.requests[i]}
                };

                return null;
            },


            testAddProcessDefinition : function() {
                var _definition = new Definition(this.pvt.controlMgr, {});
                _definition.definitionID = "60cac005-4dbb-4a22-beb1-1afae6604791";
                _definition.name = 'Определение тестового процесса';

                new FlowNode(this.pvt.controlMgr, {});

                var _activity1 = new Activity(this.pvt.controlMgr);
                _activity1.name = "testActivity1";

                var _userTask =  new UserTask(this.pvt.controlMgr);
                _userTask.name = 'UserTask1';
                var _request = _userTask.addRequest('Реквест1');
                _request.addParameter('param1');

                var _activity2 = new Activity(this.pvt.controlMgr);
                _activity2.name = "testActivity2";

                _definition.addActivity(_activity1);
                _definition.addActivity(_userTask);
                _definition.addActivity(_activity2);

                var _sq1 = new SequenceFlow(this.pvt.controlMgr);
                _sq1.connect(_activity1, _userTask);
                _definition.addConnector(_sq1);

                var _sq2 = new SequenceFlow(this.pvt.controlMgr);
                _sq2.connect(_userTask, _activity2);
                _definition.addConnector(_sq2);

                this.addProcessDefinition(_definition);

                return _definition.definitionID;
            }

        });

        return Engine;
    }
);
