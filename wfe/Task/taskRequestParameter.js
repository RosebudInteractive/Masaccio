/**
 * Created by staloverov on 04.05.2016.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', '../../public/utils'],
    function(UObject, Utils){
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
                    {'cname': 'AvailableNodes', 'ctype': 'string'}
                ]
            }

            selectedNode(value) {
                return this._genericSetter("SelectedNode", value);
            }

            availableNodes() {
                return this.getCol('AvailableNodes');
            }
            
            addAvailableNode(nodeName) {
                this.availableNodes()._add(nodeName)
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