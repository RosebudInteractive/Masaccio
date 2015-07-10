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
        var RetrievalExpression = UObject.extend({

            //<editor-fold desc="Class description">
            className: 'RetrievalExpression',
            classGuid: Controls.guidOf('RetrievalExpression'),
            metaFields: [
                {fname: 'MessageName',      ftype: 'string'},
                {fname: 'NodeName',         ftype: 'string'},
                {fname: 'ParameterName',    ftype: 'string'}
            ],
            //</editor-fold>

            //<editor-fold desc="MetaFields & MetaCols">
            messageName: function (value) {
                return this._genericSetter("MessageName", value);
            },

            nodeName: function (value) {
                return this._genericSetter("NodeName", value);
            },

            parameterName: function (value) {
                return this._genericSetter("ParameterName", value);
            },
            //</editor-fold>

            addNewCopyTo : function(parent) {
                var _newExpr = new RetrievalExpression(parent.getControlManager(), {parent : parent, colName : 'Expressions'});
                _newExpr.messageName(this.messageName());
                _newExpr.nodeName(this.nodeName());
                _newExpr.parameterName(this.parameterName());

                return _newExpr;
            }
        });

        return RetrievalExpression;
    }
);