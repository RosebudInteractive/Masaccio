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
        './../../engineSingleton',
        './../../Messages/messageRetrievalExpression'
    ],
    function(
        Event,
        FlowNode,
        Controls,
        Logger,
        Utils,
        Process,
        ProcessDefinition,
        EngineSingleton,
        MessageRetrievalExpression
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

            init: function(cm, params){
                UccelloClass.super.apply(this, [cm, params]);
                if (!params) { return }

                if (this.getRoot() instanceof ProcessDefinition) {
                    var _flow = this.getRoot().addMessageFlow();
                    this.outgoingMessage(_flow);
                }
            },

            outgoingMessage: function(value) {
                return this._genericSetter('OutgoingMessage', value);
            },

            createInstance : function(cm, params){
                return new MessageThrowEvent(cm, params);
            },

            expressions : function() {
                return this.getCol('Expressions');
            },

            createOutgoingMessage : function(messageDefinition, targetProcessName, targetNodeName) {
                this.outgoingMessage().messageDefinition(messageDefinition);
                this.outgoingMessage().sourceProcessName(this.getRoot().name());
                this.outgoingMessage().sourceNodeName(this.name());
                this.outgoingMessage().targetProcessName(targetProcessName);
                this.outgoingMessage().targetNodeName(targetNodeName);
            },

            addExpression : function(exprParams) {
                var _expr = new MessageRetrievalExpression(this.getControlManager(), {parent : this, colName : 'Expressions'});
                if (!exprParams) {
                    return _expr;
                } else {
                    if (exprParams.hasOwnProperty('messageName')) {
                        _expr.messageName(exprParams.messageName);
                    }
                    if (exprParams.hasOwnProperty('nodeName')) {
                        _expr.nodeName(exprParams.nodeName);
                    }
                    if (exprParams.hasOwnProperty('parameterName')) {
                        _expr.parameterName(exprParams.parameterName);
                    }
                    if (exprParams.hasOwnProperty('messageParameterName')) {
                        _expr.messageParameterName(exprParams.messageParameterName)
                    }
                    return _expr;
                }
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
                var _messageInstance = this.createMessageInstance(this.outgoingMessage().messageDefinition());
                var _correlationKey = this.outgoingMessage().correlationKey();
                var _ckInstance = _correlationKey.createInstanceForMessage(this.outgoingMessage().messageDefinition().name(), _messageInstance);
                _messageInstance.correlationKeyInstance(_ckInstance);
                _messageInstance.sourceProcessName(this.outgoingMessage().sourceProcessName());
                _messageInstance.sourceProcessId(this.processInstance().processID());
                _messageInstance.sourceTokenId(this.token().tokenId());
                _messageInstance.sourceNodeName(this.outgoingMessage().sourceNodeName());
                _messageInstance.targetProcessName(this.outgoingMessage().targetProcessName());
                _messageInstance.targetNodeName(this.outgoingMessage().targetNodeName());

                this.token().addSentMessage(_messageInstance);
                this.state(FlowNode.state.ExecutionComplete);
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

            createMessageInstance : function(messageDefinition) {
                if (!(this.getRoot() instanceof Process)) {
                    throw 'Err'
                }

                //var _processInstance = this.processInstance();

                var _message = EngineSingleton.getInstance().newMessageInstance();
                _message.messageDefinition(messageDefinition);

                for (var i = 0; i < messageDefinition.parameters().count(); i++) {
                    var _param = messageDefinition.parameters().get(i).addNewCopyTo(_message);
                    this.copyParametersWithValue(_param);
                }

                return _message;
            },

            copyParametersWithValue : function(targetParam) {
                var _expr = this.getExpressionForParameter(targetParam.name());
                if (_expr) {
                    var _sourceParam;
                    if (!_expr.nodeName()) {
                        _sourceParam = this.processInstance().findParameter(_expr.parameterName());
                    } else {
                        var _node = this.processInstance().findNodeByName(_expr.nodeName());
                        if (_node) {
                            _sourceParam = _node.findParameter(_expr.parameterName());
                        }
                    }

                    if (_sourceParam) {
                        targetParam.value(_sourceParam.value());
                    }
                }
            },

            assign : function(source){
                UccelloClass.super.apply(this, [source]);

                var _outgoingMessage = this.getRoot().getMessageFlow(source.outgoingMessage());
                this.outgoingMessage(_outgoingMessage);
            },

            copyCollectionDefinitions : function(source, process) {
                UccelloClass.super.apply(this, [source, process]);

                //for (var i = 0; i < source.expressions().count(); i++){
                //    this.expressions()._add(source.requests().get(i).clone(process.getControlManager(), {parent : process, colName : 'Requests'}));
                //}
                //
                //for (var i = 0; i < source.responses().count(); i++){
                //    this.responses()._add(source.responses().get(i).clone(process.getControlManager(), {parent : process, colName : 'Responses'}))
                //}
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
