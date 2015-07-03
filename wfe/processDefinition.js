/**
 * Created by staloverov on 11.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        '../public/utils',
        './parameter',
        './controls',
        './Activities/userTask'
    ],
    function(UObject, Utils, Parameter, Controls, UserTask){
        var ProcessDefinition = UObject.extend({

            //<editor-fold desc="Class description">
            className: "ProcessDefinition",
            //classGuid: UCCELLO_CONFIG.classGuids.ProcessDefinition,
            classGuid : Controls.guidOf('ProcessDefinition'),
            metaFields: [
                {fname : "Name", ftype : "string"},
                {fname : 'DefinitionID', ftype : 'string'}
            ],
            metaCols: [
                {'cname' : 'Parameters', 'ctype' : 'Parameter'},
                {'cname' : 'Connectors', 'ctype' : 'SequenceFlow'},
                {'cname' : 'Nodes', 'ctype' : 'FlowNode'},
                {'cname' : 'Requests', 'ctype' : 'Request'}

            ],
            //</editor-fold>

            init: function(cm, params) {
                //if (!params) {params = {}};
                UccelloClass.super.apply(this, [cm, params]);
                //if (!params) return
            },

            //<editor-fold desc="MetaFields & MetaCols">
            name: function(value) {
                return this._genericSetter("Name",value);
            },

            definitionID: function(value) {
                return this._genericSetter("DefinitionID",value);
            },

            parameters : function() {
                return this.getCol('Parameters');
            },

            connectors : function(){
                return this.getCol('Connectors');
            },

            nodes : function(){
                return this.getCol('Nodes');
            },
            //</editor-fold>

            getControlManager : function() {
                return this.pvt.controlMgr;
            },

            addActivity : function(activity){
            //    TODO Пока входящим параметром будет проинициализированный Узел
                this.nodes()._add(activity)
            },

            /* Todo : сделать методы  addParameter, addRequest*/
            addParameter : function(parameterName) {
                var _param = new Parameter(this.getControlManager(), {parent : this, colName : 'Parameters'});
                _param.name(parameterName);
                return _param;
            },

            addGateway : function(gateway) {
                this.nodes()._add(gateway)
            },

            addRequest : function() {},

            addConnector : function(connector) {
                this.connectors()._add(connector);
            },


            clone : function()
            {
                var _newDefinition = new ProcessDefinition(this.pvt.controlMgr, {});

                _newDefinition.definitionID = this.definitionID;
                _newDefinition.name(this.name());
                Utils.copyCollection(this.nodes(), _newDefinition.nodes());
                Utils.copyCollection(this.connectors(), _newDefinition.connectors());

                return _newDefinition;
            },

            findNode : function(node) {
                for (var i = 0; i < this.nodes().count(); i++) {
                    var _node = this.nodes().get(i);
                    if ((_node instanceof node.constructor) && (_node.name() == node.name())){
                        return _node;
                    }
                }
            },

            addUserTask : function(name) {
                var _node = new UserTask(this.getControlManager(), {parent  : this, colName : 'Nodes'});
                if (name) {_node.name(name)}
                return _node;
            }

        });

        return ProcessDefinition;
    }
)
