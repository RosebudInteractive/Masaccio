/**
 * Created by staloverov on 18.05.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(PATH.Uccello + 'system/uccello-class');
}

define(
    [],
    function (){
        return UccelloClass.extend({
            init: function () {
                this.scriptObject = null;
            },

            execTest: function (params) {
                if (this.scriptObject) {
                    //var _result = this.scriptObject.processFacade.currentToken.getPropertiesOfNode("UserTask1").parameters[params.paramNumber].value == params.value;
                    var _result = true;
                    var that = this;

                    setTimeout(function () {
                        that.scriptObject.returnResult(_result)
                    }, 0);
                } else {
                    throw 'scriptObject не определен'
                }
            }
        });
    }
)
