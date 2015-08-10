/**
 * Created by staloverov on 28.05.2015.
 */
//var assert = require("assert");
var Main = require('./../main');
var EngineSingleton = require(PATH.engine + 'engineSingleton');

var Definitions = {
    forCreateNewProcessTest : function () {
        var _definition = EngineSingleton.getInstance().newProcessDefinition();
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

        var _definition = EngineSingleton.getInstance().newProcessDefinition();
        _definition.definitionID("1c27b462-ad68-422e-b4f9-2740b16b60f4");
        _definition.name('Тестовый процесс - Копирование структуры definition в процесс');

        _definition.addParameter('param1').value(3);

        var _start = _definition.addActivity('start');
        var _gateway = _definition.addInclusiveGateway('inclusiveGateway');

        var _userTask = _definition.addUserTask('userTask');
        _userTask.addRequest('request1').addParameter('request_param1');

        var _script1 = {moduleName : 'Test/Process/CopyDefinitionStruct/script1', methodName : 'execScript'};
        var _scriptTask = _definition.addScriptTask('scriptTask', _script1);

        _definition.connect(_start, _gateway);

        var _script2 = {moduleName : 'Test/Process/CopyDefinitionStruct/sequence', methodName : 'execScript', methodParams : {minValue : 0, maxValue : 5}};
        _definition.connect(_gateway, _userTask, _script2);

        _definition.connect(_gateway, _userTask, _script2);

        var _script3 = {moduleName : 'Test/Process/CopyDefinitionStruct/sequence', methodName : 'execScript', methodParams : {minValue : 0, maxValue : 5}};
        _definition.connect(_gateway, _scriptTask, _script3);

        return _definition;
    },

    testDefinitionWithLoop : function() {

        /*
                              +---------------+
                              |               |
         +---------+   +------v-----+   +-----+-----+   +----------+
         | _start  +---> _userTask  +---> _gateway  +---> _finish  |
         +---------+   +------------+   +-----------+   +----------+
         */

        var _definition = EngineSingleton.getInstance().newProcessDefinition();
        _definition.definitionID('219612b1-259c-4af6-8bba-959db2526ad7');
        _definition.name('Тестовый процесс с петлей');

        // Добавим параметр процесса, который будем потом изменять и контролировать
        _definition.addParameter('param1').value(0);

        // Добавляем узлы
        var _start = _definition.addActivity('start');
        var _userTask = _definition.addUserTask('userTask', {
            moduleName : 'Test/Process/CopyDefinitionStruct/script1',
            methodName : 'execScript'
        });
        // UserTask-У добавим реквест с параметром
        _userTask.addRequest('request1').addParameter('request_param1');

        var _finish = _definition.addActivity('finish');
        var _gateway = _definition.addInclusiveGateway('inclusiveGateway');

        // Соединим узлы
        // Первые два без условий
        _definition.connect(_start, _userTask);
        _definition.connect(_userTask, _gateway);

        // gateway с условиями
        _definition.connect(_gateway, _userTask, {
            moduleName : 'Test/Process/CopyDefinitionStruct/sequence',
            methodName : 'execScript',
            methodParams : {minValue : 0, maxValue : 2}
        });

        _definition.connect(_gateway, _finish, {
            moduleName : 'Test/Process/CopyDefinitionStruct/sequence',
            methodName : 'execScript',
            methodParams : {minValue : 2, maxValue : 5}}
        );

        return _definition;
    }
};


if (module) {module.exports = Definitions}
