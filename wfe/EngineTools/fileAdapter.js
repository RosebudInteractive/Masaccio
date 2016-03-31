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
                this.engine = EngineSingleton.getInstance();
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
                if (!createComponentFunction) {
                    createComponentFunction = this.engine.createComponentFunction
                }

                var _obj = fs.readFileSync(UCCELLO_CONFIG.wfe.processStorage + processID + '.txt');
                _obj = JSON.parse(_obj);

                var _process = this.db.deserialize(_obj, {}, createComponentFunction);
                console.log('[%s] : }} Процесс [%s] восстановлен', (new Date()).toLocaleTimeString(), processID);
                fs.unlink(UCCELLO_CONFIG.wfe.processStorage + processID + '.txt');

                return _process
            }
        }

    }
);

