if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', './process', './processDefinition', './activity', './flowNode', './sequenceFlow'],
    function(UObject, Process, Definition, Activity, FlowNode, SequenceFlow) {
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

                this.testAddProcess();
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
                if ((_def !== null) && (_def !== undefined))
                {
                    this.definitions.push(definiton);
                }
            },

            createNewProcess: function (definitionID)
            {
                var _def = this.findDefinition(definitionID);
                if ((_def !== null) && (_def !== undefined))
                {
                    return new Process(definitionID)
                }
            },

            runProcess : function(processInstance)
            {
                /*TODO : Запустить процесс, пока не знаю что здесь делать*/

                this.processes.push(processInstance);
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
                var _process = this.createNewProcess(definitionID);
                this.runProcess(_process);
                return _process.ProcessID;
            },

            testAddProcess : function() {
                var _definition = new Definition(this.pvt.controlMgr, {definitionID : "60CAC005-4DBB-4A22-BEB1-1AFAE6604791"})
                new FlowNode(this.pvt.controlMgr, {});
                var _activity1 = new Activity(this.pvt.controlMgr, {name : "testActivity1"});
                var _activity2 = new Activity(this.pvt.controlMgr, {name : "testActivity2"});
                _definition.addActivity(_activity1);
                _definition.addActivity(_activity2);
                var _sq = new SequenceFlow(this.pvt.controlMgr);
                _sq.source = _activity1;
                _sq.target = _activity2;
                _definition.addConnector(_sq)
                this.addProcessDefinition(_definition);
            }

        });
        return Engine;
    }
);