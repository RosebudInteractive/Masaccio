/**
 * Created by staloverov on 28.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject'],
    function(UObject){
        var Process = UObject.extend({

            className: "Process",
            classGuid: UCCELLO_CONFIG.classGuids.AComponent,
            metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            processID : "",

            init: function(cm, params){
                this._super(cm,params);
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            addActivity : function(){}



        });

        return Process;
    }
)
