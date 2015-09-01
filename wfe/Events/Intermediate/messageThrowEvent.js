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
        './../../Messages/messageInstance',
        './../../process'
    ],
    function(
        Event,
        FlowNode,
        Controls,
        Logger,
        Utils,
        MessageInstance,
        Process
    ){
        var MessageThrowEvent = Event.extend({

            className: 'MessageThrowEvent',
            classGuid: Controls.guidOf('MessageThrowEvent'),
            metaFields : [
                {
                    fname : 'OutgoingMessage',
                    ftype : {
                        type : 'ref',
                        res_elem_type : Controls.guidOf('MessageFlow')
                    }
                }
            ],
            metaCols: [
                {'cname' : 'Expressions', 'ctype' : 'MessageRetrievalExpression'}

            ],

            outgoingMessage: function(value) {
                return this._genericSetter('OutgoingMessage', value);
            },

            expressions : function() {
                return this.getCol('Expressions');
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


            sendMessage: function (callback) {
                var _correlationKey = this.outgoingMessage().correlationKey();
                var _ckInstance = _correlationKey.createInstance(this.outgoingMessage().name());

                var _messageInstance = this.createMessageInstance(this.outgoingMessage().messageDefinition());
                _messageInstance.correlationKeyInstance(_ckInstance);
                _messageInstance.sourceProcessName(this.outgoingMessage().sourceProcessName());
                _messageInstance.sourceProcessId(this.getParent().processID());
                _messageInstance.sourceTokenId(this.token().tokenID());
                _messageInstance.sourceNodeName(this.outgoingMessage().sourceNodeName());
                _messageInstance.targetProcessName(this.outgoingMessage().targetProcessName());
                _messageInstance.targetNodeName(this.outgoingMessage().targetNodeName());

                this.token().addSentMessage(_messageInstance);
                this.state(FlowNode.state.ExecutionComplete);
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

            createMessageInstance : function(messageDefinition) {
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
                        if (this.hasScript()) {
                            /* Todo : здесь возможно callback не нужен */
                            this.executeUserScript(callback);
                        } else {
                            this.sendMessage(callback);
                        }
                        break;
                    }

                    case FlowNode.state.WaitingScriptAnswer : {
                        Logger.info('Узел [%s] ожидает выполнения пользовательского скрипта', this.name());
                        this.callExecuteCallBack(callback);
                        break;
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

        return MessageThrowEvent;
    }
);
