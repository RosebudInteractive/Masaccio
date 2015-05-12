/**
 * Created by staloverov on 24.04.2015.
 */
var Definition = require('./../wfe/processDefinition');
var FlowNode = require('./../wfe/flowNode');
var Activity = require('./../wfe/Activities/activity');
var UserTask = require('./../wfe/Activities/userTask');
var SequenceFlow = require('./../wfe/sequenceFlow');
var ExclusiveGateway = require('./../wfe/Gateways/exclusiveGateway');

var Definitions = {};

Definitions.simpleTestDefinition = function(controlManager){
    var _definition = new Definition(controlManager);
    _definition.definitionID = "60cac005-4dbb-4a22-beb1-1afae6604791";
    _definition.name = 'Определение тестового процесса';

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
    _gateway.name = 'Gateway1';

    var _activityFalse = new Activity(controlManager);
    _activityFalse.name = "testActivity_false";

    var _activityTrue = new Activity(controlManager);
    _activityTrue.name = "testActivity_true";

    _definition.addActivity(_activity1);
    _definition.addActivity(_userTask);
    _definition.addGateway(_gateway);
    _definition.addActivity(_activityFalse);
    _definition.addActivity(_activityTrue);

    var _sq1 = new SequenceFlow(controlManager);
    _sq1.connect(_activity1, _userTask);
    _definition.addConnector(_sq1);

    var _sq2 = new SequenceFlow(controlManager);
    _sq2.connect(_userTask, _gateway);
    _definition.addConnector(_sq2);

    var _sqFalse = new SequenceFlow(controlManager);
    _sqFalse.connect(_gateway, _activityFalse, 'process.currentToken.getPropertiesOfNode("UserTask1").parameters[0].value == "False"');
    _definition.addConnector(_sqFalse);

    var _sqTrue = new SequenceFlow(controlManager);
    _sqTrue.connect(_gateway, _activityTrue, 'process.currentToken.getPropertiesOfNode("UserTask1").parameters[0].value == "YAHOO!"');
    _definition.addConnector(_sqTrue);

    return _definition;
}


if (module) {module.exports = Definitions}