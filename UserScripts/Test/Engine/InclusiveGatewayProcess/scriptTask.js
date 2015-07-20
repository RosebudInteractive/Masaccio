/**
 * Created by staloverov on 25.05.2015.
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

            execScript: function (params) {
                if (this.scriptObject) {
                    console.log(params.message, this.scriptObject.processFacade.currentToken().currentNode().name());

                    var that = this;

                    setTimeout(function () {
                        that.scriptObject.returnResult(null)
                    }, 2000);
                } else {
                    throw 'scriptObject не определен'
                }
            }
        });
    }
)
