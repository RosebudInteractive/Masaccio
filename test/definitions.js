/**
 * Created by staloverov on 24.04.2015.
 */
var Definition = require('./../wfe/processDefinition');
var FlowNode = require('./../wfe/flowNode');
var Activity = require('./../wfe/Activities/activity');
var UserTask = require('./../wfe/Activities/userTask');
var ScriptTask = require('./../wfe/Activities/scriptTask');

var SequenceFlow = require('./../wfe/sequenceFlow');
var ExclusiveGateway = require('./../wfe/Gateways/exclusiveGateway');
var InclusiveGateway = require('./../wfe/Gateways/inclusiveGateway');

var Definitions = {};

Definitions.exclusiveGatewayTest_Definition = function(controlManager){
    var _definition = new Definition(controlManager);
    _definition.definitionID = "60cac005-4dbb-4a22-beb1-1afae6604791";
    _definition.name = 'Определение тестового процесса с использованием exclusiveGateway';

    new FlowNode(controlManager);

    var _activity1 = new Activity(controlManager);
    _activity1.name = "testActivity1";

    var _userTask =  new UserTask(controlManager);
    _userTask.name = 'UserTask1';
    var _request1 = _userTask.addRequest('Реквест1');
    /* Todo : необходимо добавить в параметры узла*/
    _request1.addParameter('param1');

    _userTask.addRequest('Реквест2').addParameter('param1');

    var _gateway = new ExclusiveGateway(controlManager);
    _gateway.name = 'ExclusiveGateway1';

    var _activityFalse = new Activity(controlManager);
    _activityFalse.name = "testActivity_false";

    var _activityTrue = new Activity(controlManager);
    _activityTrue.name = "testActivity_true";

    var _scriptForTask = {moduleName : 'testScriptTask', methodName : 'execScript', methodParams : { message : 'Привет от узла [%s]'}};
    var _scriptTask = new ScriptTask(controlManager, null, _scriptForTask)

    _definition.addActivity(_activity1);
    _definition.addActivity(_userTask);
    _definition.addGateway(_gateway);
    _definition.addActivity(_activityFalse);
    _definition.addActivity(_activityTrue);
    _definition.addActivity(_scriptTask);

    var _sqToScript = new SequenceFlow(controlManager);
    _sqToScript.connect(_activity1, _scriptTask);
    _definition.addConnector(_sqToScript);

    var _sq1 = new SequenceFlow(controlManager);
    _sq1.connect(_scriptTask, _userTask);
    _definition.addConnector(_sq1);

    var _sq2 = new SequenceFlow(controlManager);
    _sq2.connect(_userTask, _gateway);
    _definition.addConnector(_sq2);

    var _sqFalse = new SequenceFlow(controlManager);
    var _script1 = {moduleName : 'test', methodName : 'execTest', methodParams : { paramNumber : 0, value : 'False'}};
    _sqFalse.connect(_gateway, _activityFalse, _script1);
    _definition.addConnector(_sqFalse);

    var _sqTrue = new SequenceFlow(controlManager);
    var _script2 = {moduleName : 'test', methodName : 'execTest', methodParams : { paramNumber : 0, value : 'YAHOO!'}};
    _sqTrue.connect(_gateway, _activityTrue, _script2);
    _definition.addConnector(_sqTrue);

    return _definition;
}

Definitions.inclusiveGatewayTest_Definition = function(controlManager){
    var _definition = new Definition(controlManager);
    _definition.definitionID = "3289be23-3e15-4be2-957e-62e1c8516376";
    _definition.name = 'Определение тестового процесса с использованием inclusiveGateway';

    new FlowNode(controlManager);

    var _activity1 = new Activity(controlManager);
    _activity1.name = "testActivity1";

    var _userTask =  new UserTask(controlManager);
    _userTask.name = 'UserTask1';
    var _request1 = _userTask.addRequest('Реквест1');
    /* Todo : необходимо добавить в параметры узла*/
    _request1.addParameter('param1');

    _userTask.addRequest('Реквест2').addParameter('param1');

    var _gateway = new InclusiveGateway(controlManager);
    _gateway.name = 'InclusiveGateway1';

    var _activityFalse = new Activity(controlManager);
    _activityFalse.name = "testActivity_false";

    var _activityTrue = new Activity(controlManager);
    _activityTrue.name = "testActivity_true";

    var _scriptForTask = {moduleName : 'testScriptTask', methodName : 'execScript', methodParams : { message : 'Привет от узла [%s]'}};
    var _scriptTask = new ScriptTask(controlManager, null, _scriptForTask)
    _scriptTask.name = 'scriptTask';

    _definition.addActivity(_activity1);
    _definition.addActivity(_userTask);
    _definition.addGateway(_gateway);
    _definition.addActivity(_activityFalse);
    _definition.addActivity(_activityTrue);

    /*
                             -> _activityFalse -> _scriptTask
     _activity1 -> _gateway
                            -> _activityTrue -> _userTask
     */

    var _sqToGateway = new SequenceFlow(controlManager);
    _sqToGateway.connect(_activity1, _gateway);
    _definition.addConnector(_sqToGateway);

    var _sqFalse = new SequenceFlow(controlManager);
    var _script1 = {moduleName : 'test', methodName : 'execTest', methodParams : { paramNumber : 0, value : 'YAHOO!'}};
    _sqFalse.connect(_gateway, _activityFalse, _script1);
    _definition.addConnector(_sqFalse);

    var _sqTrue = new SequenceFlow(controlManager);
    var _script2 = {moduleName : 'test', methodName : 'execTest', methodParams : { paramNumber : 1, value : 'YAHOO!'}};
    _sqTrue.connect(_gateway, _activityTrue, _script2);
    _definition.addConnector(_sqTrue);

    var _sqToScript = new SequenceFlow(controlManager);
    _sqToScript.connect(_activityFalse, _scriptTask);
    _definition.addConnector(_sqToScript);

    var _sqToUserTask = new SequenceFlow(controlManager);
    _sqToUserTask.connect(_activityTrue, _userTask);
    _definition.addConnector(_sqToUserTask);

    return _definition;
}


if (module) {module.exports = Definitions}