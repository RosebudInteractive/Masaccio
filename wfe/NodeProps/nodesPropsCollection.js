/**
 * Created by staloverov on 21.04.2015.
 */

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject'],
    function(UObject){
        var TokenProperties = UObject.extend({

            className: "TokenProperties",
            classGuid: UCCELLO_CONFIG.classGuids.TokenProperties,
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
                this.requests = {};
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            tokenID: function(value) {
                return this._genericSetter("TokenID",value);
            },

            processID: function(value) {
                return this._genericSetter("ProcessID",value);
            },

            addParameter : function(parameter){
                this.parameters.push(parameter);
            }

        });

        return TokenProperties;
    }
)


