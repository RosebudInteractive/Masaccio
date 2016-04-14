/**
 * Created by staloverov on 30.03.2016.
 */
'use strict';
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['fs', './../engineSingleton'],
    function(fs, EngineSingleton) {

        return class FileAdapter{
            constructor(){
                //this.engine = EngineSingleton.getInstance();
            }

            serialize(process) {
                return new Promise(function(resolve, reject){
                    process.clearFinishedTokens();
                    var _obj = process.pvt.db.serialize(process);
                    if (_obj) {
                        var _fileName = UCCELLO_CONFIG.wfe.processStorage + process.processID() + '.txt';
                        fs.writeFile(_fileName, JSON.stringify(_obj), function(error) {
                                if (error) {
                                    reject(error)
                                } else {
                                    resolve()
                                }
                            }
                        );
                    } else {
                        reject(new Error('Can not serialize process'))
                    }
                });
            }

            deserialize(processID, createComponentFunction) {
                return new Promise(function(resolve, reject) {
                    if (!createComponentFunction) {
                        createComponentFunction = EngineSingleton.getInstance().createComponentFunction
                    }

                    var _fileName = UCCELLO_CONFIG.wfe.processStorage + processID + '.txt';
                    fs.readFile(_fileName, function(error, data) {
                        if (error) {
                            reject(error)
                        } else {
                            var _obj = JSON.parse(data);
                            var _process = EngineSingleton.getInstance().db.deserialize(_obj, {}, createComponentFunction);
                            console.log('[%s] : }} Процесс [%s] восстановлен', (new Date()).toLocaleTimeString(), processID);
                            fs.unlink(_fileName);

                            resolve(_process)
                        }
                    });
                });
            }
        }

    }
);

