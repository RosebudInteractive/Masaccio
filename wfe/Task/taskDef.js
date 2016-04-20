/**
 * Created by Alex on 20.04.2016.
 */
'use strict';
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
        './../processDefinition',
        './../controls'
    ],
    function(
        ProcessDefinition,
        Controls
    ){
        return class TaskDef extends ProcessDefinition{
            get className() {return "TaskDef"}
            get classGuid() { return Controls.guidOf('TaskDef')}

            getModelForProcess() {
                return {
                    name: 'Task',
                    childs: [{
                        dataObject: {
                            name: 'Request', isStub : true
                        }
                    }]
                }
            }

            onSaveProcess(dbObject, params) {

            }

            getModelDescription() {
                return { name: "TaskDef" };
            }

            onSave(data_object) {
            }
        }

    });
