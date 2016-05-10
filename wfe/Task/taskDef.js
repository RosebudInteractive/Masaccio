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
        './taskDefStage',
        './taskStage'
    ],
    function(
        ProcessDefinition,
        Controls,
        TaskDefStage,
        TaskStage
    ){
        return class TaskDef extends ProcessDefinition {
            get className() {
                return "TaskDef"
            }

            get classGuid() {
                return UCCELLO_CONFIG.classGuids.TaskDef
            }

            get metaFields() {
                return [
                    {fname: 'IsSystem', ftype: 'boolean'}
                ]
            }

            isSystem(value) {
                return this._genericSetter("IsSystem", value);
            }

            getModelForProcess() {
                return {
                    name: 'Task',
                    childs: [
                        {dataObject: {name: 'Request'}}
                        // {dataObject: {name: 'Task'}}
                    ]
                }
            }

            onSaveProcess(dbObject, params) {
                return super.onSaveProcess(dbObject, params).then(function () {
                    return new Promise(function(resolve){
                        dbObject.number(params.processInstance.processVar().taskNumber());
                        dbObject.specification(params.processInstance.processVar().specification());
                        dbObject.objId(params.processInstance.processVar().objId());
                        // Todo : Что делать со старыми состояниями процесса? Если они должны жить параллельно, то где хранить?
                        // обязательно требует TaskStageLogId, пока поставил nullable
                        dbObject.taskState('InProgress');
                        resolve()
                    })
                }).catch(function (err) {
                    return Promise.reject(err)
                })
            }

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

            _saveTaskParams(dbObject) {
                this.taskParams().name(this.name());

                for (var i = 0; i < this.nodes().count(); i++) {
                    var _node = this.nodes().get(i);
                    if (_node instanceof TaskDefStage) {
                        TaskStage.createFromDefinition(_node, {parent : this.taskParams(), colName: 'TaskStages'})
                    }
                }

                var _params = JSON.stringify(this.pvt.db.serialize(this.taskParams(), true));
                dbObject.params(_params);
            }

            onSave(data_object) {
                var that = this;
                return new Promise(function (resolve, reject) {
                    data_object.name(that.name());
                    data_object.isSystem(that.isSystem() ? true : false);

                    var _root = data_object.getDataRoot('TaskDefStage');
                    that._fillStagesCollection(_root).then(function () {
                        that._saveTaskParams(data_object);
                        resolve()
                    }).catch(function (err) {
                        reject(err)
                    });
                });
            }

            _fillStagesCollection(root) {
                var that = this;
                var _stagesCollection = root.getCol("DataElements");

                return new Promise(function (resolve, reject) {

                    var _count = 0;

                    for (var i = 0; i < that.nodes().count(); i++) {
                        var _node = that.nodes().get(i);
                        if (_node instanceof TaskDefStage) {
                            var _nodeDbObj = getStage(_node.name());
                            if (!_nodeDbObj) {
                                root.newObject({
                                        fields: {
                                            StageCode: _node.name()
                                        }
                                    }, {},
                                    function (result) {
                                        if (result.result !== 'OK') {
                                            reject(new Error(result.message))
                                        } else {
                                            var _createdObj = root.getDB().getObj(result.newObject);
                                            var _thatNode = that.findNodeByName(_createdObj.stageCode());
                                            if (_thatNode) {
                                                _thatNode.id(_createdObj.id());
                                                _thatNode.taskDefId(_createdObj.taskDefId());
                                            }

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

                function getStage(code) {
                    for (var i = 0; i < _stagesCollection.count(); i++) {
                        if (_stagesCollection.get(i).stageCode() == code) {
                            return _stagesCollection.get(i);
                        }
                    }
                }
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

            applyInputTaskParams() {
                this.taskParams().copy(this.inputTaskParams());    
            }

            checkInputParams() {
                var _params = this.inputTaskParams();
                return _params &&
                    _params.taskNumber() &&
                    _params.specification() &&
                    _params.objId()
            }
        }

    });
