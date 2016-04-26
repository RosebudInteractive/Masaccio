/**
 * Created by Alex on 20.04.2016.
 */
'use strict';
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
        './../processDefinition',
        './../controls',
        './taskDefStage'
    ],
    function(
        ProcessDefinition,
        Controls,
        TaskDefStage
    ){
        return class TaskDef extends ProcessDefinition{
            get className() {return "TaskDef"}
            get classGuid() { return Controls.guidOf('TaskDef')}

            get metaFields() {
                return [
                    {fname: 'IsSystem', ftype: 'boolean'}
                ]
            }

            isSystem(value) {
                return this._genericSetter("IsSystem", value);
            }

            //getModelForProcess() {
            //    return {
            //        name: 'Task',
            //        childs: [{
            //            dataObject: {
            //                name: 'Request', isStub : true
            //            }
            //        }]
            //    }
            //}

            //onSaveProcess(dbObject, params) {
            //
            //}

            getModelDescription() {
                return {
                    name: 'TaskDef',
                    childs: [{
                        dataObject: {
                            name: 'TaskDefStage'
                        }
                    }]
                }
            }

            onSave(data_object) {
                var that = this;
                return new Promise(function (resolve) {
                    data_object.name(that.name());
                    data_object.isSystem(that.isSystem() ? true : false);

                    var _root = data_object.getDataRoot('TaskDefStage');
                    var _stagesCollection = _root.getCol("DataElements");

                    function getStage(code) {
                        for (var i = 0; i < _stagesCollection.count(); i++) {
                            if (_stagesCollection.get(i).stageCode() == code) {
                                return _stagesCollection.get(i);
                            }
                        }
                    }

                    var _count = 0;

                    for (var i = 0; i < that.nodes().count(); i++) {
                        var _node = that.nodes().get(i);
                        if (_node.className === 'TaskDefStage') {
                            var _nodeDbObj = getStage(_node.name());
                            if (!_nodeDbObj) {
                                _root.newObject({
                                        fields: {
                                            StageCode: _node.name()
                                        }
                                    }, {},
                                    function (result) {
                                        if (result.result !== 'OK') {
                                            reject(new Error(result.message))
                                        } else {
                                            _count++;
                                            checkDone();
                                        }
                                    })
                            } else {
                                _nodeDbObj.stageCode(_node.name());
                                _count++;
                                checkDone();

                            }
                        } else {
                            _count++;
                            checkDone();
                        }
                    }

                    function checkDone() {
                        if (_count == that.nodes().count()) {
                            resolve();
                        }
                    }
                });
            }

            addTaskStage(taskName, script) {
                var _node = new TaskDefStage(this.getControlManager(), {parent: this, colName: 'Nodes'});
                if (taskName) {
                    _node.name(taskName)
                }

                if (script) {
                    _node.setUserScript(script)
                }
                return _node;
            }
        }

    });
