/**
 * Created by staloverov on 08.04.2015.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    //var Class = require('class.extend');
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        './gateway',
        './../flowNode'
    ],
    function(
        Gateway,
        FlowNode
    ){
        var ExclusiveGateway = Gateway.extend({

            className: "ExclusiveGateway",
            classGuid: UCCELLO_CONFIG.classGuids.ExclusiveGateway,
            //metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            //init: function(cm, params){
            //    if (!params) {
            //        params = {}
            //    }
            //    UccelloClass.super.apply(this, [cm, params]);
            //},

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