/**
 * Created by staloverov on 01.06.2015.
 */
var should  = require('chai').should();
var expect = require('chai').expect;

var Initiator = require("./initiator");
var Definition = require(PATH.definitions +'engine');
var EngineSingleton = require(PATH.engine + 'engineSingleton');
var TaskDefinition = require(PATH.definitions +'taskDef');


before(function(done) {
    Initiator.importData().
    then(function(){done()}).
    catch(function(err){
        done(err)
    });
});

beforeEach(function() {
    Initiator.clearTestClient();
});

describe('Engine', function(){

    describe('#common', function() {
        beforeEach(function() {
            EngineSingleton.getInstance().processes.clearDefinitions();
        });

        describe('Интерфейсные функции', function(){
            describe('#getProcessDefParameters', function(){
                var guids = {
                    existingDef: 'cbf35df0-8317-4f2f-8728-88736251ff0b',
                    nonexistentDef: '3fdd3c7e-196d-440c-982c-c33b7ca0ab4d',

                    Type : '08b97860-179a-4292-a48d-bfb9535115d3'
                };

                it('Найти параметры по Guid TaskDef - Ok', function(done) {
                    //EngineSingleton.getInstance().getProcessDefParameters({resType : guids.Type, resName : TaskDefinition.names.forSimpleTaskDef}, function(result){
                    EngineSingleton.getInstance().getProcessDefParameters('32d7a96c-6264-cd94-e8a9-672c9cea84ee', function(result){
                        if (result.result !== 'OK'){
                            done(new Error(result.message));
                        } else {
                            result.params.should.be.exists;
                            done()
                        }
                    })
                });

                it('Искать по несуществующему Guid - Error', function(done){
                    EngineSingleton.getInstance().getProcessDefParameters(guids.nonexistentDef, function(result){
                        if (result.result !== 'OK'){
                            done();
                        } else {
                            done(new Error('Должна вернуться ошибка'))
                        }
                    })
                })
            })
        });

        xdescribe('#waitForRequest', function () {
            it('Request должен быть получен', function (done) {
                EngineSingleton.getInstance().startProcessInstance(Definition.names.forTestWaitRequest, function(_result) {
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
            });

            it('Ошибка оп таймауту', function (done) {
                EngineSingleton.getInstance().startProcessInstance(Definition.names.forTestWaitRequest, function(startResult) {
                    EngineSingleton.getInstance().waitForRequest(startResult.processID, startResult.tokenID, 'ERROR', 3000, function (result) {
                        result.result.should.equal('ERROR');
                        expect(result.requestInfo).to.be.not.exist;
                        expect(result.message).to.be.exist;

                        EngineSingleton.getInstance().deleteProcess(startResult.processID);
                        done();
                    });
                });
            })
        });

        describe('#nodeStateWithTwoTokens', function () {
            it('Должен быть запущен процесс с распараллеливанием токена и прохождением по одному узлу 2 токенов', function (done) {
                EngineSingleton.getInstance().startProcessInstance(Definition.names.forTestNodeStateWithTwoTokens, function(result) {
                        var _process;

                        var _interval = setInterval(function () {
                            _process = EngineSingleton.getInstance().getProcessInstance(result.processID);
                            if (_process && _process.isFinished()) {
                                clearInterval(_interval);
                                var _value = _process.findParameter('count').value();
                                _value.should.equal(7);

                                EngineSingleton.getInstance().saveAndUploadProcess(result.processID).then(
                                    function(){
                                        EngineSingleton.getInstance().findOrUploadProcess(result.processID).then(
                                            function(process){
                                                EngineSingleton.getInstance().deleteProcess(process.processID);
                                                done()
                                            },
                                            function(error){
                                                //throw error
                                                done(error)
                                            }
                                        );
                                    },
                                    function(error){done(error)}
                                );

                            } else {
                                console.log('[%s] Еще работает', (new Date()).toLocaleTimeString())
                            }

                        }, 1000)
                    }
                );
            })
        });

        xdescribe('#inclusiveGateway_with_reqeusts_&_script', function () {
            it('Выставить реквесты и все остальное', function (done) {
                var testBody = function(startResult) {
                    var _processID = startResult.processID;
                    var _process;

                    var _interval = setInterval(function () {
                        _process = EngineSingleton.getInstance().getProcessInstance(_processID);
                        if (EngineSingleton.getInstance().isProcessFinished(_processID)) {
                            clearInterval(_interval);
                            EngineSingleton.getInstance().deleteProcess(_processID);

                            done()
                        } else {
                            console.log('[%s] Еще работает', (new Date()).toLocaleTimeString())
                        }

                    }, 1000)
                };

                EngineSingleton.getInstance().startProcessInstance(Definition.names.forTestInclusiveGatewayProcess, testBody);
            })
        })
    });

    xdescribe('#process', function(){
        beforeEach(function() {
            EngineSingleton.getInstance().processes.clearDefinitions();
        });

        describe('#startProcessInstance', function() {
            it('Должен вернутся объект-результат', function(done) {
                var testBody = function(startResult) {
                    startResult.should.exist;
                    startResult.result.should.equal('OK');
                    startResult.processID.should.exist;
                    startResult.tokenID.should.equal(1);
                    startResult.message.should.exist;

                    EngineSingleton.getInstance().deleteProcess(startResult.processID);

                    done();
                };

                var _def = Definition.simpleProcessWithOneActivity();
                EngineSingleton.getInstance().addProcessDefinition(_def);
                EngineSingleton.getInstance().startProcessInstance(_def.definitionID(), testBody);
            });

            it('Должна вернуться ошибка', function(done) {
                var testBody = function(startResult) {
                    startResult.should.exist;
                    startResult.result.should.equal('ERROR');
                    startResult.message.should.exist;

                    done()
                };

                var _def = Definition.simpleProcessWithOneActivity();
                EngineSingleton.getInstance().addProcessDefinition(_def);
                EngineSingleton.getInstance().startProcessInstance('ERROR', testBody);
            })
        });

        describe('#startProcessInstanceAndWait', function() {
            it('Должен быть запущен процесс и вернуться request', function(done) {
                var _def = Definition.forTestWaitRequest();
                var _processID;
                EngineSingleton.getInstance().addProcessDefinition(_def);
                EngineSingleton.getInstance().startProcessInstanceAndWait(_def.name(), 'request1', 3000, function(result) {
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

    xdescribe('#message', function() {
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
                _definition.name('Test');
                EngineSingleton.getInstance().addMessageDefinition(_definition, function(answer) {
                    answer.result.should.equal('OK');
                    done();
                });
            });

            it('Добавить 2 одинаковых определения - ERROR', function(done) {
                var _definition1 = EngineSingleton.getInstance().newMessageDefinition();
                _definition1.name('Test1');
                var _definition2 = EngineSingleton.getInstance().newMessageDefinition();
                _definition2.name('Test2');
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
