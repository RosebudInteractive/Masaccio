/**
 * Created by staloverov on 28.05.2015.
 */
var assert = require("assert");
var Main = require('./../main');
var ProcessDefinition = require(PATH.engine + 'processDefinition')
var Parameter = require(PATH.engine + 'parameter');

var Activity = require(PATH.engine + 'Activities/activity');
var InclusiveGateway = require(PATH.engine + 'Gateways/inclusiveGateway');
var UserTask = require(PATH.engine + 'Activities/userTask');
var ScriptTask = require(PATH.engine + 'Activities/scriptTask');
var SequenceFlow = require(PATH.engine + 'sequenceFlow');

var Definitions = {
    forCreateNewProcessTest : function () {
        var _controlManager = Main.Config.getControlManager();

        var _definition = new ProcessDefinition(_controlManager, {});
        _definition.definitionID("8349600e-3d0e-4d4e-90c8-93d42c443ab3");
        _definition.name('Тестовый процесс - Создание нового процесса');
        _definition.addParameter('param1').value(3);
        _definition.addParameter('param2');
        _definition.addParameter('param3').value('hello!');

        return _definition;
    },

    forCopyDefinitionStruct : function() {

        /*
                                         +-------------+
                               +---------> _userTask   |
                               |         +------^------+
         +---------+     +-----+-----+          |
         | _start  +-----> _gateway  +----------+
         +---------+     +-----+-----+
                               |         +-------------+
                               +---------> scriptTask  |
                                         +-------------+
        */


        var _controlManager = Main.Config.getControlManager();

        var _definition = new ProcessDefinition(_controlManager, {});
        _definition.definitionID("1c27b462-ad68-422e-b4f9-2740b16b60f4");
        _definition.name('Тестовый процесс - Копирование структуры definition в процесс');

        _definition.addParameter('param1').value(3);

        var _start = new Activity(_controlManager, {parent  : _definition, colName : 'Nodes'});
        _start.name('start');

        var _gateway = new InclusiveGateway(_controlManager, {parent  : _definition, colName : 'Nodes'});
        _gateway.name('inclusiveGateway');

        var _userTask = new UserTask(_controlManager, {parent  : _definition, colName : 'Nodes'});
        _userTask.name('userTask');
        _userTask.addRequest('request1').addParameter('request_param1');

        var _script1 = {moduleName : 'Test/Process/CopyDefinitionStruct/script1', methodName : 'execScript'};
        var _scriptTask = new ScriptTask(_controlManager, {parent  : _definition, colName : 'Nodes'}, _script1);
        _scriptTask.name('scriptTask');

        var _sqToGateway = new SequenceFlow(_controlManager, {parent  : _definition, colName : 'Connectors'});
        _sqToGateway.connect(_start, _gateway);

        var _sqToUserTask1 = new SequenceFlow(_controlManager, {parent  : _definition, colName : 'Connectors'});
        var _script2 = {moduleName : 'Test/Process/CopyDefinitionStruct/sequence', methodName : 'execScript', methodParams : {minValue : 0, maxValue : 5}};
        _sqToUserTask1.connect(_gateway, _userTask, _script2);

        var _sqToUserTask2 = new SequenceFlow(_controlManager, {parent  : _definition, colName : 'Connectors'});
        _sqToUserTask2.connect(_gateway, _userTask, _script2);

        var _sqToScriptTask = new SequenceFlow(_controlManager, {parent  : _definition, colName : 'Connectors'});
        var _script3 = {moduleName : 'Test/Process/CopyDefinitionStruct/sequence', methodName : 'execScript', methodParams : {minValue : 0, maxValue : 5}};
        _sqToScriptTask.connect(_gateway, _scriptTask, _script3);

        return _definition;
    }
}


if (module) {module.exports = Definitions}
