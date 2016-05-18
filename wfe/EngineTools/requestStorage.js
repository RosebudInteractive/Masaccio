/**
 * Created by staloverov on 23.04.2015.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
    ['./../engineSingleton'],
    function(EngineSingleton) {
        return class RequestStorage {
            constructor(options) {
                // checkOptions(options);
                this.storage = [];
            }

            addRequest(request) {
                if (!this.isRequestExists(request.ID())) {
                    this.storage.push(request)
                }
            }

            getRequest(requestID) {
                return  this.storage.find(function(request){
                    return request.ID() == requestID
                });
            }

            findOrUpload(requestID) {
                var that = this;
                return new Promise(function (resolve, reject) {
                    var _request = that.getRequest(requestID);
                    if (_request) {
                        resolve(_request)
                    } else {
                        execSql('select RequestBody from Request where Id = ' + requestID).
                        then(function(object){
                            if ((!object.detail) || (!object.detail[0].RequestBody)) {
                                reject(new Error('Can not find request'))
                            } else {
                                var _requestBody = object.detail[0].RequestBody;
                                _requestBody = JSON.parse(_requestBody);
                                _request = EngineSingleton.getInstance().db.deserialize(_requestBody, {}, EngineSingleton.getInstance().createComponentFunction);
                                _request.dbId(requestID);
                                that.addRequest(_request, {});
                                resolve(_request)
                            }
                        }).
                        catch(function(err){
                            reject(err)
                        })
                    }
                })
            }

            getActiveRequest(requestID) {
                return this.storage.find(function (request) {
                    if (typeof requestID === 'string'){
                        return (request.ID() == requestID) && request.isActive()
                    } else {
                        if (typeof requestID === 'number') {
                            return (request.dbId() == requestID) && request.isActive()
                        }
                    }
                    
                });
            }

            isRequestExists(requestID) {
                return (this.getRequest(requestID) ? true : false);
            }

            isActiveRequestExists(requestID) {
                return this.getActiveRequest() ? true : false;
            }

            isActiveRequestExistsByName(requestName, processID) {
                var _index = this.storage.findIndex(function (request) {
                    return (request.name() == requestName) && (request.processID() == processID) && request.isActive()
                });

                return _index > -1;
            }

            getProcessRequests(processID) {
                var _requests = [];
                this.storage.forEach(function (request) {
                    if (request.processID() == processID) {
                        _requests.push(request);
                    }
                });

                return _requests;
            }

            getRequestParamsByName(requestName, processID) {
                var _request = this.storage.find(function (request) {
                    return (request.name() == requestName) && (request.processID() == processID) && request.isActive()
                });
                if (_request) {
                    return _request.createEventParams()
                }
            }

            cancelActiveRequestsForProcess(processID) {
                var _requests = this.getProcessRequests(processID);
                _requests.forEach(function (item) {
                    if (item.isActive()) {
                        item.cancel();
                    }
                })
            }
        };

        function checkOptions(options){
            if (!options) {
                throw new Error('RequestStorage : Undefined options')
            }

            if (!options.db) {
                throw new Error('RequestStorage : Undefined db')
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

