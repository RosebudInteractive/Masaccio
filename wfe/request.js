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
    ResponseReceived : 3,
    Done : 4
};

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        '../public/utils',
        UCCELLO_CONFIG.uccelloPath + 'system/utils',
        './parameter',
        './controls',
        './Task/taskRequestParameter'
    ],
    function(UObject, Utils, UUtils, Parameter, Controls, TaskParameter){
        var Request = UObject.extend({

            //<editor-fold desc="Class description">
            className: "Request",
            classGuid: Controls.guidOf('Request'),
            metaFields: [
                {fname: "Name", ftype: "string"},
                {fname: "State", ftype: "integer"},
                {fname: "TokenID", ftype: "string"},
                {fname: "ProcessID", ftype: "string"},
                {fname: "ID", ftype: "string"},
                {fname: 'ResponseID', ftype: 'string'},
                {fname: 'IsService', ftype: 'boolean'}
            ],
            metaCols: [
                {'cname': 'Parameters', 'ctype': 'WfeParameter'},
                {'cname': 'TaskParameters', 'ctype': 'TaskRequestParameter'}
            ],
            //</editor-fold>

            init: function (cm, params) {
                UccelloClass.super.apply(this, [cm, params]);
                if (!params) {
                    return
                }

                if (!this.state()) {
                    this.state(requestState.Exposed);
                }
                if (!this.ID()) {
                    this.ID(UUtils.guid());
                }
                if (!this.taskParams()) {
                    new TaskParameter(cm, {parent: this, colName: 'TaskParameters'});
                }
            },

            //<editor-fold desc="MetaFields & MetaCols">
            name: function (value) {
                return this._genericSetter("Name", value);
            },

            state: function (value) {
                return this._genericSetter("State", value);
            },

            tokenID: function (value) {
                return this._genericSetter("TokenID", value);
            },

            processID: function (value) {
                return this._genericSetter("ProcessID", value);
            },

            ID: function (value) {
                return this._genericSetter("ID", value);
            },

            responseID: function (value) {
                return this._genericSetter("ResponseID", value);
            },

            isService: function(value) {
                return this._genericSetter("IsService", value);
            },

            parameters: function () {
                return this.getCol('Parameters');
            },

            taskParams: function () {
                return this.getCol('TaskParameters').get(0);
            },
            //</editor-fold>

            addParameter: function (parameterName) {
                var _param = new Parameter(this.getControlManager(), {parent: this, colName: 'Parameters'});
                _param.name(parameterName);
                _param.value(null);

                return _param;
            },

            getControlManager: function () {
                return this.getParent().getControlManager();
            },

            clone: function (cm, params) {
                var _newRequest = new Request(cm, params);

                _newRequest.name(this.name());
                _newRequest.processID(this.processID());
                _newRequest.tokenID(this.tokenID());
                _newRequest.isService(this.isService());
                _newRequest.taskParams().copy(this.taskParams());
                Utils.copyCollection(this.parameters(), _newRequest.parameters());

                return _newRequest;
            },

            createResponse: function (root) {
                var _response = new Request(root.getControlManager(), {parent: root, colName: 'Responses'});

                _response.name(this.name());
                _response.processID(this.processID());
                _response.tokenID(this.tokenID());
                _response.isService(this.isService());
                Utils.copyCollection(this.parameters(), _response.parameters());
                _response.state(requestState.ResponseReceived);
                this.state(requestState.ResponseReceived);
                this.responseID(_response.ID());

                return _response;
            },

            getParamsForMessage: function () {
                var _params = {};
                for (var i = 0; i < this.parameters().count(); i++) {
                    _params[this.parameters().get(i).name()] = this.parameters().get(i).value();
                }

                return _params;
            },

            fillParams: function (paramsObject) {
                for (var _prop in paramsObject) {
                    if (!paramsObject.hasOwnProperty(_prop)) continue;

                    var _param = this.findParameter(_prop);
                    if (_param) {
                        _param.value(paramsObject[_prop])
                    }
                }


                if (paramsObject.hasOwnProperty('selectedNode')){
                    this.taskParams().selectedNode(paramsObject['selectedNode'])
                }
            },

            findParameter: function (parameterName) {
                for (var i = 0; i < this.parameters().count(); i++) {
                    if (this.parameters().get(i).name() == parameterName) {
                        return this.parameters().get(i)
                    }

                }
                return null;
            },

            cancel: function () {
                this.state(requestState.Canceled);
            },

            responseReceived: function () {
                this.state(requestState.ResponseReceived);
            },

            hasReceivedResponse: function () {
                return (this.state() == requestState.ResponseReceived) && !(!this.responseID())
            },

            isActive: function () {
                return !((this.state() == requestState.Canceled) || (this.state() == requestState.ResponseReceived))
            }
        });

        return Request;
    }
);

module.exports.state = requestState;

