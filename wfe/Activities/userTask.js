/**
 * Created by staloverov on 14.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    //var Class = require('class.extend');
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    ['./scriptTask', './../request', './../flowNode', './../controls', './activity'],
    function(ScriptTask, Request, FlowNode, Controls, Activity){
        var UserTask = ScriptTask.extend({

            className: "UserTask",
            classGuid: Controls.guidOf('UserTask'),
            metaCols: [
                {'cname' : 'Requests', 'ctype' : 'Request'},
                {'cname' : 'Responses', 'ctype' : 'Request'}
            ],

            requests : function(){
                return this.getCol('Requests');
            },

            responses : function(){
                return this.getCol('Responses');
            },

            createInstance : function(cm, params){
                return new UserTask(cm, params);
            },

            getUnhandledResponse : function() {
                var _responses = this.token().getPropertiesOfNode(this.name()).responses();
                for (var i = 0; i < _responses.count(); i++) {
                    if (_responses.get(i).state() != Request.state.Done) {
                        return _responses.get(i)
                    }
                }

                return null;
            },

            copyCollectionDefinitions : function(source, process) {
                UccelloClass.super.apply(this, [source, process]);

                for (var i = 0; i < source.requests().count(); i++){
                    this.requests()._add(source.requests().get(i).clone(process.getControlManager(), {parent : process, colName : 'Requests'}));
                }

                for (var i = 0; i < source.responses().count(); i++){
                    this.responses()._add(source.responses().get(i).clone(process.getControlManager(), {parent : process, colName : 'Responses'}))
                }
            },

            addCollectionInstances : function(nodeDefinition) {
                UccelloClass.super.apply(this, [nodeDefinition]);

                for (var i = 0; i < nodeDefinition.requests().count(); i++){
                    this.requests()._add(nodeDefinition.requests().get(i).clone(this.getControlManager(), {parent : this.processInstance(), colName : 'Requests'}));
                }

                for (var i = 0; i < nodeDefinition.responses().count(); i++){
                    this.responses()._add(nodeDefinition.responses().get(i).clone(this.getControlManager(), {parent : this.processInstance(), colName : 'Responses'}))
                }
            },

            hasUnhandledResponse: function () {
                return this.getUnhandledResponse() ? true : false;
            },

            execute : function(callback) {
                function logResponses() {
                    console.log('[%s] : => Узел %s ожидает ответа', (new Date()).toLocaleTimeString(), this.name());
                    var _requestCount = this.token().getPropertiesOfNode(this.name()).requests().count();
                    var _responseCount = this.token().getPropertiesOfNode(this.name()).responses().count();
                    console.log('[%s] : !! Ответов %d из %d', (new Date()).toLocaleTimeString(), _responseCount, _requestCount);
                }

                if (this.state() == FlowNode.state.Executing) {
                    console.log('[%s] : => Выполняется узел %s', (new Date()).toLocaleTimeString(), this.name());
                    var _activityState = this.exposeRequests();
                    if (_activityState == Activity.state.Waiting) {
                        this.state(FlowNode.state.WaitingRequest);
                        this.processInstance().enqueueCurrentToken();
                    }
                    else if (_activityState == Activity.state.Executing) {
                        this.state(FlowNode.state.ExecutionComplete)
                    }
                }
                else if (this.state() == FlowNode.state.WaitingRequest) {
                    logResponses.call(this);

                    if (this.token().getPropertiesOfNode(this.name()).isAllResponseReceived()){
                        this.state(FlowNode.state.ExecutionComplete);
                        if (this.processInstance().isWaitingScriptAnswer()){
                            this.processInstance().enqueueCurrentToken();
                            console.log('[%s] : => Узел [%s] ждет выполнения скрипта', (new Date()).toLocaleTimeString(), this.name());
                        } else {
                            console.log('[%s] : => Узел отработал %s', (new Date()).toLocaleTimeString(), this.name());
                        }
                    } else {
                        this.state(FlowNode.state.WaitingRequest)
                    }

                    if (this.hasScript() && this.hasUnhandledResponse()) {
                        var _state = this.state();
                        UccelloClass.super.apply(this, [callback]);
                        this.state(_state);
                        return;
                    }
                }
                else {
                    console.log('[%s] : => Узел отработал %s', (new Date()).toLocaleTimeString(), this.name());
                    this.state(FlowNode.state.ExecutionComplete)
                }

                //if ((this.state() == FlowNode.state.ExecutionComplete) && this.hasScript()) {
                //    UccelloClass.super.apply(this, [callback]);
                //    return;
                //}


                this.callExecuteCallBack(callback);
            },

            cancel : function() {

            },

            createScriptObject : function(callback) {
                var _scriptObject = UccelloClass.super.apply(this, [callback]);
                var _response = this.getUnhandledResponse();
                _response.state(Request.state.Done);
                _scriptObject.response = _response;

                return _scriptObject;
            },

            addRequest : function(name) {
                var _request = new Request(this.getControlManager(), {parent  : this.getParent(), colName : 'Requests'});
                _request.name(name);
                this.requests()._add(_request);
                return _request;
            },

            close : function() {
                if (this.token().getPropertiesOfNode(this.name()).isAllResponseReceived()){
                    UccelloClass.super.apply(this, []);
                }
            },


            exposeRequests : function() {
                if (this.requests().count() > 0){
                    var _process = this.processInstance();
                    var _token = _process.currentToken();
                    var _props = _token.getPropertiesOfNode(this.name());

                    for (var i = 0; i < this.requests().count(); i++) {
                        var _request = this.requests().get(i).clone(this.getControlManager(), {parent : _props, colName : 'Requests'});
                        _request.processID(_process.processID());
                        _request.tokenID(_token.tokenID())
                    }

                    return Activity.state.Waiting
                }
                else {
                    return Activity.state.Executing
                }
            }
        });

        return UserTask;
    }
)

