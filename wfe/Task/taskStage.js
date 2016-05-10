/**
 * Created by Alex on 28.04.2016.
 */
'use strict';
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

var State = {
    idle : {value : 0, code : 'в ожидании'},
    canStart : {value : 1, code : 'можно приступать'},
    inProcess : {value :2, code : 'в процессе'},
    finished : {value : 3, code : 'завершено'},
    canceled : {value : 4, code : 'аннулировано'},
    interrupted : {value : 5, code : 'прервано'}
};

function getStageState(state){
    return state.value
}

define([
        './../Activities/userTask',
        './../engineSingleton'
    ],
    function(
        UserTask, EngineSingleton
    ){
        return class TaskStage extends UserTask {
            get className() {
                return "TaskStage"
            }

            get classGuid() {
                return UCCELLO_CONFIG.classGuids.TaskStage
            }

            get metaFields() {
                return [
                    {fname: 'Id', ftype: 'integer'},
                    {fname: 'TaskId', ftype: 'integer'},
                    {fname: 'TaskDefStageId', ftype: 'integer'},
                    {fname: 'StageCode', ftype: 'string'},
                    {fname: 'StageState', ftype: 'integer'}
                ]
            }

            id(value) {
                return this._genericSetter("Id", value);
            }

            taskId(value) {
                return this._genericSetter("TaskId", value);
            }

            taskDefStageId(value) {
                return this._genericSetter("TaskDefStageId", value);
            }

            stageCode(value) {
                return this._genericSetter("StageCode", value);
            }

            stageState(value) {
                return this._genericSetter("StageState", value);
            }

            getControlManager() {
                return this.pvt.controlMgr;
            }

            addNewCopyTo(parent) {
                var _newStage = new TaskStage(parent.getControlManager(), {parent : parent, colName : 'TaskStages'});
                _newStage.id(this.id());
                _newStage.taskId(this.taskId());
                _newStage.taskDefStageId(this.taskDefStageId());
                _newStage.stageCode(this.stageCode());
                _newStage.stageState(this.stageState());
                
                return _newStage;
            }

            static createFromDefinition(taskDefStage, params) {
                var _instance = new TaskStage(params.parent.getControlManager(), {
                    parent: params.parent,
                    colName: params.colName
                });
                _instance.taskDefStageId(taskDefStage.id());
                _instance.stageCode(taskDefStage.name());
                _instance.stageState(getStageState(State.idle));
                
                return _instance;
            }

            _getInternalRequest() {
                if (this.outgoing().count() > 0) {
                    var _request = this.addServiceRequest();
                    _request.taskParams().addAvailableNode(this.name());
                    for (var i = 0; i < this.outgoing().count(); i++) {
                        _request.taskParams().addAvailableNode(this.outgoing().get(i).object().target().name())
                    }

                    return _request
                } else {
                    return null
                }
            }

            _hasUserSelectedNextNode() {
                return this._getServiceResponse() ? true : false;
            }
            
            _getServiceResponse() {
                var _responsesCol = this.token().getPropertiesOfNode(this.name()).responses();
                for (var i = 0; i < _responsesCol.count(); i++){
                    var _response = _responsesCol.get(i);
                    if (_response.isService() && _response.taskParams().selectedNode()) {
                        return _response
                    }
                }    
            }

            _getUserSelectedNexNode() {
                var _serviceResponse = this._getServiceResponse();
                var _result = [];
                if (_serviceResponse) {
                    var _node = this.processInstance().findNodeByName(_serviceResponse.taskParams().selectedNode());
                    if (_node) {
                        _result.push(_node)
                    }
                } 
                return _result
            }

            _doOnDone() {
                if (!this.hasScript()) {
                    var _serviceResponse = this._getServiceResponse();
                    EngineSingleton.getInstance().responseStorage.executeResponseCallback(_serviceResponse.ID());
                }
            }
        }
    });