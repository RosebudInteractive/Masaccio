/**
 * Created by staloverov on 23.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [],
    function() {
        return UccelloClass.extend({
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

                isRequestExists: function (requestID) {
                    return (this.getRequest(requestID) ? true : false);
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
            }
        );
    }

)

