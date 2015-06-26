/**
 * Created by staloverov on 30.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    //var Class = require('class.extend');
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

var sequenceState = {
    Unchecked : 0,
    Checked : 1
}

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        'util',
        './../public/utils',
        './parameter',
        UCCELLO_CONFIG.uccelloPath + 'system/utils'
    ],
    function(
        UObject,
        util,
        Utils,
        Parameter,
        UUtils
    ){
        var SequenceFlow = UObject.extend({

            className: "SequenceFlow",
            classGuid: UCCELLO_CONFIG.classGuids.SequenceFlow,
            metaFields: [
                {fname : 'ID',          ftype : 'string'},
                {fname : "Name" ,       ftype : "string"},
                {fname : "State" ,      ftype : "integer"},
                {fname : "IsDefault",   ftype : "boolean"},
                {
                    fname: 'Source',
                    ftype: {
                        type : 'ref',
                        res_elem_type : UCCELLO_CONFIG.classGuids.FlowNode
                    }
                },
                {
                    fname: 'Target',
                    ftype: {
                        type : 'ref',
                        res_elem_type : UCCELLO_CONFIG.classGuids.FlowNode
                    }
                },
                {fname : 'ScriptName',      ftype : 'string'},
                {fname : 'ScriptMethod',    ftype : 'string'}
            ],
            metaCols: [
                {'cname' : 'Parameters', 'ctype' : 'Parameter'}
            ],

            init: function(cm, params){
                //if (!params) {
                //    params = {
                //        parent  : root,
                //        colName : 'Connectors'
                //    }
                //}
                if (!params) { throw 'не указан params SequenceFlow'};
                UccelloClass.super.apply(this, [cm, params]);
                if (!this.id()) {
                    this.id(UUtils.guid());
                    this.isDefault(false);
                };
            },

            clone : function(root, params){
                var _sequence;

                _sequence = root.findConnector(this);
                if (!_sequence) {
                    _sequence = new SequenceFlow(root.getControlManager(), params);
                    _sequence.name(this.name());
                    _sequence.id(this.id());
                    _sequence.state(this.state());
                    _sequence.isDefault(this.isDefault());
                    _sequence.scriptName(this.scriptName());
                    _sequence.scriptMethod(this.scriptMethod());
                    Utils.copyCollection(this.scriptParams(), _sequence.scriptParams());
                    _sequence.source(root.findNode(this.source()));
                    _sequence.target(root.findNode(this.target()));
                }

                return _sequence;
            },

            id : function(value) {
                return this._genericSetter("ID",value);
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            source: function(value) {
                return this._genericSetter("Source",value);
            },

            target: function(value) {
                return this._genericSetter("Target",value);
            },

            check : function() {
                this.state(sequenceState.Checked);
            },

            isDefault : function(value) {
                return this._genericSetter("IsDefault",value);
            },

            scriptName: function(value) {
                return this._genericSetter("ScriptName",value);
            },

            scriptMethod: function(value) {
                return this._genericSetter("ScriptMethod",value);
            },

            scriptParams : function(){
                return this.getCol('Parameters');
            },

            connect : function(from, to, expession) {
                this.source(from);
                this.target(to);

                this.name(util.format('%s->%s', from.name(), to.name()));
                this.source().addOutgoing(this);
                this.target().addIncoming(this);

                if (expession) {
                    this.setUserScript(expession);
                }
            },

            setUserScript : function(script) {
                if (script.hasOwnProperty('moduleName')) {
                    this.scriptName(script.moduleName);
                };

                if (script.hasOwnProperty('methodName')) {
                    this.scriptMethod(script.methodName);
                };

                if (script.hasOwnProperty('methodParams')) {
                    for (param in script.methodParams) {
                        var _param = new Parameter(this.getControlManager(), {parent : this, colName : 'Parameters'});
                        _param.name(param);
                        _param.value(script.methodParams[param]);
                    }
                }
            },

            getUserScript : function() {
                if (this.hasCondition()) {
                    var _result = {};
                    _result.moduleName = (this.scriptName());
                    _result.methodName = (this.scriptMethod());

                    if (this.scriptParams().count() > 0) {
                        _result.methodParams = {};

                        for (var i = 0; i < this.scriptParams().count(); i++) {
                            var _param = this.scriptParams().get(i);
                            _result.methodParams[_param.name()] = _param.value()
                        }
                    }

                    return _result;
                } else {
                    return null
                };
            },

            hasCondition : function() {
                return ((this.scriptName()) && (this.scriptMethod())) ? true : false;
            },

             checkConditionSatisfied : function(scriptObject) {
                scriptObject.subject = this;
                Utils.execScript(scriptObject)
            },

            getParent : function() {
                return this.pvt.parent
            },

            getControlManager : function() {
                return this.getParent().getControlManager();
            }
        });

        return SequenceFlow;
    }
)

if (module) module.exports.state = sequenceState;
