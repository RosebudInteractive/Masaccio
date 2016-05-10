/**
 * Created by staloverov on 04.05.2016.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', '../../public/utils', './../parameter'],
    function(UObject, Utils, Parameter){
        return class TaskRequestParameter extends UObject {
            get className() {
                return "TaskRequestParameter"
            }

            get classGuid() {
                return UCCELLO_CONFIG.classGuids.TaskRequestParameter
            }

            get metaFields() {
                return [
                    {fname: 'SelectedNode', ftype: 'string'}
                ]
            }

            get metaCols() {
                return [
                    {'cname': 'AvailableNodes', 'ctype': 'WfeParameter'}
                ]
            }

            selectedNode(value) {
                return this._genericSetter("SelectedNode", value);
            }

            availableNodes() {
                return this.getCol('AvailableNodes');
            }
            
            addAvailableNode(nodeName) {
                var _param = new Parameter(this.getControlManager(), {parent : this, colName : 'AvailableNodes'});
                _param.name('Node');
                _param.value(nodeName);
                return _param;
            }

            getControlManager() {
                return this.pvt.controlMgr;
            }

            copy(source) {
                this.selectedNode(source.selectedNode());
                Utils.copyCollection(source.availableNodes(), this.availableNodes());
            }
        }
    }
);