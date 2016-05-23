/**
 * Created by staloverov on 03.05.2016.
 */
var should  = require('chai').should();
var expect = require('chai').expect;

var Initiator = require("./initiator");
var EngineSingleton = require(PATH.engine + 'engineSingleton');
var TaskDefinition = require(PATH.definitions +'taskDef');
var fs = require('fs');


function deserialize(obj){
    return EngineSingleton.getInstance().db.deserialize(obj, {}, EngineSingleton.getInstance().createComponentFunction);
}

function serialize(uObj){
    return EngineSingleton.getInstance().db.serialize(uObj, true)
}

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

        it('#startProcessInstanceAndWait', function(done){
            var _options = {
                taskParams : _inputTaskParams,
                requestName : 'TaskRequest',
                timeout : 0

            };

            EngineSingleton.getInstance().startProcessInstanceAndWait(TaskDefinition.names.forSimpleTaskDef, _options, function(result) {
                var _process;

                if (result.result === "OK") {
                    _process = result.requestInfo.processGuid;
                    var _serializedParams = result.requestInfo.taskParams;
                    var _params = deserialize(_serializedParams);

                    _params.selectedNode('task2.1');

                    var responseObj = {
                        requestId: result.requestInfo.requestId,
                        taskParams: serialize(_params)
                    };
                    console.log(">>> Next node [%s]", [_params.selectedNode()]);

                    EngineSingleton.getInstance().processResponse(responseObj, 0, function () {
                        EngineSingleton.getInstance().waitForRequest({processId : _process, requestName : 'TaskRequest'}, 0, function(result){
                            if (result.result === "OK") {
                                _process = result.requestInfo.processGuid;
                                var _serializedParams = result.requestInfo.taskParams;
                                var _params = deserialize(_serializedParams);

                                _params.selectedNode('task3');

                                var responseObj = {
                                    requestId: result.requestInfo.requestId,
                                    taskParams: serialize(_params)
                                };
                                console.log(">>> Next node [%s]", [_params.selectedNode()]);

                                EngineSingleton.getInstance().processResponse(responseObj, 0, function () {
                                    EngineSingleton.getInstance().waitForRequest({processId : _process, requestName : 'TaskRequest'}, 0, function(result){
                                        if (result.result === "OK") {
                                            var _serializedParams = result.requestInfo.taskParams;
                                            var _params = deserialize(_serializedParams);

                                            _params.selectedNode(_params.availableNodes().get(0).value());

                                            var responseObj = {
                                                requestId: result.requestInfo.requestId,
                                                taskParams: serialize(_params)
                                            };
                                            console.log(">>> Next node [%s]", [_params.selectedNode()]);

                                            EngineSingleton.getInstance().processResponse(responseObj, 0, function () {
                                                done()
                                            })
                                        } else {
                                            done(new Error(result.message))
                                        }
                                    })
                                })
                            } else {
                                done(new Error(result.message))
                            }
                        });
                    });
                }
            });
        });

        xit('Запуск процесса', function(done){
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
        });
    })
});