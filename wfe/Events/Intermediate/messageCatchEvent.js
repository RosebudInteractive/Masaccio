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
        './../../controls'
    ],
    function(
        Event,
        FlowNode,
        Controls
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
                    fname: 'InitScript',
                    ftype: {
                        type: 'ref',
                        res_elem_type: Controls.guidOf('UserScript')
                    }
                }
            ],

            incomingMessage: function(value) {
                return this._genericSetter('IncomingMessage', value);
            },

            //initScript: function(value) {
            //    return this._genericSetter('InitScript', value);
            //},
            //
            //setInitScript : function(script) {
            //    this.script(this.getRoot().getOrCreateScript(script));
            //},
            //
            //hasInitScript : function() {
            //    return (this.initScript() ? true : false);
            //},

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
                var _correlationKey = this.incomingMessage().correlationKey();
                var _ckInstance = _correlationKey.createInstance(this.incomingMessage().name());

                var _messageRequest = this.createMessageRequest(this.outgoingMessage().messageDefinition());
                _messageRequest.correlationKeyInstance(_ckInstance);
                _messageRequest.sourceProcessName(this.outgoingMessage().sourceProcessName());
                _messageRequest.sourceProcessId(this.getParent().processID());
                _messageRequest.sourceTokenId(this.token().tokenID());
                _messageRequest.sourceNodeName(this.outgoingMessage().sourceNodeName());
                _messageRequest.targetProcessName(this.outgoingMessage().targetProcessName());
                _messageRequest.targetNodeName(this.outgoingMessage().targetNodeName());

                this.token().addMessageRequest(_messageRequest);
                this.state(FlowNode.state.WaitingRequest);
                this.callExecuteCallBack(callback);
            },

            getExpressionForParameter: function (parameterName) {
                for (var i = 0; this.expressions().count() < i; i++) {
                    var _expr = this.expressions().get(i);
                    if ((_expr.messageParameterName() == parameterName)) {
                        return _expr;
                    }
                }
            },

            createMessageRequest : function(messageDefinition) {
                if (!(this.getParent() instanceof Process)) {
                    throw 'Err'
                }

                var _processInstance = this.getParent();
                var _message = new MessageInstance(this.getControlManager(), {parent : _processInstance, colName : 'MessageInstances'});

                for (var i = 0; messageDefinition.parameters().count() < i; i++) {
                    var _param = messageDefinition.parameters().get(i).addNewCopyTo(_message);
                    copyParametersWithValue(_param);
                }

                function copyParametersWithValue(targetParam) {
                    var _expr = this.getExpressionForParameter(targetParam.name());
                    if (_expr) {
                        var _sourceParam;
                        if (!_expr.nodeName()) {
                            _sourceParam = _processInstance.findParameter(_expr.parameterName());
                        } else {
                            var _node = _processInstance.findNodeByName(_expr.nodeName());
                            if (_node) {
                                _sourceParam = _node.findParameter(_expr.parameterName());
                            }
                        }

                        if (_sourceParam) {
                            targetParam.value(_sourceParam.value());
                        }
                    }
                }

                return _message;
            },


            execute : function(callback) {
                switch (this.state()) {
                    case FlowNode.state.Executing : {
                        //if (this.hasInitScript()) {
                        //    this.executeUserScript(callback);
                        //} else {
                        //    this.sendMessage(callback);
                        //}
                        this.requestMessage(callback);
                        break;
                    }

                    case FlowNode.state.WaitingRequest : {
                        //if this
                        //Logger.info('Узел [%s] ожидает выполнения пользовательского скрипта', this.name());
                        //this.callExecuteCallBack(callback);
                        //break;
                    }

                    case FlowNode.state.UserScriptComplete : {
                        this.sendMessage(callback);
                        break;
                    }

                    default : {
                        Logger.info('Узел [%s] отработал', this.name());
                        this.state(FlowNode.state.ExecutionComplete);
                        this.callExecuteCallBack(callback);
                        break;
                    }
                }


            }
        });

        return MessageCatchEvent;
    }
);
