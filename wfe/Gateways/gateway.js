/**
 * Created by staloverov on 31.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['./../flowNode'],
    function(FlowNode){
        var Gateway = FlowNode.extend({

            className: "Gateway",
            classGuid: UCCELLO_CONFIG.classGuids.Activity,
            metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            //incoming : [],
            //outgoing : [],

            direction : {Unspecified : 0, Converging : 1, Diverging : 2, Mixed : 3},


            init: function(cm, params){
                this._super(cm,params);
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            execute : function() {
                console.log('execute node [%s]', this.name);
            },

            cancel : function() {

            }
        });

        return Gateway;
    }
)
