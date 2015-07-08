/**
 * Created by staloverov on 01.06.2015.
 */
var should  = require('chai').should();
var expect = require('chai').expect;

var Main = require("./main");
var Definition = require(PATH.definitions +'engine');
var EngineSingleton = require(PATH.engine + 'engineSingleton');

beforeEach(function() {
    Main.Config.initServer();
    EngineSingleton.getInstance().clearDefinitions();
});

describe('Engine', function(){
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
            EngineSingleton.getInstance().addProcessDefinition(_def);
            EngineSingleton.getInstance().startProcessInstanceAndWait(_def.definitionID(), 'request1', 3000, function(result) {
                result.result.should.equal('OK');
                expect(result.requestInfo).to.be.exist;
                expect(result.message).to.be.not.exist;
                expect(result.requestInfo.processID).to.be.exist;
                expect(result.requestInfo.tokenID).to.be.exist;
                result.requestInfo.requestName.should.equal('request1');
                result.requestInfo.nodeName.should.equal('userTask');

                done();
            });
        })
    });

    describe('#waitForRequest', function(){
        it('Request должен быть получен', function(done) {
           var _def = Definition.forTestWaitRequest();
           EngineSingleton.getInstance().addProcessDefinition(_def);
           var _result = EngineSingleton.getInstance().startProcessInstance(_def.definitionID());
           EngineSingleton.getInstance().waitForRequest(_result.processID, _result.tokenID, 'request1', 3000, function(result) {
               result.result.should.equal('OK');
               expect(result.requestInfo).to.be.exist;
               expect(result.message).to.be.not.exist;
               result.requestInfo.processID.should.equal(_result.processID);
               result.requestInfo.tokenID.should.equal(_result.tokenID);
               result.requestInfo.requestName.should.equal('request1');
               result.requestInfo.nodeName.should.equal('userTask');

               done();
           });
        });

        it('Ошибка оп таймауту', function(done) {
            var _def = Definition.forTestWaitRequest();
            EngineSingleton.getInstance().addProcessDefinition(_def);
            var _result = EngineSingleton.getInstance().startProcessInstance(_def.definitionID());
            EngineSingleton.getInstance().waitForRequest(_result.processID, _result.tokenID, 'ERROR', 3000, function(result) {
                result.result.should.equal('ERROR');
                expect(result.requestInfo).to.be.not.exist;
                expect(result.message).to.be.exist;
                done();
            });
        })
    });

    describe('#nodeStateWithTwoTokens', function(){
        it('Должен быть запущен процесс с распараллеливанием токена и прохождением по одному узлу 2 токенов', function(done){
            var _def = Definition.forTestNodeStateWithTwoTokens();
            EngineSingleton.getInstance().addProcessDefinition(_def);
            var _processID =  EngineSingleton.getInstance().startProcessInstance(_def.definitionID()).processID;
            var _process;

            var _interval = setInterval(function(){
                _process = EngineSingleton.getInstance().getProcessInstance(_processID);
                if (_process && _process.isFinished()) {
                    clearInterval(_interval);
                    var _value = _process.findParameter('count').value();
                    _value.should.equal(7);

                    EngineSingleton.getInstance().saveProcess(_processID);
                    EngineSingleton.getInstance().findProcess(_processID);

                    done()
                } else {
                    console.log('[%s] Еще работает', (new Date()).toLocaleTimeString())
                }

            }, 1000)

        })
    });

    describe('#inclusiveGateway_with_reqeusts_&_script', function(){
        it('Выставить реквесты и все остальное', function(done){
            var _def = Definition.forTestInclusiveGatewayProcess()
            EngineSingleton.getInstance().addProcessDefinition(_def);
            var _processID =  EngineSingleton.getInstance().startProcessInstance(_def.definitionID()).processID;
            var _process;

            var _interval = setInterval(function(){
                _process = EngineSingleton.getInstance().getProcessInstance(_processID);
                if (_process && _process.isFinished()) {
                    clearInterval(_interval);
                    //var _value = _process.findParameter('count').value;
                    //_value.should.equal(7);
                    done()
                } else {
                    console.log('[%s] Еще работает', (new Date()).toLocaleTimeString())
                }

            }, 1000)
            //done()

        })
    })
})