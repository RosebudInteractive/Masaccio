/**
 * Created by staloverov on 04.05.2016.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', '../../public/utils', './../parameter'],
    function(UObject, Utils, WfeParameter){
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
                var _param = new WfeParameter(this.getControlManager(), {parent : this, colName : 'AvailableNodes'});
                _param.name('Node');
                _param.value(nodeName);
                return _param;
            }

            getControlManager() {
                return this.pvt.controlMgr;
            }

            copy(source) {
                this.selectedNode(source.selectedNode());
                this.availableNodes().clear();
                for (var i = 0; i < source.availableNodes().count(); i++) {
                    this.addAvailableNode(source.availableNodes().get(i).value())
                }
            }

            checkSelectedNode(nodeName) {
                if (!nodeName) {
                    console.error('Selected node is empty');
                    throw new Error('Selected node is empty')
                }

                for (var i = 0; i < this.availableNodes().count(); i++) {
                    if (nodeName === this.availableNodes().get(i).value()) {
                        return true
                    }
                }

                console.error('Selected node is not match to available nodes');
                throw new Error('Selected node is not match to available nodes')
            }
        }
    }
);