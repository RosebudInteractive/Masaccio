/**
 * Created by staloverov on 30.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', './flowNode'],
    function(UObject, FlowNode){
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

            connect : function(from, to) {
                this.source = from;
                this.target = to;

                this.source.outgoing.push(this);
                this.target.incoming.push(this);
            }
        });

        return SequenceFlow;
    }
)
