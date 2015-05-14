/**
 * Created by staloverov on 14.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject'],
    function(UObject){
        var NodeProperties = UObject.extend({

            className: "NodeProperties",
            classGuid: UCCELLO_CONFIG.classGuids.NodeProperties,
            //metaFields: [
            //    {fname:"Name",ftype:"string"},
            //    {fname:"State",ftype:"string"},
            //    {fname:"TokenID",ftype:"string"},
            //    {fname:"ProcessID",ftype:"string"}
            //],
            ///* Todo : Необходимо сохраннять коллекцию параметров */
            //metaCols: [],

            init: function(cm, params){
                if (!params) {params = {}};
                this._super(cm,params);

                this.parameters = [];
                this.requests = [];
                this.responses = [];
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
            },

            addRequest : function(request) {
                this.requests.push(request)
            },

            clearResponses : function() {
                this.responses.length = 0;
            },

            isAllResponseReceived : function() {
                return this.requests.length == this.responses.length;
            },

            clone : function() {
                var _newProp = new NodeProperties(this.pvt.controlMgr);
                _newProp.name = this.name;
                for (var i = 0; i < this.parameters.length; i++) {
                    _newProp.addParameter(this.parameters[i].clone());
                }

                for (var i = 0; i < this.requests.length; i++) {
                    _newProp.addRequest(this.requests[i]);
                }

                for (var i = 0; i < this.responses.length; i++) {
                    _newProp.addRequest(this.responses[i]);
                }

                return _newProp;
            }

        });

        return NodeProperties;
    }
)

