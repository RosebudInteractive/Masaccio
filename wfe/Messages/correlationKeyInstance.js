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
        //'crytpo'
    ],
    function(
        UObject,
        Controls,
        Crypto
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
                for (var i = 0; this.correlationValues().count(); i++) {
                    _stringValue.concat(this.correlationValues().get(i).value());
                }

                //return Crypto.createHash('md5').update(_stringValue).digest('hex');
            }
        });

        return CorrelationKeyInstance;
    });