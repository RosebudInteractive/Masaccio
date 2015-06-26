/**
 * Created by staloverov on 20.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject'],
    function(UObject){
        var Parameter = UObject.extend({

            className: "Parameter",
            classGuid: UCCELLO_CONFIG.classGuids.Parameter,
            metaFields: [
                {fname : "Name"   , ftype : "string"},
                {fname : "Value"  , ftype : "string"}
            ],

            init: function(cm, params){
                //if (!params) {
                //    params = {
                //        parent  : root,
                //            colName : 'Parameters'
                //    }
                //}
                if (!params) {
                    throw 'не указан params Parameter'
                }
                UccelloClass.super.apply(this, [cm, params]);
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            value: function(value) {
                return this._genericSetter("Value",value);
            },

            clone : function(cm, params) {
                var _newParam = new Parameter(cm, params);
                _newParam.name(this.name());
                _newParam.value(this.value());
                return _newParam;
            }

        });

        return Parameter;
    }
);

