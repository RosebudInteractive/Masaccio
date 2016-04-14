/**
 * Created by staloverov on 30.03.2016.
 */
'use strict';
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['./../engineSingleton', UCCELLO_CONFIG.uccelloPath + 'predicate/predicate', './../controls'],
    function(EngineSingleton, Predicate, Controls) {

        return class DbAdapter{
            constructor(){
                this.queryGuid = '6df668d3-5f54-480f-963d-3fca2501b5a6'
            }

            serialize(process) {
                this.db = EngineSingleton.getInstance().db;
                var that = this;

                return new Promise(function(resolve, reject){
                    if (!process) {
                        reject(new Error('Can not serialize process'))
                    }

                    process.clearFinishedTokens();
                    var _obj = process.pvt.db.serialize(process);
                    //if (_obj) {
                        var _predicate = new Predicate(that.db, {});
                        _predicate.addCondition({field: "Guid", op: "=", value: process.processID()});
                        var _expression = {
                            model: process.getModel(), //{name : 'ProcessData'},
                            predicate: that.db.serialize(_predicate)
                        };

                        that.db.getRoots([that.queryGuid], {rtype: "data", expr: _expression}, function (guids) {
                            var _objectGuid = guids.guids[0];
                            that.queryGuid = _objectGuid;

                            var _root = that.db.getObj(_objectGuid);
                            var _processObj = _root.getCol("DataElements").get(0);
                            if (_processObj) {
                                _processObj.edit(function (result) {
                                    if (result === 'OK') {
                                        _processObj.State(process.state());
                                        _processObj.Body(JSON.stringify(_obj));
                                    } else {
                                        reject(new Error(result.message))
                                    }

                                    _processObj.save({}, function (result) {
                                        if (result.result === 'OK') {
                                            resolve()
                                        } else {
                                            reject(new Error(result.message))
                                        }
                                    })
                                })
                            } else {
                                _root.edit(function (result) {
                                    if (result.result === 'OK') {
                                        _root.newObject({
                                            $sys: {guid: process.processID()},
                                            fields: {
                                                Name: process.name(),
                                                State: process.state(),
                                                Body: JSON.stringify(_obj),
                                                DefinitionId: process.definitionResourceID()
                                            }
                                        }, {}, function (result) {
                                            if (result.result === 'OK') {
                                                process.onSave(result.newObject);
                                                _root.save({}, function (result) {
                                                    if (result.result === 'OK') {
                                                        resolve()
                                                    } else {
                                                        reject(new Error(result.message))
                                                    }
                                                })
                                            } else {
                                                reject(new Error(result.message))
                                            }
                                        })
                                    } else {
                                        reject(new Error(result.message))
                                    }
                                })
                            }
                        })
                    //}
                });
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
