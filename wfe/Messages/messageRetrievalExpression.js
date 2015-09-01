/**
 * Created by staloverov on 24.08.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        './retrievalExpression',
        './../controls'
    ],
    function(
        RetrievalExpression,
        Controls
    ){
        var MessageRetrievalExpression = RetrievalExpression.extend({

            //<editor-fold desc="Class description">
            className: 'MessageRetrievalExpression',
            classGuid: Controls.guidOf('MessageRetrievalExpression'),
            metaFields: [
                {fname: 'MessageParameterName', ftype: 'string'}
            ],
            //</editor-fold>

            //<editor-fold desc="MetaFields & MetaCols">
            messageParameterName: function (value) {
                return this._genericSetter("MessageParameterName", value);
            },
            //</editor-fold>

            addNewCopyTo : function(parent) {
                var _newExpr = new MessageRetrievalExpression(parent.getControlManager(), {parent : parent, colName : 'Expressions'});
                _newExpr.messageName(this.messageName());
                _newExpr.nodeName(this.nodeName());
                _newExpr.parameterName(this.parameterName());
                _newExpr.messageParameterName(this.messageParameterName());

                return _newExpr;
            }
        });

        return MessageRetrievalExpression;
    }
);