/**
 * Created by staloverov on 11.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', '../public/utils'],
    function(UObject, Utils){
        var ProcessDefinition = UObject.extend({

            className: "ProcessDefinition",
            classGuid: UCCELLO_CONFIG.classGuids.ProcessDefinition,
            metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            init: function(cm, params){
                if (!params) {params = {}};
                this._super(cm,params);
                this.definitionID = "";
                this.connectors = [];
                this.nodes = [];
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

            /* Todo : сделать методы  addParameter, addRequest*/
            addParameter : function(parameter) {},

            addGateway : function(gateway) {
                this.nodes.push(gateway)
            },

            addRequest : function() {},

            addConnector : function(connector) {
                this.connectors.push(connector);
            },


            clone : function()
            {
                var _newDefinition = new ProcessDefinition(this.pvt.controlMgr, {});

                _newDefinition.definitionID = this.definitionID;
                _newDefinition.name = this.name;
                _newDefinition.state = this.state;
                _newDefinition.nodes = Utils.copyArray(this.nodes);
                _newDefinition.connectors = Utils.copyArray(this.connectors)

                return _newDefinition;
            }

        });

        return ProcessDefinition;
    }
)
