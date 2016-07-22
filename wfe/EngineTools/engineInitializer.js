/**
 * Created by staloverov on 01.07.2015.
 */
'use strict';

var ControlMgr = require(UCCELLO_CONFIG.uccelloPath + 'controls/controlMgr');

var ProcessDefinition = require('./../processDefinition');
    var ObjectRef = require('./../objectRef');
    var FlowNode = require('./../flowNode');
    var SequenceFlow = require('./../sequenceFlow');
    var Parameter = require('./../parameter');
    var Request = require('./../request');
    var UserScript = require('./../userScript');
    var Activity = require('./../Activities/activity');
    var UserTask = require('./../Activities/userTask');
    var ScriptTask = require('./../Activities/scriptTask');

var InclusiveGateway = require('./../Gateways/inclusiveGateway');
var ExclusiveGateway = require('./../Gateways/exclusiveGateway');

var Process = require('./../process');
    var Token = require('./../token');
    var NodeProps = require('./../NodeProps/nodeProperties');

var MessageDefinition = require('./../Messages/messageDefinition');
var MessageInstance = require('./../Messages/messageInstance');
    var MessageFlow = require('./../Messages/messageFlow');
    var CorrelationKey = require('./../Messages/correlationKey');
    var CorrelationKeyInstance = require('./../Messages/correlationKeyInstance');
    var CorrelationProperty = require('./../Messages/correlationProperty');
    var RetrievalExpression = require('./../Messages/retrievalExpression');
    var MessageRetrievalExpression = require('./../Messages/messageRetrievalExpression');

var Event = require('./../Events/event');
    var StartMessageEvent = require('./../Events/Start/messageStartEvent');

var TaskDef = require('./../Task/taskDef');
var TaskStage = require('./../Task/taskStageMOC');
var TaskParameter = require('./../Task/taskParameter');
var TaskRequestParameter = require('./../Task/taskRequestParameter');
var ProcessVar = require('./../processVar');
var WfeParameter = require('./../parameter');


var TypeProvider = require('./typeProvider');

class Initiator {
    static registerTypeProvider(controlManager, constructHolder, rpc) {
        var _provider = new TypeProvider(controlManager, {});
        var _remote = rpc._publ(_provider, _provider.getInterface());
        
        constructHolder.addTypeProvider(_remote);
        constructHolder.addTypeProvider(_provider, true);

        _provider.registerType(TaskParameter);
        _provider.registerType(Request);
        _provider.registerType(TaskRequestParameter);
        _provider.registerType(ProcessVar);
        _provider.registerType(WfeParameter);
        _provider.registerType(TaskStage);
    }

    static registerTypes(controlManager) {
        new ObjectRef(controlManager);

        new Parameter(controlManager);
        new UserScript(controlManager);

        new RetrievalExpression(controlManager);
        new MessageRetrievalExpression(controlManager);
        new CorrelationProperty(controlManager);
        new CorrelationKey(controlManager);
        new CorrelationKeyInstance(controlManager);
        new MessageDefinition(controlManager);
        new MessageInstance(controlManager);
        new MessageFlow(controlManager);

        new SequenceFlow(controlManager);

        new FlowNode(controlManager);
        new Request(controlManager);

        new ProcessDefinition(controlManager);

        new Activity(controlManager);
        new UserTask(controlManager);
        new ScriptTask(controlManager);

        new InclusiveGateway(controlManager);
        new ExclusiveGateway(controlManager);

        new NodeProps(controlManager);
        new Token(controlManager);
        new Process(controlManager);

        // new TaskDef(controlManager);
        // new TaskStage(controlManager);

        // new TaskParameter(controlManager);
    }

    static createControlManager(initParams) {
        var _dbParams = {
            name: "Engine",
            kind: "master",
            guid: 'fb9653ea-4fc3-aee0-7a31-172a91aa196b',
            constructHolder: initParams.constructHolder
        };
        return new ControlMgr({
            controller: initParams.dbController,
            dbparams: _dbParams
        }, null, null, null, initParams.proxy);
    }
}

if (module) {module.exports = Initiator}