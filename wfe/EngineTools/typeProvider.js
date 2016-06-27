/**
 * Created by staloverov on 16.06.2016.
 */
'use strict';
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['./../engineSingleton', UCCELLO_CONFIG.uccelloPath+'system/uobject'],
    function(EngineSingleton, UObject) {
        var REMOTE_RESULT = "XXX";

        var masaccioTypeProviderInterfaceGUID = "90122ac9-2d4a-493a-b6ac-8f5fe3c46590";

        var masaccioTypeProviderInterface = {

            className: "MasaccioTypeProviderInterf",
            classGuid: masaccioTypeProviderInterfaceGUID,

            getConstructors: "function"
        };
        
        
        return class TypeProvider extends UObject {
            get className() {
                return "TypeProvider"
            }

            get classGuid() {
                return UCCELLO_CONFIG.classGuids.TypeProvider
            }

            get metaFields() {
                return []
            }

            get metaCols() {
                return []
            }

            constructor(cm, params) {
                super(cm, params);
                this.constructors = [];
            }

            registerType(typeConstr) {
                var _item = {};
                _item.selfGuid = typeConstr.prototype.classGuid;
                _item.parentGuid = typeConstr.__proto__.prototype.classGuid;
                _item.constrBody = this._buildConstrBody(typeConstr);//.prototype.constructor.toString();
                _item.isDataObject = false;

                this.constructors.push(_item);
            }

            _buildConstrBody(typeConstr) {
                var _code = 'return Parent.extend({\n\t';
                _code += 'className: "'+ typeConstr.prototype.className +'",\n\t';
                _code += 'classGuid: "'+ typeConstr.prototype.classGuid +'",\n\t';

                if (typeConstr.prototype.metaFields.length != 0) {
                    _code += 'metaFields: [\n\t\t';
                    var _fields = [];
                    typeConstr.prototype.metaFields.forEach(function(field){
                        _fields.push('{fname: "' + field.fname + '", ftype: "' + field.ftype + '"}')
                    });

                    _code += _fields.join(',\n\t\t');
                    _code += '\n\t],\n\t'
                }

                if (typeConstr.prototype.metaCols.length != 0) {
                    _code += 'metaCols: [\n\t';
                    var _cols = [];
                    typeConstr.prototype.metaCols.forEach(function(column){
                        _cols.push('{cname: "' + column.cname + '", ftype: "' + column.ctype + '"}')
                    });

                    _code += _cols.join(',\n\t\t');
                    _code += '],\n\t'
                }

                var _functionsNames = Object.getOwnPropertyNames(typeConstr.prototype);
                var _functionsBodies = [];
                _functionsNames.forEach(function(name){
                    if ((typeof typeConstr.prototype[name] === 'function') && (name != 'constructor')) {

                        var _body = typeConstr.prototype[name].toString();
                        _body = _body.replace(name, ': function');
                        _body = name + _body;
                        _functionsBodies.push(_body);
                    }
                });

                _code += _functionsBodies.join(',\n\t');
                var _footer = '})';
                
                return _code + _footer;
            }

            getConstructors(guids, callback) {
                var constrArr = [];

                var that = this;
                guids.forEach(function (guid) {
                    var _item = that.constructors.find(function (constructor) {
                        return constructor.selfGuid == guid;
                    });

                    if (_item) {
                        constrArr.push({guid: guid, code: _item});
                    }
                });

                if (callback)
                    setTimeout(function () {
                        callback(constrArr);
                    }, 0);

                return callback ? REMOTE_RESULT : constrArr;
            }

        }
    }
);