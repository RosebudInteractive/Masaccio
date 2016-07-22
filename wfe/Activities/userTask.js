/**
 * Created by staloverov on 14.04.2015.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
    ['./scriptTask', './../request', './../flowNode', './activity', './../engineSingleton', './../../public/logger'],
    function(ScriptTask, Request, FlowNode, Activity, EngineSingleton, Logger) {
        return class UserTask extends ScriptTask {

            get className() {
                return "UserTask"
            }

            get classGuid() {
                return UCCELLO_CONFIG.classGuids.UserTask
            }

            get metaCols() {
                return [
                    {'cname': 'Requests', 'ctype': 'Request'},
                    {'cname': 'Responses', 'ctype': 'Request'}
                ]
            }

            requests() {
                return this.getCol('Requests');
            }

            responses() {
                return this.getCol('Responses');
            }

            createInstance(cm, params) {
                return new UserTask(cm, params);
            }

            getUnhandledResponse() {
                var _responses = this.token().getPropertiesOfNode(this.name()).responses();
                for (var i = 0; i < _responses.count(); i++) {
                    if (!_responses.get(i).isDone()) {
                        return _responses.get(i)
                    }
                }

                return null;
            }

            copyCollectionDefinitions(source, process) {
                super.copyCollectionDefinitions(source, process);

                for (var i = 0; i < source.requests().count(); i++) {
                    this.requests()._add(source.requests().get(i).clone(process.getControlManager(), {
                        parent: process,
                        colName: 'Requests'
                    }));
                }

                for (var i = 0; i < source.responses().count(); i++) {
                    this.responses()._add(source.responses().get(i).clone(process.getControlManager(), {
                        parent: process,
                        colName: 'Responses'
                    }))
                }
            }

            addCollectionInstances(nodeDefinition) {
                super.addCollectionInstances(nodeDefinition);

                for (var i = 0; i < nodeDefinition.requests().count(); i++) {
                    this.requests()._add(nodeDefinition.requests().get(i).clone(this.getControlManager(), {
                        parent: this.processInstance(),
                        colName: 'Requests'
                    }));
                }

                for (var i = 0; i < nodeDefinition.responses().count(); i++) {
                    this.responses()._add(nodeDefinition.responses().get(i).clone(this.getControlManager(), {
                        parent: this.processInstance(),
                        colName: 'Responses'
                    }))
                }
            }

            hasUnhandledResponse() {
                return this.getUnhandledResponse() ? true : false;
            }

            handleResponse(done) {
                this.state(FlowNode.state.HasNewResponse);
                done();
            }

            execute(callback) {
                if (this.processInstance().isSaving()) {
                    this.saving();
                    this.callExecuteCallBack(callback);
                }

                var that = this;

                function logResponses() {
                    Logger.info('Узел %s ожидает ответа', that.name());
                    var _requestCount = that.token().getPropertiesOfNode(that.name()).requests().count();
                    var _responseCount = that.token().getPropertiesOfNode(that.name()).responses().count();
                    Logger.info('Ответов %d из %d', _responseCount, _requestCount);
                }

                if (this.state() == FlowNode.state.Executing) {
                    this._doOnExecute();
                }
                else if ((this.state() == FlowNode.state.WaitingRequest) || (this.state() == FlowNode.state.HasNewResponse)) {
                    logResponses.call(this);

                    if (this.token().getPropertiesOfNode(this.name()).isAllResponseReceived()) {
                        this.completeExecution();
                        if (this.processInstance().isWaitingScriptAnswer()) {
                            this.processInstance().enqueueCurrentToken();
                            Logger.info('Узел [%s] ждет выполнения скрипта', this.name());
                        } else {
                            this._doOnDone();
                            Logger.info('Узел отработал %s', this.name());
                        }
                    } else {
                        this.state(FlowNode.state.WaitingRequest)
                    }

                    if (this.hasScript() && this.hasUnhandledResponse()) {
                        var _state = this.state();
                        super.execute(callback);
                        this.state(_state);
                        return;
                    }
                }
                else {
                    Logger.info('Узел отработал %s', this.name());
                    this.completeExecution();
                }

                this.callExecuteCallBack(callback);
            }

            _handleRequests() {
                Logger.info('Выполняется узел %s', this.name());
                var _activityState = this.exposeRequests();
                if (_activityState == Activity.state.Waiting) {
                    this.waitingRequest();
                    this.needSave = true;
                    this.processInstance().enqueueCurrentToken();
                }
                else if (_activityState == Activity.state.Executing) {
                    this.completeExecution();
                }
            }

            _doOnDone() {
                if (!this.hasScript()) {
                    var _responseCol = this.token().getPropertiesOfNode(this.name()).responses();

                    for (var i = 0; i < _responseCol.count(); i++) {
                        EngineSingleton.getInstance().responseStorage.executeResponseCallback(_responseCol.get(i).ID());
                    }
                }
            }

            _doOnExecute() {
                this._handleRequests();
            }
            
            cancel() {

            }

            createScriptObject(callback) {
                var _scriptObject = super.createScriptObject(callback);
                var _response = this.getUnhandledResponse();
                _response.done();
                _scriptObject.response = _response;

                return _scriptObject;
            }

            addRequest(name) {
                var _request = new Request(this.getControlManager(), {parent: this.getParent(), colName: 'Requests'});
                _request.name(name);
                _request.isService(false);
                this.requests()._add(_request);
                return _request;
            }

            addServiceRequest() {
                var _request = new Request(this.getControlManager(), {
                    parent: this.processInstance().definition(),
                    colName: 'Requests'
                });
                _request.name('TaskRequest');
                _request.isService(true);
                this.requests()._add(_request);
                return _request;
            }

            close() {
                if (this.token().getPropertiesOfNode(this.name()).isAllResponseReceived()) {
                    super.close();
                }
            }


            exposeRequests() {
                var _requests = this._getRequests();

                if (_requests.length > 0) {
                    var _process = this.processInstance();
                    var _token = _process.currentToken();
                    var _props = _token.getPropertiesOfNode(this.name());

                    var that = this;
                    _requests.forEach(function (request) {
                        var _request = request.clone(that.getControlManager(), {parent: _props, colName: 'Requests'});
                        _request.processID(_process.processID());
                        _request.tokenId(_token.tokenId());
                    });

                    return Activity.state.Waiting
                }
                else {
                    return Activity.state.Executing
                }
            }

            _getRequests() {
                var _result = [];

                if (this.requests().count() > 0) {
                    for (var i = 0; i < this.requests().count(); i++) {
                        _result.push(this.requests().get(i))
                    }
                } else {
                    var _internalRequest = this._getInternalRequest();
                    if (_internalRequest) {
                        _result.push(_internalRequest);
                    }
                }

                return _result;
            }

            _getInternalRequest() {
                // переопределяется для Task
                return null
            }

            hasNewRequests() {
                for (var i = 0; i < this.requests().count(); i++) {
                    if (this.requests().get(i).isNew()) {
                        return true
                    }
                }

                return false
            }
        }
    }
);

