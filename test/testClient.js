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
            responses : [],

            //init: function() {
            //    this.engine = engine;
                //this.
            //},

            handleNewRequest : function (eventParams) {
                if (!this.responses) {
                    this.responses = []
                }

                if (eventParams.result != 'OK') {
                    console.log('[%s] : !! Ошибка при обработке request [%s]', (new Date()).toLocaleTimeString(), eventParams.message);
                    return
                }
                var requestInfo = eventParams.requestInfo;
                var _process = EngineSingleton.getInstance().getProcessInstance(requestInfo.processID);
                if (!_process) { throw 'Process ID [%s] do not exists', requestInfo.processID }

                var _request = EngineSingleton.getInstance().requestStorage.getRequest(requestInfo.requestID);
                if (!_request) { throw 'Token ID [%s] do not exists', requestInfo.requestID }

                var _response = _request.createResponse(_request.getParent());
                _response.ID(_request.ID());

                _response.parameters().get(0).value('YAHOO!');
                this.responses.push(_response);
                console.log('[%s] : <= Готовим респонс [%s]', (new Date()).toLocaleTimeString(), _response.name());

                var that = this;
                setTimeout(function(){
                    console.log('[%s] : <= Отправляем респонс [%s]', (new Date()).toLocaleTimeString(), _response.name());
                    EngineSingleton.getInstance().submitResponse(_response);
                }, 5000 * that.responses.length);

            }
        });

        return TestClient;
    }
)

