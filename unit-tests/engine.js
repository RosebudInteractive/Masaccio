/**
 * Created by staloverov on 01.06.2015.
 */
var should  = require('chai').should();

var Main = require("./main");
var Definition = require(PATH.definitions +'engine');
var EngineSingleton = require(PATH.engine + 'engineSingleton');

describe('Engine', function(){
    describe('#nodeStateWithTwoTokens', function(){
        it('Должен быть запущен процесс с распараллеливанием токена и прохождением по одному узлу 2 токенов', function(done){
            var _def = Definition.forTestNodeStateWithTwoTokens();
            EngineSingleton.getInstance().addProcessDefinition(_def);
            var _processID =  EngineSingleton.getInstance().startProcessInstance(_def.definitionID());
            var _process;

            var _interval = setInterval(function(){
                _process = EngineSingleton.getInstance().getProcessInstance(_processID);
                if (_process && _process.isFinished()) {
                    clearInterval(_interval);
                    var _value = _process.findParameter('count').value();
                    _value.should.equal(7); //7

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
            var _processID =  EngineSingleton.getInstance().startProcessInstance(_def.definitionID());
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