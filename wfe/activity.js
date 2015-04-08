/**
 * Created by staloverov on 31.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['./flowNode'],
    function(FlowNode){
        var Activity = FlowNode.extend({

            className: "Activity",
            classGuid: UCCELLO_CONFIG.classGuids.Activity,
            metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            incoming : [],
            outgoing : [],


            init: function(cm, params){
                this._super(cm);
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            execute : function() {

            },

            cancel : function() {

            }
        });

        return Activity;
    }
)
