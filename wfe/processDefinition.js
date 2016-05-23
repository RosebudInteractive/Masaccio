/**
 * Created by staloverov on 11.03.2015.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
        UCCELLO_CONFIG.uccelloPath + 'resman/dataTypes/resource',
        '../public/utils',
        './parameter',
        './Activities/activity',
        './Activities/userTask',
        './Activities/scriptTask',
        './Activities/callActivity',
        './Gateways/exclusiveGateway',
        './Gateways/inclusiveGateway',
        './sequenceFlow',
        './userScript',
        './answer',
        './Events/Start/startEvent',
        './Events/End/endEvent',
        './Messages/messageFlow',
        './Events/eventReferences',
        './Messages/correlationKey',
        './engineSingleton',
        './Task/taskParameter'
    ],
    function(
        Resource,
        Utils,
        Parameter,
        Activity,
        UserTask,
        ScriptTask,
        CallActivity,
        ExclusiveGateway,
        InclusiveGateway,
        SequenceFlow,
        UserScript,
        Answer,
        StartEvent,
        EndEvent,
        MessageFlow,
        EventRef,
        CorrelationKey,
        EngineSingleton,
        TaskParameter
    ) {
        return class ProcessDefinition extends Resource{

            //<editor-fold desc="Class description">
            get className() {
                return "ProcessDefinition"
            }

            get classGuid() {
                return UCCELLO_CONFIG.classGuids.ProcessDefinition
            }

            get metaFields() {
                return [
                    {fname: 'DefinitionID', ftype: 'string'},
                    {fname: "dbId", ftype: "integer"}
                ]
            }

            get metaCols() {
                return [
                    {'cname': 'Parameters', 'ctype': 'WfeParameter'},
                    {'cname': 'InputParameters', 'ctype': 'WfeParameter'},
                    {'cname': 'Connectors', 'ctype': 'SequenceFlow'},
                    {'cname': 'Nodes', 'ctype': 'FlowNode'},

                    {'cname': 'Requests', 'ctype': 'Request'},
                    {'cname': 'Scripts', 'ctype': 'UserScript'},

                    {'cname': 'MessageFlows', 'ctype': 'MessageFlow'},
                    {'cname': 'CorrelationKeys', 'ctype': 'CorrelationKey'},

                    {'cname': 'TaskParams', 'ctype': 'TaskParameter'}
                ]
            }

            get elemNamePrefix() {
                return "Field"
            } 
            get queryGuid() {
                return '1811166b-b719-4bf1-8527-8db9f8a8c67e'
            }
            //</editor-fold>

            constructor(cm, params){
                super(cm, params);
                if (!params) { return }

                if (!params.isDeserialize){
                    if (!this.taskParams()) {
                        new TaskParameter(this.getControlManager(), {parent: this, colName: 'TaskParams'});
                    }
                }
            }

            getModelDescription() {
                return {name: "ProcessDef"};
            }

            //<editor-fold desc="MetaFields & MetaCols">
            name (value) {
                return this._genericSetter("ResName", value);
            }

            definitionId (value) {
                return this._genericSetter("DefinitionID", value);
            }

            dbId(value) {
                return this._genericSetter("dbId", value);
            }

            parameters () {
                return this.getCol('Parameters');
            }

            inputParameters () {
                return this.getCol('InputParameters');
            }

            connectors () {
                return this.getCol('Connectors');
            }

            nodes () {
                return this.getCol('Nodes');
            }

            taskParams () {
                return this.getCol('TaskParams').get(0);
            }
            
            inputTaskParams() {
                return this.getCol('TaskParams').get(1);
            }

            messageFlows () {
                return this.getCol('MessageFlows');
            }

            correlationKeys () {
                return this.getCol('CorrelationKeys');
            }

            scripts () {
                return this.getCol('Scripts');
            }
            //</editor-fold>

            getControlManager () {
                return this.pvt.controlMgr;
            }

            getRootObj () {
                return this;
            }

            getOrCreateScript (script) {
                var _script;

                for (var i = 0; i < this.scripts().count(); i++) {
                    _script = this.scripts().get(i);
                    if (_script.isEqualTo()) {
                        return _script;
                    }
                }

                _script = new UserScript(this.getControlManager(), {parent: this, colName: 'Scripts'});
                _script.parse(script);
                return _script;
            }

            addParameter (parameterName) {
                var _param = new Parameter(this.getControlManager(), {parent: this, colName: 'Parameters'});
                _param.name(parameterName);
                return _param;
            }

            clone () {
                var _newDefinition = new ProcessDefinition(this.pvt.controlMgr, {});

                _newDefinition.definitionId(this.definitionId());
                _newDefinition.name(this.name());
                Utils.copyCollection(this.nodes(), _newDefinition.nodes());
                Utils.copyCollection(this.connectors(), _newDefinition.connectors());

                return _newDefinition;
            }

            findNode (node) {
                for (var i = 0; i < this.nodes().count(); i++) {
                    var _node = this.nodes().get(i);
                    if ((_node instanceof node.constructor) && (_node.name() == node.name())) {
                        return _node;
                    }
                }
            }

            addActivity (activityName) {
                var _node = new Activity(this.getControlManager(), {parent: this, colName: 'Nodes'});
                if (activityName) {
                    _node.name(activityName)
                }
                return _node;
            }

            addUserTask (taskName, script) {
                var _node = new UserTask(this.getControlManager(), {parent: this, colName: 'Nodes'});
                if (taskName) {
                    _node.name(taskName)
                }

                if (script) {
                    _node.setUserScript(script)
                }
                return _node;
            }

            addScriptTask (taskName, script) {
                if (!script) {
                    throw 'Не указан скрипт'
                }
                var _node = new ScriptTask(this.getControlManager(), {parent: this, colName: 'Nodes'}, script);
                if (taskName) {
                    _node.name(taskName)
                }
                return _node;
            }

            addInclusiveGateway (gatewayName) {
                var _node = new InclusiveGateway(this.getControlManager(), {parent: this, colName: 'Nodes'});
                if (gatewayName) {
                    _node.name(gatewayName)
                }
                return _node;
            }

            addExclusiveGateway (gatewayName) {
                var _node = new ExclusiveGateway(this.getControlManager(), {parent: this, colName: 'Nodes'});
                if (gatewayName) {
                    _node.name(gatewayName)
                }
                return _node;
            }

            addCallActivity (activityName, definitionID) {
                var _node = new CallActivity(this.getControlManager(), {parent: this, colName: 'Nodes'});
                if (activityName) {
                    _node.name(activityName)
                }
                if (definitionID) {
                    _node.definitionID(definitionID)
                }
                return _node;
            }

            addStartEvent (eventName) {
                var _node = new StartEvent(this.getControlManager(), {parent: this, colName: 'Nodes'});
                if (eventName) {
                    _node.name(eventName)
                }
                return _node;
            }

            addEndEvent (eventName) {
                var _node = new EndEvent(this.getControlManager(), {parent: this, colName: 'Nodes'});
                if (eventName) {
                    _node.name(eventName)
                }
                return _node;
            }

            connect (source, target, script) {
                var _sequence = new SequenceFlow(this.getControlManager(), {parent: this, colName: 'Connectors'});
                _sequence.connect(source, target, script);
                return _sequence;
            }

            validate () {
                return Answer.success();
            }

            findNodeByName (nodeName) {
                for (var i = 0; i < this.nodes().count(); i++) {
                    var _node = this.nodes().get(i);
                    if (_node.name() == nodeName) {
                        return _node;
                    }
                }
            }

            addEvent (eventType, eventName) {
                var _constructor = EventRef.constructor.getForType(eventType);
                if (_constructor) {
                    var _node = new _constructor(this.getControlManager(), {parent: this, colName: 'Nodes'});
                    if (eventName) {
                        _node.name(eventName)
                    }
                    return _node;
                }
            }

            addMessageFlow () {
                var _flow = new MessageFlow(this.getControlManager(), {parent: this, colName: 'MessageFlows'});
                var _correlationKey = this.addCorrelationKey();
                _flow.correlationKey(_correlationKey);
                return _flow;
            }

            addCorrelationKey (name) {
                var _ck = new CorrelationKey(this.getControlManager(), {parent: this, colName: 'CorrelationKeys'});
                if (name) {
                    _ck.name(name);
                }
                return _ck
            }

            addInputParameters (parameterName) {
                var _param = new Parameter(this.getControlManager(), {parent: this, colName: 'InputParameters'});
                _param.name(parameterName);
                return _param;
            }

            getModelForProcess () {
                return {
                    name: 'Process',
                    childs: [{
                        dataObject: {
                            name: 'Request'
                        }
                    }]
                }
            }

            onSaveProcess (dbObject, params) {
                var that = this;
                return new Promise(function (resolve, reject) {
                    if ((!params) || (!params.processInstance)) {
                        reject(new Error('Undefined process instance'))
                    }

                    that._saveRequests(dbObject, params)
                        .then(function () {
                            that._saveProcessVar(dbObject, params.processInstance);
                        })
                        .then(resolve)
                        .catch(function(error) {
                            throw error
                        });
                });
            }


            _saveRequests (dbObject, params) {

                function getRequestObject(request){
                    var _collection = dbObject.getDataRoot('Request').getCol('DataElements');
                    for (var i = 0; i < _collection.count(); i++){
                        if (_collection.get(i).parseGuid(_collection.get(i).pvt.guid).guid == request.ID()){
                            return _collection.get(i);
                        }
                    }
                }

                return new Promise(function (resolve, reject) {
                    var _process = params.processInstance;
                    var _requests = _process.getRequestsForSave();
                    var _responses = _process.getResponsesForSave();

                    if ((_requests.length != 0) || (_responses.length != 0)) {
                        var _options = {};
                        if (params.transactionId) {
                            _options.transactionId = params.transactionId;
                        }

                        var _count = 0;

                        var _root = dbObject.getDataRoot('Request');

                        _requests.forEach(function (request) {
                            var _requestBody = EngineSingleton.getInstance().db.serialize(request, true);
                            _requestBody = JSON.stringify(_requestBody);

                            var _responseBody = null;
                            if (request.hasReceivedResponse()) {
                                var _response = _responses.find(function(response){
                                    return response.ID() == request.responseID();
                                });

                                if (_response) {
                                    _responseBody = EngineSingleton.getInstance().db.serialize(_response, true);
                                    _responseBody = JSON.stringify(_responseBody);
                                }
                            }

                            var _requestObj = getRequestObject(request);
                            if (!_requestObj){
                                _root.newObject({
                                    $sys: {guid: request.ID()},
                                    fields: {
                                        ProcessId: dbObject.id(),
                                        TokenId: request.tokenId(),
                                        Name: request.name(),
                                        State: request.state(),
                                        RequestBody: _requestBody,
                                        ResponceBody: _responseBody
                                    }
                                }, {}, function (result) {
                                    if (result.result !== 'OK') {
                                        reject(new Error(result.message))
                                    } else {
                                        var _created = _root.getDB().getObj(result.newObject);
                                        request.dbId(_created.id());
                                        _count++;
                                        checkDone();
                                    }
                                })
                            } else {
                                _requestObj.state(request.state());
                                _requestObj.state(request.state());
                                _requestObj.requestBody(_requestBody);
                                _requestObj.responseBody(_responseBody);

                                _count++;
                                checkDone();
                            }
                        });

                        function checkDone() {
                            if (_count == _requests.length) {
                                resolve();
                            }
                        }
                    } else {
                        resolve()
                    }
                })
            }

            _saveProcessVar (dbObject, processInstance){
                if (processInstance.processVar()) {
                    processInstance.processVar().taskId(processInstance.dbId());
                    processInstance.processVar().taskGuid(processInstance.processID());

                    var _processVar = EngineSingleton.getInstance().db.serialize(processInstance.processVar(), true);
                    _processVar = JSON.stringify(_processVar);
                    dbObject.vars(_processVar);
                }
            }

            applyInputTaskParams (){
                // Only Task definition can use task parameters
                // implementation in TaskDef
            }

            checkInputParams(params){
                return true
            }

            setInputParams(params){
                var _inputParam = this.inputTaskParams();
                if (_inputParam) {
                    this.getCol('TaskParams')._del(_inputParam)
                }
                var _db = this.pvt.db ? this.pvt.db : this.getRoot().pvt.db;
                _db.deserialize(params, {obj: this, colName: 'TaskParams'}, EngineSingleton.getInstance().createComponentFunction);
            }
        }
    }
);
