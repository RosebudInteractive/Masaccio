/**
 * Created by staloverov on 18.06.2015.
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
                {fname : "ModuleName"   , ftype : "string"},
                {fname : "MethodName"   , ftype : "string"}
            ],
            metaCols: [
                {'cname' : 'Parameters', 'ctype' : 'Parameter'}
            ],

            init: function(root, params){
                if (!params) {
                    params = {
                        parent  : root,
                        colName : 'Parameters'
                    }
                }
                UccelloClass.super.apply(this, [root.getControlManager(), params]);
            },

            moduleName: function(value) {
                return this._genericSetter("ModuleName", value);
            },

            methodName: function(value) {
                return this._genericSetter("MethodName", value);
            },

            clone : function(process, params) {
                var _newParam = new Parameter(process, params);
                _newParam.name(this.name());
                _newParam.value(this.value());
                return _newParam;
            }

        });

        return Parameter;
    }
);