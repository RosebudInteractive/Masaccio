/**
 * Created by staloverov on 28.03.2015.
 */

'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

var processStates = {
    Initialized : 0,
    Running : 1,
    Finished : 2,
    Aborted : 3,
    Waiting : 4,
    WaitingScriptAnswer : 5,
    None : 6,
    Saving : 7
};

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        './processDefinition',
        UCCELLO_CONFIG.uccelloPath + 'system/utils',
        './sequenceFlow',
        './engineSingleton',
        './userScript',
        './../public/logger',
        './processVar',
        './controls'
    ],
    function(
        UObject,
        Definition,
        UUtils,
        SequenceFlow,
        EngineSingleton,
        UserScript,
        Logger,
        ProcessVar,
        Controls
    ) {
        return class Process extends UObject {

            //<editor-fold desc="Class description">
            get className() {
                return "Process"
            }

            get classGuid() {
                return Controls.guidOf('Process')
            }

            get metaFields() {
                return [
                    {fname: 'Name', ftype: 'string'},
                    {fname: 'State', ftype: 'integer'},
                    {fname: 'SequenceValue', ftype: 'integer'},
                    {fname: 'ProcessID', ftype: 'string'},
                    {fname: 'DefinitionID', ftype: 'string'},
                    {fname: 'DefinitionResourceID', ftype: 'integer'},
                    {fname: "dbId", ftype: "integer"},
                    {
                        fname: 'CurrentToken',
                        ftype: {
                            type: 'ref',
                            res_elem_type: Controls.guidOf('Token')
                        }
                    }
                ]
            }

            get metaCols() {
                return [
                    {'cname': 'Tokens', 'ctype': 'Token'},
                    {'cname': 'TokenQueue', 'ctype': 'ObjectRef'},
                    {'cname': 'Requests', 'ctype': 'Request'},

                    {'cname': 'Connectors', 'ctype': 'SequenceFlow'},
                    {'cname': 'Nodes', 'ctype': 'FlowNode'},

                    {'cname': 'CorrelationKeys', 'ctype': 'CorrelationKey'},
                    {'cname': 'CorrelationKeyInstances', 'ctype': 'CorrelationKeyInstance'},

                    {'cname': 'MessageInstances', 'ctype': 'MessageInstance'},
                    {'cname': 'MessageFlows', 'ctype': 'MessageFlow'},
                    {'cname': 'MessageRequests', 'ctype': 'MessageInstance'},
                    {'cname': 'Definitions', 'ctype': 'ProcessDefinition'},
                    {'cname': 'Vars', 'ctype': 'ProcessVar'}
                ]
            }

            //</editor-fold>

            constructor(cm, params, definition) {
                super(cm, params);

                if (!params) {
                    return
                }

                if (!params.isDeserialize) {
                    this.pvt.db.deserialize(definition, {
                        obj: this,
                        colName: 'Definitions'
                    }, EngineSingleton.getInstance().createComponentFunction);
                    if (params.hasOwnProperty('definitionResourceID')) {
                        this.definitionResourceID(params.definitionResourceID)
                    }

                    this._copyDefinition();

                    if (params.hasOwnProperty('params') && (params.params)) {
                        this.definition().setInputParams(params.params);

                        if (this._checkInputParams()) {
                            this.definition().applyInputTaskParams();
                            this.name(this.definition().taskParams().name());
                            this._createProcessVar();
                        }
                    }

                    this.processID(UUtils.guid());
                    this.sequenceValue(0);

                    this.state(processStates.Initialized);
                }

                this.history = [];
            }

            _checkInputParams(params) {
                return this.definition().checkInputParams(params)
            }

            _createProcessVar() {
                var _taskParameter = this.definition().taskParams();
                var _processVar = new ProcessVar(this.getControlManager(), {parent: this, colName: 'Vars'});
                _processVar.copy(_taskParameter);
            }

            _copyDefinition() {
                var definition = this.definition();
                this.name(definition.name());
                this.definitionID(definition.definitionId());
                this._copyCorrelations(definition);
                this._copyMessages(definition);
                this._copyNodes();
                this._copyConnectors();
            }

            _copyMessages(definition) {
                for (var i = 0; i < definition.messageFlows().count(); i++) {
                    definition.messageFlows().get(i).addNewCopyTo(this);
                }
            }

            _copyCorrelations(definition) {
                for (var i = 0; i < definition.correlationKeys().count(); i++) {
                    definition.correlationKeys().get(i).addNewCopyTo(this);
                }
            }

            _copyNodes() {
                for (var i = 0; i < this.definition().nodes().count(); i++){
                    var _defNode = this.definition().nodes().get(i);
                    _defNode.copyNodeDefinition(this, {parent  : this, colName : 'Nodes'});
                }
            }

            _copyConnectors() {
                var _definition = this.definition();
                
                for (var i = 0; i < _definition.connectors().count(); i++){
                    var _defConnector = _definition.connectors().get(i);
                    var _source = this.findNode(_defConnector.source());
                    var _target = this.findNode(_defConnector.target());
                    var _script = _defConnector.getUserScript();

                    if ((_source) && (_target)) {
                        var _connector = new SequenceFlow(this.getControlManager(), {parent  : this, colName : 'Connectors'});
                        _connector.name(_defConnector.name());
                        _connector.connect(_source, _target, _script)
                    }
                }    
            }

            getCorrelationKey(correlationKey) {
                for (var i = 0; this.correlationKeys().count(); i++) {
                    if (correlationKey.name() == this.correlationKeys().get(i).name()) {
                        return this.correlationKeys().get(i);
                    }
                }
            }

            //<editor-fold desc="MetaFields & MetaCols">
            processVar() {
                return this.getCol('Vars').get(0);
            }

            definition() {
                return this.getCol('Definitions').get(0);
            }

            name(value) {
                return this._genericSetter("Name", value);
            }

            state(value) {
                return this._genericSetter("State", value);
            }

            processID(value) {
                return this._genericSetter("ProcessID", value);
            }

            dbId(value) {
                return this._genericSetter("dbId", value);
            }

            sequenceValue(value) {
                return this._genericSetter("SequenceValue", value);
            }

            definitionID(value) {
                return this._genericSetter("DefinitionID", value);
            }

            definitionResourceID(value) {
                return this._genericSetter("DefinitionResourceID", value);
            }

            currentToken(value) {
                return this._genericSetter("CurrentToken", value);
            }

            tokens() {
                return this.getCol('Tokens');
            }

            tokenQueue() {
                return this.getCol('TokenQueue');
            }

            parameters() {
                return this.definition().parameters();
            }

            inputParameters() {
                return this.definition().inputParameters();
            }

            nodes() {
                return this.getCol('Nodes');
                // return this.definition().nodes();
            }

            messageDeclarations() {
                return this.getCol('MessageDeclarations');
            }

            scripts() {
                return this.definition().scripts();
            }

            connectors() {
                return this.getCol('Connectors');
                // return this.definition().connectors();
            }

            messageFlows() {
                return this.getCol('MessageFlows');
            }

            correlationKeys() {
                return this.getCol('CorrelationKeys');
            }

            requests() {
                return this.getCol('Requests');
            }

            //</editor-fold>

            getControlManager() {
                return this.pvt.controlMgr;
            }

            getStartNode() {
                for (var i = 0; i < this.nodes().count(); i++) {
                    if (this.nodes().get(i).incoming().count() == 0)
                        return this.nodes().get(i);
                }
            }

            isTokenInQueue(token) {
                for (var i = 0; i < this.tokenQueue().count(); i++) {
                    if (this.tokenQueue().get(i).object().tokenId() == token.tokenId()) return true;
                }

                return false;
            }

            getToken(tokenID) {
                for (var i = 0; i < this.tokens().count(); i++) {
                    if (this.tokens().get(i).tokenId() == tokenID) {
                        return this.tokens().get(i)
                    }
                }

                return null;
            }

            enqueueToken(token) {
                if (!token.tokenId()) {
                    var _tokenID = this.sequenceValue() + 1;
                    this.sequenceValue(_tokenID);
                    token.tokenId(_tokenID);
                }

                token.newLink(this, 'TokenQueue');
            }

            enqueueCurrentToken() {
                if (this.currentToken() && !this.isTokenInQueue(this.currentToken())) {
                    this.enqueueToken(this.currentToken())
                }
            }

            dequeueToken() {
                if (this.tokenQueue().count() != 0) {
                    var _tokenRef = this.tokenQueue().get(0);
                    this.tokenQueue()._del(_tokenRef);
                    return _tokenRef.object();
                }
                else {
                    return null
                }
            }

            getNodeTokens(node) {
                var _nodeTokens = [];
                for (var i = 0; i < this.tokens().count(); i++) {
                    if (this.tokens().get(i).currentNode() == node) {
                        _nodeTokens.push(this.tokens().get(i))
                    }
                }

                return _nodeTokens;
            }

            isAllTokensDead() {
                for (var i = 0; i < this.tokens().count(); i++) {
                    if (this.tokens().get(i).isLive()) {
                        return false;
                    }
                }

                return true;
            }

            finish() {
                if (this.state() != processStates.Finished) {
                    var that = this;
                    that.state(processStates.Finished);
                    EngineSingleton.getInstance().justSaveProcess(this.processID()).then(function () {
                        Logger.info('Процесс [%s] id [%s] закончил выполнение', that.name(), that.processID());

                    }).catch(function (error) {
                        throw error
                    });
                }
            }

            getFacade() {
                /* Todo : Необходиом определиться какой доступ пользовательскому коду мы даем к процессу */
                return this
            }

            getRootObj() {
                return this;
            }

            canContinue() {
                return (this.state() != processStates.WaitingScriptAnswer)
                    && (this.state() != processStates.Finished)
                    && (this.state() != processStates.Saving)
            }

            activate() {
                if (this.state() != processStates.Running) {
                    clearInterval(this.idleTimer);
                    Logger.info('Процесс [%s] активирован', this.processID());
                    this.state(processStates.Running);
                }
            }

            saving() {
                this.state(processStates.Saving);
            }

            isSaving() {
                return this.state() == processStates.Saving;
            }

            isWaitingScriptAnswer() {
                return this.state() == processStates.WaitingScriptAnswer;
            }

            isWaiting() {
                return (this.state() == processStates.WaitingScriptAnswer)
                    || (this.state() == processStates.Waiting)
                    || (this.state() == processStates.Saving);
            }

            isRunning() {
                return (this.state() == processStates.Running)
            }

            isFinished() {
                return (this.state() == processStates.Finished);
            }

            findParameter(parameterName) {
                for (var i = 0; i < this.parameters().count(); i++) {
                    if (this.parameters().get(i).name() == parameterName) {
                        return this.parameters().get(i)
                    }

                }
                return null;
            }

            findInputParameter(parameterName) {
                for (var i = 0; i < this.inputParameters().count(); i++) {
                    if (this.inputParameters().get(i).name() == parameterName) {
                        return this.inputParameters().get(i)
                    }

                }
                return null;
            }

            wait() {
                if (this.state() != processStates.Saving) {
                    this.state(processStates.Waiting);
                    var that = this;
                    if (UCCELLO_CONFIG.wfe.idleTimeout != Infinity) {
                        that.idleTimer = setInterval(function () {
                            clearInterval(that.idleTimer);
                            EngineSingleton.getInstance().saveAndUploadProcess(that.processID());
                        }, UCCELLO_CONFIG.wfe.idleTimeout)
                    }
                }
            }

            waitScriptAnswer() {
                this.state(processStates.WaitingScriptAnswer);
            }

            // findNode(node) {
            //     return this.definition().findNode(node);
            // }

            findNode(node) {
                for (var i = 0; i < this.nodes().count(); i++) {
                    var _node = this.nodes().get(i);
                    if ((_node.name() == node.name()) && (_node.guid() == node.guid())){
                        return _node;
                    }
                }
            }

            findNodeByName(nodeName) {
                // return this.definition().findNodeByName(nodeName);
                for (var i = 0; i < this.nodes().count(); i++) {
                    var _node = this.nodes().get(i);
                    if (_node.name() == nodeName){
                        return _node;
                    }
                }
            }

            findNodeByID(nodeID) {
                for (var i = 0; i < this.nodes().count(); i++) {
                    var _node = this.nodes().get(i);
                    if (_node.guid() == nodeID) {
                        return _node;
                    }
                }
            }

            getOrCreateScript(script) {
                return this.definition().getOrCreateScript(script);
            }

            findConnector(connector) {
                for (var i = 0; i < this.connectors().count(); i++) {
                    var _connector = this.connectors().get(i);
                    if ((_connector.guid() == connector.guid()) && (_connector.name() == connector.name())) {
                        return _connector;
                    }
                }
            }

            addNewReceivedMessage(messageInstance, targetNode) {
                if (typeof targetNode.incomingInstance == 'function') {
                    targetNode.incomingInstance(messageInstance);
                }
            }

            getMessageFlow(messageFlow) {
                for (var i = 0; i < this.messageFlows().count(); i++) {
                    if (this.messageFlows().get(i).guid() == messageFlow.guid()) {
                        return this.messageFlows().get(i);
                    }
                }
            }

            clearFinishedTokens() {
                for (var i = this.tokens().count() - 1; i >= 0; i--) {
                    var _token = this.tokens().get(i);
                    if (_token.isDead()) {
                        this.tokens()._del(_token);
                    }
                }
            }

            getModel() {
                return this.definition().getModelForProcess()
            }

            onSave(dbObject, params) {
                if (!params) {
                    params = {}
                }

                this.dbId(dbObject.id());
                params.processInstance = this;
                return this.definition().onSaveProcess(dbObject, params)
            }

            deleteRequest(request) {
                var _token = this.getToken(request.tokenId());
                if (_token) {
                    _token.deleteRequest(request)
                }
            }

            deleteResponse(response) {
                var _token = this.getToken(response.tokenId());
                if (_token) {
                    _token.deleteResponse(response)
                }
            }

            getRequestsForSave() {
                var _requests = [];
                for (var i = 0; i < this.tokens().count(); i++) {
                    var _token = this.tokens().get(i);
                    if (_token.isLive()) {
                        for (var j = 0; j < _token.nodesProps().count(); j++) {
                            var _nodeProp = _token.nodesProps().get(j);
                            for (var k = 0; k < _nodeProp.requests().count(); k++) {
                                _requests.push(_nodeProp.requests().get(k))
                            }
                        }
                    }
                }

                return _requests;
            }

            getResponsesForSave() {
                var _responses = [];
                for (var i = 0; i < this.tokens().count(); i++) {
                    var _token = this.tokens().get(i);
                    if (_token.isLive()) {
                        for (var j = 0; j < _token.nodesProps().count(); j++) {
                            var _nodeProp = _token.nodesProps().get(j);
                            for (var k = 0; k < _nodeProp.responses().count(); k++) {
                                _responses.push(_nodeProp.responses().get(k))
                            }
                        }
                    }
                }

                return _responses;
            }

            addStepHistory(previousId, newNode) {
                var _item = {previousId : previousId, current : newNode};
                this.history.push(_item)
            }

            hasHistory() {
                return this.history ? (this.history.length != 0) : false
            }
        };
    }
);

module.exports.state = processStates;
