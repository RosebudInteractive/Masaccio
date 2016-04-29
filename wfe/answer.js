/**
 * Created by staloverov on 04.08.2015.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    //var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
    //var Util = require('util');
    //var Logger = require('./../public/logger');
}

var Result = {
    UNKNOWN : 'UNKNOWN',
    OK : 'OK',
    WARNING : 'WARNING',
    ERROR : 'ERROR'
};

//function success(message) {
//    var _instance = new Answer();
//    _instance.result = Result.OK;
//    if (arguments.length > 1) {
//        var _arg = Array.prototype.slice.call(arguments, 1);
//        _instance.message = Util.format(message, _arg);
//    } else {
//        _instance.message = message;
//    }
//
//    return _instance;
//}

//function error(message) {
//    var _instance = new Answer();
//    _instance.result = Result.ERROR;
//    if (arguments.length > 1) {
//        var _arg = Array.prototype.slice.call(arguments, 1);
//        _instance.message = Util.format(message, _arg);
//    } else {
//        _instance.message = message;
//    }
//
//    return _instance;
//}

define(
    ['util', './../public/logger'],
    function(Util, Logger) {
        return class Answer{
            constructor () {
                this.result = Result.UNKNOWN;
            }

            handle(callback) {
                Logger.info(this);

                if (callback) {
                    var that = this;
                    setTimeout(function () {
                        callback(that)
                    }, 0)
                }
            }

            add(object){
                for (var prop in object){
                    if (object.hasOwnProperty(prop)){
                        this[prop] = object[prop]
                    }
                }

                return this;
            }

            static success(message) {
                var _instance = new Answer();
                _instance.result = Result.OK;
                if (arguments.length > 1) {
                    var _arg = Array.prototype.slice.call(arguments, 1);
                    _instance.message = Util.format(message, _arg);
                } else {
                    _instance.message = message;
                }

                return _instance;
            }

            static error(message) {
                var _instance = new Answer();
                _instance.result = Result.ERROR;
                if (arguments.length > 1) {
                    var _arg = Array.prototype.slice.call(arguments, 1);
                    _instance.message = Util.format(message, _arg);
                } else {
                    _instance.message = message;
                }

                return _instance;
            }
        }
    }
);



//if (module) {
//    module.exports.success = success;
//    module.exports.error = error
//}
