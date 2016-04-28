/**
 * Created by staloverov on 22.04.2016.
 */
'use strict';
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
        './../Activities/userTask',
        './../controls'
    ],
    function(
        UserTask,
        Controls
    ){
        return class TaskDefStage extends UserTask{
            get className() {return "TaskDefStage"}
            get classGuid() { return Controls.guidOf('TaskDefStage')}

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
        }
    });
