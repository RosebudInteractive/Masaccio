/**
 * Created by staloverov on 08.04.2015.
 */
'use strict';


if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
        './gateway',
        './../flowNode',
        './../controls'
    ],
    function(
        Gateway,
        FlowNode,
        Controls
    ){
        return class ExclusiveGateway extends Gateway {

            get className() {return "ExclusiveGateway"}
            get classGuid() {return Controls.guidOf('ExclusiveGateway')}

            createInstance(cm, params){
                return new ExclusiveGateway(cm, params);
            }

            name(value) {
                return this._genericSetter("Name",value);
            }

            state(value) {
                return this._genericSetter("State",value);
            }

            execute (callback) {
                super.execute(callback);

                this.completeExecution();
                this.callExecuteCallBack(callback)
            }

            cancel () {

            }

            getOutgoingNodes () {
                if (!this.isAllOutgoingChecked()) {
                    throw 'Не все исходящие ветви проверены'
                }

                var _outgoingNodes = this.conditionsResult.getConfirmedNodes();
                if (_outgoingNodes.length != 0) {
                    return [_outgoingNodes[0]]
                } else {
                    if (!this.defaultFlow()) {
                        throw 'Ни одно из условий исходящих коннекторов не выполнено и не задан коннектор по умолчанию!'
                    } else {
                        return [this.defaultFlow().target]
                    }
                }
            }
        };
    }
);