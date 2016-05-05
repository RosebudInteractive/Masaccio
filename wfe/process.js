/**
 * Created by staloverov on 28.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

var processStates = {
    Initialized : 0,
    Running : 1,
    Finished : 2,
    Aborted : 3,
    Waiting : 4,
    WaitingScriptAnswer : 5,
    None : 6
};

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        './processDefinition',
        UCCELLO_CONFIG.uccelloPath + 'system/utils',
        './sequenceFlow',
        './engineSingleton',
        './controls',
        './userScript',
        './../public/logger',
        './processVar'
    ],
    function(
        UObject,
        Definition,
        UUtils,
        SequenceFlow,
        EngineSingleton,
        Controls,
        UserScript,
        Logger,
        ProcessVar
    ){
        var Process = UObject.extend({

            //<editor-fold desc="Class description">
            className: "Process",
            classGuid: Controls.guidOf('Process'),
            metaFields: [
                {fname : 'Name', ftype : 'string'},
                {fname : 'State', ftype : 'integer'},
                {fname : 'SequenceValue', ftype : 'integer'},
                {fname : 'ProcessID', ftype : 'string'},
                {fname : 'DefinitionID', ftype : 'string'},
                {fname : 'DefinitionResourceID', ftype : 'integer'},
                {
                    fname : 'CurrentToken',
                    ftype : {
                        type : 'ref',
                        res_elem_type : Controls.guidOf('Token')
                    }
                }

            ],
            metaCols: [
                {'cname' : 'Tokens', 'ctype' : 'Token'},
                {'cname' : 'TokenQueue', 'ctype' : 'ObjectRef'},
                {'cname' : 'Requests', 'ctype' : 'Request'},

                {'cname' : 'CorrelationKeys', 'ctype' : 'CorrelationKey'},
                {'cname' : 'CorrelationKeyInstances', 'ctype' : 'CorrelationKeyInstance'},

                {'cname' : 'MessageInstances', 'ctype' : 'MessageInstance'},
                {'cname' : 'MessageFlows', 'ctype' : 'MessageFlow'},
                {'cname' : 'MessageRequests', 'ctype' : 'MessageInstance'},
                {'cname' : 'Definitions', 'ctype' : 'ProcessDefinition'},
                {'cname' : 'Vars', 'ctype' : 'ProcessVar'}
            ],
            //</editor-fold>
            
            

            init: function(cm, params, definition){
                UccelloClass.super.apply(this, [cm, params]);
                if (!params) { return }

                // Todo : Костыль!!!!
                if (!this.processID()) {
                    this.pvt.db.deserialize(definition, {obj: this, colName: 'Definitions'}, EngineSingleton.getInstance().createComponentFunction);
                    if (params.hasOwnProperty('definitionResourceID')) {
                        this.definitionResourceID(params.definitionResourceID)
                    }
                    
                    if (params.hasOwnProperty('params')) {
                        this.definition().setInputParams(params.params);
                    }

                    if (this.checkInputParams()) {
                        this.definition().applyInputTaskParams();
                        this.createProcessVar();
                        
                    }

                    this.processID(UUtils.guid());
                    this.sequenceValue(0);
                    this.copyDefinition();
                    this.state(processStates.Initialized);
                }
            },

            checkParams : function(params) {
                return this.definition().checkParams(params)
            },

            createProcessVar: function () {
                var _taskParameter = this.definition().taskParams();
                var _processVar = new ProcessVar(this.getControlManager(), {parent: this, colName: 'Vars'});
                _processVar.copy(_taskParameter);
            },
            
            copyMessages: function (definition) {
                for (var i = 0; i < definition.messageFlows().count(); i++) {
                    definition.messageFlows().get(i).addNewCopyTo(this);
                }
            },

            copyCorrelations: function (definition) {
                for (var i = 0; i < definition.correlationKeys().count(); i++) {
                    definition.correlationKeys().get(i).addNewCopyTo(this);
                }
            },

            copyDefinition: function () {
                var definition = this.definition();
                this.name(definition.name());
                this.definitionID(definition.definitionID());
                this.copyCorrelations(definition);
                this.copyMessages(definition);
            },

            getCorrelationKey : function(correlationKey) {
                for (var i = 0; this.correlationKeys().count(); i++) {
                    if (correlationKey.name() == this.correlationKeys().get(i).name()) {
                        return this.correlationKeys().get(i);
                    }
                }
            },

            //<editor-fold desc="MetaFields & MetaCols">
            processVar : function(){
                return this.getCol('ProcessVars').get(0);
            },
            
            definition : function(){
                return this.getCol('Definitions').get(0);
            },

            name : function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            processID : function(value) {
                return this._genericSetter("ProcessID",value);
            },

            sequenceValue : function(value) {
                return this._genericSetter("SequenceValue",value);
            },

            definitionID : function(value) {
                return this._genericSetter("DefinitionID",value);
            },

            definitionResourceID : function(value) {
                return this._genericSetter("DefinitionResourceID",value);
            },

            currentToken : function(value) {
                return this._genericSetter("CurrentToken",value);
            },

            tokens : function() {
                return this.getCol('Tokens');
            },

            tokenQueue : function() {
                return this.getCol('TokenQueue');
            },

            parameters : function() {
                return this.definition().parameters();
            },

            inputParameters : function() {
                return this.definition().inputParameters();
            },

            nodes : function(){
                return this.definition().nodes();
            },

            messageDeclarations : function() {
                return this.getCol('MessageDeclarations');
            },

            scripts : function(){
                return this.definition().scripts();
            },

            connectors : function(){
                return this.definition().connectors();
            },

            messageFlows : function() {
                return this.getCol('MessageFlows');
            },

            correlationKeys : function() {
                return this.getCol('CorrelationKeys');
            },

            requests : function() {
                return this.getCol('Requests');
            },
            //</editor-fold>

            getControlManager : function() {
                return this.pvt.controlMgr;
            },

            getStartNode : function() {
                for (var i = 0; i < this.nodes().count(); i++){
                    if (this.nodes().get(i).incoming().count() == 0)
                        return this.nodes().get(i);
                }
            },

            isTokenInQueue : function(token) {
                for (var i = 0; i < this.tokenQueue().count(); i++) {
                    if (this.tokenQueue().get(i).object().tokenID() == token.tokenID()) return true;
                }

                return false;
            },

            getToken : function(tokenID) {
                for (var i = 0; i < this.tokens().count(); i++) {
                    if (this.tokens().get(i).tokenID() == tokenID) {return this.tokens().get(i)}
                }

                return null;
            },

            enqueueToken : function(token) {
                if (!token.tokenID()) {
                    var _tokenID = this.sequenceValue() + 1;
                    this.sequenceValue(_tokenID);
                    token.tokenID(_tokenID);
                }

                token.newLink(this, 'TokenQueue');
            },

            enqueueCurrentToken : function() {
                if (this.currentToken() && !this.isTokenInQueue(this.currentToken())) {
                    this.enqueueToken(this.currentToken())
                }
            },

            dequeueToken : function() {
                if (this.tokenQueue().count() != 0) {
                    var _tokenRef = this.tokenQueue().get(0);
                    this.tokenQueue()._del(_tokenRef);
                    return _tokenRef.object();
                }
                else {return null}
            },

            getNodeTokens : function(node) {
                var _nodeTokens = [];
                for (var i = 0; i < this.tokens().count(); i++) {
                    if (this.tokens().get(i).currentNode() == node) {
                        _nodeTokens.push(this.tokens().get(i))
                    }
                }

                return _nodeTokens;
            },

            isAllTokensDead : function() {
                for (var i = 0; i < this.tokens().count(); i++) {
                    if (this.tokens().get(i).isLive()) {
                        return false;
                    }
                }

                return true;
            },

            finish : function() {
                if (this.state() != processStates.Finished) {
                    var that = this;
                    that.state(processStates.Finished);
                    EngineSingleton.getInstance().justSaveProcess(this.processID()).then(function () {
                        Logger.info('Процесс [%s] id [%s] закончил выполнение', that.name(), that.processID());

                    }).
                    catch(function (error) {
                        throw error
                    });
                }
            },

            getFacade : function() {
                /* Todo : Необходиом определиться какой доступ пользовательскому коду мы даем к процессу */
                return this
            },

            getRootObj : function() {
                return this;
            },

            canContinue : function() {
                return (this.state() != processStates.WaitingScriptAnswer) && (this.state() != processStates.Finished)
            },

            activate : function() {
                if (this.state() != processStates.Running) {
                    clearInterval(this.idleTimer);
                    console.log('[%s] : => Процесс [%s] активирован', (new Date()).toLocaleTimeString(), this.processID());
                    this.state(processStates.Running);
                }
            },

            isWaitingScriptAnswer : function() {
                return this.state() == processStates.WaitingScriptAnswer;
            },

            isWaiting : function() {
                return (this.state() == processStates.WaitingScriptAnswer) || (this.state() == processStates.Waiting);
            },

            isRunning : function() {
                return (this.state() == processStates.Running)
            },

            isFinished : function() {
                return (this.state() == processStates.Finished);
            },

            findParameter : function(parameterName) {
                for (var i = 0; i < this.parameters().count(); i++) {
                    if (this.parameters().get(i).name() == parameterName) {
                        return this.parameters().get(i)
                    }

                }
                return null;
            },

            findInputParameter : function(parameterName) {
                for (var i = 0; i < this.inputParameters().count(); i++) {
                    if (this.inputParameters().get(i).name() == parameterName) {
                        return this.inputParameters().get(i)
                    }

                }
                return null;
            },

            wait : function() {
                this.state(processStates.Waiting);
                var that = this;
                if (UCCELLO_CONFIG.wfe.idleTimeout != Infinity) {
                    that.idleTimer = setInterval(function () {
                        clearInterval(that.idleTimer);
                        EngineSingleton.getInstance().saveAndUploadProcess(that.processID());
                    }, UCCELLO_CONFIG.wfe.idleTimeout)
                }
            },

            waitScriptAnswer : function(){
                this.state(processStates.WaitingScriptAnswer);
            },

            findNode : function(node) {
                return this.definition().findNode(node);
            },

            findNodeByName : function(nodeName) {
                return this.definition().findNodeByName(nodeName);
            },

            findNodeByID : function(nodeID) {
                for (var i = 0; i < this.nodes().count(); i++) {
                    var _node = this.nodes().get(i);
                    if (_node.guid() == nodeID){
                        return _node;
                    }
                }
            },

            getOrCreateScript : function(script) {
                return this.definition().getOrCreateScript(script);
            },

            findConnector : function(connector) {
                for (var i = 0; i < this.connectors().count(); i++) {
                    var _connector = this.connectors().get(i);
                    if ((_connector.guid() == connector.guid()) && (_connector.name() == connector.name())){
                        return _connector;
                    }
                }
            },

            addNewReceivedMessage : function(messageInstance, targetNode){
                if (typeof targetNode.incomingInstance == 'function'){
                    targetNode.incomingInstance(messageInstance);
                }
            },

            getMessageFlow : function(messageFlow) {
                for (var i = 0; i < this.messageFlows().count(); i++) {
                    if (this.messageFlows().get(i).guid() == messageFlow.guid()) {
                        return this.messageFlows().get(i);
                    }
                }
            },

            clearFinishedTokens : function() {
                for (var i = this.tokens().count() - 1; i >= 0; i--) {
                    var _token = this.tokens().get(i);
                    if (_token.isDead()) {
                        this.tokens()._del(_token);
                    }
                }
            },

            getModel : function(){
                return this.definition().getModelForProcess()
            },

            onSave : function(dbObject, params) {
                if (!params) {
                    params = {}
                }
                params.processInstance = this;
                return this.definition().onSaveProcess(dbObject, params)
            },

            deleteRequest : function(request) {
                var _token = this.getToken(request.tokenID());
                if (_token) {
                    _token.deleteRequest(request)
                }
            },

            deleteResponse : function(response){
                var _token = this.getToken(response.tokenID());
                if (_token) {
                    _token.deleteResponse(response)
                }
            }
        });

        return Process;
    }
);

module.exports.state = processStates;
