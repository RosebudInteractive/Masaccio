/**
 * Created by staloverov on 09.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

var tokenState = {Alive: 0, Dead: 1};

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        './flowNode',
        './process',
        './NodeProps/nodeProperties',
        './request',
        './engineSingleton'
    ],
    function(
        UObject,
        FlowNode,
        Process,
        NodeProps,
        Request,
        EngineSingleton
    ){
        var Token = UObject.extend({

            //<editor-fold desc="Class description">
            className: "Token",
            classGuid: UCCELLO_CONFIG.classGuids.Token,
            metaFields: [
                {fname : "State", ftype : "string"},
                {fname : 'TokenID', ftype : 'string'},
                {
                    fname: 'CurrentNode',
                    ftype: {
                        type : 'ref',
                        res_elem_type : UCCELLO_CONFIG.classGuids.FlowNode
                    }
                }
            ],
            metaCols: [
                {'cname' : 'NodesProps', 'ctype' : 'NodeProperties'},
                {'cname' : 'NodeInstances', 'ctype' : 'FlowNode'}
            ],
            //</editor-fold>

            init: function(cm, params){
                UccelloClass.super.apply(this, [cm, params]);
                if (!params) { return };
            },

            //<editor-fold desc="MetaFields & MetaCols">
            state: function(value) {
                return this._genericSetter("State",value);
            },

            tokenID: function(value) {
                return this._genericSetter("TokenID",value);
            },

            currentNode: function(value) {
                return this._genericSetter("CurrentNode",value);
            },

            processInstance: function(value) {
                return this.pvt.parent;
            },

            getControlManager : function() {
                return this.processInstance().getControlManager();
            },

            nodesProps : function() {
                return this.getCol('NodesProps');
            },
            //</editor-fold>

            execute : function() {
                var _processInstance = this.processInstance();

                switch (this.currentNode().state()){
                    case FlowNode.state.Initialized : {
                        _processInstance.currentToken(this);

                        this.doOnInitialized()

                        this.currentNode().state(FlowNode.state.Executing);
                        return this.execute();
                    };

                    case (FlowNode.state.Executing) : {
                        this.executeNode();
                        EngineSingleton.getInstance().switchTokens(this);
                        break;
                        //return this.execute();
                    };

                    case (FlowNode.state.WaitingRequest) || (FlowNode.state.WaitingTokens) : {
                        /* Todo : возможно нужен callback*/
                        EngineSingleton.getInstance().deactivateProcess(this.processInstance());
                        /* Todo : Сохранение и выгрузка из памяти процесса */
                        return 'Процесс ожидает ответ';
                    };

                    case (FlowNode.state.ExecutionComplete) : {
                        var that = this;

                        this.currentNode().calcOutgoingNodes(function(result) {
                            EngineSingleton.getInstance().activateProcess(that.processInstance().processID());
                            EngineSingleton.getInstance().startOutgoingNodes(that);
                        });

                        break;
                    };

                    case (FlowNode.state.WaitingUserScriptAnswer) : {
                        EngineSingleton.getInstance().switchTokens(this)
                        break;
                    };

                    case (FlowNode.state.UserScriptComplete) : {
                        if (this.hasNextNode()) {
                            EngineSingleton.getInstance().switchTokens(this);
                            break;
                        } else {
                            this.currentNode().close();
                            EngineSingleton.getInstance().switchTokens(this);
                            break;
                        }
                    }

                    case (FlowNode.state.Closed) :
                    {
                        if (!this.hasNextNode()) {
                            this.die();
                            if (this.processInstance().isAllTokensDead()) {
                                EngineSingleton.getInstance().deactivateProcess(this.processInstance())
                            } else {
                                EngineSingleton.getInstance().switchTokens(this);
                            }
                        } else {
                            EngineSingleton.getInstance().switchTokens(this);
                        }
                    }

                    default : { return "Неизвестный статус узла" };
                }
            },

            die : function() {
                if (this.state() == tokenState.Alive) {
                    this.state(tokenState.Dead);
                    console.log('[%s] : XX Token [%s] закончил выполнение', (new Date()).toLocaleTimeString(), this.tokenID());
                    EngineSingleton.getInstance().archiveToken(this);
                }
            },

            hasNewRequest: function () {
                return true;
            },

            executeNode : function() {
                var that = this;
                this.currentNode().execute(function() {
                    EngineSingleton.getInstance().activateProcess(that.processInstance().processID());
                    EngineSingleton.getInstance().switchTokens(that);
                });
                if (this.hasNewRequest() && this.currentNode().isWaitingRequest()) {
                    var _nodeProps = this.getPropertiesOfNode(this.currentNode().name());
                    if (_nodeProps) {
                        this.exposeRequests(_nodeProps);
                    }
                }
            },

            exposeRequests : function (nodeProps) {
                for (var i = 0; i < nodeProps.requests().count(); i++) {

                    var _request = nodeProps.requests().get(i);
                    _request.state(Request.state.Exposed);

                    var _requestEventParams = {
                        processID: this.processInstance().processID(),
                        tokenID: this.tokenID(),
                        requestID: _request.ID(),
                        requestName: _request.name(),
                        nodeName: this.currentNode().name
                    };

                    EngineSingleton.getInstance().exposeRequest(
                        _request, _requestEventParams, function (token) {
                            if (!token.processInstance().isWaitingScriptAnswer()) {
                                token.execute();
                            }
                        });
                }
            },

            hasNextNode : function() {
                return (this.currentNode().getOutgoingNodes().length != 0);
            },

            clearNodeResponses: function (nodeName) {
                var _nodeProps = this.getPropertiesOfNode(nodeName);
                if (!_nodeProps) {
                    _nodeProps.clearResponses()
                }
            },

            getPropertiesOfNode : function (nodeName) {
                for (var i = 0; i < this.nodesProps().count(); i++) {
                    var _nodeProps = this.nodesProps().get(i);
                    if (_nodeProps.name() == nodeName) {
                        return _nodeProps
                    }
                }

                return null;
            },

            addResponse : function (response){
                var _nodeProps = this.getPropertiesOfNode(this.currentNode().name());
                _nodeProps.addResponse(response);
            },

            doOnInitialized : function() {

                this.isContainsCurrentNodeParams = function () {
                    return (this.getPropertiesOfNode(this.currentNode().name()))
                };

                this.copyNodeParams = function (properties) {
                    for (var i = 0; i < this.currentNode().parameters().count(); i++) {
                        this.currentNode().parameters().clone(this.getControlManager(), {parent  : properties, colName : 'Parameters'})
                    }
                }

                if (!this.isContainsCurrentNodeParams()) {
                    var _nodeProps = new NodeProps(this.getControlManager(), {parent  : this, colName : 'NodesProps'});
                    _nodeProps.name(this.currentNode().name());
                    this.copyNodeParams(_nodeProps);
                    //this.nodesProps()._add(_nodeProps)
                };

                this.clearNodeResponses(this.currentNode().name());
            },

            copyNodePropsFromToken : function(token) {
                for (var i = 0; i < token.nodesProps().count(); i++) {
                    token.nodesProps().get(i).clone(this.getControlManager(), {parent  : this, colName : 'NodesProps'})
                }
            },

            isLive : function() {
                return this.state() != tokenState.Dead
            },

            findNode : function(node) {
                return this.getParent().findNode(node);
            }
        });

        return Token;
    }
)

module.exports.state = tokenState;
