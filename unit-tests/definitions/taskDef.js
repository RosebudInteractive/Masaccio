/**
 * Created by staloverov on 22.04.2016.
 */
var EngineSingleton = require(PATH.engine + 'engineSingleton');

var Definitions = {
    names: {
        forSimpleTaskDef: 'Simple Task Definition'
    },

    forSimpleTaskDef : function() {
        /*
                                    +---------+
                          +---------> task2.1 +--------+
                          |         +---------+        |
         +-------+    +---+---+                    +---v---+     +-------+
         | start +----> task1 |                    | task3 +----->  end  |
         +-------+    +---+---+                    +---^---+     +-------+
                          |         +---------+        |
                          +---------> task2.2 +--------+
                                    +---------+
        */




        var _definition = EngineSingleton.getInstance().newTaskDefinition();
        _definition.definitionID('cbf35df0-8317-4f2f-8728-88736251ff0b');
        _definition.name(this.names.forSimpleTaskDef);
        var _start = _definition.addStartEvent('start');
        var _task1 = _definition.addTaskStage('task1');
        var _task21 = _definition.addTaskStage('task2.1');
        var _task22 = _definition.addTaskStage('task2.2');
        var _task3 = _definition.addTaskStage('task3');
        var _end = _definition.addEndEvent('end');

        _definition.connect(_start, _task1);
        _definition.connect(_task1, _task1);
        _definition.connect(_task1, _task21);
        // _definition.connect(_task1, _task22);
        _definition.connect(_task21, _task3);
        // _definition.connect(_task22, _task3);
        _definition.connect(_task3, _end);

        return _definition;
    }
};

if (module) {module.exports = Definitions}