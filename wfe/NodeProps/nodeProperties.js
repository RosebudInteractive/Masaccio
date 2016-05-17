/**
 * Created by staloverov on 14.04.2015.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject'],
    function(UObject) {
        return class NodeProperties extends UObject {

            get className() {
                return "NodeProperties"
            }

            get classGuid() {
                return UCCELLO_CONFIG.classGuids.NodeProperties
            }

            get metaFields() {
                return [
                    {fname: "Name", ftype: "string"},
                    {fname: "TokenID", ftype: "string"},
                    {fname: "ProcessID", ftype: "string"}
                ]
            }

            get metaCols() {
                return [
                    {'cname': 'Parameters', 'ctype': 'WfeParameter'},
                    {'cname': 'Requests', 'ctype': 'Request'},
                    {'cname': 'Responses', 'ctype': 'Request'}
                ]
            }

            //<editor-fold desc="MetaFields & MetaCols">
            name(value) {
                return this._genericSetter("Name", value);
            }

            tokenId(value) {
                return this._genericSetter("TokenID", value);
            }

            processID(value) {
                return this._genericSetter("ProcessID", value);
            }

            parameters() {
                return this.getCol('Parameters');
            }

            requests() {
                return this.getCol('Requests');
            }

            responses() {
                return this.getCol('Responses');
            }

            //</editor-fold>

            addParameter(parameter) {
                this.parameters()._add(parameter);
            }

            addRequest(request) {
                this.requests()._add(request)
            }

            addResponse(response) {
                this.responses()._add(response)
            }

            clear(){
                this.responses().clear();
                this.requests().clear();
            }

            isAllResponseReceived() {
                return this.requests().count() == this.responses().count();
            }

            clone(cm, params) {
                var _newProp = new NodeProperties(cm, params);
                _newProp.name(this.name);
                for (var i = 0; i < this.parameters().count(); i++) {
                    this.parameters().get(i).clone(cm, {parent: _newProp, colName: 'Parameters'});
                }

                for (var i = 0; i < this.requests().count(); i++) {
                    _newProp.addRequest(this.requests().get(i));
                }

                for (var i = 0; i < this.responses().count(); i++) {
                    _newProp.addRequest(this.responses().get(i));
                }

                return _newProp;
            }

            getParent() {
                return this.pvt.parent;
            }

            getControlManager() {
                return this.getParent().getControlManager();
            }

            findParameter(parameterName) {
                for (var i = 0; i < this.parameters().count(); i++) {
                    if (this.parameters().get(i).name() == parameterName) {
                        return this.parameters().get(i)
                    }

                }
                return null;
            }

            findRequest(requestID) {
                for (var i = 0; i < this.requests().count(); i++) {
                    if (this.requests().get(i).ID() == requestID) {
                        return this.requests().get(i)
                    }

                }
                return null;

            }

            deleteRequest(request) {
                this.requests()._del(request)
            }

            findResponse(responseID) {
                for (var i = 0; i < this.responses().count(); i++) {
                    if (this.responses().get(i).ID() == responseID) {
                        return this.responses().get(i)
                    }

                }
                return null;
            }

            deleteResponse(response) {
                this.responses()._del(response)
            }
        };
    }
);

