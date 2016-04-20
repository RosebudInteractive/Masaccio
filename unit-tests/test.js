/**
 * Created by staloverov on 27.07.2015.
 */
var Main = require("./main");
//var EngineSingleton = require(PATH.engine + 'engineSingleton');
var fs = require('fs');

function copyFile(source, target) {
    fs.writeFileSync(target, fs.readFileSync(source));
}

copyFile(
    UCCELLO_CONFIG.wfe.processStorage + 'testProcess.txt',
    UCCELLO_CONFIG.wfe.processStorage + 'testProcess1.txt'
);

//Main.Config.initServer();

/*
var _engine = EngineSingleton.getInstance();
_engine.uploadedProcesses.push({processID : 'testProcess1', isFinished : false});
var _process = _engine.findOrUploadProcess('testProcess1');
console.log('Здесь все ОК, ID = [%s]', _process.currentToken().tokenID());
var _ID = _process.processID();
_engine.saveAndUploadProcess(_ID);
_process = _engine.findOrUploadProcess(_ID);

console.log(_process.currentToken().tokenID());*/
