/**
 * Created by staloverov on 28.03.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject', './processDefinition', UCCELLO_CONFIG.uccelloPath + 'system/utils', ],
    function(UObject, Definition, UUtils){
        var Process = UObject.extend({

            className: "Process",
            classGuid: UCCELLO_CONFIG.classGuids.Process,
            metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            //processID : "",
            definition : null,
            tokens : [],

            currentTokenID : 0,
            states : {Initialized : 0, Running : 1, Finished : 2, Aborted : 3, Waiting : 4, None : 5},

            init: function(cm, params, definition){
                this._super(cm,params);

                this.processID = UUtils.guid();
                this.definition = definition.clone();
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

            isTokenInGueue : function(token) {
                for (var i in this.tokens) {
                    if (!this.tokens.hasOwnProperty(i)) continue;

                    if (this.tokens[i].tokenID == token.tokenID) return true;
                };

                return false;
            },

            enqueueToken : function(token) {

                if (!this.isTokenInGueue(token)){
                    token.tokenID = ++this.currentTokenID;
                    this.tokens.push(token);
                }
            },

            dequeueToken : function() {
                return this.tokens.splice(0, 1)[0];
            }
        });

        return Process;
    }
)
