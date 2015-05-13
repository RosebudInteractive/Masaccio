/**
 * Created by staloverov on 31.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/* Todo : сделано по аналогии с Calypso при рефакторинге подумать */
var ActivityState = {Passive : 0,
    Initializing : 1,
    ProcessingChildSteps : 2,
    ExposingRequests : 3,
    Waiting : 4,
    Executing : 5,
    Transfering : 6,
    Closed : 7,
    Abort : 8}

define(
    ['./../flowNode'],
    function(FlowNode){
        var Activity = FlowNode.extend({

            className: "Activity",
            classGuid: UCCELLO_CONFIG.classGuids.Activity,
            metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            init: function(cm, params){
                this._super(cm);

                //this.incoming = [];
                //this.outgoing = [];
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            execute : function() {
                this.state = FlowNode.state.ExecutionComplete;
                console.log("Выполняется узел %s [%s]", this.name, typeof(this))
            },

            cancel : function() {

            },

            //addOutgoing : function(sequence) {
            //    this.outgoing.push(sequence);
            //},
            //
            //addIncoming : function(sequence) {
            //    this.incoming.push(sequence);
            //},

            getOutgoingNodes : function() {
                var _confirmedOutgoing = [];
                for (var i = 0; i < this.outgoing.length; i++) {
                    var _sequence = this.outgoing[i];
                    if (_sequence.hasCondition()) {
                        if (_sequence.isConditionSatisfied(this.processInstance)) {
                            _confirmedOutgoing.push(_sequence.target)
                        }
                    }
                    else {
                        _confirmedOutgoing.push(_sequence.target)
                    };
                }

                return _confirmedOutgoing;
            }
        });

        return Activity;
    }
)

module.exports.state = ActivityState;