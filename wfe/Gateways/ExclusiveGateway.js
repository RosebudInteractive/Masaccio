/**
 * Created by staloverov on 08.04.2015.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['./gateway', './../flowNode'],
    function(Gateway, FlowNode){
        var ExclusiveGateway = Gateway.extend({

            className: "ExclusiveGateway",
            classGuid: UCCELLO_CONFIG.classGuids.ExclusiveGateway,
            //metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            init: function(cm, params){
                this._super(cm,{});
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            execute : function() {
                this._super();
                this.state = FlowNode.state.ExecutionComplete;
            },

            cancel : function() {

            },

            getOutgoingNodes : function() {
                if (this.getDirection() == Gateway.direction.Converging) {
                    return [this.outgoing[0].target]
                };

                for (var i  = 0; i < this.outgoing.length; i++) {
                    var _sequence = this.outgoing[i];
                    if (_sequence.hasCondition()) {
                        if (_sequence.isConditionSatisfied(this.processInstance)) {
                            return [_sequence.target];
                        }
                    }
                    else if (_sequence.isDefault) {
                        throw "Не задано условие для исходящего коннектора по умолчанию!"
                    }
                };

                if (this.defaultFlow === undefined || this.defaultFlow === null) {
                    throw 'Ни одно из условий исходящих коннекторов не выполнено и не задан коннектор по умолчанию!'
                } else {
                    return [this.defaultFlow.target]
                }


            }

        });

        return ExclusiveGateway;
    }
)