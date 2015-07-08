/**
 * Created by staloverov on 01.06.2015.
 */
var Main = require('./../main');
var EngineSingleton = require(PATH.engine + 'engineSingleton');

var Definitions = {
    simpleProcessWithOneActivity : function() {
        var _definition = EngineSingleton.getInstance().newDefinition();
        _definition.definitionID('68c621d9-3168-4655-98e6-36ed7700efe4')
        _definition.name('Тестовый процесс - простейший процесс с одним узлом Activity');
        _definition.addActivity('start');

        return _definition;
    },

    forTestWaitRequest : function() {

        /*
         +---------+      +-----------+
         | _start  +------> _userTask |
         +---------+      +-----------+
         */

        var _definition =  EngineSingleton.getInstance().newDefinition();
        var _start = _definition.addActivity('start');
        var _userTask = _definition.addUserTask('userTask');
        _userTask.addRequest('request1').addParameter('param1').value(5);
        _definition.connect(_start, _userTask);

        return _definition;
    },

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

        var _definition = EngineSingleton.getInstance().newDefinition();
        _definition.definitionID("bcfb9471-2364-4dd8-a12e-166245f35f5f")
        _definition.name('Тестовый процесс - Проверка прохождения узлов несколькими токенами');
        _definition.addParameter('count').value(0);

        var _start = _definition.addActivity('start');

        var _script1 = {moduleName : 'Test/Engine/NodeStateWithTwoTokens/script1', methodName : 'execScript'};
        var _scriptTask = _definition.addScriptTask(_script1, 'scriptTask');

        var _gateway = _definition.addInclusiveGateway('inclusiveGateway');
        var _finish = _definition.addActivity('finish');

        _definition.connect(_start, _scriptTask);
        _definition.connect(_scriptTask, _gateway);

        var _script2 = {moduleName : 'Test/Engine/NodeStateWithTwoTokens/sequence', methodName : 'execScript', methodParams : {minValue : 0, maxValue : 5}};
        _definition.connect(_gateway, _scriptTask, _script2);

        var _script3 = {moduleName : 'Test/Engine/NodeStateWithTwoTokens/sequence', methodName : 'execScript', methodParams : {minValue : 0, maxValue : 5}};
        _definition.connect(_gateway, _scriptTask, _script3);

        var _script4 = {moduleName : 'Test/Engine/NodeStateWithTwoTokens/sequence', methodName : 'execScript', methodParams : {minValue : 4, maxValue : 10}};
        _definition.connect(_gateway, _finish, _script4);

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

        var _definition = EngineSingleton.getInstance().newDefinition();
        _definition.definitionID("3289be23-3e15-4be2-957e-62e1c8516376");
        _definition.name('Определение тестового процесса с использованием inclusiveGateway');

        var _activity1 = _definition.addActivity('testActivity1');
        var _userTask = _definition.addUserTask('UserTask1');
            _userTask.addRequest('Реквест1').addParameter('param1');
            _userTask.addRequest('Реквест2').addParameter('param1');

        var _gateway = _definition.addInclusiveGateway('InclusiveGateway1');

        var _activityFalse = _definition.addActivity('testActivity_false');
        var _activityTrue = _definition.addActivity('testActivity_true');

        var _scriptForTask = {moduleName : 'Test/Engine/InclusiveGatewayProcess/scriptTask', methodName : 'execScript', methodParams : { message : 'Привет от узла [%s]'}};
        var _scriptTask = _definition.addScriptTask(_scriptForTask, 'scriptTask');

        _definition.connect(_activity1, _gateway);

        var _script1 = {moduleName : 'Test/Engine/InclusiveGatewayProcess/sequence', methodName : 'execTest', methodParams : { paramNumber : 0, value : 'YAHOO!'}};
        _definition.connect(_gateway, _activityFalse, _script1);

        var _script2 = {moduleName : 'Test/Engine/InclusiveGatewayProcess/sequence', methodName : 'execTest', methodParams : { paramNumber : 1, value : 'YAHOO!'}};
        _definition.connect(_gateway, _activityTrue, _script2);

        _definition.connect(_activityFalse, _scriptTask);
        _definition.connect(_activityTrue, _userTask);

        return _definition;
    }
};


if (module) {module.exports = Definitions}
