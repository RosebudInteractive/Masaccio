/**
 * Created by staloverov on 01.06.2015.
 */
var assert = require("assert");
var Main = require('./../main');
var ProcessDefinition = require(PATH.engine + 'processDefinition');
var Activity = require(PATH.engine + 'Activities/activity');
var FlowNode = require(PATH.engine + 'flowNode');
var UserTask = require(PATH.engine + 'Activities/userTask')
var SequenceFlow = require(PATH.engine + 'sequenceFlow');
var ScriptTask = require(PATH.engine + 'Activities/scriptTask');
var InclusiveGateway = require(PATH.engine + 'Gateways/inclusiveGateway');
var EngineSingleton = require(PATH.engine + 'engineSingleton');

var Definitions = {
    forTestNodeStateWithTwoTokens : function () {

        /*
                                +-------------------+
                                |                   |
         +---------+     +------v-------+     +-----+-----+    +-------+
         | _start  +-----> _scriptTask  +-----> _gateway  +----> _end  |
         +---------+     +------^-------+     +-----+-----+    +-------+
                                |                   |
                                +-------------------+
         */

        var _controlManager = Main.Config.getControlManager();

        var _definition = EngineSingleton.getInstance().newDefinition();
        _definition.definitionID("bcfb9471-2364-4dd8-a12e-166245f35f5f")
        _definition.name('Тестовый процесс - Проверка прохождения узлов несколькими токенами');
        _definition.addParameter('count').value(0);

        var _start = new Activity(_controlManager, {parent  : _definition, colName : 'Nodes'});
        _start.name('start');

        var _script1 = {moduleName : 'Test/Engine/NodeStateWithTwoTokens/script1', methodName : 'execScript'};
        var _scriptTask = new ScriptTask(_controlManager, {parent  : _definition, colName : 'Nodes'}, _script1);
        _scriptTask.name('scriptTask');

        var _gateway = new InclusiveGateway(_controlManager, {parent  : _definition, colName : 'Nodes'});
        _gateway.name('inclusiveGateway');

        var _finish = new Activity(_controlManager, {parent  : _definition, colName : 'Nodes'});
        _finish.name('finish');

        var _sqToScriptTask1 = new SequenceFlow(_controlManager, {parent  : _definition, colName : 'Connectors'});
        _sqToScriptTask1.connect(_start, _scriptTask);
        //_definition.addConnector(_sqToScriptTask1);

        var _sqToGateway = new SequenceFlow(_controlManager, {parent  : _definition, colName : 'Connectors'});
        _sqToGateway.connect(_scriptTask, _gateway);
        //_definition.addConnector(_sqToGateway);

        var _sqToScriptTask2 = new SequenceFlow(_controlManager, {parent  : _definition, colName : 'Connectors'});
        var _script2 = {moduleName : 'Test/Engine/NodeStateWithTwoTokens/sequence', methodName : 'execScript', methodParams : {minValue : 0, maxValue : 5}};
        _sqToScriptTask2.connect(_gateway, _scriptTask, _script2);
        //_definition.addConnector(_sqToScriptTask2);

        var _sqToScriptTask3 = new SequenceFlow(_controlManager, {parent  : _definition, colName : 'Connectors'});
        var _script3 = {moduleName : 'Test/Engine/NodeStateWithTwoTokens/sequence', methodName : 'execScript', methodParams : {minValue : 0, maxValue : 5}};
        _sqToScriptTask3.connect(_gateway, _scriptTask, _script3);
        //_definition.addConnector(_sqToScriptTask3);

        var _sqToFinish = new SequenceFlow(_controlManager, {parent  : _definition, colName : 'Connectors'});
        var _script4 = {moduleName : 'Test/Engine/NodeStateWithTwoTokens/sequence', methodName : 'execScript', methodParams : {minValue : 4, maxValue : 10}};
        _sqToFinish.connect(_gateway, _finish, _script4);
        //_definition.addConnector(_sqToFinish);

        return _definition;
    },

    forTestInclusiveGatewayProcess : function() {

        /*
                                                  +-----------------+    +-------------+
                                        +---------> _activityFalse  +----> _scriptTask |
                                        |         +-----------------+    +-------------+
         +------------+   +-------------+-----+
         | _activity1 +---> _inclusiveGateway |
         +------------+   +-------------+-----+
                                        |         +-----------------+    +-------------+
                                        +---------> _activityTrue   +----> _userTask   |
                                                  +-----------------+    +-------------+
         */

        var _controlManager = Main.Config.getControlManager();

        var _definition = EngineSingleton.getInstance().newDefinition();
        _definition.definitionID("3289be23-3e15-4be2-957e-62e1c8516376");
        _definition.name('Определение тестового процесса с использованием inclusiveGateway');

        var _activity1 = new Activity(_controlManager, {parent  : _definition, colName : 'Nodes'});
        _activity1.name("testActivity1");

        //var _userTask =  new UserTask(_controlManager, {parent  : _definition, colName : 'Nodes'});

        var _userTask = _definition.addUserTask('UserTask1');
        _userTask.addRequest('Реквест1').addParameter('param1');
        _userTask.addRequest('Реквест2').addParameter('param1');

        var _gateway = new InclusiveGateway(_controlManager, {parent  : _definition, colName : 'Nodes'});
        _gateway.name('InclusiveGateway1');

        var _activityFalse = new Activity(_controlManager, {parent  : _definition, colName : 'Nodes'});
        _activityFalse.name("testActivity_false");

        var _activityTrue = new Activity(_controlManager, {parent  : _definition, colName : 'Nodes'});
        _activityTrue.name("testActivity_true");

        var _scriptForTask = {moduleName : 'Test/Engine/InclusiveGatewayProcess/scriptTask', methodName : 'execScript', methodParams : { message : 'Привет от узла [%s]'}};
        var _scriptTask = new ScriptTask(_controlManager, {parent  : _definition, colName : 'Nodes'}, _scriptForTask);
        _scriptTask.name('scriptTask');

        var _sqToGateway = new SequenceFlow(_controlManager, {parent  : _definition, colName : 'Connectors'});
        _sqToGateway.connect(_activity1, _gateway);

        var _sqFalse = new SequenceFlow(_controlManager, {parent  : _definition, colName : 'Connectors'});
        var _script1 = {moduleName : 'Test/Engine/InclusiveGatewayProcess/sequence', methodName : 'execTest', methodParams : { paramNumber : 0, value : 'YAHOO!'}};
        _sqFalse.connect(_gateway, _activityFalse, _script1);

        var _sqTrue = new SequenceFlow(_controlManager, {parent  : _definition, colName : 'Connectors'});
        var _script2 = {moduleName : 'Test/Engine/InclusiveGatewayProcess/sequence', methodName : 'execTest', methodParams : { paramNumber : 1, value : 'YAHOO!'}};
        _sqTrue.connect(_gateway, _activityTrue, _script2);

        var _sqToScript = new SequenceFlow(_controlManager, {parent  : _definition, colName : 'Connectors'});
        _sqToScript.connect(_activityFalse, _scriptTask);

        var _sqToUserTask = new SequenceFlow(_controlManager, {parent  : _definition, colName : 'Connectors'});
        _sqToUserTask.connect(_activityTrue, _userTask);

        return _definition;
    }
};


if (module) {module.exports = Definitions}
