/**
 * Created by staloverov on 30.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    //var Class = require('class.extend');
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

var flowNodeState = {
        Passive : 0,
        Initialized : 1,
        Executing : 2,
        WaitingRequest : 3,
        WaitingTokens : 4,
        WaitingUserScriptAnswer : 5,
        ExecutionComplete : 6,
        UserScriptComplete : 7,
        WaitingSubProcess : 8,
        Closed : 9
    };

define([
        UCCELLO_CONFIG.uccelloPath + 'system/uobject',
        './sequenceFlow',
        './scriptObject',
        './Gateways/conditionsResult',
        UCCELLO_CONFIG.uccelloPath + 'system/utils',
        './controls',
        './parameter',
        './objectRef'
        //'./../public/utils'
    ],
    function(
        UObject,
        SequenceFlow,
        ScriptObject,
        ConditionsResult,
        UUtils,
        Controls,
        Parameter,
        ObjectRef
        //Utils
    ){
        var FlowNode = UObject.extend({

            className: "FlowNode",
            classGuid: Controls.guidOf('FlowNode'),
            metaFields: [
                {fname : 'Name',  ftype : 'string'},
                {fname : 'State', ftype : 'integer'},
                {fname : 'ID',    ftype : 'string'}
            ],
            metaCols: [
                {'cname' : 'Incoming', 'ctype' : 'ObjectRef'},
                {'cname' : 'Outgoing', 'ctype' : 'ObjectRef'},
                {'cname' : 'Connectors', 'ctype' : 'SequenceFlow'},
                {'cname' : 'Parameters', 'ctype' : 'Parameter'}
            ],

            init: function(cm, params){
                UccelloClass.super.apply(this, [cm, params]);
                if (!params) { return }

                if (!this.id()) {
                    this.id(UUtils.guid());
                }

                this.conditionsResult = new ConditionsResult();
            },

            //<editor-fold desc="MetaFields & MetaCols">
            id : function(value) {
                return this._genericSetter("ID",value);
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            outgoing : function(){
                return this.getCol('Outgoing');
            },

            incoming : function(){
                return this.getCol('Incoming');
            },

            connectors : function(){
                return this.getCol('Connectors');
            },

            parameters : function() {
                return this.getCol('Parameters');
            },
            //</editor-fold>

            getInstance : function(token, params){
                // todo : возможно обойтись без process
                if (!params) {
                    params = {
                        parent  : token,
                        colName : 'NodeInstances'
                    }
                }

                var _node= this.createInstance(token.getControlManager(), params);
                _node.assign(this, token);
                _node.assignConnections(this);
                //_node.addLinkToParameters(this);
                _node.addCollectionInstances(this);

                return _node;
            },

            copyNodeDefinition : function(process, params){
                var _node= this.createInstance(process.getControlManager(), params);
                _node.assign(this, process);
                _node.id(this.id());
                _node.copyCollectionDefinitions(this, process);
                //_node.copyParameters(this)

                return _node;
            },

            createInstance : function(){
                throw 'NotImplementedException';
            },

            getParent : function() {
                return this.pvt.parent;
            },

            getRoot : function() {
                return this.getParent().getRoot();
            },

            assignConnections: function (source) {
                for (var i = 0; i < source.incoming().count(); i++) {
                    var _inConnector = source.incoming().get(i).object().clone(this, {parent  : this, colName : 'Connectors'});
                    _inConnector.newIncomingLink(this);
                    //Utils.createRefTo(_inConnector, {parent  : this, colName : 'Incoming'});
                    //this.incoming()._add()
                }
                for (var i = 0; i < source.outgoing().count(); i++) {
                    var _outConnector = source.outgoing().get(i).object().clone(this, {parent  : this, colName : 'Connectors'});
                    _outConnector.newOutgoingLink(this);
                    //ObjectRef.createRefTo(_outConnector, {parent  : this, colName : 'Outgoing'});
                    //this.outgoing()._add()
                }
            },

            findNode : function(node) {
                return this.getParent().findNode(node);
            },

            findParameter : function(parameterName) {
                for (var i = 0; i < this.parameters().count(); i++) {
                    if (this.parameters().get(i).name() == parameterName) {
                        return this.parameters().get(i)
                    }
                }
                return null;
            },

            findConnector : function(connector) {
                for (var i = 0; i < this.connectors().count(); i++) {
                    var _connector = this.connectors().get(i);
                    if ((_connector.id() == connector.id()) && (_connector.name() == connector.name())){
                        return _connector;
                    }
                }
            },

            getControlManager : function() {
                return this.getParent().getControlManager();
            },

            assign : function(source){
                this.name(source.name());
                this.state(source.state());
            },

            addCollectionInstances : function(nodeDefinition) {
                this.addLinkToParameters(nodeDefinition);
            },

            addLinkToParameters : function(nodeDefinition) {
                for (var i = 0; i < nodeDefinition.parameters().count(); i++) {
                    this.parameters()._add(nodeDefinition.parameters().get(i));
                }
            },

            copyCollectionDefinitions : function(source) {
                this.copyParameters(source);
            },

            copyParameters : function(source) {
                for (var i = 0; i < source.parameters().count(); i++) {
                    source.parameters().get(i).clone(this.getControlManager(), {parent  : this, colName : 'Parameters'});
                }
            },


            state: function(value) {
                return this._genericSetter("State",value);
            },

            processInstance : function(){
                return this.token().getParent();
            },

            token : function() {
                return this.getParent();
            },

            cancel : function() {

            },

            calcOutgoingNodes : function() {
                throw 'NotImplementedException';
            },

            close : function() {
                console.log('[%s] : => [%s] узел закончил выполнение', (new Date()).toLocaleTimeString(), this.name());
                this.state(flowNodeState.Closed);
            },

            execute : function() {
                for (var i = 0; i < this.outgoing().count(); i++){
                    this.outgoing().get(i).object().state(SequenceFlow.state.Unchecked);
                }

                this.processInstance().enqueueCurrentToken();
                this.processInstance().wait();
            },

            callExecuteCallBack : function(callback) {
                if (callback) {
                    setTimeout(callback, 0)
                } else {
                    throw 'No execute callback'
                }
            },


            addOutgoing : function(sequence) {
                sequence.newOutgoingLink(this); //this.outgoing()._add(sequence);
            },

            isAllOutgoingChecked : function() {
                for (var i = 0; i < this.outgoing().count(); i++) {
                    if (this.outgoing().get(i).object().state() != SequenceFlow.state.Checked){
                        return false;
                    }
                }

                return true;
            },

            createSequenceScriptObject : function(sequence, resultCallback) {
                var _scriptObject = new ScriptObject(this.processInstance());
                _scriptObject.moduleName = sequence.script().moduleName();
                _scriptObject.methodName = sequence.script().methodName();
                _scriptObject.methodParams = sequence.script().parameters();

                var that = this;
                _scriptObject.setCallback(
                    function(condition, result){
                        that.conditionsResult.addResult(condition, result);
                        condition.check();

                        if (that.isAllOutgoingChecked()) {
                            that.state(flowNodeState.UserScriptComplete);
                            that.returnOutgoingNodes(resultCallback)
                        }
                    }
                );

                return _scriptObject;
            },

            returnOutgoingNodes : function(resultCallback) {
                if (resultCallback) {
                    resultCallback(this.getOutgoingNodes())
                }
            },

            getOutgoingNodes : function() {
                throw 'NotImplementedException';
            },

            addIncoming : function(sequence) {
                sequence.newIncomingLink(this);//this.incoming()._add(sequence);
            },

            waitUserScriptAnswer : function(){
                this.state(flowNodeState.WaitingUserScriptAnswer);
                this.processInstance().wait();
            },

            isWaitingRequest : function() {
                return this.state() == flowNodeState.WaitingRequest;
            },

            canStartProcess : function() {
                return false
            },

            addParameter : function(parameterName) {
                var _param = new Parameter(this.getControlManager(), {parent : this, colName : 'Parameters'});
                _param.name(parameterName);
                return _param;
            },

            hasNewOutgoingMessage : function() {
                return false
            }
        });

        return FlowNode;
    }
);

module.exports.state = flowNodeState;
