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
                _item.constrBody = typeConstr.prototype.constructor.toString();
                _item.isDataObject = false;

                this.constructors.push(_item);
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