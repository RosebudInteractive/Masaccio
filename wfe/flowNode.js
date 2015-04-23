/**
 * Created by staloverov on 30.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

var flowNodeState = {
        Passive : 0, Initialized : 1, Executing : 2, WaitingRequest : 3,
        WaitingTokens : 4, ExecutionComplete : 5, Closed : 6
    };

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject'],
    function(UObject){
        var FlowNode = UObject.extend({

            className: "FlowNode",
            classGuid: UCCELLO_CONFIG.classGuids.FlowNode,
            metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            //incoming : [],
            //outgoing : [],

            init: function(cm, params){
                this._super(cm,params);
                this.parameters = [];
                this.processInstance = null;
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            cancel : function() {

            }
        });

        return FlowNode;
    }
)

module.exports.state = flowNodeState;
