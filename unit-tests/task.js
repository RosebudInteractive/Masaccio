/**
 * Created by staloverov on 03.05.2016.
 */
var should  = require('chai').should();
var expect = require('chai').expect;

var Initiator = require("./initiator");
// var Definition = require(PATH.definitions +'engine');
var EngineSingleton = require(PATH.engine + 'engineSingleton');
var TaskDefinition = require(PATH.definitions +'taskDef');
var fs = require('fs');


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

describe('Task', function(){
    var guids = {
        existingDef: 'cbf35df0-8317-4f2f-8728-88736251ff0b',
        nonexistentDef: '3fdd3c7e-196d-440c-982c-c33b7ca0ab4d',

        Type : '08b97860-179a-4292-a48d-bfb9535115d3'
    };
    
    beforeEach(function() {
        EngineSingleton.getInstance().processes.clearDefinitions();
    });

    describe('#startProcessInstanceAndWait', function(){
        var _inputTaskParams = fs.readFileSync(PATH.testDataPath + 'inputTaskParams.json');
        _inputTaskParams = JSON.parse(_inputTaskParams);
        
        it('Запуск процесса', function(done){
            var _options = {
                taskParams : _inputTaskParams,
                // requestName : 'TaskRequest',
                // timeout : 0
                
            };

            EngineSingleton.getInstance().startProcessInstance(TaskDefinition.names.forSimpleTaskDef, _options, function(result) {
                var _process;

                var _interval = setInterval(function () {
                    _process = EngineSingleton.getInstance().getProcessInstance(result.processID);
                    if (_process && _process.isFinished()) {
                        clearInterval(_interval);
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
            });
        })
    })
});