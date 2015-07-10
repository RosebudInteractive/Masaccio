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
        './retrievalExpression',
        UCCELLO_CONFIG.uccelloPath + 'system/utils'
    ],
    function(
        UObject,
        Controls,
        RetrievalExpression,
        UUtils
    ){
        var CorrelationProperty = UObject.extend({

            //<editor-fold desc="Class description">
            className: "CorrelationProperty",
            classGuid : Controls.guidOf('CorrelationProperty'),
            metaFields: [
                {fname : 'Name',    ftype : 'string'},
                {fname : 'ID',      ftype : 'string'}
            ],
            metaCols: [
                {'cname' : 'Expressions', 'ctype' : 'RetrievalExpression'}
            ],
            //</editor-fold>

            init: function(cm, params) {
                UccelloClass.super.apply(this, [cm, params]);

                if ((!this.ID()) || (this.ID() == '')) {
                    this.ID(UUtils.guid());
                }
            },

            //<editor-fold desc="MetaFields & MetaCols">
            name: function(value) {
                return this._genericSetter("Name",value);
            },

            ID: function(value) {
                return this._genericSetter("ID",value);
            },

            expressions : function() {
                return this.getCol('Expressions');
            },
            //</editor-fold>

            getControlManager : function() {
                return this.pvt.controlMgr;
            },

            addExpression : function(exprParams) {
                var _expr = new RetrievalExpression(this.getControlManager(), {parent : this, colName : 'Expressions'});
                if (!exprParams) {
                    return _expr;
                } else {
                    if (exprParams.hasOwnProperty('messageName')) {
                        _expr.messageName(exprParams.messageName);
                    }
                    if (exprParams.hasOwnProperty('nodeName')) {
                        _expr.nodeName(exprParams.nodeName);
                    }
                    if (exprParams.hasOwnProperty('nodeParameterName')) {
                        _expr.nodeParameterName(exprParams.nodeParameterName);
                    }
                    return _expr;
                }
            },

            addNewCopyTo : function(parent)
            {
                var _newProperty = new CorrelationProperty(parent.getControlManager(), {parent : parent, colName : 'CorrelationProperties'});

                _newProperty.name(this.name());
                for (var i = 0; i < this.expressions().count(); i++) {
                    this.expressions().get(i).addNewCopyTo(_newProperty);
                }

                return _newProperty;
            },

            getExpressionsForMessage : function(messageName) {
                var _expr = [];
                for (var i = 0; i < this.expressions().count(); i++) {
                    if (this.expressions().get(i).messageName() == messageName) {
                        _expr.push(this.expressions().get(i))
                    }
                }

                return _expr;
            }
        });

        return CorrelationProperty;
    }
);