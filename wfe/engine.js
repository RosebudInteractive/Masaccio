if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

var tokenState = {alive: 0, dead: 1};
var flowNodeState = {Passive : 0, Initialized : 1, Executing : 2, WaitingRequest : 3,
    WaitingTokens : 4, ExecutionComplete : 5, Closed : 6};
var processStates = {Initialized : 0, Running : 1, Finished : 2, Aborted : 3, Waiting : 4, None : 5};

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', './process', './processDefinition', './Activities/activity',
        './flowNode', './sequenceFlow', './Token'],
    function(UObject, Process, Definition, Activity, FlowNode, SequenceFlow, Token) {
        var Engine = UObject.extend({

            className: "Engine",
            classGuid: UCCELLO_CONFIG.classGuids.Engine,
            metaFields: [{fname: "Name", ftype: "string"}, {fname: "State", ftype: "string"}],
            metaCols: [],

            definitions: [],
            processes: [],
            requests: [],



            /**
             * @constructs
             * @param cm {ControlMgr} - менеджер контролов, к которому привязан данный контрол
             * @param params
             */
            init: function (cm, params) {
                this._super(cm, params);

                var _id = this.testAddProcessDefinition();
                this.startProcessInstance(_id);
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

            createNewProcess: function (definitionID)
            {
                console.log('Создание инстанса процесса %s', definitionID);
                var _def = this.findDefinition(definitionID);
                if ((_def !== null) && (_def !== undefined))
                {
                    return new Process(this.pvt.controlMgr, {name : 'Тестовый просесс'}, _def)
                }
            },

            runProcess : function(processInstance, callback)
            {
                this.processes.push(processInstance);

                this.defineTokens(processInstance);

                var _startToken = processInstance.dequeueToken();
                _startToken.currentNode.state = flowNodeState.Initialized;
                var result = this.executeToken(_startToken);

                callback(result);
            },

            defineTokens: function (processInstance) {
                var _token = new Token(this.pvt.controlMgr, {}, processInstance);
                _token.currentNode = processInstance.getStartNode();
                _token.state = tokenState.alive;
                processInstance.enqueueToken(_token);
            },



            executeToken : function(token) {
                var _processInstance = token.processInstance;
                _processInstance.state = processStates.Running;

                switch (token.currentNode.state){
                    case flowNodeState.Initialized : {
                        /*Todo : добавить работу с параметрами*/
                        token.currentNode.state = flowNodeState.Executing;
                        return this.executeToken(token);
                        //break;
                    };
                    case (flowNodeState.Executing) : {
                        this.executeNode(token);
                        return this.executeToken(token);
                        //break;
                    };
                    case (flowNodeState.WaitingRequest) : {};
                    case (flowNodeState.ExecutionComplete) : {
                        var _nextNode = this.getNexTokenNode(token);
                        if (_nextNode !== undefined) {
                            token.currentNode = _nextNode;
                            token.currentNode.state = flowNodeState.Initialized;
                        }
                        else {
                            token.currentNode.state = flowNodeState.Closed;
                        };

                        return this.executeToken(token);
                        //break;
                    };
                    case (flowNodeState.Closed) : { return "Token " + token.tokenID + " выполнен"; };
                    default : { return "Неизвестный статус узла" };
                }


            },

            getNexTokenNode: function (token) {
                return (token.currentNode.outgoing[0] !== undefined) ? token.currentNode.outgoing[0].target : undefined;
            },

            executeNode: function (token) {
                return token.currentNode.execute()
            },

            getProcessInstance : function(processID)
            {
                for (var i in this.processes) {
                    if (!this.processes.hasOwnProperty(i)) continue;

                    var _process = this.processes[i];

                    if (_process.processID == processID) { return _process; }
                }

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

            testAddProcessDefinition : function() {
                var _definition = new Definition(this.pvt.controlMgr, {});
                _definition.definitionID = "60CAC005-4DBB-4A22-BEB1-1AFAE6604791";
                _definition.name = 'Определение тестового процесса';

                new FlowNode(this.pvt.controlMgr, {});
                var _activity1 = new Activity(this.pvt.controlMgr);
                _activity1.name = "testActivity1";
                var _activity2 = new Activity(this.pvt.controlMgr);
                _activity2.name = "testActivity2";

                _definition.addActivity(_activity1);
                _definition.addActivity(_activity2);
                var _sq = new SequenceFlow(this.pvt.controlMgr);
                _sq.connect(_activity1, _activity2);
                _definition.addConnector(_sq);
                this.addProcessDefinition(_definition);

                return _definition.definitionID;
            }

        });

        return Engine;
    }
);