/**
 * Created by staloverov on 27.07.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        './../event',
        './../../flowNode',
        './../../controls',
        './../../../public/logger',
        './../../../public/utils',
        './../../process',
        './../../processDefinition',
        './../../engineSingleton'
    ],
    function(
        Event,
        FlowNode,
        Controls,
        Logger,
        Utils,
        Process,
        ProcessDefinition,
        EngineSingleton
    ){
        var MessageCatchEvent = Event.extend({

            className: 'MessageCatchEvent',
            classGuid: Controls.guidOf('MessageCatchEvent'),

            metaFields : [
                {
                    fname : 'IncomingMessage',
                    ftype : {
                        type : 'ref',
                        res_elem_type : Controls.guidOf('MessageFlow')
                    }
                },
                {
                    fname : 'IncomingInstance',
                    ftype : {
                        type : 'ref',
                        external: true,
                        res_type: Controls.guidOf('MessageInstance'),
                        res_elem_type: Controls.guidOf('MessageInstance')
                    }
                }
            ],

            init: function(cm, params){
                UccelloClass.super.apply(this, [cm, params]);
                if (!params) { return }

                if (this.getRoot() instanceof ProcessDefinition) {
                    var _flow = this.getRoot().addMessageFlow();
                    this.incomingMessage(_flow);
                }
            },

            createIncomingMessage : function(messageDefinition, sourceProcessName, sourceNodeName) {
                this.incomingMessage().messageDefinition(messageDefinition);
                this.incomingMessage().sourceProcessName(sourceProcessName);
                this.incomingMessage().sourceNodeName(sourceNodeName);
                this.incomingMessage().targetProcessName(this.getRoot().name());
                this.incomingMessage().targetNodeName(this.name());
            },

            createInstance : function(cm, params){
                return new MessageCatchEvent(cm, params);
            },

            assign : function(source){
                UccelloClass.super.apply(this, [source]);

                var _incomingMessage = this.getRoot().getMessageFlow(source.incomingMessage());
                this.incomingMessage(_incomingMessage);
            },

            incomingMessage: function(value) {
                return this._genericSetter('IncomingMessage', value);
            },

            incomingInstance: function(value) {
                return this._genericSetter('IncomingInstance', value);
            },

            executeUserScript: function (callback) {
                this.processInstance().enqueueCurrentToken();
                this.processInstance().waitScriptAnswer();

                Logger.info('Выполняется userScript узла [%s]', this.name());
                var _scriptObject = this.createScriptObject(callback);


                _scriptObject.setCallback(
                    function (subject) {
                        subject.state(FlowNode.state.UserScriptComplete);
                        subject.processInstance().activate();
                        subject.callExecuteCallBack(callback);
                    }
                );

                this.state(FlowNode.state.WaitingUserScriptAnswer);
                Utils.execScript(_scriptObject);
            },

            requestMessage: function (callback) {
                var _messageRequest = this.createMessageRequest(this.incomingMessage().messageDefinition());

                _messageRequest.sourceProcessName(this.incomingMessage().sourceProcessName());
                _messageRequest.sourceProcessId(this.processInstance().processID());
                _messageRequest.sourceTokenId(this.token().tokenID());
                _messageRequest.sourceNodeId(this.guid());
                _messageRequest.sourceNodeName(this.incomingMessage().sourceNodeName());
                _messageRequest.targetProcessName(this.incomingMessage().targetProcessName());
                _messageRequest.targetNodeName(this.incomingMessage().targetNodeName());

                var _correlationKey = this.incomingMessage().correlationKey();
                var _ckInstance = _correlationKey.createInstanceForMessage(this.incomingMessage().messageDefinition().name(), _messageRequest);
                _messageRequest.correlationKeyInstance(_ckInstance);

                this.token().addMessageRequest(_messageRequest);
                this.state(FlowNode.state.WaitingRequest);
                this.callExecuteCallBack(callback);
            },

            getExpressionForParameter: function (parameterName) {
                for (var i = 0; i < this.expressions().count(); i++) {
                    var _expr = this.expressions().get(i);
                    if ((_expr.messageParameterName() == parameterName)) {
                        return _expr;
                    }
                }
            },

            createMessageRequest : function(messageDefinition) {
                var _request = EngineSingleton.getInstance().newMessageInstance();
                _request.messageDefinition(messageDefinition);

                return _request;
            },


            execute : function(callback) {
                switch (this.state()) {
                    case FlowNode.state.Executing : {
                        this.requestMessage(callback);
                        break;
                    }

                    case FlowNode.state.WaitingRequest : {
                        if (this.incomingInstance()) {
                            if (this.hasScript()) {
                                this.executeUserScript(callback);
                            } else {
                                this.completeExecution();
                                this.callExecuteCallBack(callback);
                            }
                        } else {
                            this.callExecuteCallBack(callback);
                        }
                        break;
                    }

                    case FlowNode.state.UserScriptComplete : {
                        this.completeExecution();
                        this.callExecuteCallBack(callback);
                        break;
                    }

                    default : {
                        Logger.info('Узел [%s] отработал', this.name());
                        this.completeExecution();
                        this.callExecuteCallBack(callback);
                        break;
                    }
                }


            }
        });

        return MessageCatchEvent;
    }
);
