/**
 * Created by staloverov on 30.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', './flowNode', 'util'],
    function(UObject, FlowNode, util){
        var SequenceFlow = UObject.extend({

            className: "SequinceFlow",
            classGuid: UCCELLO_CONFIG.classGuids.SequinceFlow,
            metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            source : null,
            target : null,


            init: function(cm, params){
                this._super(cm,params);
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            connect : function(from, to, expession) {
                this.source = from;
                this.target = to;

                this.name = util.format('%s->%s', from.name, to.name);
                this.source.addOutgoing(this);
                this.target.addIncoming(this);

                this.expression = expession;
            },

            hasCondition : function() {
                return this.expression !== undefined || this.expression !== null;
            }
        });

        return SequenceFlow;
    }
)
