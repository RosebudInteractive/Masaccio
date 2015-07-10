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
        './correlationProperty',
        UCCELLO_CONFIG.uccelloPath + 'system/utils',
        './correlationKeyInstance'
    ],
    function(
        UObject,
        Controls,
        CorrelationProperty,
        UUtils,
        CorrelationKeyInstance
    ){
        var CorrelationKey = UObject.extend({

            //<editor-fold desc="Class description">
            className: "CorrelationKey",
            classGuid : Controls.guidOf('CorrelationKey'),
            metaFields: [
                {fname : 'Name',    ftype : 'string'},
                {fname : 'ID',      ftype : 'string'}
            ],
            metaCols: [
                {'cname' : 'Properties', 'ctype' : 'CorrelationProperty'}
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

            properties : function() {
                return this.getCol('Properties');
            },
            //</editor-fold>

            getControlManager : function() {
                return this.pvt.controlMgr;
            },

            addProperty : function(propertyName) {
                var _property = new CorrelationProperty(this.getControlManager(), {parent : this, colName : 'Properties'});
                if (propertyName) {
                    _property.name(propertyName);
                }

                return _property;
            },

            addNewCopyTo : function(parent)
            {
                var _newKey = new CorrelationKey(parent.getControlManager(), {parent : parent, colName : 'CorrelationKeys'});

                _newKey.name(this.name());
                for (var i = 0; i < this.properties().count(); i++) {
                    this.properties().get(i).addNewCopyTo(_newKey);
                }

                return _newKey;
            },

            checkConsistency : function() {
                return true;
            },

            getParent : function() {
                return this.pvt.parent;
            },

            createInstance : function(messageDefintionName) {
                var _instance = new CorrelationKeyInstance(this.getControlManager(), {parent : this.getParent(), colName : 'CorrelationKeyInstances'});
                for (var i = 0; i < this.properties().count(); i++) {
                    var _expressions = this.properties().get(i).getExpressionsForMessage();


                }
            }
        });

        return CorrelationKey;
    }
);

