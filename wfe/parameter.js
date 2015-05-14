/**
 * Created by staloverov on 20.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject'],
    function(UObject){
        var Parameter = UObject.extend({

            className: "Parameter",
            classGuid: UCCELLO_CONFIG.classGuids.Parameter,
            metaFields: [
                {fname : "Name"   , ftype : "string"},
                {fname : "Value"  , ftype : "string"}
            ],
            ///* Todo : Не уверен что нужен UObject */
            init: function(cm, params){
                this._super(cm,{});
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            value: function(value) {
                return this._genericSetter("Value",value);
            },

            clone : function() {
                var _newParam = new Parameter(this.pvt.controlMgr);
                _newParam.name = this.name;
                _newParam.value = this.value;
                return _newParam;
            }

        });

        return Parameter;
    }
)

