/**
 * Created by staloverov on 23.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    //[UCCELLO_CONFIG.uccelloPath+'system/uobject'],
    ['./../wfe/request', './../wfe/engineSingleton'],
    function(Request, EngineSingleton){
        var TestClient = Class.extend({


            init: function(engine) {
                this.engine = engine;
            },

            handleNewRequest : function (eventParams) {
                var _process = EngineSingleton.getInstance().getProcessInstance(eventParams.processID);
                if (_process === null) { throw 'Process ID [%s] do not exists', eventParams.processID };

                var _request = EngineSingleton.getInstance().requestStorage.getRequest(eventParams.requestID);
                if (_request === null) { throw 'Token ID [%s] do not exists', eventParams.requestID };

                var _response = _request.clone();
                _response.ID = _request.ID;

                _response.parameters[0].value = 'YAHOO!';
                console.log('Готовим респонс')
                //process.nextTick(function(){
                //    console.log('Готовим респонс')
                //});

                EngineSingleton.getInstance().submitResponse(_response);
            }
        });

        return TestClient;
    }
)

