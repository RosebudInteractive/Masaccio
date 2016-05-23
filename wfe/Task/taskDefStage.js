/**
 * Created by staloverov on 22.04.2016.
 */
'use strict';
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
        './../Activities/userTask',
        './../controls',
        './taskStage'
    ],
    function(
        UserTask,
        Controls,
        TaskStage
    ){
        return class TaskDefStage extends UserTask {
            get className() {
                return "TaskDefStage"
            }

            get classGuid() {
                return UCCELLO_CONFIG.classGuids.TaskDefStage
            }

            get metaFields() {
                return [
                    {fname: 'Id', ftype: 'integer'},
                    {fname: 'TaskDefId', ftype: 'integer'},
                    {fname: 'StageCode', ftype: 'string'}
                ]
            }

            id(value) {
                return this._genericSetter("Id", value);
            }

            taskDefId(value) {
                return this._genericSetter("TaskDefId", value);
            }

            name(value) {
                return this._genericSetter("StageCode", value);
            }

            createInstance(cm, params) {
                throw new Error('Task definition can not create instance')
            }

            copyNodeDefinition(process, params){
                var _taskStage = TaskStage.createFromDefinition(this, params);
                _taskStage.assign(this, process);
                _taskStage.guid(this.guid());
                _taskStage.copyCollectionDefinitions(this, process);
                _taskStage.taskDefStageId(this.id());

                return _taskStage;
            }
        }
    });
