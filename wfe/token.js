/**
 * Created by staloverov on 09.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject',],
    function(UObject){
        var Token = UObject.extend({

            className: "Token",
            classGuid: UCCELLO_CONFIG.classGuids.Token,
            metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            metaCols: [],

            tokenID : "",
            currentNode : null,

            /*Todo : пока заготовка на будующее, вложенность токен пока не используется*/
            parentToken : null,
            childTokens : [],

            states : {alive : 0, dead : 1},
            processInstance : null,

            init: function(cm, params, processInstance){
                this._super(cm,params);
                this.processInstance = processInstance;
            },

            name: function(value) {
                return this._genericSetter("Name",value);
            },

            state: function(value) {
                return this._genericSetter("State",value);
            }
        });

        return Token;
    }
)

