/**
 * Created by staloverov on 09.07.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        './../controls',
        UCCELLO_CONFIG.uccelloPath + 'system/utils',
        './../processDefinition'
    ],
    function(
        UObject,
        Controls,
        UUtils,
        ProcessDefinition
    ){
        var MessageFlow = UObject.extend({

            //<editor-fold desc="Class description">
            className: 'MessageFlow',
            classGuid: Controls.guidOf('MessageFlow'),
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
                    fname: 'CorrelationKey',
                    ftype: {
                        type: 'ref',
                        res_elem_type: Controls.guidOf('CorrelationKey')
                    }
                },

                {fname: 'ID', ftype: 'string'},
                {fname: 'SourceProcessName', ftype: 'string'},
                {fname: 'SourceNodeName', ftype: 'string'},
                {fname: 'TargetProcessName', ftype: 'string'},
                {fname: 'TargetNodeName', ftype: 'string'},
                {fname: 'ExpiryDate', ftype: 'datetime'}

            ],
            //</editor-fold>

            init: function(cm, params){
                UccelloClass.super.apply(this, [cm, params]);
                if (!params) { return }

                if (!this.id()) {
                    this.id(UUtils.guid());
                }
            },

            //getParent : function() {
            //    return this.pvt.parent;
            //},
            //
            //getRoot : function() {
            //    if (this.getParent()) {
            //        return this.getParent().getRoot()
            //    } else {
            //        return this
            //    }
            //},

            //<editor-fold desc="MetaFields & MetaCols">
            id: function (value) {
                return this._genericSetter('ID', value);
            },

            correlationKey: function (value) {
                return this._genericSetter('CorrelationKey', value);
            },

            messageDefinition: function (value) {
                return this._genericSetter('MessageDefinition', value);
            },

            sourceProcessName: function (value) {
                return this._genericSetter("SourceProcessName", value);
            },

            sourceNodeName: function (value) {
                return this._genericSetter("SourceNodeName", value);
            },

            targetProcessName: function (value) {
                return this._genericSetter("TargetProcessName", value);
            },

            targetNodeName: function (value) {
                return this._genericSetter("TargetNodeName", value);
            },

            expiryDate: function (value) {
                return this._genericSetter("ExpiryDate", value);
            },
            //</editor-fold>

            addNewCopyTo : function(parent) {
                var _newFlow = new MessageFlow(parent.getControlManager(), {parent : parent, colName : 'MessageFlows'});
                _newFlow.id(this.id());
                _newFlow.messageDefinition(this.messageDefinition());
                _newFlow.correlationKey(parent.getCorrelationKey(this.correlationKey()));
                _newFlow.sourceProcessName(this.sourceProcessName());
                _newFlow.sourceNodeName(this.sourceNodeName());
                _newFlow.targetProcessName(this.targetProcessName());
                _newFlow.targetNodeName(this.targetNodeName());
                _newFlow.expiryDate(this.expiryDate());

                return _newFlow;
            }
        });

        return MessageFlow;
    }
);