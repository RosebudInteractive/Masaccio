/**
 * Created by staloverov on 14.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

var requestState = {
    Exposed : 0,
    Acquire : 1,
    Canceled : 2,
    ResponseReceived : 3
};

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        '../public/utils',
        UCCELLO_CONFIG.uccelloPath + 'system/utils',
        './parameter'],
    function(UObject, Utils, UUtils, Parameter){
        var Request = UObject.extend({

            //<editor-fold desc="Class description">
            className: "Request",
            classGuid: UCCELLO_CONFIG.classGuids.Request,
            metaFields: [
                {fname:"Name",ftype:"string"},
                {fname:"State",ftype:"integer"},
                {fname:"TokenID",ftype:"string"},
                {fname:"ProcessID",ftype:"string"},
                {fname:"ID", ftype:"string"}
            ],
            metaCols: [
                {'cname' : 'Parameters', 'ctype' : 'Parameter'}
            ],
            //</editor-fold>

            //init: function(root, params){
            init: function(cm, params){
                if (!params) {
                    throw 'не указан params Request'
                }

                UccelloClass.super.apply(this, [cm, params]);

                //if (!params) {
                //    params = {
                //        parent  : root,
                //        colName : 'Requests'
                //    }
                //}
                //UccelloClass.super.apply(this, [root.getControlManager(), params]);

                this.state(requestState.Exposed);
                this.ID(UUtils.guid());
            },

            //<editor-fold desc="MetaFields & MetaCols">
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

            parameters : function() {
                return this.getCol('Parameters');
            },
            //</editor-fold>

            addParameter : function(parameterName){
                var _param = new Parameter(this.getControlManager(), {parent : this, colName : 'Parameters'});
                _param.name(parameterName);
                _param.value(null);
            },

            getControlManager : function(){
                return this.getParent().getControlManager();
            },

            clone : function(cm, params) {
                //var _newRequest = new Request(root.getControlManager(), {parent : root, colName : 'Requests'});
                var _newRequest = new Request(cm, params);

                _newRequest.name(this.name());
                _newRequest.processID(this.processID());
                _newRequest.tokenID(this.tokenID());
                Utils.copyCollection(this.parameters(), _newRequest.parameters());

                return _newRequest;
            },

            createResponse : function(root) {
                var _response = new Request(root.getControlManager(), {parent : root, colName : 'Responses'});

                _response.name(this.name());
                _response.processID(this.processID());
                _response.tokenID(this.tokenID());
                Utils.copyCollection(this.parameters(), _response.parameters());

                return _response;
            }

        });

        return Request;
    }
);

module.exports.state = requestState;

