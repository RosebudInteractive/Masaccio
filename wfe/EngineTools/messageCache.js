/**
 * Created by staloverov on 01.09.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    ['./../engineSingleton'],
    function(EngineSingleton) {
        return UccelloClass.extend({
            init : function(){
                this.cache = [];
            },

            findItem : function(hash) {
                var _index = -1;
                var _found = this.cache.some(function(element, index){
                    if (element.hash == hash) {
                        _index = index;
                        return true;
                    }
                });

                if (_found) {
                    return this.cache[_index].message;
                } else {
                    return null
                }
            },

            newItem : function(hash){
                var _messageItem = {
                    instances : [],
                    requests : [],
                    hasRequest : function(instance) {
                        return _messageItem.requests.some(function(request) {
                            return request.equals(instance);
                        })
                    },

                    hasInstance : function(request) {
                        return _messageItem.instances.some(function(instance) {
                            return instance.equals(request);
                        })
                    },

                    getRequestsForInstance : function(instance) {
                        return _messageItem.requests.filter(function(request) {
                            return request.equals(instance)
                        })
                    },

                    getInstancesForRequest : function(request) {
                        return _messageItem.instances.filter(function(instance) {
                            return instance.equals(request)
                        })
                    },

                    hasNoRequest : function() {
                        return _messageItem.requests.length == 0;
                    },

                    hasNoInstance : function() {
                        return _messageItem.instances.length == 0;
                    },

                    removeInstance : function(instance) {
                        _messageItem.instances.some(function(element, index, array) {
                            if (element.id() == instance.id()) {
                                array.splice(index, 1);
                                return true;
                            }
                        })
                    },

                    removeRequest : function(request) {
                        _messageItem.requests.some(function(element, index, array) {
                            if (element.id() == request.id()) {
                                array.splice(index, 1);
                                return true;
                            }
                        })
                    }
                };

                this.cache.push({hash : hash, message : _messageItem});

                return _messageItem;
            },

            deleteEmptyItems : function() {
                this.cache.every(function(element, item, array) {
                    if (element.message.hasNoRequest() && element.message.hasNoInstance()) {
                        array.splice(item, 1);
                    }
                })
            },

            addMessageInstance : function(messageInstance) {
                var _hash = messageInstance.correlationKeyInstance().calculateHash();

                var _item = this.findItem(_hash);
                if (!_item) {
                    _item = this.newItem(_hash)
                }

                if (_item.hasRequest(messageInstance)) {
                    var _requests = _item.getRequestsForInstance(messageInstance);
                    _requests.forEach(function(request) {
                        EngineSingleton.getInstance().deliverMessage(messageInstance, request);
                        _item.removeRequest(request);
                    });

                    _item.removeInstance(messageInstance);
                } else {
                    _item.instances.push(messageInstance);
                }

                this.deleteEmptyItems();

                EngineSingleton.getInstance().startProcessByMessage(messageInstance);
            },

            addMessageRequest : function(messageRequest) {
                var _hash = messageRequest.correlationKeyInstance().calculateHash();

                var _item = this.findItem(_hash);
                if (!_item) {
                    _item = this.newItem(_hash)
                }

                if (_item.hasInstance(messageRequest)) {
                    var _instances = _item.getInstancesForRequest(messageRequest);
                    _instances.every(function(instance) {
                        EngineSingleton.getInstance().deliverMessage(instance, messageRequest);
                        _item.removeInstance(instance);
                    });
                    _item.removeRequest(messageRequest)
                } else {
                    _item.requests.push(messageRequest);
                }

                this.deleteEmptyItems();
            }
        })
    }
);