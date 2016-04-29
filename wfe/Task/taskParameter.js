/**
 * Created by Alex on 28.04.2016.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', './../controls'],
    function(UObject, Controls){
        return class TaskParameter extends UObject{
            get className() {return "TaskParameter"}
            get classGuid() { return Controls.guidOf('TaskParameter')}

            get metaFields() {
                return [
                    {fname: 'Name', ftype: 'string'},
                    {fname: 'TaskNumber', ftype: 'string'},
                    {fname: 'Specification', ftype: 'string'},
                    {fname: 'ObjId', ftype: 'integer'}
                ]
            }

            get metaCols() {
                return [
                    {'cname' : 'TaskStages', 'ctype' : 'TaskStage'}
                ]
            }

            name(value) {
                return this._genericSetter("Name",value);
            }

            taskNumber(value) {
                return this._genericSetter("taskNumber",value);
            }

            specification(value) {
                return this._genericSetter("Specification",value);
            }

            objId(value) {
                return this._genericSetter("ObjId",value);
            }

            taskStages() {
                return this.getCol('TaskStages');
            }

            getControlManager() {
                return this.pvt.controlMgr;
            }
        }
    }
);
