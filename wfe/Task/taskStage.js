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
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        './../controls'
    ],
    function(
        UObject,
        Controls
    ){
        return class TaskStage extends UObject{
            get className() {return "TaskStage"}
            get classGuid() { return Controls.guidOf('TaskStage')}

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
                return this._genericSetter("Id",value);
            }

            taskId(value) {
                return this._genericSetter("TaskId",value);
            }

            taskDefStageId(value) {
                return this._genericSetter("TaskDefStageId",value);
            }

            stageCode(value) {
                return this._genericSetter("StageCode",value);
            }

            stageState(value) {
                return this._genericSetter("StageState",value);
            }

            getControlManager() {
                return this.pvt.controlMgr;
            }

            static createFromDefinition(taskDefStage, parameter){
                var _instance = new TaskStage(parameter.getControlManager(), {parent : parameter, colName : 'TaskStages'});
                _instance.taskDefStageId(taskDefStage.id());
                _instance.stageCode(taskDefStage.name());
                _instance.stageState(getStageState(State.idle));
            }
        }
    });