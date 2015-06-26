/**
 * Created by staloverov on 23.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [],
    function() {
        var RequestStorage = Class.extend({
                init: function () {
                    this.requests = [];
                },

                addRequest : function(request){
                    if (!this.isRequestExists(request.ID())){
                        this.requests.push(request)
                    }
                },

                getRequest : function(requestID){
                    for (var i = 0; i < this.requests.length; i++) {
                        if (this.requests[i].ID() == requestID) {return this.requests[i]}
                    }
                },

                isRequestExists : function(requestID) {
                    return (this.getRequest(requestID) ? true : false);
                }
            }
        );

        return RequestStorage;
    }

)

