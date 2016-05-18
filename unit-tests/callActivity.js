/**
 * Created by staloverov on 01.09.2015.
 */
var should  = require('chai').should();
var expect = require('chai').expect;

var Main = require("./main");
var Definition = require(PATH.definitions +'callActivity');
var EngineSingleton = require(PATH.engine + 'engineSingleton');

before(function() {
    //Main.Config.initServer();
    //Main.Config.testClient.setTimeout(3)
});

beforeEach(function() {
    //Main.Config.testClient.clear();
});

xdescribe('CallActivity', function(){
   describe('#Execute', function(){
       it('Должен отработать процесс с запуском подпроцесса', function(done){
           EngineSingleton.getInstance().addProcessDefinition(Definition.SubProcess.simpleSubprocess());

           var _def = Definition.Process.callSimpleSubProcess();
           EngineSingleton.getInstance().addProcessDefinition(_def);
           var _processID = EngineSingleton.getInstance().startProcessInstance(_def.definitionId()).processID;
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

       })
   })
});