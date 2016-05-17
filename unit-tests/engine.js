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
                };

                it('Найти параметры по Guid TaskDef - Ok', function(done) {
                    EngineSingleton.getInstance().getProcessDefParameters({resName : TaskDefinition.names.forSimpleTaskDef}, function(result){
                    // EngineSingleton.getInstance().getProcessDefParameters('32d7a96c-6264-cd94-e8a9-672c9cea84ee', function(result){
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
            });

            xdescribe('#getProcessVars', function(){
                var guids = {
                    existing: '7bb49fe5-746e-4741-83f6-0b4e53d27358',
                    nonexistent: '3fdd3c7e-196d-440c-982c-c33b7ca0ab4d'
                };

                it('Найти переменные - Ok', function(done) {
                    EngineSingleton.getInstance().getProcessVars(14, function(result){
                        if (result.result !== 'OK'){
                            done(new Error(result.message));
                        } else {
                            result.vars.should.be.exists;
                            done()
                        }
                    })
                });

                it('Искать по несуществующему Guid - Error', function(done){
                    EngineSingleton.getInstance().getProcessVars(guids.nonexistent, function(result){
                        if (result.result !== 'OK'){
                            done();
                        } else {
                            done(new Error('Должна вернуться ошибка'))
                        }
                    })
                })
            })
        });

        describe('#waitForRequest', function () {
            xit('Request должен быть получен', function (done) {
                EngineSingleton.getInstance().startProcessInstance(Definition.names.forTestWaitRequest, function(_result) {
                    var _requestInfo = {
                        processID: _result.processID,
                        tokenId: _result.tokenId,
                        requestName: 'request1'
                    };

                    EngineSingleton.getInstance().waitForRequest(_requestInfo, 3000, function (result) {
                        result.result.should.equal('OK');
                        expect(result.requestInfo).to.be.exist;
                        expect(result.message).to.be.not.exist;
                        result.requestInfo.processID.should.equal(_result.processID);
                        result.requestInfo.tokenId.should.equal(_result.tokenId);
                        result.requestInfo.requestName.should.equal('request1');
                        result.requestInfo.nodeName.should.equal('userTask');

                        EngineSingleton.getInstance().deleteProcess(_result.processID);

                        done();
                    });
                });
            });

            it('Запрос request-а у завершенного процесса', function (done) {
                var _options = {
                    requestName : 'request1',
                    timeout : 0
                };

                EngineSingleton.getInstance().startProcessInstanceAndWait(Definition.names.forTestWaitRequest, _options, function(result) {
                    if (result.result !== 'OK') {
                        done(result.message)
                    } else {
                        var responseObj = {
                            requestID: result.requestInfo.requestID
                        };
                        EngineSingleton.getInstance().processResponse(responseObj, 0, function (result) {
                            if (result.result !== 'OK') {
                                done(result.message)
                            } else {
                                EngineSingleton.getInstance().waitForRequest({processId : result.processId, requestName : 'request1'}, 0, function(result){
                                    result.result.should.equal('ERROR');
                                    EngineSingleton.getInstance().deleteProcess(result.processId);
                                    done()
                                })
                            }
                        })
                    }
                });
            });

            it('Оповещение о завершении процесса', function (done) {
                EngineSingleton.getInstance().startProcessInstance(Definition.names.forTestWaitRequest, {}, function(result) {
                    if (result.result !== 'OK') {
                        done(result.message)
                    } else {
                        EngineSingleton.getInstance().waitForRequest({processId : result.processId, requestName : 'Test'}, 0, function(result){
                            result.result.should.equal('ERROR');
                            result.message.should.equal('Process has been finished');
                            done()
                        });

                        EngineSingleton.getInstance().waitForRequest({processId : result.processId, requestName : 'request1'}, 0, function(result){
                            var responseObj = {
                                requestID: result.requestInfo.requestID
                            };
                            EngineSingleton.getInstance().processResponse(responseObj, 0, function (result) {
                                if (result.result !== 'OK') {
                                    done(result.message)
                                }
                            })
                        });
                    }
                });
            });
            
            xit('Получить request по ID - OK', function (done) {
                EngineSingleton.getInstance().waitForRequest({requestId : 15}, 0, function (result) {
                    result.result.should.equal('OK');
                    expect(result.requestInfo).to.be.exist;
                    expect(result.message).to.be.not.exist;
                    result.requestInfo.processID.should.equal(_result.processID);
                    result.requestInfo.tokenId.should.equal(_result.tokenId);
                    result.requestInfo.requestName.should.equal('request1');
                    result.requestInfo.nodeName.should.equal('userTask');

                    EngineSingleton.getInstance().deleteProcess(_result.processID);

                    done();
                });
            });

            xit('Ошибка оп таймауту', function (done) {
                EngineSingleton.getInstance().startProcessInstance(Definition.names.forTestWaitRequest, function(startResult) {
                    EngineSingleton.getInstance().waitForRequest(startResult.processID, startResult.tokenId, 'ERROR', 3000, function (result) {
                        result.result.should.equal('ERROR');
                        expect(result.requestInfo).to.be.not.exist;
                        expect(result.message).to.be.exist;

                        EngineSingleton.getInstance().deleteProcess(startResult.processID);
                        done();
                    });
                });
            })
        });

        xdescribe('#nodeStateWithTwoTokens', function () {
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
                    startResult.tokenId.should.equal(1);
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
                    expect(result.requestInfo.tokenId).to.be.exist;
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
