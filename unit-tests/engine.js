/**
 * Created by staloverov on 01.06.2015.
 */
var should  = require('chai').should();
var expect = require('chai').expect;

var Main = require("./main");
var Definition = require(PATH.definitions +'engine');
var EngineSingleton = require(PATH.engine + 'engineSingleton');

before(function() {
    Main.Config.initServer();
    Main.Config.testClient.setTimeout(3)
});

beforeEach(function() {
    Main.Config.testClient.clear();
});

describe('Engine', function(){

    describe('#common', function() {
        beforeEach(function() {
            EngineSingleton.getInstance().clearProcessDefinitions();
        });

        describe('#waitForRequest', function () {
            it('Request должен быть получен', function (done) {
                var _def = Definition.forTestWaitRequest();
                EngineSingleton.getInstance().addProcessDefinition(_def);
                var _result = EngineSingleton.getInstance().startProcessInstance(_def.definitionID());
                EngineSingleton.getInstance().waitForRequest(_result.processID, _result.tokenID, 'request1', 3000, function (result) {
                    result.result.should.equal('OK');
                    expect(result.requestInfo).to.be.exist;
                    expect(result.message).to.be.not.exist;
                    result.requestInfo.processID.should.equal(_result.processID);
                    result.requestInfo.tokenID.should.equal(_result.tokenID);
                    result.requestInfo.requestName.should.equal('request1');
                    result.requestInfo.nodeName.should.equal('userTask');

                    EngineSingleton.getInstance().deleteProcess(_result.processID);

                    done();
                });
            });

            it('Ошибка оп таймауту', function (done) {
                var _def = Definition.forTestWaitRequest();
                EngineSingleton.getInstance().addProcessDefinition(_def);
                var _result = EngineSingleton.getInstance().startProcessInstance(_def.definitionID());
                EngineSingleton.getInstance().waitForRequest(_result.processID, _result.tokenID, 'ERROR', 3000, function (result) {
                    result.result.should.equal('ERROR');
                    expect(result.requestInfo).to.be.not.exist;
                    expect(result.message).to.be.exist;

                    EngineSingleton.getInstance().deleteProcess(_result.processID);
                    done();
                });
            })
        });

        describe('#nodeStateWithTwoTokens', function () {
            it('Должен быть запущен процесс с распараллеливанием токена и прохождением по одному узлу 2 токенов', function (done) {
                var _def = Definition.forTestNodeStateWithTwoTokens();
                EngineSingleton.getInstance().addProcessDefinition(_def);
                var _processID = EngineSingleton.getInstance().startProcessInstance(_def.definitionID()).processID;
                var _process;

                var _interval = setInterval(function () {
                    _process = EngineSingleton.getInstance().getProcessInstance(_processID);
                    if (_process && _process.isFinished()) {
                        clearInterval(_interval);
                        var _value = _process.findParameter('count').value();
                        _value.should.equal(7);

                        EngineSingleton.getInstance().saveProcess(_processID);
                        EngineSingleton.getInstance().findOrUploadProcess(_processID);

                        EngineSingleton.getInstance().deleteProcess(_processID);

                        done()
                    } else {
                        console.log('[%s] Еще работает', (new Date()).toLocaleTimeString())
                    }

                }, 1000)

            })
        });

        describe('#inclusiveGateway_with_reqeusts_&_script', function () {
            it('Выставить реквесты и все остальное', function (done) {
                var _def = Definition.forTestInclusiveGatewayProcess()
                EngineSingleton.getInstance().addProcessDefinition(_def);
                var _processID = EngineSingleton.getInstance().startProcessInstance(_def.definitionID()).processID;
                var _process;

                var _interval = setInterval(function () {
                    _process = EngineSingleton.getInstance().getProcessInstance(_processID);
                    if (EngineSingleton.getInstance().processFinished(_processID)) {
                        clearInterval(_interval);
                        //var _value = _process.findParameter('count').value;
                        //_value.should.equal(7);
                        EngineSingleton.getInstance().deleteProcess(_processID);

                        done()
                    } else {
                        console.log('[%s] Еще работает', (new Date()).toLocaleTimeString())
                    }

                }, 1000)
                //done()

            })
        })
    });

    describe('#process', function(){
        beforeEach(function() {
            EngineSingleton.getInstance().clearProcessDefinitions();
        });

        describe('#startProcessInstance', function() {
            it('Должен вернутся объект-результат', function(done) {
                var _def = Definition.simpleProcessWithOneActivity();
                EngineSingleton.getInstance().addProcessDefinition(_def);

                var result =  EngineSingleton.getInstance().startProcessInstance(_def.definitionID());
                result.should.exist;
                result.result.should.equal('OK');
                result.processID.should.exist;
                result.tokenID.should.equal(1);
                expect(result.message).to.be.undefined;

                EngineSingleton.getInstance().deleteProcess(result.processID);

                done();
            });

            it('Должна вернуться ошибка', function(done) {
                var _def = Definition.simpleProcessWithOneActivity();
                EngineSingleton.getInstance().addProcessDefinition(_def);
                var result =  EngineSingleton.getInstance().startProcessInstance('ERROR');
                result.should.exist;
                result.result.should.equal('ERROR');
                result.message.should.exist;

                done()
            })
        });

        describe('#startProcessInstanceAndWait', function() {
            it('Должен быть запущен процесс и вернуться request', function(done) {
                var _def = Definition.forTestWaitRequest();
                var _processID;
                EngineSingleton.getInstance().addProcessDefinition(_def);
                EngineSingleton.getInstance().startProcessInstanceAndWait(_def.definitionID(), 'request1', 3000, function(result) {
                    result.result.should.equal('OK');
                    expect(result.requestInfo).to.be.exist;
                    expect(result.message).to.be.not.exist;
                    _processID = result.requestInfo.processID;
                    expect(result.requestInfo.processID).to.be.exist;
                    expect(result.requestInfo.tokenID).to.be.exist;
                    result.requestInfo.requestName.should.equal('request1');
                    result.requestInfo.nodeName.should.equal('userTask');

                    //done();
                });

                var _interval = setInterval(function(){
                    if (!_processID) {
                        console.log('[%s] Не получен ProcessID', (new Date()).toLocaleTimeString())
                    } else {
                        var _process = EngineSingleton.getInstance().getProcessInstance(_processID);
                        if (_process && _process.isFinished()) {
                            clearInterval(_interval);
                            var _value = _process.findParameter('count').value();
                            _value.should.equal(2);

                            EngineSingleton.getInstance().deleteProcess(_processID);

                            done()
                        } else {
                            console.log('[%s] Еще работает', (new Date()).toLocaleTimeString())
                        }
                    }
                }, 1000)
            })
        });
    });

    describe('#message', function() {
        beforeEach(function() {
            EngineSingleton.getInstance().clearMessageDefinitions();
        });

        describe('#newMessageDefinition', function() {
            it('Должно появится определение сообщения', function() {
                var _definition = EngineSingleton.getInstance().newMessageDefinition();

                _definition.should.be.exists;
                _definition.definitionID().should.be.exists;
                EngineSingleton.getInstance().messageDefinitions.should.have.length(0);
            });

            it('Добавить 1 определение - OK', function(done) {
                var _definition = EngineSingleton.getInstance().newMessageDefinition();
                EngineSingleton.getInstance().addMessageDefinition(_definition, function(answer) {
                    answer.result.should.equal('OK');
                    done();
                });
            });

            it('Добавить 2 одинаковых определения - ERROR', function(done) {
                var _definition1 = EngineSingleton.getInstance().newMessageDefinition();
                var _definition2 = EngineSingleton.getInstance().newMessageDefinition();
                _definition2.definitionID(_definition1.definitionID());
                EngineSingleton.getInstance().addMessageDefinition(_definition1);
                EngineSingleton.getInstance().addMessageDefinition(_definition2, function(answer) {
                    answer.result.should.equal('ERROR');
                    done();
                });
            })
        })
    })
});