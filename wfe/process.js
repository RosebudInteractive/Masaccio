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
        './engineSingleton'
    ],
    function(
        UObject,
        Definition,
        UUtils,
        SequenceFlow,
        EngineSingleton
    ){
        var Process = UObject.extend({

            //<editor-fold desc="Class description">
            className: "Process",
            classGuid: UCCELLO_CONFIG.classGuids.Process,
            metaFields: [
                {fname : 'Name', ftype : 'string'},
                {fname : 'State', ftype : 'integer'},
                {fname : 'SequenceValue', ftype : 'integer'},
                {fname : 'ProcessID', ftype : 'string'},
                //{
                //    fname : 'Definition',
                //    ftype : {
                //        type : 'ref',
                //        external: true,
                //        res_type : UCCELLO_CONFIG.classGuids.ProcessDefinition,
                //        res_elem_type : UCCELLO_CONFIG.classGuids.ProcessDefinition
                //    }
                //},
                {
                    fname : 'CurrentToken',
                    ftype : {
                        type : 'ref',
                        res_elem_type : UCCELLO_CONFIG.classGuids.Token
                    }
                }

            ],
            metaCols: [
                {'cname' : 'Tokens', 'ctype' : 'Token'},
                {'cname' : 'TokenQueue', 'ctype' : 'Token'},
                {'cname' : 'Parameters', 'ctype' : 'Parameter'},
                {'cname' : 'Nodes', 'ctype' : 'FlowNode'},
                {'cname' : 'NodeInstances', 'ctype' : 'FlowNode'},
                {'cname' : 'Connectors', 'ctype' : 'SequenceFlow'},
                {'cname' : 'Requests', 'ctype' : 'Request'}
            ],
            //</editor-fold>


            init: function(cm, params, definition){
                UccelloClass.super.apply(this, [cm, params]);

                // Todo : Костыль!!!!
                if (!this.processID()) {
                    this.processID(UUtils.guid());
                    this.name(definition.name());
                    this.sequenceValue(0);
                    this.copyDefinition(definition);
                    this.state(processStates.Initialized);
                }
                //this.definition(definition.clone());
            },

            copyDefinition: function (definition) {
                this.cloneParameters(definition);

                for (var i = 0; i < definition.nodes().count(); i++){
                    var _defNode = definition.nodes().get(i);
                    _defNode.copyNodeDefinition(this, {parent  : this, colName : 'Nodes'});
                }

                for (var i = 0; i < definition.connectors().count(); i++){
                    var _defConnector = definition.connectors().get(i);
                    var _source = this.findNode(_defConnector.source());
                    var _target = this.findNode(_defConnector.target());
                    var _script = _defConnector.getUserScript();

                    if ((_source) && (_target)) {
                        var _connector = new SequenceFlow(this.getControlManager(), {parent  : this, colName : 'Connectors'});
                        _connector.name(_defConnector.name())
                        _connector.connect(_source, _target, _script)
                    }
                }
            },

            cloneParameters :  function (definition) {
                for (var i = 0; i < definition.parameters().count(); i++) {
                    definition.parameters().get(i).clone(this.getControlManager(), {parent  : this, colName : 'Parameters'});
                }
            },

            //<editor-fold desc="MetaFields & MetaCols">
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

            //definition : function(value) {
            //    return this._genericSetter("Definition",value);
            //},

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
                return this.getCol('Parameters');
            },

            nodes : function(){
                return this.getCol('Nodes');
            },

            connectors : function(){
                return this.getCol('Connectors');
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
                    if (this.tokenQueue().get(i).tokenID() == token.tokenID()) return true;
                };

                return false;
            },

            getToken : function(tokenID) {
                for (var i =0; i < this.tokens().count(); i++) {
                    if (this.tokens().get(i).tokenID() == tokenID) {return this.tokens().get(i)}
                };

                return null;
            },

            enqueueToken : function(token) {
                if (!token.tokenID()) {
                    var _tokenID = this.sequenceValue() + 1;
                    this.sequenceValue(_tokenID);
                    token.tokenID(_tokenID);
                };

                if (!this.getToken(token.tokenID())){
                    this.tokens()._add(token);
                }

                this.tokenQueue()._add(token);
            },

            enqueueCurrentToken : function() {
                if (this.currentToken() && !this.isTokenInQueue(this.currentToken())) {
                    this.enqueueToken(this.currentToken())
                }
            },

            dequeueToken : function() {
                if (this.tokenQueue().count() != 0) {
                    var _token = this.tokenQueue().get(0);
                    this.tokenQueue()._del(_token);
                    return _token;
                }
                else {return null};
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
                if (this.state != processStates.Finished) {
                    this.state(processStates.Finished);
                    console.log('[%s] : => Процесс [%s] закончил выполнение', (new Date()).toLocaleTimeString(), this.name());
                }
            },

            getFacade : function() {
                /* Todo : Необходиом определиться какой доступ пользовательскому коду мы даем к процессу */
                return this
            },

            canContinue : function() {
                return (this.state() != processStates.WaitingScriptAnswer)
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
                    if (this.parameters().get(i).name(parameterName)) {
                        return this.parameters().get(i)
                    }

                }
                return null;
            },

            wait : function(){
                this.state(processStates.Waiting)
                var that = this;
                this.idleTimer = setInterval(function() {
                    clearInterval(that.idleTimer);
                    EngineSingleton.getInstance().saveProcess(that.processID());
                }, UCCELLO_CONFIG.idleTimeout)
            },

            waitScriptAnswer : function(){
                this.state(processStates.WaitingScriptAnswer);
            },

            findNode : function(node) {
                for (var i = 0; i < this.nodes().count(); i++) {
                    var _node = this.nodes().get(i);
                    if ((_node instanceof node.constructor) && (_node.name() == node.name() && _node.id() == node.id())){
                        return _node;
                    }
                }
            },

            findConnector : function(connector) {
                for (var i = 0; i < this.connectors().count(); i++) {
                    var _connector = this.connectors().get(i);
                    if ((_connector.id() == connector.id()) && (_connector.name() == connector.name())){
                        return _connector;
                    }
                }
            }
        });

        return Process;
    }
)

module.exports.state = processStates;
