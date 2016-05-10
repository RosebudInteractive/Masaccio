/**
 * Created by staloverov on 17.09.2015.
 */
var should  = require('chai').should();

var Main = require("./main");
var Definition = require(PATH.definitions +'messages');

var EngineSingleton = require(PATH.engine + 'engineSingleton');
var ProcessInfo = require('./processInfo');

beforeEach(function() {
    // Definition.Messages.register();
});

beforeEach(function() {
    //Main.Config.testClient.clear();
});

xdescribe('Message', function(){
    describe('Должено появиться описание сообщения и само сообщение ', function() {

            xit('message1', function (done) {
                var _def1 = Definition.process_with_throwEvent();
                EngineSingleton.getInstance().addProcessDefinition(_def1);

                var _def2 = Definition.process_with_start_and_catch_event();
                EngineSingleton.getInstance().addProcessDefinition(_def2);

                var _processID = EngineSingleton.getInstance().startProcessInstance(_def1.definitionID()).processID;
                var _process;

                var _interval = setInterval(function () {
                    _process = EngineSingleton.getInstance().findProcessByPredicate(
                        function (element) {
                            return element.name() == _def2.name();
                        }
                    );
                    if ((_process) && (EngineSingleton.getInstance().isProcessFinished(_process.processID()))) {
                        clearInterval(_interval);
                        EngineSingleton.getInstance().deleteProcess(_process.processID());
                        EngineSingleton.getInstance().deleteProcess(_processID);

                        done()
                    } else {
                        console.log('[%s] Еще работает', (new Date()).toLocaleTimeString())
                    }

                }, 1000)


            });

            xit('message2', function (done) {
                var _count = 0;
                Main.Config.testClient.setResponseCustomizer(function (response) {
                    _count++;
                    response.param1 = _count * 10;
                });

                var _def1 = Definition.process_with_throwEvent();
                EngineSingleton.getInstance().addProcessDefinition(_def1);

                var _def2 = Definition.process_with_catchingEvent_and_userTask();
                EngineSingleton.getInstance().addProcessDefinition(_def2);

                var _processID1 = EngineSingleton.getInstance().startProcessInstance(_def1.definitionID()).processID;
                var _processID2 = EngineSingleton.getInstance().startProcessInstance(_def2.definitionID()).processID;
                var _process;

                var _interval = setInterval(function () {
                    _process = EngineSingleton.getInstance().getProcessInstance(_processID2);

                    if ((_process) && (EngineSingleton.getInstance().isProcessFinished(_process.processID()))) {
                        clearInterval(_interval);
                        EngineSingleton.getInstance().deleteProcess(_processID2);
                        EngineSingleton.getInstance().deleteProcess(_processID1);

                        done()
                    } else {
                        console.log('[%s] Еще работает', (new Date()).toLocaleTimeString())
                    }

                }, 1000)

            })
        });

    describe('Throw-catching events', function() {
        it('Отправлено 2 сообщения, два процесса получили их по очереди', function(done) {
            var _throwProcessDef = Definition.process_with_throwEvent();
            EngineSingleton.getInstance().addProcessDefinition(_throwProcessDef);

            var _catchProcessDef = Definition.process_with_catchingEvent();
            EngineSingleton.getInstance().addProcessDefinition(_catchProcessDef);

            var _catch1 = new ProcessInfo(EngineSingleton.getInstance().startProcessInstance(_catchProcessDef.definitionID()).processID);
            var _catch2 = new ProcessInfo(EngineSingleton.getInstance().startProcessInstance(_catchProcessDef.definitionID()).processID);

            var _throw = new ProcessInfo(EngineSingleton.getInstance().startProcessInstance(_throwProcessDef.definitionID()).processID);

            var _interval = setInterval(function () {
                _catch1.instance = EngineSingleton.getInstance().getProcessInstance(_catch1.processID);
                _catch2.instance = EngineSingleton.getInstance().getProcessInstance(_catch2.processID);

                if ((_catch1.isProcessFinished()) && (_catch2.isProcessFinished())) {
                    clearInterval(_interval);
                    EngineSingleton.getInstance().deleteProcess(_catch1.processID);
                    EngineSingleton.getInstance().deleteProcess(_catch2.processID);
                    EngineSingleton.getInstance().deleteProcess(_throw.processID);


                    done()
                } else {
                    console.log('[%s] Еще работает', (new Date()).toLocaleTimeString())
                }

            }, 1000)
        });

        it('Вызвать 2 новых процесса и передать каждому свое сообщение', function(done) {
            var _throwProcessDef = Definition.process_with_startMessage_and_throwEvent();
            EngineSingleton.getInstance().addProcessDefinition(_throwProcessDef);

            var _catchProcessDef = Definition.process_with_start_and_catch_event();
            EngineSingleton.getInstance().addProcessDefinition(_catchProcessDef);

            var _throw = new ProcessInfo(EngineSingleton.getInstance().startProcessInstance(_throwProcessDef.definitionID()).processID);

            var _interval = setInterval(function () {
                var _process1 = EngineSingleton.getInstance().findProcessByPredicate(
                    function (element) {
                        return element.name() == _catchProcessDef.name();
                    }
                );
                if (!_process1) {
                    console.log('[%s] Процес 1 не найден', (new Date()).toLocaleTimeString());
                } else {
                    var _catch1 = new ProcessInfo(_process1.processID());
                    _catch1.instance = _process1;

                    var _process2 = EngineSingleton.getInstance().findProcessByPredicate(
                        function (element) {
                            return (element.name() == _catchProcessDef.name()) && (element.processID() != _process1.processID());
                        }
                    );

                    if (!_process2) {
                        console.log('[%s] Процес 2 не найден', (new Date()).toLocaleTimeString());
                    } else {
                        var _catch2 = new ProcessInfo(_process2.processID());
                        _catch2.instance = _process2;


                        if ((_catch1.isProcessFinished()) && (_catch2.isProcessFinished())) {
                            clearInterval(_interval);
                            EngineSingleton.getInstance().deleteProcess(_catch1.processID);
                            EngineSingleton.getInstance().deleteProcess(_catch2.processID);
                            EngineSingleton.getInstance().deleteProcess(_throw.processID);


                            done()
                        } else {
                            console.log('[%s] Еще работает', (new Date()).toLocaleTimeString())
                        }
                    }
                }

            }, 1000)
        })

    })
});