/**
 * Created by Alex on 28.04.2016.
 */
'use strict';
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
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
        }
    });