/**
 * Created by staloverov on 23.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['./../wfe/request', './../wfe/engineSingleton'],
    function(Request, EngineSingleton){
        var TestClient = Class.extend({

            init: function() {
                //this.engine = engine;
                this.responses = [];
            },

            handleNewRequest : function (eventParams) {
                var that = this;

                var _process = EngineSingleton.getInstance().getProcessInstance(eventParams.processID);
                if (!_process) { throw 'Process ID [%s] do not exists', eventParams.processID };

                var _request = EngineSingleton.getInstance().requestStorage.getRequest(eventParams.requestID);
                if (!_request) { throw 'Token ID [%s] do not exists', eventParams.requestID };

                var _response = _request.createResponse(_request.getParent());
                _response.ID(_request.ID());

                _response.parameters().get(0).value('YAHOO!');
                that.observer.responses.push(_response);
                console.log('[%s] : <= Готовим респонс [%s]', (new Date()).toLocaleTimeString(), _response.name());
                //process.nextTick(function(){
                //    console.log('Готовим респонс')
                //});
                setTimeout(function(){
                    console.log('[%s] : <= Отправляем респонс [%s]', (new Date()).toLocaleTimeString(), _response.name());
                    EngineSingleton.getInstance().submitResponse(_response);
                }, 15000 * that.observer.responses.length);

                //EngineSingleton.getInstance().submitResponse(_response);
            }
        });

        return TestClient;
    }
)

