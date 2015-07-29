/**
 * Created by staloverov on 01.07.2015.
 */
var ControlMgr = require(UCCELLO_CONFIG.uccelloPath + 'controls/controlMgr');

var ProcessDefinition = require('./processDefinition');
    var FlowNode = require('./flowNode');
    var SequenceFlow = require('./sequenceFlow');
    var Parameter = require('./parameter');
    var Request = require('./request');
    var UserScript = require('./userScript');
    var Activity = require('./Activities/activity');
    var UserTask = require('./Activities/userTask');
    var ScriptTask = require('./Activities/scriptTask');

var InclusiveGateway = require('./Gateways/inclusiveGateway');
var ExclusiveGateway = require('./Gateways/exclusiveGateway');

var Process = require('./process');
    var Token = require('./token');
    var NodeProps = require('./NodeProps/nodeProperties');

var Initializer = {
    dbp : {name: "Engine", kind: "master", guid: 'fb9653ea-4fc3-aee0-7a31-172a91aa196b'},

    registerTypes : function(controlManager){
        new Parameter(controlManager);
        new UserScript(controlManager);
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
    },

    createInternalDb : function(dbController) {
        return dbController.newDataBase(this.dbp);
    },

    createControlManager : function(engineDb) {
        return new ControlMgr({controller : engineDb.pvt.controller, dbparams : this.dbp});
    }
}


if (module) {module.exports = Initializer}