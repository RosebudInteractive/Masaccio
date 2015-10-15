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
        './correlationKeyInstance',
        './../process'
    ],
    function(
        UObject,
        Controls,
        CorrelationProperty,
        UUtils,
        CorrelationKeyInstance,
        Process
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

                if (!params) { return }

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

            createInstanceForMessage : function(messageDefinitionName, messageInstance) {
                //if (!(this.getParent() instanceof Process)) {
                //    throw 'Err'
                //}
                var _processInstance = this.getParent();

                var _instance = new CorrelationKeyInstance(this.getControlManager(), {parent : messageInstance, colName : 'CorrelationKeyInstances'});
                _instance.keyName(this.name());
                for (var i = 0; i < this.properties().count(); i++) {
                    var _expressions = this.properties().get(i).getExpressionsForMessage(messageDefinitionName);

                    _expressions.forEach(function(element) {
                        var _param;
                        if (!element.nodeName()) {
                            _param = _processInstance.findParameter(element.parameterName());
                        } else {
                            /* Todo : у кого брать значения параметров для вычиления ключа? и что делать если инстанса узла еще нет?*/
                            _param = _processInstance.currentToken().findNodeInstanceByName(element.nodeName()).findParameter(element.parameterName());
                        }

                        if (_param) {
                            _instance.addParameterValue(_param);
                        }
                    });
                }

                messageInstance.correlationKeyInstance(_instance);

                return _instance;
            }
        });

        return CorrelationKey;
    }
);

