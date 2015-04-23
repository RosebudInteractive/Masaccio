/**
 * Created by staloverov on 14.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

var requestState = {Exposed : 0, Acquire : 1, Canceled : 2, ResponseReceived : 3};

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', '../public/utils', UCCELLO_CONFIG.uccelloPath + 'system/utils'],
    function(UObject, Utils, UUtils){
        var Request = UObject.extend({

            className: "Request",
            classGuid: UCCELLO_CONFIG.classGuids.Request,
            metaFields: [
                {fname:"Name",ftype:"string"},
                {fname:"State",ftype:"string"},
                {fname:"TokenID",ftype:"string"},
                {fname:"ProcessID",ftype:"string"},
                {fname:"ID", ftype:"string"}
            ],
            /* Todo : Необходимо сохраннять коллекцию параметров */
            metaCols: [],

            init: function(cm, params){
                this._super(cm,params);

                this.state = requestState.Exposed;
                this.ID = UUtils.guid();
                this.parameters = [];
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

            ID: function(value) {
                return this._genericSetter("ID",value);
            },

            addParameter : function(parameterName){
                this.parameters.push({name : parameterName, value : ''});
            },

            clone : function() {
                var _newRequest = new Request(this.pvt.controlMgr);

                _newRequest.name = this.name;
                _newRequest.processID = this.processID;
                _newRequest.tokenID = this.tokenID;
                _newRequest.parameters = Utils.copyArray(this.parameters);

                return _newRequest;
            }

        });

        return Request;
    }
)

module.exports.state = requestState;

