/**
 * Created by staloverov on 08.04.2015.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['./gateway'],
    function(Gateway){
        var ExlusiveGateway = Gateway.extend({

            className: "Gateway",
            classGuid: UCCELLO_CONFIG.classGuids.Activity,
            metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            //init: function(cm, params){
            //    this._super(cm,params);
            //},

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            execute : function() {
                this._super();
                return this.states.ExecutionComplete
            },

            cancel : function() {

            }
        });

        return ExlusiveGateway;
    }
)