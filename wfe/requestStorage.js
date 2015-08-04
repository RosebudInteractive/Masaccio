/**
 * Created by staloverov on 23.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

var _instance;

var getItemIndexByPredicate = function(predicate){
    var _index = -1;
    _instance.requests.some(function(element, index) {
        if (predicate && predicate(element)) {
            _index = index;
            return true;
        }
    });

    return _index
};

define(
    [],
    function() {
        if (!_instance) {
            _instance = UccelloClass.extend({
                init: function () {
                    this.requests = [];
                },

                addRequest: function (request) {
                    if (!this.isRequestExists(request.ID())) {
                        this.requests.push(request)
                    }
                },

                getRequest: function (requestID) {
                    for (var i = 0; i < this.requests.length; i++) {
                        if (this.requests[i].ID() == requestID) {
                            return this.requests[i]
                        }
                    }
                },

                getActiveRequest: function (requestID) {
                    var _index = getItemIndexByPredicate(function(element) {
                        (element.ID() == requestID) && element.isActive()
                    });

                    if (_index > -1) {
                        return this.requests[_index]
                    } else {
                        return null
                    }
                },

                isRequestExists: function (requestID) {
                    return (this.getRequest(requestID) ? true : false);
                },

                isActiveRequestExists : function(requestID) {
                    var _index = getItemIndexByPredicate(function(element) {
                        (element.ID() == requestID) && element.isActive()
                    });

                    return _index > -1;
                },

                getProcessRequests: function (processID) {
                    var _requests = [];
                    this.requests.forEach(function (item) {
                        if (item.processID() == processID) {
                            _requests.push(item);
                        }
                    });

                    return _requests;
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

