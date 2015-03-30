/**
 * Created by staloverov on 11.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', 'Utils'],
    function(UObject, Utils){
        var ProcessDefinition = UObject.extend({

            className: "ProcessDefinition",
            classGuid: UCCELLO_CONFIG.classGuids.ProcessDefinition,
            metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],


            definitionID : "",
            connectors : [],
            nodes : [],


            init: function(cm, params){
                this._super(cm,params);
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            addActivity : function(activity){
            //    TODO Пока входящим параметром будет проинициализированный Узел
                this.nodes.push(activity)
            },

            addParameter : function(parameter) {},

            addGateway : function() {},

            addRequest : function() {},

            clone : function()
            {
                var _newDefinition = Utils.deepCopy(this);

                return _newDefinition;
            }

        });

        return ProcessDefinition;
    }
)
