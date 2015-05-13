/**
 * Created by staloverov on 28.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

var processStates = {Initialized : 0, Running : 1, Finished : 2, Aborted : 3, Waiting : 4, None : 5};

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        './processDefinition',
        UCCELLO_CONFIG.uccelloPath + 'system/utils'
    ],
    function(
        UObject,
        Definition,
        UUtils
    ){
        var Process = UObject.extend({

            className: "Process",
            classGuid: UCCELLO_CONFIG.classGuids.Process,
            metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            tokens : [],

            sequenceValue : 0,
            currentToken : null,

            init: function(cm, params, definition){
                this._super(cm,params);

                this.processID = UUtils.guid();
                this.definition = definition.clone();
                this.tokenQueue = [];
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            },

            getStartNode : function() {
                for (var i in this.definition.nodes){
                    if (!this.definition.nodes.hasOwnProperty(i)) continue;

                    if (this.definition.nodes[i].incoming.length == 0)
                        return this.definition.nodes[i];
                }
            },

            isTokenInQueue : function(token) {
                for (var i in this.tokens) {
                    if (!this.tokens.hasOwnProperty(i)) continue;

                    if (this.tokens[i].tokenID == token.tokenID) return true;
                };

                return false;
            },

            getToken : function(tokenID) {
                for (var i =0; i < this.tokens.length; i++) {
                    if (this.tokens[i].tokenID == tokenID) {return this.tokens[i]}
                };

                return null;
            },

            enqueueToken : function(token) {

                if (!this.isTokenInQueue(token)){
                    token.tokenID = ++this.sequenceValue;
                    this.tokens.push(token);
                }

                this.tokenQueue.push(token);
            },

            dequeueToken : function() {
                if (this.tokenQueue.length != 0) {
                    return this.tokenQueue.splice(0, 1)[0];
                }
                else {return null};
            },

            getNodeTokens : function(node) {
                var _nodeTokens = [];
                for (var i = 0; this.tokens.length; i++) {
                    if (this.tokens[i].currentNode == node) {
                        _nodeTokens.push(this.tokens[i])
                    }
                }

                return _nodeTokens;
            },

            isAllTokensDead : function() {
                for (var i = 0; this.tokens.length; i++) {
                    if (this.tokens[i].state == 0) {
                        return false;
                    }
                }
            }
        });

        return Process;
    }
)

module.exports.state = processStates;
