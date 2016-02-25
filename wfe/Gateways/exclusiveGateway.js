/**
 * Created by staloverov on 08.04.2015.
 */
'use strict';


if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
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
        //var ExclusiveGateway = Gateway.extend({

            get className() {return "ExclusiveGateway"}
            get classGuid() {return Controls.guidOf('ExclusiveGateway')}
            //metaCols: [],

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
                UccelloClass.super.apply(this, [callback]);

                this.state(FlowNode.state.ExecutionComplete);
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
        }; //);

        //return ExclusiveGateway;
    }
);