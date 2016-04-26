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
        }
    });
