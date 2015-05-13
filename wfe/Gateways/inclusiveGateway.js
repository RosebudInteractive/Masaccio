/**
 * Created by staloverov on 12.05.2015.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['./gateway', './../flowNode'],
    function(Gateway, FlowNode){
        var InclusiveGateway = Gateway.extend({

            className: "InclusiveGateway",
            classGuid: UCCELLO_CONFIG.classGuids.Activity,
            metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            execute : function() {
                this._super();
                if (this.getDirection() == Gateway.direction.Converging || this.getDirection() == Gateway.direction.Mixed){
                    if (this.processInstance.getNodeTokens(this).length == this.incoming.length) {
                        this.state = FlowNode.state.ExecutionComplete
                    } else {
                        this.state = FlowNode.state.WaitingRequest
                    }
                } else if (this.getDirection() == Gateway.direction.Diverging) {
                    this.state = FlowNode.state.ExecutionComplete
                } else {
                    throw 'Неизвестный тип GatewayDirection'
                }
            },

            cancel : function() {

            },

            getOutgoingNodes : function() {
                if (this.getDirection() == Gateway.direction.Converging) {
                    return [this.outgoing[0].target]
                };

                var _confirmedOutgoingNodes = [];

                for (var i  = 0; i < this.outgoing.length; i++) {
                    var _sequence = this.outgoing[i];
                    if (_sequence.hasCondition()) {
                        if (_sequence.isConditionSatisfied(this.processInstance)) {
                            _confirmedOutgoingNodes.push(_sequence.target);
                        }
                    }
                    else if (_sequence.isDefault) {
                        throw "Не задано условие для исходящего коннектора по умолчанию!"
                    }
                };

                if (_confirmedOutgoingNodes.length > 0) {
                    return _confirmedOutgoingNodes;
                }

                if (this.defaultFlow === undefined || this.defaultFlow === null) {
                    throw 'Ни одно из условий исходящих коннекторов не выполнено и не задан коннектор по умолчанию!'
                } else {
                    return [this.defaultFlow.target]
                }
            }

        });

        return InclusiveGateway;
    }
)