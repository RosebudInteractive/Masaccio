/**
 * Created by staloverov on 31.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    //var Class = require('class.extend');
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

var gatewayDirection = {
        Unspecified : 'Unspecified',
        Converging : 'Converging',
        Diverging : 'Diverging',
        Mixed : 'Mixed'
    }

define(
    ['./../flowNode'],
    function(FlowNode){
        var Gateway = FlowNode.extend({

            className: "Gateway",
            classGuid: UCCELLO_CONFIG.classGuids.Activity,
            metaFields: [{
                fname : 'DefaultFlow',
                ftype : {
                    type :'ref',
                    res_elem_type : UCCELLO_CONFIG.classGuids.FlowNode
                }}
            ],
            //metaCols: [],

            //init: function(definition, params){
            //    UccelloClass.super.apply(this, [definition, params]);
            //},

            assign : function(source, process){
                UccelloClass.super.apply(this, [source, process]);
                this.defaultFlow(source.defaultFlow());
            },

            defaultFlow: function(value) {
                return this._genericSetter("DefaultFlow",value);
            },
            //
            //state: function(value) {
            //    return this._genericSetter("State",value);
            //},

            execute : function(callback) {
                UccelloClass.super.apply(this, [callback]);
                console.log('[%s] :=> Выполняется gateway [%s]', (new Date()).toLocaleTimeString(), this.name());
            },

            cancel : function() {

            },

            getDirection : function() {
                var _direction = gatewayDirection.Unspecified;
                if (this.incoming().count() > 1) {
                    _direction = gatewayDirection.Converging
                };
                if (this.outgoing().count() > 1) {
                    if (_direction == gatewayDirection.Converging) {_direction = gatewayDirection.Mixed}
                    else (_direction = gatewayDirection.Diverging)
                }

                return _direction;
            },

            calcOutgoingNodes : function(callback) {
                if (this.getDirection() == Gateway.direction.Converging) {
                    return [this.outgoing().get(0).target()]
                };

                for (var i  = 0; i < this.outgoing().count(); i++) {
                    var _sequence = this.outgoing().get(i);
                    this.conditionsResult.clearResult(_sequence);
                    if (_sequence.hasCondition()) {
                        var _scriptObject = this.createSequenceScriptObject(_sequence, callback);
                        this.state(FlowNode.state.WaitingUserScriptAnswer);
                        /* Todo : возможно здесь нуден не currentToken, а token узла */
                        //this.processInstance().enqueueCurrentToken();
                        _sequence.checkConditionSatisfied(_scriptObject);
                    }
                    else {
                        if (_sequence.isDefault) {
                            throw "Не задано условие для исходящего коннектора по умолчанию!"
                        };
                        this.conditionsResult.addResult(_sequence, true);
                        _sequence.check();
                    }
                };
            },

            setDefaultFlow : function(sequence){
                this.defaultFlow(sequence);
                sequence.isDefault = true;
            }
        });

        return Gateway;
    }
)

if (module) { module.exports.direction = gatewayDirection };