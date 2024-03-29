/**
 * Created by staloverov on 30.03.2016.
 */
'use strict';
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['./../engineSingleton', UCCELLO_CONFIG.uccelloPath + 'predicate/predicate'],
    function(EngineSingleton, Predicate) {

        return class DbAdapter{
            constructor(){
                this.queryGuid = '6df668d3-5f54-480f-963d-3fca2501b5a6';
            }

            _setDB(){
                if (!this.db) {
                    this.db = EngineSingleton.getInstance().db;
                }
            }

            _getExpression(process){
                var _predicate = new Predicate(this.db, {});
                _predicate.addCondition({field: "Guid", op: "=", value: process.processID()});
                return {
                    model: process.getModel(),
                    predicate: this.db.serialize(_predicate, true)
                };
            }

            _getExpressionForLog(){
                var _predicate = new Predicate(this.db, {});
                _predicate.addCondition({field: "Id", op: "=", value: 0});
                return {
                    model: {name: 'TaskStageLog'},
                    predicate: this.db.serialize(_predicate, true)
                };
            }

            _getSerializedBody(process){
                var _obj = this.db.serialize(process, true);
                if (!_obj){
                    throw new Error('Can not serialize process')
                } else {
                    return JSON.stringify(_obj)
                }
            }

            _editProcessObj(processObj, process, params){
                var that = this;

                return new Promise(function(resolve, reject) {
                    processObj.edit(function (result) {
                        if (result.result === 'OK') {
                            processObj.state(process.state());
                            processObj.body(that._getSerializedBody(process));
                            if (params) {
                                if ((params.taskStageLogId) && (processObj['taskStageLogId'])){
                                    processObj.taskStageLogId(params.taskStageLogId)
                                }
                            }
                        } else {
                            reject(new Error(result.message))
                        }

                        process.onSave(processObj).
                        then(
                            function () {
                                processObj.save({}, function (result) {
                                    if (result.result === 'OK') {
                                        resolve()
                                    } else {
                                        reject(new Error(result.message))
                                    }
                                })
                            },
                            reject);

                    })
                })
            }

            _addProcessObj(root, process){
                var that = this;

                return new Promise(function(resolve, reject){
                    root.edit(function (result) {
                        if (result.result === 'OK') {
                            root.newObject({
                                $sys: {guid: process.processID()},
                                fields: {
                                    Name: process.name(),
                                    State: process.state(),
                                    Body: that._getSerializedBody(process),
                                    DefinitionId: process.definitionResourceID()
                                }
                            }, {}, function (result) {
                                if (result.result === 'OK') {
                                    var _processObject = root.getDB().getObj(result.newObject);
                                    process.onSave(_processObject).then(
                                        function () {
                                            root.save({}, function (result) {
                                                if (result.result === 'OK') {
                                                    resolve()
                                                } else {
                                                    reject(new Error(result.message))
                                                }
                                            })
                                        },
                                        reject);
                                } else {
                                    reject(new Error(result.message))
                                }
                            });
                        } else {
                            reject(new Error(result.message))
                        }
                    })
                });
            }

            save(process, params){
                this._setDB();
                var that = this;
                return new Promise(function(resolve, reject){
                    var _expr = that._getExpression(process);
                    that.db.getRoots([that.queryGuid], {rtype: "data", expr: _expr}, function (guids) {
                        var _objectGuid = guids.guids[0];
                        that.queryGuid = _objectGuid;

                        var _root = that.db.getObj(_objectGuid);
                        var _processObj = _root.getCol("DataElements").get(0);
                        if (_processObj) {
                            that._editProcessObj(_processObj, process, params).then(resolve, reject);
                        } else {
                            that._addProcessObj(_root, process, params).then(resolve, reject);
                        }
                    });
                });
            }

            serialize(process) {
                this._setDB();
                var that = this;

                return new Promise(function (resolve, reject) {
                    if (!process) {
                        reject(new Error('Can not serialize process'))
                    }

                    process.clearFinishedTokens();
                    that.save(process).
                    then(function () {
                        that._saveProcessLog(process).then(function (lastLoggedId) {
                            if (lastLoggedId) {
                                that.save(process, {taskStageLogId : lastLoggedId}).then(resolve, reject)
                            } else {
                                resolve()
                            }
                        })
                    }).
                    catch(function (err) {
                        throw err
                    });
                });
            }

            _saveProcessLog(process) {
                this._setDB();
                var that = this;
                return new Promise(function (resolve, reject) {
                    if (!process.hasHistory()) {
                        resolve();
                        return
                    }

                    var _expr = that._getExpressionForLog();
                    that.db.getRoots([that.queryGuid], {rtype: "data", expr: _expr}, function (guids) {
                        var _objectGuid = guids.guids[0];
                        that.queryGuid = _objectGuid;

                        var _root = that.db.getObj(_objectGuid);
                        var _count = 0;
                        var _lastId;

                        _root.edit(function (result) {
                            if (result.result === 'OK') {
                                process.history.forEach(function (item) {
                                    _root.newObject({
                                        fields: {
                                            TaskId: process.dbId(),
                                            TaskStageId: item.current.dbId(),
                                            PrevId: item.previousId,
                                            RequestId: item.current._getServiceRequest().dbId(),
                                            StageState: 'InProgress'
                                        }
                                    }, {}, function (result) {
                                        if (result.result === 'OK') {
                                            var _loggedRec = _root.getDB().getObj(result.newObject);
                                            _lastId = _loggedRec.id();
                                            item.current.token().lastLoggedId(_lastId);
                                            _count++;
                                            check();
                                        } else {
                                            reject(new Error(result.message))
                                        }
                                    });

                                    function check() {
                                        if (_count == process.history.length) {
                                            _root.save({}, function (result) {
                                                if (result.result === 'OK') {
                                                    process.history.length = 0;
                                                    resolve(_lastId)
                                                } else {
                                                    reject(new Error(result.message))
                                                }
                                            })
                                        }
                                    }
                                });
                            }
                        })
                    });
                })
            };

            _setTaskStageLogId(process, taskStageLogId){

            }

            deserialize(processID, createComponentFunction) {
                this.db = EngineSingleton.getInstance().db;
                var that = this;

                return new Promise(function(resolve, reject) {
                    if (!createComponentFunction) {
                        createComponentFunction = EngineSingleton.getInstance().createComponentFunction
                    }

                    var _predicate = new Predicate(that.db, {});
                    _predicate.addCondition({field: "Guid", op: "=", value: processID});
                    var _expression = {
                        model : {name : 'Process'},
                        predicate : that.db.serialize(_predicate)
                    };

                    that.db.getRoots([that.queryGuid], {rtype: "data", expr : _expression}, function(guids) {
                        var _objectGuid = guids.guids[0];
                        that.queryGuid = _objectGuid;

                        var _root = that.db.getObj(_objectGuid);
                        var _processObj = _root.getCol("DataElements").get(0);
                        if (_processObj) {
                            var _body = _processObj.body();
                            var _obj = JSON.parse(_body);
                            var _process = EngineSingleton.getInstance().db.deserialize(_obj, {}, createComponentFunction);
                            resolve(_process)
                        } else {
                            reject(new Error('Can not find process [' + processID + ']'))
                        }
                    });
                });
            }
        }

    }
);
