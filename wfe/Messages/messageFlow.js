/**
 * Created by staloverov on 09.07.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        './../controls'
    ],
    function(
        UObject,
        Controls
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

                {fname: 'SourceProcessName', ftype: 'string'},
                {fname: 'SourceNodeName', ftype: 'string'},
                {fname: 'TargetProcessName', ftype: 'string'},
                {fname: 'TargetNodeName', ftype: 'string'},
                {fname: 'ExpiryDate', ftype: 'DateTime'}

            ],
            //</editor-fold>

            //<editor-fold desc="MetaFields & MetaCols">
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
            }
            //</editor-fold>

            //addNewCopyTo : function(parent) {
            //    var _newExpr = new RetrievalExpression(parent.getControlManager(), {parent : parent, colName : 'Expressions'});
            //    _newExpr.messageName(this.messageName());
            //    _newExpr.nodeName(this.nodeName());
            //    _newExpr.nodeParameterName(this.nodeParameterName());
            //
            //    return _newExpr;
            //}
        });

        return MessageFlow;
    }
);