/**
 * Created by staloverov on 09.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
    //var NodeProcess = require('Process');
}

var tokenState = {alive: 0, dead: 1};

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', './flowNode', './process', './NodeProps/nodeProperties', './request',
    './engineSingleton'],
    function(UObject, FlowNode, Process, NodeProps, Request, EngineSingleton){
        var Token = UObject.extend({

            className: "Token",
            classGuid: UCCELLO_CONFIG.classGuids.Token,
            metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            tokenID : "",
            currentNode : null,

            /*Todo : пока заготовка на будующее, вложенность токен пока не используется*/
            parentToken : null,
            childTokens : [],

            //states : {alive : 0, dead : 1},
            //processInstance : null,

            init: function(cm, params, processInstance){
                this._super(cm,params);
                this.processInstance = processInstance;
                this.nodesProps = [];
                //this.ExtProperties = [];
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            execute : function() {
                var _processInstance = this.processInstance;
                _processInstance.state = Process.state.Running;

                switch (this.currentNode.state){
                    case FlowNode.state.Initialized : {
                        _processInstance.currentToken = this;
                        this.currentNode.processInstance = _processInstance;

                        this.doOnInitialized()

                        this.currentNode.state = FlowNode.state.Executing;
                        return this.execute();
                    };

                    case (FlowNode.state.Executing) : {
                        this.doOnExecuting();

                        return this.execute();
                    };

                    case (FlowNode.state.WaitingRequest) || (FlowNode.state.WaitingTokens) : {
                        /* Todo : возможно нужен callback*/
                        EngineSingleton.getInstance().continueProcess(this);
                        /* Сохранение и выгрузка из памяти процесса */
                        //return this.execute();
                        return 'Процесс ожидает ответ';
                    };

                    case (FlowNode.state.ExecutionComplete) : {
                        //var _nextNode = this.hasNextNode();
                        //if (_nextNode !== undefined) {
                        //    this.currentNode = _nextNode;
                        //    this.currentNode.state = FlowNode.state.Initialized;
                        //}
                        //else {
                        //    this.currentNode.state = FlowNode.state.Closed;
                        //};
                        //
                        //return this.execute();


                        if (this.hasNextNode()) {
                            EngineSingleton.getInstance().switchToken(this)
                        } else {
                            this.currentNode.state = FlowNode.state.Closed;
                            return this.execute();
                        }
                    };

                    case (FlowNode.state.Closed) : {
                        this.state = tokenState.dead;
                        return "Token " + this.tokenID + " выполнен"; };

                    default : { return "Неизвестный статус узла" };
                }
            },

            hasNewRequest: function () {
                return true;
            },

            executeNode : function() {
                this.currentNode.execute();
                var _nodeState = this.currentNode.state;
                if (this.hasNewRequest() && _nodeState == FlowNode.state.WaitingRequest) {
                    var _nodeProps = this.getPropertiesOfNode(this.currentNode.name);
                    if (_nodeProps !== undefined && _nodeProps !== null) { this.exposeRequests(_nodeProps); }
                }
            },

            exposeRequests : function (nodeProps) {
                for (var i in nodeProps.requests) {
                    if (!nodeProps.requests.hasOwnProperty(i)) continue;

                    var _request = nodeProps.requests[i]
                    _request.state = Request.state.Exposed;

                    var _requestEventParams = {
                        processID: this.processInstance.processID,
                        tokenID: this.tokenID,
                        requestID: _request.ID,
                        requestName: _request.name,
                        nodeName: this.currentNode.name
                    };

                    EngineSingleton.getInstance().exposeRequest(
                        _request, _requestEventParams, function (token) {
                            console.log('Вызов callback-а');
                            console.log('token [%s]', token.tokenID);
                            token.execute();
                        });
                }
            },

            hasNextNode : function() {
                return (this.currentNode.getOutgoingNodes().length != 0);
            },

            clearNodeResponses: function (nodeName) {
                var _nodeProps = this.getPropertiesOfNode(nodeName);
                if (_nodeProps !== undefined && _nodeProps !== null) {
                    _nodeProps.clearResponses()
                }
            },

            getPropertiesOfNode : function (nodeName) {
                for (var i = 0; i < this.nodesProps.length; i++) {
                    var _nodeProps = this.nodesProps[i];
                    if (_nodeProps.name == nodeName) {
                        return _nodeProps
                    }
                }

                return null;
            },

            addResponse : function (response){
                var _nodeProps = this.getPropertiesOfNode(this.currentNode.name);
                _nodeProps.responses.push(response);
                _nodeProps.addParameter(response.parameters[0]);
            },

            doOnInitialized : function() {

                this.isContainsCurrentNodeParams = function () {
                    var _extProps = this.getPropertiesOfNode(this.currentNode.name);
                    return (_extProps !== undefined && _extProps !== null)
                };

                this.copyNodeParams = function (properties) {
                    for (var i in this.currentNode.parameters) {
                        if (!this.currentNode.parameters.hasOwnProperty(i)) continue;

                        properties.addParameter(this.currentNode.parameters.clone())
                    }
                }

                if (!this.isContainsCurrentNodeParams()) {
                    var _props = new NodeProps(this.pvt.controlMgr);
                    _props.name = this.currentNode.name;
                    this.copyNodeParams(_props);
                    this.nodesProps.push(_props)
                };

                this.clearNodeResponses();
            },

            doOnExecuting: function () {
                this.executeNode();

                if (this.currentNode.state == FlowNode.state.WaitingRequest || this.currentNode.state == FlowNode.state.WaitingTokens){
                    // переход на WaitingRequest
                }
                else {
                    // переход ExecutionComplete
                }
            }
        });

        return Token;
    }
)


module.exports.tokenState = tokenState;
