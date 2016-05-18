/**
 * Created by staloverov on 24.08.2015.
 */
/**
 * Created by staloverov on 09.07.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        '../../public/utils',
        './../parameter',
        './../controls',
        UCCELLO_CONFIG.uccelloPath + 'system/utils'
    ],
    function(
        UObject,
        Utils,
        Parameter,
        Controls,
        UUtils
    ){
        var MessageInstance = UObject.extend({

            //<editor-fold desc="Class description">
            className: 'MessageInstance',
            classGuid : Controls.guidOf('MessageInstance'),
            metaFields: [
                {
                    fname: 'MessageDefinition',
                    ftype: {
                        type: 'ref',
                        external: true,
                        res_type: Controls.guidOf('MessageDefinition'),
                        res_elem_type: Controls.guidOf('MessageDefinition')
                    }
                },
                {
                    fname: 'CorrelationKeyInstance',
                    ftype: {
                        type: 'ref',
                        res_elem_type: Controls.guidOf('CorrelationKeyInstance')
                    }
                },
                {fname : 'ID', ftype : 'string'},

                {fname : 'SourceProcessName', ftype : 'string'},
                {fname : 'SourceProcessId', ftype : 'string'},
                {fname : 'SourceTokenId', ftype : 'string'},
                {fname : 'SourceNodeName', ftype : 'string'},
                {fname : 'SourceNodeId', ftype : 'string'},

                {fname : 'TargetProcessName', ftype : 'string'},
                {fname : 'TargetNodeName', ftype : 'string'},
                {fname : 'ExpiryDate', ftype : 'date'},
                {fname : 'IsDelivered', ftype : 'boolean'}
            ],
            metaCols: [
                {'cname' : 'Parameters', 'ctype' : 'WfeParameter'},
                {'cname' : 'CorrelationKeyInstances', 'ctype' : 'CorrelationKeyInstance'},
            ],
            //</editor-fold>

            init: function(cm, params){
                UccelloClass.super.apply(this, [cm, params]);
                if (!params) { return }

                if (!this.id()) {
                    this.id(UUtils.guid());
                }
            },

            //<editor-fold desc="MetaFields & MetaCols">
            id : function(value) {
                return this._genericSetter("ID",value);
            },

            messageDefinition: function(value) {
                return this._genericSetter("MessageDefinition",value);
            },

            correlationKeyInstance: function(value) {
                return this._genericSetter("CorrelationKeyInstance",value);
            },

            sourceProcessName: function(value) {
                return this._genericSetter("SourceProcessName",value);
            },

            sourceProcessId: function(value) {
                return this._genericSetter("SourceProcessId",value);
            },

            sourceTokenId: function(value) {
                return this._genericSetter("SourceTokenId",value);
            },

            sourceNodeName: function(value) {
                return this._genericSetter("SourceNodeName",value);
            },

            sourceNodeId: function(value) {
                return this._genericSetter("SourceNodeId",value);
            },

            targetProcessName: function(value) {
                return this._genericSetter("TargetProcessName",value);
            },

            targetNodeName: function(value) {
                return this._genericSetter("TargetNodeName",value);
            },

            expiryDate: function(value) {
                return this._genericSetter("ExpiryDate",value);
            },

            isDelivered: function(value) {
                return this._genericSetter("IsDelivered",value);
            },

            parameters : function() {
                return this.getCol('Parameters');
            },

            //correlationKeyInstances : function() {
            //    return this.getCol('CorrelationKeyInstances');
            //},
            //</editor-fold>

            getControlManager : function() {
                return this.pvt.controlMgr;
            },

            equals : function(otherInstance) {
                return this.correlationKeyInstance().equals(otherInstance.correlationKeyInstance())
                    && (this.sourceProcessName() == otherInstance.sourceProcessName())
                    && (this.sourceNodeName() == otherInstance.sourceNodeName())
                    && (this.targetProcessName() == otherInstance.targetProcessName())
                    && (this.targetNodeName() == otherInstance.targetNodeName());
            },

            addNewCopyTo : function(parent){
                //var _newInstance = new MessageInstance(parent.getControlManager(), {parent : parent, colName : 'MessageInstances'});
                //_newInstance.id(this.id());
                //_newInstance.messageDefinition(this.messageDefinition());
                //_newInstance.

            }

            //addParameter : function(parameterName) {
            //    var _param = new Parameter(this.getControlManager(), {parent : this, colName : 'Parameters'});
            //    _param.name(parameterName);
            //    return _param;
            //},
            //
            //clone : function()
            //{
            //    var _newDefinition = new MessageDefinition(this.getControlManager(), {});
            //
            //    _newDefinition.definitionId = this.definitionId;
            //    _newDefinition.name(this.name());
            //    Utils.copyCollection(this.nodes(), _newDefinition.nodes());
            //    Utils.copyCollection(this.connectors(), _newDefinition.connectors());
            //
            //    return _newDefinition;
            //}
        });

        return MessageInstance;
    }
);
