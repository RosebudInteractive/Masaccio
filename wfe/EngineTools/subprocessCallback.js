/**
 * Created by staloverov on 28.08.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [],
    function() {
        return UccelloClass.extend({
            init : function(){
                this.callbacks = [];
            },

            findItem : function(processID) {
                var _index = -1;
                var _found = this.callbacks.some(function(element, index){
                    if (element.processID == processID) {
                        _index = index;
                        return true;
                    }
                });

                if (_found) {
                    return this.callbacks[_index]
                } else {
                    return null
                }
            },

            deleteItem : function(item) {
                var _index = -1;
                var _found = this.callbacks.some(function(element, index){
                    if (element == item) {
                        _index = index;
                        return true;
                    }
                });

                if (_found) {
                    this.callbacks.splice(_index, 1);
                }
            },

            register : function(processID, startCallback, endCallback){
                if (this.findItem(processID)) {
                    throw 'Уже существует зарегистрированный подпроцесс'
                }

                if (!startCallback) {
                    throw 'Не может быть подпроцесса без стартового callback'
                }

                if (!endCallback) {
                    throw 'Не может быть подпроцесса без заверщающего callback'
                }

                this.callbacks.push({
                    processID : processID,
                    startCallback : startCallback,
                    isStarted : false,
                    endCallback : endCallback,
                    isFinished : false
                })
            },

            execStartCallback : function(processID) {
                var _item = this.findItem(processID);

                if (!_item) {
                    //throw 'Не найден зарегистрированный стартовый callback для процесса'
                    return
                }

                if (_item.isStarted) {
                    throw 'Подпроцесс уже запущен'
                }

                _item.isStarted = true;
                setTimeout(function () {
                    _item.startCallback();
                }, 0)
            },

            execEndCallback : function(processID) {
                var _item = this.findItem(processID);

                if (!_item) {
                    //throw 'Не найден зарегистрированный завершающий callback для процесса'
                    return
                }

                if (!_item.isStarted) {
                    throw 'Подпроцесс еще не запущен'
                }

                if (_item.isFinished) {
                    throw 'Подпроцесс уже завершен'
                }

                _item.isFinished = true;
                var that = this;
                setTimeout(function () {
                    _item.endCallback();
                    that.deleteItem(_item)
                }, 0)

            }
        })
    }
)