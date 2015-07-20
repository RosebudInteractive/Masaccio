/**
 * Created by staloverov on 21.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([],
    function(){
        return UccelloClass.extend({

            init: function () {
                this.observers = [];
            },

            registerObserver: function (observer, callback) {
                this.observers.push({requestParams: null, callback: callback, timeout: null});
            },

            registerObserverOnRequest: function (requestParams, timeOut, callback) {
                var _item = {requestParams: requestParams, callback: callback, timeout: timeOut};
                this.observers.push(_item);

                var that = this;
                _item.timer = setInterval(function () {
                    clearInterval(_item.timer);
                    callback({result: 'ERROR', message: 'Превышен интервал ожидания'});
                    var _index = that.observers.indexOf(_item);
                    that.observers.splice(_index, 1);
                }, timeOut)
            },

            notify: function (eventParams) {
                this.observers.forEach(function (item, i, arr) {
                    if (!item.requestParams) {
                        item.callback({result: 'OK', requestInfo: eventParams});
                        if (item.timer) {
                            clearInterval(item.timer);
                            arr.splice(i, 1);
                        }
                    } else {
                        if ((item.requestParams.processID == eventParams.processID) &&
                            (item.requestParams.tokenID == eventParams.tokenID) &&
                            (item.requestParams.requestName == eventParams.requestName)) {

                            if (item.timer) {
                                clearInterval(item.timer)
                            }
                            ;
                            item.callback({result: 'OK', requestInfo: eventParams});
                            arr.splice(i, 1);
                        }
                    }
                })
            }
        });
    }
)


