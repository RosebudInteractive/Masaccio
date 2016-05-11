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
                this.preparedForSave = [];
            }

            getItemIndexByPredicate(predicate) {
                var _index = -1;
                this.storage.some(function (element, index) {
                    if (predicate && predicate(element)) {
                        _index = index;
                        return true;
                    }
                });

                return _index
            }

            getItemByPredicate(predicate) {
                var _index = this.getItemIndexByPredicate(predicate);

                if (_index > -1) {
                    return this.storage[_index]
                } else {
                    return null
                }
            }

            addRequest(request, eventParams) {
                if (!this.isRequestExists(request.ID())) {
                    this.storage.push({request: request, params: eventParams})
                }
            }

            getRequest(requestID) {
                var _item =  this.storage.find(function(item){
                    return item.request.ID() == requestID
                });

                if (_item) {
                    return _item.request
                }
            }

            findOrUpload(requestID) {
                var that = this;
                return new Promise(function (resolve, reject) {
                    var _request = that.getRequest(requestID);
                    if (_request) {
                        resolve(_request)
                    } else {
                        execSql('select RequestBody from Request where Guid = \'' + requestID + '\'').
                        then(function(object){
                            if ((!object.detail) || (!object.detail[0].RequestBody)) {
                                reject(new Error('Can not find request'))
                            } else {
                                var _requestBody = object.detail[0].RequestBody;
                                _requestBody = JSON.parse(_requestBody);
                                _request = EngineSingleton.getInstance().db.deserialize(_requestBody, {}, EngineSingleton.getInstance().createComponentFunction);
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
                var _item = this.getItemByPredicate(function (element) {
                    return (element.request.ID() == requestID) && element.request.isActive()
                });

                if (_item) {
                    return _item.request
                }
            }

            isRequestExists(requestID) {
                return (this.getRequest(requestID) ? true : false);
            }

            isActiveRequestExists(requestID) {
                var _index = this.getItemIndexByPredicate(function (element) {
                    return (element.request.ID() == requestID) && element.request.isActive()
                });

                return _index > -1;
            }

            isActiveRequestExistsByName(requestName, processID) {
                var _index = this.getItemIndexByPredicate(function (element) {
                    return (element.request.name() == requestName) && (element.request.processID() == processID) && element.request.isActive()
                });

                return _index > -1;
            }

            getProcessRequests(processID) {
                var _requests = [];
                this.storage.forEach(function (item) {
                    if (item.request.processID() == processID) {
                        _requests.push(item.request);
                    }
                });

                return _requests;
            }

            getRequestParamsByName(requestName, processID) {
                var _item = this.getItemByPredicate(function (element) {
                    return (element.request.name() == requestName) && (element.request.processID() == processID) && element.request.isActive()
                });
                if (_item) {
                    return _item.params
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

            addForSave(request) {
                var _index = this.preparedForSave.findIndex(function (element) {
                    return element.ID() == request.ID()
                });

                if (_index == -1) {
                    this.preparedForSave.push(request)
                } else {
                    this.preparedForSave[_index] = request
                }
            }

            getProcessRequestsForSave(processID) {
                var _resultArray = [];
                this.preparedForSave.forEach(function(element){
                    if (element.processID() == processID) {
                        _resultArray.push(element)
                    }
                });

                return _resultArray;
            }

            deleteProcessRequestsForSave(processID){
                this.preparedForSave.forEach(function(element, index, array) {
                    if (element.processID() == processID){
                        array.splice(index, 1)
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

