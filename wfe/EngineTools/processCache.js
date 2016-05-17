/**
 * Created by staloverov on 28.04.2016.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

var _adapterType = {db : 1, file : 2};

define([
        './fileAdapter',
        './dbAdapter',
        './../process'
    ],
    function(FileAdapter, DbAdapter, Process) {
        return class ProcessCache {
            static get AdapterType(){
                return _adapterType
            }

            constructor(options){
                checkOptions(options);

                this.resman = options.resman;
                this.db = options.db;
                this.notifier = options.notifier;
                this.definitions = [];
                this.instances = [];
                this.adapter = getAdapter(options.adapterType)
            }

            clearDefinitions() {
                this.definitions.length = 0;
            }

            createNewProcess(definitionName, options) {
                var that = this;
                return new Promise(promiseBody);

                function promiseBody(resolve, reject) {

                    that.resman.loadRes([{
                        resName: definitionName,
                        resType: '08b97860-179a-4292-a48d-bfb9535115d3'
                    }], function (result) {
                        if ((result.result) && (result.result == 'ERROR')) {
                            reject(new Error(result.message))
                        } else {
                            var _defResource = result.datas[0].resource;

                            var _options = {
                                definitionResourceID : result.datas[0].resVerId
                            };
                            if (options) {
                                _options.params = options.params
                            }
                            var _process = new Process(that.db, _options, _defResource);
                            that._register(_process);
                            resolve(_process);
                        }
                    })

                }
            }

            finish(processInstance){
                processInstance.finish();
                this.notifier.notifyFinishProcess(processInstance.processID());
            }
            
            _register(process) {
                var _instance = this.instances.find(function(instance){
                    return instance.processID() === process.processID()
                });
                
                if (!_instance) {
                   this.instances.push(process); 
                }
            }

            getDefinitionParameters(definitionIdentifier){
                var that = this;
                return new Promise(function(resolve, reject){
                    that.resman.loadRes([definitionIdentifier], function(result){
                        if ((result.result) && (result.result == 'ERROR')) {
                            reject(new Error(result.message))
                        } else {
                            var _verId = result.datas[0].resVerId;
                            execSql('select Params from ProcessDef where ParentId = ' + _verId).
                            then(function(object){
                                if ((!object.detail) || (object.detail.length == 0) || (!object.detail[0].Params)) {
                                    reject(new Error('Can not find task parameters'))
                                } else {
                                    var _params = object.detail[0].Params;
                                    resolve(JSON.parse(_params));
                                }
                            }).
                            catch(function(err){
                                reject(err)
                            })
                        }
                    })
                });
            }

            getVars(processID){
                var that = this;
                return new Promise(function(resolve, reject){
                    var _process = that.instances.find(function(instance){
                        return instance.processID() == processID
                    });

                    if (_process) {
                        resolve(that.db.serialize(_process.processVar(), true))
                    } else {
                        execSql('select Vars from Process where Id = ' + processID).
                        then(function(object){
                            if ((!object.detail) || (object.detail.length == 0) || (!object.detail[0].Vars)) {
                                reject(new Error('Can not find task vars'))
                            } else {
                                var _vars = object.detail[0].Vars;
                                resolve(JSON.parse(_vars));
                            }
                        }).
                        catch(function(err){
                            reject(err)
                        })
                    }
                });
            }
            
            findOrUpload(processId){
                var that = this;

                return new Promise(function(resolve, reject){
                    var _process = that._findProcessInstance(processId);
                    if (_process) {
                        resolve(_process)
                    } else {
                        that.adapter.deserialize(processId).
                        then(function(process) {
                                that.instances.push(process);
                                resolve(process)
                            }
                        ).
                        catch(function(err) {
                            reject(err)
                        })
                    }
                });
            }

            _findProcessInstance (processId) {
                return this.instances.find(function(instance){
                    return instance.processID() == processId
                });
            }
        };

        function checkOptions(options){
            if (!options) {
                throw new Error('ProcessCache : Undefined options')
            }

            if (!options.resman) {
                throw new Error('ProcessCache : Undefined resman')
            }

            if (!options.db) {
                throw new Error('ProcessCache : Undefined db')
            }
            
            if (!options.notifier) {
                throw new Error('ProcessCache : Undefined notifier')
            }
        }

        function execSql(sql) {
            return new Promise(function(resolve, reject) {
                $data.execSql({cmd: sql}, {}, function (result) {
                    if (result.result === "OK") {
                        resolve(result)
                    } else {
                        reject(new Error(result.message))
                    }
                });
            })
        }

        function getAdapter(adapterType) {
            switch (adapterType) {
                case (_adapterType.db) : {
                    return new DbAdapter();
                }
                case (_adapterType.file) : {
                    return new FileAdapter();
                }
                default : {
                    throw new Error('Process adapter is undefined')
                }
            }
        }
    }
);