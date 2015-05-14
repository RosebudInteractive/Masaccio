/**
 * Created by staloverov on 31.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
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
            //metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            init: function(cm, params){
                this._super(cm,params);
                this.defaultFlow = null;
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            execute : function() {
                console.log('Выполняется gateway [%s]', this.name);
            },

            cancel : function() {

            },

            getDirection : function() {
                var _direction = gatewayDirection.Unspecified;
                if (this.incoming.length > 1) {
                    _direction = gatewayDirection.Converging
                };
                if (this.outgoing.length > 1) {
                    if (_direction == gatewayDirection.Converging) {_direction = gatewayDirection.Mixed}
                    else (_direction = gatewayDirection.Diverging)
                }

                return _direction;
            },

            setDefaultFlow : function(sequence){
                this.defaultFlow = sequence;
                sequence.isDefault = true;
            }
        });

        return Gateway;
    }
)

if (module) { module.exports.direction = gatewayDirection };