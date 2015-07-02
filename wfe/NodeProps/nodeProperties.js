/**
 * Created by staloverov on 14.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    //var Class = require('class.extend');
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject'],
    function(UObject){
        var NodeProperties = UObject.extend({

            //region Class description
            className: "NodeProperties",
            classGuid: UCCELLO_CONFIG.classGuids.NodeProperties,
            metaFields: [
                {fname : "Name", ftype : "string"},
                {fname : "TokenID", ftype : "string"},
                {fname : "ProcessID", ftype : "string"}
            ],
            metaCols: [
                {'cname' : 'Parameters', 'ctype' : 'Parameter'},
                {'cname' : 'Requests', 'ctype' : 'Request'},
                {'cname' : 'Responses', 'ctype' : 'Request'},
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
                    this.responses()._del(i);
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
            }

        });

        return NodeProperties;
    }
)

