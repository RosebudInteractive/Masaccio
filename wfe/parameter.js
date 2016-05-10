/**
 * Created by staloverov on 20.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', './controls'],
    function(UObject, Controls){
        var Parameter = UObject.extend({

            className: "WfeParameter",
            classGuid: UCCELLO_CONFIG.classGuids.WfeParameter,
            metaFields: [
                {fname : "Name"   , ftype : "string"},
                {fname : "Value"  , ftype : "string"}
            ],

            init: function(cm, params){
                UccelloClass.super.apply(this, [cm, params]);
                //if (!params) { return }
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
            },

            addNewCopyTo : function(parent) {
                return this.clone(parent.getControlManager(), {parent : parent, colName : 'Parameters'})
            }

        });

        return Parameter;
    }
);

