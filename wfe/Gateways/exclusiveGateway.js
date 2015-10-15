/**
 * Created by staloverov on 08.04.2015.
 */

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
        var ExclusiveGateway = Gateway.extend({

            className: "ExclusiveGateway",
            classGuid: Controls.guidOf('ExclusiveGateway'),
            metaCols: [],

            createInstance : function(cm, params){
                return new ExclusiveGateway(cm, params);
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            execute : function(callback) {
                UccelloClass.super.apply(this, [callback]);

                this.state(FlowNode.state.ExecutionComplete);
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
                    return [_outgoingNodes[0]]
                } else {
                    if (!this.defaultFlow()) {
                        throw 'Ни одно из условий исходящих коннекторов не выполнено и не задан коннектор по умолчанию!'
                    } else {
                        return [this.defaultFlow().target]
                    }
                }
            }
        });

        return ExclusiveGateway;
    }
)