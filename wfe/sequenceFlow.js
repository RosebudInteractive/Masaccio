/**
 * Created by staloverov on 30.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

var sequenceState = {
    Unchecked : 0,
    Checked : 1
};

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        'util',
        './../public/utils',
        './parameter',
        UCCELLO_CONFIG.uccelloPath + 'system/utils',
        './controls',
        './userScript'
    ],
    function(
        UObject,
        util,
        Utils,
        Parameter,
        UUtils,
        Controls,
        UserScript
    ){
        var SequenceFlow = UObject.extend({

            className: "SequenceFlow",
            classGuid: Controls.guidOf('SequenceFlow'),
            metaFields: [
                {fname : 'ID',          ftype : 'string'},
                {fname : "Name" ,       ftype : "string"},
                {fname : "State" ,      ftype : "integer"},
                {fname : "IsDefault",   ftype : "boolean"},
                {
                    fname: 'Source',
                    ftype: {
                        type : 'ref',
                        res_elem_type : Controls.guidOf('FlowNode')
                    }
                },
                {
                    fname: 'Target',
                    ftype: {
                        type : 'ref',
                        res_elem_type : Controls.guidOf('FlowNode')
                    }
                },
                {
                    fname: 'Script',
                    ftype: {
                        type: 'ref',
                        res_elem_type: Controls.guidOf('UserScript')
                    }
                }
            ],

            init: function(cm, params){
                UccelloClass.super.apply(this, [cm, params]);
                if (!params) { return }

                if (!this.id()) {
                    this.id(UUtils.guid());
                    this.isDefault(false);
                }
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
                    _sequence.source(root.findNode(this.source()));
                    _sequence.target(root.findNode(this.target()));

                    if (this.hasCondition()) {
                        var _script = this.script().asSimpleObject();
                        _sequence.script(_sequence.getRoot().getOrCreateScript(_script));
                    }
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

            script: function(value) {
                return this._genericSetter('Script', value);
            },

            connect : function(from, to, script) {
                this.source(from);
                this.target(to);

                this.name(util.format('%s->%s', from.name(), to.name()));
                this.source().addOutgoing(this);
                this.target().addIncoming(this);

                if (script) {
                    this.setUserScript(script);
                }
            },


            setUserScript : function(script) {
                this.script(this.getRoot().getOrCreateScript(script));
            },

            getUserScript : function() {
                if (this.hasCondition()) {
                    return this.script().asSimpleObject();
                } else {
                    return null
                }
            },

            hasCondition : function() {
                return (this.script() ? true : false);
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
