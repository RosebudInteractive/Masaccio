/**
 * Created by staloverov on 23.04.2015.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

var _timeout = 3000;
var _responses = [];
var _customizeResponse = null;

var _setTimeout = function(valueInSecond) {
    _timeout = valueInSecond * 1000;
};

var _clearResponses = function() {
    _responses.length = 0;
};

define(
    ['./../wfe/engineSingleton'],
    function(EngineSingleton){
        return class TestClient {

            constructor() {
                this.responses = [];
                this.customizeResponse = null;
                this.enabled = false;
            }
            
            enable(){
                this.enabled = true;
            }
            
            disable(){
                this.enabled = false;
            }

            setTimeout(valueInSecond) {
                _setTimeout(valueInSecond)
            }

            clear() {
                _clearResponses();
                _customizeResponse = null;
            }

            setResponseCustomizer(callback) {
                _customizeResponse = callback;
            }

            createResponse(request) {
                var _response = {};
                for (var param in request) {
                    _response[param] = 'Test answer';
                }

                return _response;
            }

            handleNewRequest (eventParams) {
                if (!this.enabled) {
                    return
                }
                
                if (eventParams.result != 'OK') {
                    console.log('[%s] : !! Ошибка при обработке request [%s]', (new Date()).toLocaleTimeString(), eventParams.message);
                    return
                }
                var requestInfo = eventParams.requestInfo;

                var _request = EngineSingleton.getInstance().requestStorage.getRequest(requestInfo.requestID);
                // var _request = requestInfo.request; //
                if (!_request) { throw 'Token ID [%s] do not exists', requestInfo.requestID }

                var _response = {};
                if (!_customizeResponse) {
                    for (var param in _request) {
                        _response[param] = _request[param];
                    }
                    _response.selectedNode = 'task2'
                } else {
                    _customizeResponse(_response);
                }

                var _answer = {
                    name : requestInfo.requestName,
                    processID : requestInfo.processID,
                    requestID : requestInfo.requestID,
                    tokenId : requestInfo.tokenId,
                    response : _response
                };

                _responses.push(_answer);
                console.log('[%s] : <= Готовим респонс [%s]', (new Date()).toLocaleTimeString(), _answer.name);

                setTimeout(function(){
                    console.log('[%s] : <= Отправляем респонс [%s] process [%s]', (new Date()).toLocaleTimeString(), _answer.name, requestInfo.processID);
                    EngineSingleton.getInstance().submitResponse(_answer);
                }, _timeout * _responses.length);

            }
        }
    }
);

