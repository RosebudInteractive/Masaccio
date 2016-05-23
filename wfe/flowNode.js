/**
 * Created by staloverov on 30.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
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
        Closed : 9,
        HasNewResponse : 10
    };

define([
        UCCELLO_CONFIG.uccelloPath + 'system/uobject',
        './sequenceFlow',
        './scriptObject',
        './Gateways/conditionsResult',
        UCCELLO_CONFIG.uccelloPath + 'system/utils',
        './controls',
        './parameter',
        './objectRef',
        './engineSingleton'
    ],
    function(
        UObject,
        SequenceFlow,
        ScriptObject,
        ConditionsResult,
        UUtils,
        Controls,
        Parameter,
        ObjectRef,
        EngineSingleton
    ){
        var FlowNode = UObject.extend({

            className: "FlowNode",
            classGuid: Controls.guidOf('FlowNode'),
            metaFields: [
                {fname : 'Name',  ftype : 'string'},
                {fname : 'State', ftype : 'integer'},
                {fname : 'Guid',  ftype : 'string'},
                {fname : "dbId",  ftype : "integer"}
            ],
            metaCols: [
                {'cname' : 'Incoming', 'ctype' : 'ObjectRef'},
                {'cname' : 'Outgoing', 'ctype' : 'ObjectRef'},
                {'cname' : 'Connectors', 'ctype' : 'SequenceFlow'},
                {'cname' : 'Parameters', 'ctype' : 'WfeParameter'}
            ],

            init: function(cm, params){
                UccelloClass.super.apply(this, [cm, params]);
                if (!params) { return }

                if (!this.guid()) {
                    this.guid(UUtils.guid());
                }

                this.conditionsResult = new ConditionsResult();
                this.needSave = false;
            },

            //<editor-fold desc="MetaFields & MetaCols">
            guid : function(value) {
                return this._genericSetter("Guid",value);
            },

            dbId : function(value) {
                return this._genericSetter("dbId", value);
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
                if (!params) {
                    params = {
                        parent  : token,
                        colName : 'NodeInstances'
                    }
                }

                var _node = this.createInstance(token.getControlManager(), params);
                _node.assign(this, token);
                _node.assignConnections(this);
                _node.addCollectionInstances(this);

                return _node;
            },

            completeExecution: function(){
                this.state(flowNodeState.ExecutionComplete);
                this.needSave = true;
            },

            copyNodeDefinition : function(process, params){
                var _node = this.createInstance(process.getControlManager(), params);
                _node.assign(this, process);
                _node.guid(this.guid());
                _node.copyCollectionDefinitions(this, process);

                return _node;
            },

            createInstance : function(){
                throw 'NotImplementedException';
            },

            getParent : function() {
                return this.pvt.parent;
            },

            getRootObj : function() {
                return this.getParent().getRootObj();
            },

            assignConnections: function (source) {
                for (var i = 0; i < source.incoming().count(); i++) {
                    var _inConnector = source.incoming().get(i).object().clone(this, {parent  : this, colName : 'Connectors'});
                    _inConnector.newIncomingLink(this);
                }
                for (var i = 0; i < source.outgoing().count(); i++) {
                    var _outConnector = source.outgoing().get(i).object().clone(this, {parent  : this, colName : 'Connectors'});
                    _outConnector.newOutgoingLink(this);
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

            execute : function(callback) {
                if (this.processInstance().isSaving()) {
                    this.saving();
                    this.callExecuteCallBack(callback);
                } else {
                    for (var i = 0; i < this.outgoing().count(); i++){
                        this.outgoing().get(i).object().state(SequenceFlow.state.Unchecked);
                    }

                    this.processInstance().enqueueCurrentToken();
                    this.processInstance().wait();
                }
            },

            callExecuteCallBack : function(callback) {
                if (callback) {
                    if (!this.needSave) {
                        setTimeout(function(){
                            callback()        
                        }, 0);
                    } else {
                        var that = this;
                        var _state = this.processInstance().state();
                        this.processInstance().saving();
                        EngineSingleton.getInstance().justSaveProcess(this.processInstance().processID()).
                        then(function () {
                            that.needSave = false;
                            that.processInstance().state(_state);
                            // callback()
                            setTimeout(function(){
                                callback()
                            }, 0);
                        }).
                        catch(function (err) {
                            that.needSave = false;
                            that.processInstance().state(_state);
                            throw err
                        })

                    }
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

            saving : function(){
                this.needSave = false;
                // this.state(flowNodeState.Saving)
            },

            isWaitingRequest : function() {
                return this.state() == flowNodeState.WaitingRequest;
            },
            
            waitingRequest : function() {
                this.state(flowNodeState.WaitingRequest);    
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
            },

            hasNewRequests : function() {
                return false
            }
        });

        return FlowNode;
    }
);

module.exports.state = flowNodeState;
