/**
 * Created by staloverov on 12.05.2015.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    //var Class = require('class.extend');
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    ['./gateway', './../flowNode', './../controls'],
    function(Gateway, FlowNode, Controls){
        var InclusiveGateway = Gateway.extend({

            className: "InclusiveGateway",
            classGuid: Controls.guidOf('InclusiveGateway'),
            metaCols: [],

            createInstance : function(cm, params){
                return new InclusiveGateway(cm, params);
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            execute : function(callback) {
                UccelloClass.super.apply(this, [callback]);
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
            },

            cancel : function() {

            },

            getOutgoingNodes : function() {
                if (!this.isAllOutgoingChecked()) {
                    throw 'Не все исходящие ветви проверены'
                };

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

        });

        return InclusiveGateway;
    }
)