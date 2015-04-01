/**
 * Created by staloverov on 28.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', './processDefinition', UCCELLO_CONFIG.uccelloPath + 'system/utils'],
    function(UObject, Definition, UUtils){
        var Process = UObject.extend({

            className: "Process",
            classGuid: UCCELLO_CONFIG.classGuids.Process,
            metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            processID : "",
            definition : null,

            init: function(cm, params, definition){
                this._super(cm,params);

                this.processID = UUtils.guid;
                this.definition = definition.clone();
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            getNode : function() {}

        });

        return Process;
    }
)
