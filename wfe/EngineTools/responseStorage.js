/**
 * Created by staloverov on 31.07.2015.
 */

'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

var State = {
    NEW : {value : 0, name : 'New', code : 'N'},
    EXECUTED : {value : 1, name : 'Executed', code : 'E'}
};

Object.freeze(State);

define(
    ['./../answer'],
    function(Answer) {
        return class ResponseStorage {
            constructor() {
                this.responses = [];
            }

            addResponseCallback(response, timeout, callback) {
                if (!this.isResponseExists(response.ID())) {
                    var _item = {responseID: response.ID(), processID: response.processID(), callback: callback, state: State.NEW}
                    this.responses.push(_item);

                    if (timeout) {
                        _item.timer = setInterval(function () {
                            clearInterval(_item.timer);

                            callback(Answer.error('Превышен интервал ожидания'));
                            _item.state = State.EXECUTED
                        }, timeout)
                    }
                }
            }

            getResponseIndex(responseID) {
                var _index = -1;
                this.responses.some(function (element, index) {
                    if (element.responseID == responseID) {
                        _index = index;
                        return true;
                    }
                });

                return _index;
            }

            getResponse(responseID) {
                var _index = this.getResponseIndex(responseID);
                if (_index > -1) {
                    return this.responses[_index]
                } else {
                    return null
                }
            }

            isResponseExists(responseID) {
                this.responses.some(function (element) {
                    if (element.responseID == responseID) {
                        return true;
                    }
                });
            }

            executeResponseCallback(responseID, result) {
                var _item = this.getResponse(responseID);
                if (_item) {
                    if (_item.state == State.NEW) {
                        if (_item.timer) {
                            clearInterval(_item.timer);
                        }

                        setTimeout(function(){
                            _item.callback({result: 'OK', processId : _item.processID, responseResult: result});
                        }, 0);

                        _item.state = State.EXECUTED;
                    }
                } else {
                    throw 'Err';
                }
            }
        }
    }
);
