/**
 * Created by staloverov on 22.04.2015.
 */
//if (typeof define !== 'function') {
//    var define = require('amdefine')(module);
//    var Class = require('class.extend');
//}
//
var _instance = null;
//
//define(
//    ['./engine'],
//    function(Engine){
//        var EngineSingleton = Class.extend({
//            setInstance : function (instance){
//                _instance = instance;
//            },
//
//            getInstance : function() {
//                return _instance;
//            }
//        })
//
//        return EngineSingleton;
//    }
//)

var Singleton = {};
Singleton.setInstance = function (engine) {
    _instance = engine;
};

Singleton.getInstance = function() {
    return _instance;
};

if (module) { module.exports = Singleton };