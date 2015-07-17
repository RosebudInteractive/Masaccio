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

            createResponse : function(request) {
                var _response = {};
                for (var param in request) {
                    _response[param] = 'Test answer';
                }

                return _response;
            },

            handleNewRequest : function (eventParams) {
                if (!this.responses) {
                    this.responses = []
                }

                if (eventParams.result != 'OK') {
                    console.log('[%s] : !! Ошибка при обработке request [%s]', (new Date()).toLocaleTimeString(), eventParams.message);
                    return
                }
                var requestInfo = eventParams.requestInfo;
                //var _process = EngineSingleton.getInstance().getProcessInstance(requestInfo.processID);
                //if (!_process) { throw 'Process ID [%s] do not exists', requestInfo.processID }

                var _request = requestInfo.request; //EngineSingleton.getInstance().requestStorage.getRequest(requestInfo.requestID);
                if (!_request) { throw 'Token ID [%s] do not exists', requestInfo.requestID }

                var _response = {};
                for (var param in _request) {
                    _response[param] = _request[param];
                };


                var _answer = {
                    name : requestInfo.requestName,
                    processID : requestInfo.processID,
                    requestID : requestInfo.requestID,
                    tokenID : requestInfo.tokenID,
                    response : _response
                }

                //_response.parameters().get(0).value('YAHOO!');
                this.responses.push(_answer);
                console.log('[%s] : <= Готовим респонс [%s]', (new Date()).toLocaleTimeString(), _answer.name);

                var that = this;
                setTimeout(function(){
                    console.log('[%s] : <= Отправляем респонс [%s] process [%s]', (new Date()).toLocaleTimeString(), _answer.name, requestInfo.processID);
                    EngineSingleton.getInstance().submitResponse(_answer);
                }, 3000 * that.responses.length);

            }
        });

        return TestClient;
    }
)

