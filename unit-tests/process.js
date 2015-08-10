/**
 * Created by staloverov on 28.05.2015.
 */

var should  = require('chai').should();

var Main = require("./main");
var Definition = require(PATH.definitions +'process');
var Process = require(PATH.engine + 'process');

var Activity = require(PATH.engine + 'Activities/activity');
var InclusiveGateway = require(PATH.engine + 'Gateways/inclusiveGateway');
var UserTask = require(PATH.engine + 'Activities/userTask');
var ScriptTask = require(PATH.engine + 'Activities/scriptTask');

var EngineSingleton = require(PATH.engine + 'engineSingleton');


describe('Process', function(){
    describe('#createProcess', function(){
        it('should create new process with properties', function(){
            var _def = Definition.forCreateNewProcessTest();
            var _process = new Process(Main.Config.getControlManager(), {}, _def);

            should.exist(_process.processID());
            _process.tokens().count().should.equal(0);
            _process.tokenQueue().count().should.equal(0);
            //should.exist(_process.definition);
            _process.parameters().count().should.equal(3);
            _process.parameters().get(0).value().should.equal(3);
            should.not.exist(_process.parameters().get(1).value());
            _process.parameters().get(2).value().should.equal('hello!');
            _process.state().should.equal(Process.state.Initialized);
        })
    });

    describe('#copyDefinition', function(){
        it('Новый процесс должен иметь копию структуры processDefinition', function(){
            var _def = Definition.forCopyDefinitionStruct();
            var _process = new Process(Main.Config.getControlManager(), {}, _def);

            should.exist(_process.processID());
            _process.tokens().count().should.equal(0);
            _process.tokenQueue().count().should.equal(0);

            _process.nodes().count().should.equal(4);

            _process.nodes().get(0).name().should.equal('start');
            _process.nodes().get(0).should.be.an.instanceOf(Activity);

            _process.nodes().get(1).name().should.equal('inclusiveGateway');
            _process.nodes().get(1).should.be.an.instanceOf(InclusiveGateway);

            _process.nodes().get(2).name().should.equal('userTask');
            _process.nodes().get(2).should.be.an.instanceOf(UserTask);
            _process.nodes().get(2).requests().count().should.equal(1);
            _process.nodes().get(2).requests().get(0).name().should.equal('request1');
            _process.nodes().get(2).requests().get(0).parameters().count().should.equal(1);
            _process.nodes().get(2).requests().get(0).parameters().get(0).name().should.equal('request_param1');

            var _scriptTask = _process.nodes().get(3);
            _scriptTask.name().should.equal('scriptTask');
            _scriptTask.should.be.an.instanceOf(ScriptTask);
            _scriptTask.script().moduleName().should.equal('Test/Process/CopyDefinitionStruct/script1');
            _scriptTask.script().methodName().should.equal('execScript');
            _scriptTask.script().parameters().count().should.equal(0);

            _process.connectors().count().should.equal(4);

            _process.connectors().get(0).source().name().should.equal('start');
            _process.connectors().get(0).target().name().should.equal('inclusiveGateway');

            var _sqToUserTask1 = _process.connectors().get(1);
            _sqToUserTask1.source().name().should.equal('inclusiveGateway');
            _sqToUserTask1.target().name().should.equal('userTask');
            _sqToUserTask1.hasCondition().should.be.true;
            _sqToUserTask1.script().parameters().count().should.equal(2);
            _sqToUserTask1.script().parameters().get(0).name().should.equal('minValue');
            _sqToUserTask1.script().parameters().get(0).value().should.equal(0);
            _sqToUserTask1.script().parameters().get(1).name().should.equal('maxValue');
            _sqToUserTask1.script().parameters().get(1).value().should.equal(5);

            var _sqToUserTask2 = _process.connectors().get(2);
            _sqToUserTask2.source().name().should.equal('inclusiveGateway');
            _sqToUserTask2.target().name().should.equal('userTask');
            _sqToUserTask2.hasCondition().should.be.true;

            var _sqToScriptTask = _process.connectors().get(3);
            _sqToScriptTask.source().name().should.equal('inclusiveGateway');
            _sqToScriptTask.target().name().should.equal('scriptTask');
            _sqToScriptTask.hasCondition().should.be.true;
            _sqToScriptTask.script().parameters().count().should.equal(2);
            _sqToScriptTask.script().parameters().get(0).name().should.equal('minValue');
            _sqToScriptTask.script().parameters().get(0).value().should.equal(0);
            _sqToScriptTask.script().parameters().get(1).name().should.equal('maxValue');
            _sqToScriptTask.script().parameters().get(1).value().should.equal(5);
        })
    });

    describe('#loopProcess', function() {
        it('Запустить процесс и отработать петлю', function (done) {
            var _def = Definition.testDefinitionWithLoop();
            EngineSingleton.getInstance().addProcessDefinition(_def);
            var _processID = EngineSingleton.getInstance().startProcessInstance(_def.definitionID()).processID;
            var _process;

            var _interval = setInterval(function () {
                _process = EngineSingleton.getInstance().getProcessInstance(_processID);
                if (EngineSingleton.getInstance().processFinished(_processID)) {
                    clearInterval(_interval);
                    var _value = _process.findParameter('param1').value();
                    _value.should.equal(3);
                    EngineSingleton.getInstance().deleteProcess(_processID);

                    done()
                } else {
                    console.log('[%s] Еще работает', (new Date()).toLocaleTimeString())
                }

            }, 1000)
        })}
    )
});

