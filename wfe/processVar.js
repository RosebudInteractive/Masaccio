/**
 * Created by staloverov on 04.05.2016.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject'],
    function(UObject) {
        return class ProcessVar extends UObject {
            get className() {
                return "ProcessVar"
            }

            get classGuid() {
                return UCCELLO_CONFIG.classGuids.ProcessVar;
            }

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
                    {'cname': 'TaskStages', 'ctype': 'TaskStage'}
                ]
            }

            name(value) {
                return this._genericSetter("Name", value);
            }

            taskNumber(value) {
                return this._genericSetter("TaskNumber", value);
            }

            specification(value) {
                return this._genericSetter("Specification", value);
            }

            objId(value) {
                return this._genericSetter("ObjId", value);
            }

            taskStages() {
                return this.getCol('TaskStages');
            }

            getControlManager() {
                return this.pvt.controlMgr;
            }

            copy(source) {
                this.name(source.name());
                this.taskNumber(source.taskNumber());
                this.specification(source.specification());
                this.objId(source.objId());
                
                for (var i = 0; i < source.taskStages().count(); i++){
                    source.taskStages().get(i).addNewCopyTo(this)
                }
            }
        }
    }
);