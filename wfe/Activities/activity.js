/**
 * Created by staloverov on 31.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    //var Class = require('class.extend');
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

/* Todo : сделано по аналогии с Calypso при рефакторинге подумать */
var ActivityState = {
    Passive : 0,
    Initializing : 1,
    ProcessingChildSteps : 2,
    ExposingRequests : 3,
    Waiting : 4,
    Executing : 5,
    Transferring : 6,
    Closed : 7,
    Abort : 8
}

define(
    ['./../flowNode', './../controls'],
    function(FlowNode, Controls){
        var Activity = FlowNode.extend({

            className: "Activity",
            classGuid: Controls.guidOf('Activity'),

            createInstance : function(cm, params){
                return new Activity(cm, params);
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            execute : function(callback) {
                UccelloClass.super.apply(this, [callback]);
                this.state(FlowNode.state.ExecutionComplete);
                console.log('[%s] : => Выполняется узел [%s]', (new Date()).toLocaleTimeString(), this.name())
                this.callExecuteCallBack(callback)
            },

            cancel : function() {

            },

            calcOutgoingNodes : function(callback) {
                if (this.outgoing().count() == 0) {
                    //this.processInstance.wait();
                    setTimeout(callback(null), 0)
                };

                for (var i = 0; i < this.outgoing().count(); i++) {
                    var _sequence = this.outgoing().get(i);
                    if (_sequence.hasCondition()) {
                        var _scriptObject = this.createSequenceScriptObject(_sequence, callback);

                        this.waitUserScriptAnswer();
                        _sequence.checkConditionSatisfied(_scriptObject);
                    }
                    else {
                        this.conditionsResult.addResult(_sequence, true);
                        _sequence.check();
                        if (this.isAllOutgoingChecked()) {
                            //this.processInstance.wait();
                            setTimeout(callback(null), 0)
                        }
                    };
                }
            },

            getOutgoingNodes : function() {
                if (!this.isAllOutgoingChecked()) {
                    throw 'Не все исходящие ветви проверены'
                };

                return this.conditionsResult.getConfirmedNodes();
            }
        });

        return Activity;
    }
)

module.exports.state = ActivityState;