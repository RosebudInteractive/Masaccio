/**
 * Created by staloverov on 12.05.2015.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    //var Class = require('class.extend');
    //var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    ['./gateway', './../flowNode', './../controls'],
    function(Gateway, FlowNode, Controls){
        return class InclusiveGateway extends Gateway {
        //var InclusiveGateway = Gateway.extend({

            get className() {return "InclusiveGateway"}
            get classGuid() { return Controls.guidOf('InclusiveGateway')}
            //metaCols: [],

            createInstance (cm, params){
                return new InclusiveGateway(cm, params);
            }

            name(value) {
                return this._genericSetter("Name",value);
            }

            state(value) {
                return this._genericSetter("State",value);
            }

            execute (callback) {
                super.execute(callback);
                if (this.getDirection() == Gateway.direction.Converging || this.getDirection() == Gateway.direction.Mixed){
                    if (this.processInstance.getNodeTokens(this).length == this.incoming().count()) {
                        this.state(FlowNode.state.ExecutionComplete)
                    } else {
                        this.state(FlowNode.state.WaitingRequest)
                    }
                } else if (this.getDirection() == Gateway.direction.Diverging) {
                    this.state(FlowNode.state.ExecutionComplete)
                } else {
                    throw 'Неизвестный тип GatewayDirection'
                }

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
                    return _outgoingNodes
                } else {
                    if (!this.defaultFlow) {
                        throw 'Ни одно из условий исходящих коннекторов не выполнено и не задан коннектор по умолчанию!'
                    } else {
                        return [this.defaultFlow.target]
                    }
                }
            }

        };//);

        //return InclusiveGateway;
    }
)