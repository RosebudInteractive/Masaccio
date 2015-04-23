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
            //metaFields: [
            //    {fname:"Name",ftype:"string"},
            //    {fname:"State",ftype:"string"},
            //    {fname:"TokenID",ftype:"string"},
            //    {fname:"ProcessID",ftype:"string"}
            //],
            ///* Todo : Необходимо сохраннять коллекцию параметров */
            //metaCols: [],

            init: function(cm, params){
                this._super(cm,params);

                //this.state = requestState.Exposed;
                this.parameters = [];
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            clone : function() {

            }

        });

        return Parameter;
    }
)

