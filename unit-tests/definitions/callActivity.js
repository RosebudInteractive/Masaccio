/**
 * Created by staloverov on 01.09.2015.
 */
var Main = require('./../main');
var EngineSingleton = require(PATH.engine + 'engineSingleton');

var SubProcessDefinitions = {
    guids : {simpleProcess : 'f4b19e08-f960-4b4b-b2f2-d811cbbcc3cd'},

    simpleSubprocess : function() {
        /*
          XXX      +------------+       XXX
         X   X+----> _activity  +----->X   X
          XXX      +------------+       XXX
         */

        var _definition = EngineSingleton.getInstance().newProcessDefinition();
        _definition.definitionId(this.guids.simpleProcess);
        _definition.name('Тестовый подпроцесс - простейший процесс с одним узлом Activity');
        var _start = _definition.addStartEvent('start_Subprocess');
        var _activity = _definition.addActivity('activity_Subprocess');
        var _end = _definition.addEndEvent('end_Subprocess');

        _definition.connect(_start, _activity);
        _definition.connect(_activity, _end);

        return _definition;
    }
};

var Definitions = {
    guids : {callSimpleSubProcess : 'c1ef340e-32e7-4434-9db9-57ab62437a16'},

    callSimpleSubProcess : function() {
        /*
          XXX      +----------------+       XXX
         X   X+----> _callActivity  +----->X   X
          XXX      +----------------+       XXX
         */

        var _definition = EngineSingleton.getInstance().newProcessDefinition();
        _definition.definitionId(this.guids.callSimpleSubProcess);
        _definition.name('Тестовый процесс для CallActivity');
        var _start = _definition.addStartEvent('start');
        var _activity = _definition.addCallActivity('callActivity', SubProcessDefinitions.guids.simpleProcess);
        var _end = _definition.addStartEvent('start');

        _definition.connect(_start, _activity);
        _definition.connect(_activity, _end);

        return _definition;
    }

};

if (module) {
    module.exports.Process = Definitions;
    module.exports.SubProcess = SubProcessDefinitions;
}
