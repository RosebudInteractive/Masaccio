/**
 * Created by staloverov on 18.05.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([],
    function(){
        return UccelloClass.extend({

            init: function (process) {
                this.processFacade = process.getFacade();
                this.subject = null;
                this.moduleName = null;
                this.methodName = null;
            },

            setCallback: function (callback) {
                this.callback = callback;
            },

            returnResult: function (result) {
                var that = this;

                if (this.callback) {
                    setTimeout(function () {
                        that.callback(that.subject, result)
                    }, 0)
                }
            }

        });
    }
);

