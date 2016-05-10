/**
 * Created by staloverov on 14.04.2015.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    // var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
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
        './Task/taskRequestParameter',
        './engineSingleton'
    ],
    function(UObject, Utils, UUtils, Parameter, Controls, TaskRequestParameter, EngineSingleton){
        return class Request extends UObject {

            get className() {
                return "Request"
            }

            get classGuid() {
                return UCCELLO_CONFIG.classGuids.Request
            }

            get metaFields() {
                return [
                    {fname: "Name", ftype: "string"},
                    {fname: "State", ftype: "integer"},
                    {fname: "TokenID", ftype: "string"},
                    {fname: "ProcessID", ftype: "string"},
                    {fname: "ID", ftype: "string"},
                    {fname: 'ResponseID', ftype: 'string'},
                    {fname: 'IsService', ftype: 'boolean'}
                ]
            }

            get metaCols() {
                return [
                    {'cname': 'Parameters', 'ctype': 'WfeParameter'},
                    {'cname': 'TaskParameters', 'ctype': 'TaskRequestParameter'}
                ]
            }

            constructor(cm, params) {
                super(cm, params);

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
                    new TaskRequestParameter(cm, {parent: this, colName: 'TaskParameters'});
                }
            }

            //<editor-fold desc="MetaFields & MetaCols">
            name(value) {
                return this._genericSetter("Name", value);
            }

            state(value) {
                return this._genericSetter("State", value);
            }

            tokenID(value) {
                return this._genericSetter("TokenID", value);
            }

            processID(value) {
                return this._genericSetter("ProcessID", value);
            }

            ID(value) {
                return this._genericSetter("ID", value);
            }

            responseID(value) {
                return this._genericSetter("ResponseID", value);
            }

            isService(value) {
                return this._genericSetter("IsService", value);
            }

            parameters() {
                return this.getCol('Parameters');
            }

            taskParams() {
                return this.getCol('TaskParameters').get(0);
            }
            //</editor-fold>

            addParameter(parameterName) {
                var _param = new Parameter(this.getControlManager(), {parent: this, colName: 'Parameters'});
                _param.name(parameterName);
                _param.value(null);

                return _param;
            }

            getControlManager() {
                return this.getParent().getControlManager();
            }

            clone(cm, params) {
                var _newRequest = new Request(cm, params);

                _newRequest.name(this.name());
                _newRequest.processID(this.processID());
                _newRequest.tokenID(this.tokenID());
                _newRequest.isService(this.isService());
                _newRequest.taskParams().copy(this.taskParams());
                Utils.copyCollection(this.parameters(), _newRequest.parameters());

                return _newRequest;
            }

            createResponse(root) {
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
            }

            getParamsForMessage() {
                var _params = {};
                for (var i = 0; i < this.parameters().count(); i++) {
                    _params[this.parameters().get(i).name()] = this.parameters().get(i).value();
                }

                return _params;
            }

            getSerializedTaskParams() {
                var _db = this.pvt.db ? this.pvt.db : this.getRoot().pvt.db;
                return _db.serialize(this.taskParams(), true)
            }

            fillParams(paramsObject) {
                for (var _prop in paramsObject) {
                    if (!paramsObject.hasOwnProperty(_prop)) continue;

                    if (_prop == 'taskParams') {
                        this._setTaskParams(paramsObject[_prop])
                    } else {
                        this._setWfeParamValue(_prop, paramsObject[_prop])
                    }
                }


                if (paramsObject.hasOwnProperty('selectedNode')) {
                    this.taskParams().selectedNode(paramsObject['selectedNode'])
                }
            }

            _setWfeParamValue(key, value) {
                var _param = this.findParameter(key);
                if (_param) {
                    _param.value(value)
                }
            }

            _setTaskParams(serializedTaskParams) {
                this._clearTaskParamsGarbage();
                
                var _db = this.pvt.db ? this.pvt.db : this.getRoot().pvt.db;
                _db.deserialize(serializedTaskParams, {obj: this, colName: 'TaskParameters'}, EngineSingleton.getInstance().createComponentFunction);
                
                var _answer = this.getCol('TaskParameters').get(1);

                this.taskParams().selectedNode(_answer. selectedNode()) 
            }

            _clearTaskParamsGarbage() {
                for (var i = this.getCol('TaskParameters').count() - 1; i > 0; i--) {
                    var _obj = this.getCol('TaskParameters').get(i);
                    this.getCol('TaskParameters')._del(_obj);
                }
            }

            findParameter(parameterName) {
                for (var i = 0; i < this.parameters().count(); i++) {
                    if (this.parameters().get(i).name() == parameterName) {
                        return this.parameters().get(i)
                    }

                }
                return null;
            }

            cancel() {
                this.state(requestState.Canceled);
            }

            responseReceived() {
                this.state(requestState.ResponseReceived);
            }

            hasReceivedResponse() {
                return (this.state() == requestState.ResponseReceived) && !(!this.responseID())
            }

            isActive() {
                return !((this.state() == requestState.Canceled) || (this.state() == requestState.ResponseReceived))
            }
        };
    }
);

module.exports.state = requestState;

