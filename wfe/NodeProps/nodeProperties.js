/**
 * Created by staloverov on 14.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    //var Class = require('class.extend');
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', './../controls'],
    function(UObject, Controls){
        var NodeProperties = UObject.extend({

            //region Class description
            className: "NodeProperties",
            classGuid: Controls.guidOf('NodeProperties'),
            metaFields: [
                {fname : "Name", ftype : "string"},
                {fname : "TokenID", ftype : "string"},
                {fname : "ProcessID", ftype : "string"}
            ],
            metaCols: [
                {'cname' : 'Parameters', 'ctype' : 'WfeParameter'},
                {'cname' : 'Requests', 'ctype' : 'Request'},
                {'cname' : 'Responses', 'ctype' : 'Request'}
            ],
            //endregion

            init: function(cm, params){
                UccelloClass.super.apply(this, [cm, params]);
                if (!params) { return }
            },

            //<editor-fold desc="MetaFields & MetaCols">
            name: function(value) {
                return this._genericSetter("Name",value);
            },

            tokenID: function(value) {
                return this._genericSetter("TokenID",value);
            },

            processID: function(value) {
                return this._genericSetter("ProcessID",value);
            },

            parameters : function() {
                return this.getCol('Parameters');
            },

            requests : function() {
                return this.getCol('Requests');
            },

            responses : function() {
                return this.getCol('Responses');
            },
            //</editor-fold>

            addParameter : function(parameter){
                this.parameters()._add(parameter);
            },

            addRequest : function(request) {
                this.requests()._add(request)
            },

            addResponse : function(response) {
                this.responses()._add(response)
            },

            clearResponses : function() {
                for (var i = this.responses().count() - 1; i >= 0; i--){
                    var _response = this.responses().get(i);
                    this.responses()._del(_response);
                }
            },

            isAllResponseReceived : function() {
                return this.requests().count() == this.responses().count();
            },

            clone : function(cm, params) {
                var _newProp = new NodeProperties(cm, params);
                _newProp.name(this.name);
                for (var i = 0; i < this.parameters().count(); i++) {
                    this.parameters().get(i).clone(cm, {parent  : _newProp, colName : 'Parameters'});
                }

                for (var i = 0; i < this.requests().count(); i++) {
                    _newProp.addRequest(this.requests().get(i));
                }

                for (var i = 0; i < this.responses().count(); i++) {
                    _newProp.addRequest(this.responses().get(i));
                }

                return _newProp;
            },

            getParent : function() {
                return this.pvt.parent;
            },

            getControlManager : function() {
                return this.getParent().getControlManager();
            },

            findParameter : function(parameterName) {
                for (var i = 0; i < this.parameters().count(); i++) {
                    if (this.parameters().get(i).name() == parameterName) {
                        return this.parameters().get(i)
                    }

                }
                return null;
            },

            findRequest : function(requestID) {
                for (var i = 0; i < this.requests().count(); i++) {
                    if (this.requests().get(i).ID() == requestID) {
                        return this.requests().get(i)
                    }

                }
                return null;

            },

            deleteRequest : function(request) {
                this.requests()._del(request)
            },

            findResponse : function(responseID) {
                for (var i = 0; i < this.responses().count(); i++) {
                    if (this.responses().get(i).ID() == responseID) {
                        return this.responses().get(i)
                    }

                }
                return null;
            },

            deleteResponse : function(response) {
                this.responses()._del(response)
            }
        });

        return NodeProperties;
    }
)

