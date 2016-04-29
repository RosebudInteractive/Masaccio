/**
 * Created by staloverov on 28.04.2016.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', './../controls'],
    function(UObject, Controls) {
        return class ProcessCache {
            constructor(options){
                checkOptions(options);

                this.resman = options.resman;
                this.definitions = [];
                this.instances = [];
            }

            clearDefinitions() {
                this.definitions.length = 0;
            }

            createNewProcess(definitionName) {
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
                            var _process = new Process(that.controlManager, {definitionResourceID: result.datas[0].guid}, _defResource);
                            resolve(_process);
                        }
                    })

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
                                if ((!object.detail) || (!object.detail[0].Params)) {
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
        };

        function checkOptions(options){
            if ((!options) || (!options.resman)) {
                throw new Error('ProcessCache : Undefined resman')
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
    }
);