/**
 * Created by staloverov on 11.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        UCCELLO_CONFIG.uccelloPath + 'resman/dataTypes/resource',
        '../public/utils',
        './parameter',
        './controls',
        './Activities/activity',
        './Activities/userTask',
        './Activities/scriptTask',
        './Activities/callActivity',
        './Gateways/exclusiveGateway',
        './Gateways/inclusiveGateway',
        './sequenceFlow',
        './userScript',
        './answer',
        './Events/Start/startEvent',
        './Events/End/endEvent',
        './Messages/messageFlow',
        './Events/eventReferences',
        './Messages/correlationKey'
    ],
    function(
        UObject,
        Resource,
        Utils,
        Parameter,
        Controls,
        Activity,
        UserTask,
        ScriptTask,
        CallActivity,
        ExclusiveGateway,
        InclusiveGateway,
        SequenceFlow,
        UserScript,
        Answer,
        StartEvent,
        EndEvent,
        MessageFlow,
        EventRef,
        CorrelationKey
    ){
        var ProcessDefinition = Resource.extend({

            //<editor-fold desc="Class description">
            className: "ProcessDefinition",
            classGuid : Controls.guidOf('ProcessDefinition'),
            metaFields: [
                //{fname : "ResName", ftype : "string"},
                {fname : 'DefinitionID', ftype : 'string'}
            ],
            metaCols: [
                {'cname' : 'Parameters', 'ctype' : 'Parameter'},
                {'cname' : 'InputParameters', 'ctype' : 'Parameter'},
                {'cname' : 'Connectors', 'ctype' : 'SequenceFlow'},
                {'cname' : 'Nodes', 'ctype' : 'FlowNode'},

                {'cname' : 'Requests', 'ctype' : 'Request'},
                {'cname' : 'Scripts', 'ctype' : 'UserScript'},

                {'cname' : 'MessageFlows', 'ctype' : 'MessageFlow'},
                {'cname' : 'CorrelationKeys', 'ctype' : 'CorrelationKey'}

            ],

            elemNamePrefix: "Field",
            //</editor-fold>

            //<editor-fold desc="MetaFields & MetaCols">
            name: function(value) {
                return this._genericSetter("ResName",value);
            },

            definitionID: function(value) {
                return this._genericSetter("DefinitionID",value);
            },

            parameters : function() {
                return this.getCol('Parameters');
            },

            inputParameters : function() {
                return this.getCol('InputParameters');
            },

            connectors : function(){
                return this.getCol('Connectors');
            },

            nodes : function(){
                return this.getCol('Nodes');
            },

            //messageDefinitions : function() {
            //    return this.getCol('MessageDefinitions');
            //},

            messageFlows : function() {
                return this.getCol('MessageFlows');
            },

            correlationKeys : function() {
                return this.getCol('CorrelationKeys');
            },
            //</editor-fold>

            getControlManager : function() {
                return this.pvt.controlMgr;
            },

            scripts : function(){
                return this.getCol('Scripts');
            },

            getRoot : function() {
                return this;
            },

            getOrCreateScript : function(script) {
                var _script;

                for (var i = 0; i < this.scripts().count(); i++) {
                    _script = this.scripts().get(i);
                    if (_script.isEqualTo()) {
                        return _script;
                    }
                }

                _script = new UserScript(this.getControlManager(), {parent : this, colName : 'Scripts'});
                _script.parse(script);
                return _script;
            },

            addParameter : function(parameterName) {
                var _param = new Parameter(this.getControlManager(), {parent : this, colName : 'Parameters'});
                _param.name(parameterName);
                return _param;
            },

            clone : function(){
                var _newDefinition = new ProcessDefinition(this.pvt.controlMgr, {});

                _newDefinition.definitionID(this.definitionID());
                _newDefinition.name(this.name());
                Utils.copyCollection(this.nodes(), _newDefinition.nodes());
                Utils.copyCollection(this.connectors(), _newDefinition.connectors());

                return _newDefinition;
            },

            findNode : function(node) {
                for (var i = 0; i < this.nodes().count(); i++) {
                    var _node = this.nodes().get(i);
                    if ((_node instanceof node.constructor) && (_node.name() == node.name())){
                        return _node;
                    }
                }
            },

            addActivity : function(activityName){
                var _node = new Activity(this.getControlManager(), {parent  : this, colName : 'Nodes'});
                if (activityName) {_node.name(activityName)}
                return _node;
            },

            addUserTask : function(taskName, script) {
                var _node = new UserTask(this.getControlManager(), {parent  : this, colName : 'Nodes'});
                if (taskName) {
                    _node.name(taskName)
                }

                if (script) {
                    _node.setUserScript(script)
                }
                return _node;
            },

            addScriptTask : function(taskName, script) {
                if (!script) {
                    throw 'Не указан скрипт'
                }
                var _node = new ScriptTask(this.getControlManager(), {parent  : this, colName : 'Nodes'}, script);
                if (taskName) {_node.name(taskName)}
                return _node;
            },

            addInclusiveGateway : function(gatewayName) {
                var _node = new InclusiveGateway(this.getControlManager(), {parent  : this, colName : 'Nodes'});
                if (gatewayName) {_node.name(gatewayName)}
                return _node;
            },

            addExclusiveGateway : function(gatewayName) {
                var _node = new ExclusiveGateway(this.getControlManager(), {parent  : this, colName : 'Nodes'});
                if (gatewayName) {_node.name(gatewayName)}
                return _node;
            },

            addCallActivity : function(activityName, definitionID) {
                var _node = new CallActivity(this.getControlManager(), {parent  : this, colName : 'Nodes'});
                if (activityName) {_node.name(activityName)}
                if (definitionID) {_node.definitionID(definitionID)}
                return _node;
            },

            addStartEvent : function(eventName) {
                var _node = new StartEvent(this.getControlManager(), {parent  : this, colName : 'Nodes'});
                if (eventName) {_node.name(eventName)}
                return _node;
            },

            addEndEvent : function(eventName) {
                var _node = new EndEvent(this.getControlManager(), {parent  : this, colName : 'Nodes'});
                if (eventName) {_node.name(eventName)}
                return _node;
            },

            connect : function(source, target, script) {
                var _sequence = new SequenceFlow(this.getControlManager(), {parent  : this, colName : 'Connectors'});
                _sequence.connect(source, target, script);
                return _sequence;
            },

            validate : function() {
                return Answer.success();
            },

            findNodeByName : function(nodeName) {
                for (var i = 0; i < this.nodes().count(); i++) {
                    var _node = this.nodes().get(i);
                    if (_node.name() == nodeName){
                        return _node;
                    }
                }
            },

            addEvent : function(eventType, eventName){
                var _constructor = EventRef.constructor.getForType(eventType);
                if (_constructor) {
                    var _node = new _constructor(this.getControlManager(), {parent: this, colName: 'Nodes'});
                    if (eventName) {
                        _node.name(eventName)
                    }
                    return _node;
                }
            },

            addMessageFlow : function() {
                var _flow = new MessageFlow(this.getControlManager(), {parent  : this, colName : 'MessageFlows'});
                var _correlationKey = this.addCorrelationKey();
                _flow.correlationKey(_correlationKey);
                return _flow;
            },

            addCorrelationKey : function(name) {
                var _ck = new CorrelationKey(this.getControlManager(), {parent  : this, colName : 'CorrelationKeys'});
                if (name) {
                    _ck.name(name);
                }
                return _ck
            },

            addInputParameters : function(parameterName) {
                var _param = new Parameter(this.getControlManager(), {parent : this, colName : 'InputParameters'});
                _param.name(parameterName);
                return _param;
            }
        });

        return ProcessDefinition;
    }
);
