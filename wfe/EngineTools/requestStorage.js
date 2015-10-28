/**
 * Created by staloverov on 23.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

var _instance;

define(
    [],
    function() {
        if (!_instance) {
            _instance = UccelloClass.extend({
                init: function () {
                    this.storage = [];
                },

                getItemIndexByPredicate : function(predicate) {
                    var _index = -1;
                    this.storage.some(function (element, index) {
                        if (predicate && predicate(element)) {
                            _index = index;
                            return true;
                        }
                    });

                    return _index
                },

                getItemByPredicate : function(predicate) {
                    var _index = this.getItemIndexByPredicate(predicate);

                    if (_index > -1) {
                        return this.storage[_index]
                    } else {
                        return null
                    }
                },

                addRequest: function (request, eventParams) {
                    if (!this.isRequestExists(request.ID())) {
                        this.storage.push({request : request, params : eventParams})
                    }
                },

                getRequest: function (requestID) {
                    for (var i = 0; i < this.storage.length; i++) {
                        if (this.storage[i].request.ID() == requestID) {
                            return this.storage[i].request
                        }
                    }
                },

                getActiveRequest: function (requestID) {
                    var _item = this.getItemByPredicate(function(element) {
                        return (element.request.ID() == requestID) && element.request.isActive()
                    });

                    if (_item) {
                        return _item.request
                    }
                },

                isRequestExists: function (requestID) {
                    return (this.getRequest(requestID) ? true : false);
                },

                isActiveRequestExists : function(requestID) {
                    var _index = this.getItemIndexByPredicate(function(element) {
                        return (element.request.ID() == requestID) && element.request.isActive()
                    });

                    return _index > -1;
                },

                isActiveRequestExistsByName : function(requestName, processID) {
                    var _index = this.getItemIndexByPredicate(function(element) {
                        return (element.request.name() == requestName) && (element.request.processID() == processID) && element.request.isActive()
                    });

                    return _index > -1;
                },

                getProcessRequests: function (processID) {
                    var _requests = [];
                    this.storage.forEach(function (item) {
                        if (item.request.processID() == processID) {
                            _requests.push(item.request);
                        }
                    });

                    return _requests;
                },

                getRequestParamsByName : function(requestName, processID) {
                    var _item = this.getItemByPredicate(function(element) {
                        return (element.request.name() == requestName) && (element.request.processID() == processID) && element.request.isActive()
                    });
                    if (_item) {
                        return _item.params
                    }
                },

                cancelActiveRequestsForProcess: function (processID) {
                    var _requests = this.getProcessRequests(processID);
                    _requests.forEach(function (item) {
                        if (item.isActive()) {
                            item.cancel();
                        }
                    })
                }
            })
        }

        return _instance;
    }

)

