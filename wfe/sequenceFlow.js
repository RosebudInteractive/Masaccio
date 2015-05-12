/**
 * Created by staloverov on 30.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', './flowNode', 'util'],
    function(UObject, FlowNode, util){
        var SequenceFlow = UObject.extend({

            className: "SequinceFlow",
            classGuid: UCCELLO_CONFIG.classGuids.SequinceFlow,
            metaFields: [
                {fname : "Name" ,       ftype : "string"},
                {fname : "State" ,      ftype : "string"},
                {fname : "IsDefault",   ftype : "boolean"},
                {fname : "Expression",  ftype : "string"}
            ],
            metaCols: [],




            init: function(cm, params){
                this._super(cm,params);
                this.isDefault = false;
                this.expression = null;
                this.source = null;
                this.target = null;
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            isDefault : function(value) {
                return this._genericSetter("IsDefault",value);
            },

            expression : function(value) {
                return this._genericSetter("Expression",value);
            },

            connect : function(from, to, expession) {
                this.source = from;
                this.target = to;

                this.name = util.format('%s->%s', from.name, to.name);
                this.source.addOutgoing(this);
                this.target.addIncoming(this);

                this.expression = expession;
            },

            hasCondition : function() {
                //var _expr = this.expression;
                return !(this.expression === undefined || this.expression === null);
            },

            isConditionSatisfied : function(processObject){
                var _processObject = processObject;
                /* Todo : Код не безопасен, так как в eval передается инстанс процесса, да и не известно что оттуда вернется */
                this.expression = "var process = _processObject; " + this.expression;
                /* Todo : Необходимо обработать асинхронность */
                var _result = eval(this.expression);
                return _result == true ? true : false;
            }
        });

        return SequenceFlow;
    }
)
