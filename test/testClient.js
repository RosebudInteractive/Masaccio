/**
 * Created by staloverov on 23.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    //[UCCELLO_CONFIG.uccelloPath+'system/uobject'],
    ['./../wfe/request'],
    function(Request){
        var TestClient = Class.extend({


            init: function(engine) {
                this.engine = engine;
            },

            handleNewRequest : function (eventParams) {
                var _process = this.engine.getProcessInstance(eventParams.processID);
                if (_process === null) { throw 'Process ID [%s] do not exists', eventParams.processID };

                var _request = this.engine.requestStorage.getRequest(eventParams.requestID);
                if (_request === null) { throw 'Token ID [%s] do not exists', eventParams.requestID };

                var _response = _request.clone();
                _response.ID = _request.ID;

                _response.parameters[0].value = 'YAHOO!';

                this.engine.submitResponse(_response);
            }
        });

        return TestClient;
    }
)

