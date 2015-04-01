if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', './process'],
    function(UObject, Process) {
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
            }

        });
        return Engine;
    }
);