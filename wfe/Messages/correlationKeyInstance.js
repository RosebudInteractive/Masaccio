/**
 * Created by staloverov on 09.07.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
    //var Crypto = require('crypto');
}

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        './../controls',
        'md5'
    ],
    function(
        UObject,
        Controls,
        MD5
    ){
        var CorrelationKeyInstance = UObject.extend({

            //<editor-fold desc="Class description">
            className: "CorrelationKeyInstance",
            classGuid : Controls.guidOf('CorrelationKeyInstance'),
            metaFields: [
                {fname : 'KeyName',    ftype : 'string'}
            ],
            metaCols: [
                {'cname' : 'CorrelationValues', 'ctype' : 'Parameter'}
            ],
            //</editor-fold>

            keyName : function(value) {
                return this._genericSetter('KeyName', value);
            },

            correlationValues : function() {
                return this.getCol('CorrelationValues');
            },

            getControlManager : function() {
                return this.pvt.controlMgr;
            },

            addParameterValue : function(parameter) {
                parameter.clone(this.getControlManager(), {parent : this, colName : 'CorrelationValues'})
            },

            isEqualTo : function(parameter) {
                return true;
            },

            calculateHash : function() {
                var _stringValue = '';
                for (var i = 0; i < this.correlationValues().count(); i++) {
                    _stringValue = _stringValue + this.correlationValues().get(i).value();//concat(this.correlationValues().get(i).value());
                }

                return MD5(_stringValue);
            },

            equals : function(otherInstance) {
                var _hash = this.calculateHash();
                var _otherHash = otherInstance.calculateHash();

                return _hash == _otherHash;
            },

            getProperty : function(name) {
                for (var i = 0; i < this.correlationValues().count(); i++) {
                    if (this.correlationValues().get(i).name() == name) {
                        return this.correlationValues().get(i);
                    }
                }

                return null;
            }
        });

        return CorrelationKeyInstance;
    });