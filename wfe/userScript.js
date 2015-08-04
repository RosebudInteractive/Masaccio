/**
 * Created by staloverov on 18.06.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        './controls',
        './parameter'
    ],
    function(
        UObject,
        Controls,
        Parameter
    ){
        var UserScript = UObject.extend({

            className: 'UserScript',
            classGuid: Controls.guidOf('UserScript'),
            metaFields: [
                {fname : "ModuleName"   , ftype : "string"},
                {fname : "MethodName"   , ftype : "string"}
            ],
            metaCols: [
                {'cname' : 'ScriptParams', 'ctype' : 'Parameter'}
            ],

            //init: function(root, params){
            //    if (!params) {
            //        params = {
            //            parent  : root,
            //            colName : 'Parameters'
            //        }
            //    }
            //    UccelloClass.super.apply(this, [root.getControlManager(), params]);
            //},

            moduleName: function(value) {
                return this._genericSetter("ModuleName", value);
            },

            methodName: function(value) {
                return this._genericSetter("MethodName", value);
            },

            parameters : function() {
                return this.getCol('ScriptParams');
            },

            parse : function(script) {
                if (script.hasOwnProperty('moduleName')) {
                    this.moduleName(script.moduleName);
                };

                if (script.hasOwnProperty('methodName')) {
                    this.methodName(script.methodName);
                };

                if (script.hasOwnProperty('methodParams')) {
                    for (var param in script.methodParams) {
                        var _param = new Parameter(this.getParent().getControlManager(), {parent : this, colName : 'ScriptParams'});
                        _param.name(param);
                        _param.value(script.methodParams[param]);
                    }
                }
            },

            isEqualTo : function(scriptObject) {
                //if ((scriptObject.moduleName) && (scriptObject.methodName())) {
                //    var _equal = (this.moduleName() == scriptObject.moduleName) && (this.methodName() == scriptObject.methodName);
                //    if (_equal) {
                //        if (this.parameters().count() > 0) {
                //            if (scriptObject.methodParams) {
                //                _equal = this.parameters().count() == scriptObject.methodParams.length
                //            }
                //        } else {
                //            return true;
                //        }
                //
                //    } else {
                //        return false;
                //    }
                //} else {
                //    return false;
                //}

                return false;
            },

            clone : function(cm, params) {
                var _newScript = new UserScript(cm, params);
                _newScript.moduleName(this.moduleName());
                _newScript.methodName(this.methodName());
                _newScript.copyParameters(this);

                return _newScript;
            },

            getParent : function() {
                return this.pvt.parent
            },

            copyParameters :  function (source) {
                for (var i = 0; i < source.parameters().count(); i++) {
                    source.parameters().get(i).clone(this.getParent().getControlManager(), {parent  : this, colName : 'ScriptParams'});
                }
            },

            asSimpleObject : function() {
                var _result = {};
                _result.moduleName = (this.moduleName());
                _result.methodName = (this.methodName());

                if (this.parameters().count() > 0) {
                    _result.methodParams = {};

                    for (var i = 0; i < this.parameters().count(); i++) {
                        var _param = this.parameters().get(i);
                        _result.methodParams[_param.name()] = _param.value()
                    }
                }

                return _result;
            }

        });

        return UserScript;
    }
);