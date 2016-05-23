/**
 * Created by staloverov on 21.04.2015.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['./answer'],
    function(Answer){
        return class Notifier{

            constructor() {
                this.observers = [];
            }

            registerObserver(observer, callback) {
                this.observers.push({requestParams: null, callback: callback, timeout: null});
            }

            registerObserverOnRequest(requestParams, timeOut, callback) {
                var _item = {requestParams: requestParams, callback: callback, timeout: timeOut};
                this.observers.push(_item);

                if ((timeOut) && (timeOut > 0) && (timeOut != Infinity)){
                    var that = this;

                    _item.timer = setInterval(function () {
                        clearInterval(_item.timer);
                        callback({result: 'ERROR', message: 'Превышен интервал ожидания'});
                        var _index = that.observers.indexOf(_item);
                        that.observers.splice(_index, 1);
                    }, timeOut)
                }
            }

            notify(eventParams) {
                var that = this;
                this.observers.forEach(function (item, i) {
                    if (item.requestParams) {
                        var _isProcessEqual = item.requestParams.processGuid == eventParams.processGuid;
                        var _isTokenEqual = (!item.requestParams.tokenId) || ((item.requestParams.tokenId) && (item.requestParams.tokenId == eventParams.tokenId));
                        var _isRequestNameEqual = item.requestParams.requestName == eventParams.requestName;
                        if (_isProcessEqual && _isTokenEqual && _isRequestNameEqual) {
                            that._notifyItem(item, i, eventParams);
                        }
                    } else {
                        that._notifyItem(item, i, eventParams);
                    }
                })
            }

            notifyFinishProcess(processGuid){
                var that = this;
                this.observers.forEach(function (item, i) {
                    if (item.requestParams) {
                        if (item.requestParams.processGuid == processGuid) {
                            if (item.timer) {
                                clearInterval(item.timer)
                            }
                            Answer.error('Process has been finished').handle(item.callback);

                            that.observers.splice(i, 1)
                        }
                    }
                })
            }

            _notifyItem(item, index, eventParams) {
                if (item.timer) {
                    clearInterval(item.timer)
                }

                setTimeout(function () {
                    item.callback({result: 'OK', requestInfo: eventParams});
                }, 0);

                this.observers.splice(index, 1);
            }
        };
    }
)


