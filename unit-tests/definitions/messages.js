/**
 * Created by staloverov on 22.07.2015.
 */
var Main = require('./../main');
var EngineSingleton = require(PATH.engine + 'engineSingleton');
var EventRef = require(PATH.engine + '/Events/eventReferences');


var Messages = {
    names : {
        messageDefinition1 : 'MessageDefinition1',
        startProcessMessageDef : 'StartProcessMessageDef',
        checkMessageDef : 'CheckMessageDef'
    },

    messageDefinition1 : function() {
        var _definition = EngineSingleton.getInstance().newMessageDefinition('MessageDefinition1');
        _definition.addParameter('TaskID');
        _definition.addParameter('TaskName');
        EngineSingleton.getInstance().addMessageDefinition(_definition);
    },

    startProcessMessageDef : function() {
        var _definition = EngineSingleton.getInstance().newMessageDefinition(this.names.startProcessMessageDef);
        _definition.addParameter('MessageParameter_processID');
        EngineSingleton.getInstance().addMessageDefinition(_definition);
    },

    checkMessageDef : function() {
        var _definition = EngineSingleton.getInstance().newMessageDefinition(this.names.checkMessageDef);
        _definition.addParameter('CheckSum');
        EngineSingleton.getInstance().addMessageDefinition(_definition);
    },

    register : function() {
        for (var _def in this.names) {
            if (this.hasOwnProperty(_def) && typeof(this[_def]) == 'function') {
                this[_def]();
            }
        }
    }
};



var Definitions = {
    guids : {
        process_with_throwEvent : 'd2c1bc9d-ad21-453b-9993-0d45a5135bbc',
        process_with_startMessage_and_throwEvent : '508fe151-9a92-4c8e-a3dd-19a4d52d0cd5',
        process_with_start_and_catch_event : '14b007c7-4079-450e-a92f-7476e7c118db',
        process_with_catchingEvent_and_userTask : '56683a29-9f00-4bc0-af4b-af64642bcede',
        process_with_catchingEvent : 'a157350f-c68f-4801-b52b-ee36161c8a50'
    },
    names : {
        process_with_throwEvent : 'Тестовый процесс с простым сообщением',
        process_with_startMessage_and_throwEvent : 'Процесс запускающий 2 новых процесса и передающий им сообщения',
        process_with_start_and_catch_event : 'Процесс со стартовым событием message',
        process_with_catchingEvent_and_userTask : 'Тестовый процесс с catching event и userTask',
        process_with_catchingEvent : 'Тестовый процесс с catching event'
    },

    process_with_throwEvent : function() {

        /*
              XXXX       +----------+      XXXXX        XXXX
             X se X+-----> activity +---->X mte X+---->X ee X
              XXXX       +----------+      XXXXX        XXXX
        */

        function createMessageThrowEvent(eventName) {
            var _messageDef = EngineSingleton.getInstance().getMessageDefinition(Messages.names.messageDefinition1);

            var _event = _processDef.addEvent(EventRef.types.intermediate.throwing.message, eventName);
            _event.createOutgoingMessage(_messageDef, this.names.process_with_catchingEvent, 'ReceiveMessageEvent')

            _event.outgoingMessage().correlationKey().name('Key1');
            var _correlationProperty = _event.outgoingMessage().correlationKey().addProperty('Property1');
            _correlationProperty.addExpression({
                messageName: _messageDef.name(),
                nodeName: 'activity',
                parameterName: 'ParameterForTaskID'
            });
            _correlationProperty.addExpression({
                messageName: _messageDef.name(),
                nodeName: 'activity',
                parameterName: 'ParameterForTaskName'
            });

            return _event;
        }

        var _processDef = EngineSingleton.getInstance().newProcessDefinition();
        _processDef.definitionId(this.guids.process_with_throwEvent);
        _processDef.name(this.names.process_with_throwEvent);

        var _start = _processDef.addStartEvent('startEvent');

        var _activity = _processDef.addActivity('activity');
        _activity.addParameter('ParameterForTaskID').value(10);
        _activity.addParameter('ParameterForTaskName').value('Yahoo');

        var _messageThrowEvent = createMessageThrowEvent.call(this, 'MessageThrowEvent');
        var _end = _processDef.addEvent(EventRef.types.end.none, 'end');

        _processDef.connect(_start, _activity);
        _processDef.connect(_activity, _messageThrowEvent);
        _processDef.connect(_messageThrowEvent, _end);

        return _processDef;
    },


    process_with_startMessage_and_throwEvent : function() {
        var _processDef = EngineSingleton.getInstance().newProcessDefinition();
        _processDef.definitionId(this.guids.process_with_startMessage_and_throwEvent);
        _processDef.name(this.names.process_with_startMessage_and_throwEvent);

        _processDef.addParameter('ProcessID').value(1);
        _processDef.addParameter('MessageParameter_CheckSum').value(10);

        var _start = _processDef.addStartEvent('startEvent');

        //region _eventWithThrowStartMessage definition
        var _startProcessMessageDef = EngineSingleton.getInstance().getMessageDefinition(Messages.names.startProcessMessageDef);

        var _eventWithThrowStartMessage = _processDef.addEvent(EventRef.types.intermediate.throwing.message, 'ThrowStartMessageEvent');
        _eventWithThrowStartMessage.createOutgoingMessage(_startProcessMessageDef, this.names.process_with_start_and_catch_event, 'StartMessageEvent');
        /* Todo : с _processDef.addMessageFlow(); надо что-то решать*/

        _eventWithThrowStartMessage.outgoingMessage().correlationKey().name('EmptyKey');
        _eventWithThrowStartMessage.outgoingMessage().correlationKey().addProperty('Property1').addExpression({
            messageName: _startProcessMessageDef.name(),
            parameterName: 'ProcessID'
        });
        _eventWithThrowStartMessage.addExpression({
            messageName: _startProcessMessageDef.name(),
            parameterName: 'ProcessID',
            messageParameterName : 'MessageParameter_processID'
        });
        //endregion

        var _scriptTask1 = _processDef.addScriptTask('scriptTask1', {
            moduleName : 'Test/Message/process_with_startMessage_and_throwEvent/script1',
            methodName : 'execScript'
        });

        var _gateway1 = _processDef.addExclusiveGateway('gateway1');

        var _scriptTask2 = _processDef.addScriptTask('scriptTask2', {
            moduleName : 'Test/Message/process_with_startMessage_and_throwEvent/script2',
            methodName : 'execScript'
        });

        //region _messageThrowEvent definition
        var _checkMessageDef = EngineSingleton.getInstance().getMessageDefinition(Messages.names.checkMessageDef);

        var _messageThrowEvent = _processDef.addEvent(EventRef.types.intermediate.throwing.message, 'ThrowCheckMessageEvent');
        _messageThrowEvent.createOutgoingMessage(_checkMessageDef, this.names.process_with_start_and_catch_event, 'CatchMessageEvent');

        _messageThrowEvent.outgoingMessage().correlationKey().name('CheckKey');
        _messageThrowEvent.outgoingMessage().correlationKey().addProperty('Property1').addExpression({
            messageName: _checkMessageDef.name(),
            parameterName: 'ProcessID'
        });

        _messageThrowEvent.addExpression({
            messageName: _checkMessageDef.name(),
            parameterName: 'MessageParameter_CheckSum',
            messageParameterName : 'CheckSum'
        });
        //endregion

        var _scriptTask3 = _processDef.addScriptTask('scriptTask3', {
            moduleName : 'Test/Message/process_with_startMessage_and_throwEvent/script1',
            methodName : 'execScript'
        });

        var _gateway2 = _processDef.addExclusiveGateway('gateway2');

        var _end = _processDef.addEvent(EventRef.types.end.none, 'end');

        _processDef.connect(_start, _eventWithThrowStartMessage);
        _processDef.connect(_eventWithThrowStartMessage, _scriptTask1);
        _processDef.connect(_scriptTask1, _gateway1);
        _processDef.connect(_gateway1, _eventWithThrowStartMessage, {
            moduleName : 'Test/Message/process_with_startMessage_and_throwEvent/sequence1',
            methodName : 'execScript'
        });
        _processDef.connect(_gateway1, _scriptTask2, {
            moduleName : 'Test/Message/process_with_startMessage_and_throwEvent/sequence2',
            methodName : 'execScript'
        });
        _processDef.connect(_scriptTask2, _messageThrowEvent);
        _processDef.connect(_messageThrowEvent, _scriptTask3);
        _processDef.connect(_scriptTask3, _gateway2);
        _processDef.connect(_gateway2, _messageThrowEvent, {
            moduleName : 'Test/Message/process_with_startMessage_and_throwEvent/sequence1',
            methodName : 'execScript'
        });
        _processDef.connect(_gateway2, _end, {
            moduleName : 'Test/Message/process_with_startMessage_and_throwEvent/sequence2',
            methodName : 'execScript'
        });

        return _processDef;
    },

    process_with_start_and_catch_event : function() {
        /*
              XXXXX       +----------+      XXXX
             X sme X+-----> activity +---->X ee X
              XXXXX       +----------+      XXXX
        */

        var _processDef = EngineSingleton.getInstance().newProcessDefinition();
        _processDef.definitionId(this.guids.process_with_start_and_catch_event);
        _processDef.name(this.names.process_with_start_and_catch_event);

        _processDef.addParameter('ProcessIDFromParent');
        _processDef.addInputParameters('ProcessID');

        var _start = _processDef.addEvent(EventRef.types.start.message, 'StartMessageEvent');

        var _scriptTask = _processDef.addScriptTask('scriptTask1', {
            moduleName : 'Test/Message/process_with_start_and_catch_event/script1',
            methodName : 'execScript'
        });

        //region _catchEvent Definition
        var _checkMessageDef = EngineSingleton.getInstance().getMessageDefinition(Messages.names.checkMessageDef);

        var _catchEvent = _processDef.addEvent(EventRef.types.intermediate.catching.message, 'CatchMessageEvent');
        _catchEvent.createIncomingMessage(_checkMessageDef, this.names.process_with_startMessage_and_throwEvent, 'ThrowCheckMessageEvent');
        _catchEvent.incomingMessage().correlationKey().name('CheckKey');
        _catchEvent.incomingMessage().correlationKey().addProperty('Property1').addExpression({
            messageName: _checkMessageDef.name(),
            parameterName: 'ProcessIDFromParent'
        });
        //endregion

        var _end = _processDef.addEvent(EventRef.types.end.none, 'end');

        _processDef.connect(_start, _scriptTask);
        _processDef.connect(_scriptTask, _catchEvent);
        _processDef.connect(_catchEvent, _end);

        return _processDef;
    },

    process_with_catchingEvent_and_userTask : function() {
        /*
              XXXX    +-----------+     XXXXX       +----------+       XXXX
             X se X+--> _userTask +--->X mce X+-----> activity +----->X ee X
              XXXX    +-----------+     XXXXX       +----------+       XXXX
         */

        var _processDef = EngineSingleton.getInstance().newProcessDefinition();
        _processDef.definitionId(this.guids.process_with_catchingEvent_and_userTask);
        _processDef.name(this.names.process_with_catchingEvent_and_userTask);
        var _start = _processDef.addEvent(EventRef.types.start.none, 'startEvent');

        var _userTask = _processDef.addUserTask('userTask',{
            moduleName: 'Test/Message/ProcessWithCatchingEvent/script1',
            methodName: 'execScript'
        });
        _userTask.addRequest('request1').addParameter('param1');

        var _messageDef = EngineSingleton.getInstance().getMessageDefinition('MessageDefinition1');
        if (!_messageDef) {
            _messageDef = EngineSingleton.getInstance().newMessageDefinition();
        }
        _messageDef.name('MessageDefinition1');
        _messageDef.addParameter('TaskID');
        _messageDef.addParameter('TaskName');

        var _messageCatchingEvent = _processDef.addEvent(EventRef.types.intermediate.catching.message, 'ReceiveMessageEvent');
        var _messageFlow = _processDef.addMessageFlow();
        _messageFlow.messageDefinition(_messageDef);
        _messageFlow.sourceProcessName(this.names.process_with_throwEvent);
        _messageFlow.sourceNodeName('MessageThrowEvent');
        _messageFlow.targetProcessName(_processDef.name());
        _messageFlow.targetNodeName(_messageCatchingEvent.name());

        var _correlationKey = _processDef.addCorrelationKey('Key1');
        var _correlationProperty = _correlationKey.addProperty('Property1');
        _correlationProperty.addExpression({messageName : _processDef.name(), nodeName : 'activity', parameterName : 'ParameterForTaskID'});
        _correlationProperty.addExpression({messageName : _processDef.name(), nodeName : 'activity', parameterName : 'ParameterForTaskName'});

        _messageFlow.correlationKey(_correlationKey);

        _messageCatchingEvent.incomingMessage(_messageFlow);


        var _activity = _processDef.addActivity('activity');
        _activity.addParameter('ParameterForTaskID').value(10);
        _activity.addParameter('ParameterForTaskName').value('Yahoo');


        var _end = _processDef.addEvent(EventRef.types.end.none, 'end');

        _processDef.connect(_start, _userTask);
        _processDef.connect(_userTask, _messageCatchingEvent);
        _processDef.connect(_messageCatchingEvent, _activity);
        _processDef.connect(_activity, _end);

        return _processDef;
    },

    process_with_catchingEvent : function() {
        /*
          XXXX        +----------+       XXXXX        XXXX
         X se X+------> activity +----->X mce X+---->X ee X
          XXXX        +----------+       XXXXX        XXXX
         */

        var _processDef = EngineSingleton.getInstance().newProcessDefinition();
        _processDef.definitionId(this.guids.process_with_catchingEvent);
        _processDef.name(this.names.process_with_catchingEvent);
        var _start = _processDef.addEvent(EventRef.types.start.none, 'startEvent');

        var _messageDef = EngineSingleton.getInstance().getMessageDefinition('MessageDefinition1');
        if (!_messageDef) {
            _messageDef = EngineSingleton.getInstance().newMessageDefinition();
        }
        _messageDef.name('MessageDefinition1');
        _messageDef.addParameter('TaskID');
        _messageDef.addParameter('TaskName');

        var _messageCatchingEvent = _processDef.addEvent(EventRef.types.intermediate.catching.message, 'ReceiveMessageEvent');
        var _messageFlow = _processDef.addMessageFlow();
        _messageFlow.messageDefinition(_messageDef);
        _messageFlow.sourceProcessName(this.names.process_with_throwEvent);
        _messageFlow.sourceNodeName('MessageThrowEvent');
        _messageFlow.targetProcessName(_processDef.name());
        _messageFlow.targetNodeName(_messageCatchingEvent.name());

        var _correlationKey = _processDef.addCorrelationKey('Key1');
        var _correlationProperty = _correlationKey.addProperty('Property1');
        _correlationProperty.addExpression({messageName : _messageDef.name(), nodeName : 'activity', parameterName : 'ParameterForTaskID'});
        _correlationProperty.addExpression({messageName : _messageDef.name(), nodeName : 'activity', parameterName : 'ParameterForTaskName'});

        _messageFlow.correlationKey(_correlationKey);

        _messageCatchingEvent.incomingMessage(_messageFlow);


        var _activity = _processDef.addActivity('activity');
        _activity.addParameter('ParameterForTaskID').value(10);
        _activity.addParameter('ParameterForTaskName').value('Yahoo');


        var _end = _processDef.addEvent(EventRef.types.end.none, 'end');

        _processDef.connect(_start, _activity);
        _processDef.connect(_activity,_messageCatchingEvent);
        _processDef.connect(_messageCatchingEvent, _end);

        return _processDef;
    }
};

if (module) {
    module.exports = Definitions;
    module.exports.Messages = Messages
}