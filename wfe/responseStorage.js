/**
 * Created by staloverov on 31.07.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

var State = {
    NEW : {value : 0, name : 'New', code : 'N'},
    EXECUTED : {value : 1, name : 'Executed', code : 'E'}
};

Object.freeze(State);

define(
    ['./answer'],
    function(Answer) {
        return UccelloClass.extend({
                init: function () {
                    this.responses = [];
                },

                addResponseCallback: function (response, timeout, callback) {
                    if (!this.isResponseExists(response.ID())) {
                        var _item = {responseID : response.ID(), callback : callback, state : State.NEW}
                        this.storage.push(_item);

                        var that = this;
                        _item.timer = setInterval(function () {
                            clearInterval(_item.timer);

                            callback(Answer.error('Превышен интервал ожидания'));
                            _item.state = State.EXECUTED
                        }, timeout)
                    }
                },

                getResponseIndex : function(responseID) {
                    var _index = -1;
                    this.responses.some(function(element, index){
                        if (element.responseID == responseID) {
                            _index = index;
                            return true;
                        }
                    });

                    return _index;
                },

                getResponse: function (responseID) {
                    var _index = this.getResponseIndex(responseID);
                    if (_index > -1) {
                        return this.responses[_index]
                    } else {
                        return null
                    }
                },

                isResponseExists: function (responseID) {
                    this.responses.some(function(element){
                        if (element.responseID == responseID) {
                            return true;
                        }
                    });
                },

                executeResponseCallback : function(responseID, result) {
                    var _item = this.getResponse(responseID);
                    if (_item) {
                        if (_item.state == State.NEW) {
                            _item.callback(result);
                            _item.state = State.EXECUTED;
                        }
                    } else {
                        throw 'Err';
                    }

                }
            }
        );
    }

);
