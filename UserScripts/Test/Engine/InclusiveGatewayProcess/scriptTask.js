/**
 * Created by staloverov on 25.05.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [],
    function (){
        var TestScript = Class.extend({
            init : function() {
                this.scriptObject = null;
            },

            execScript : function(params) {
                if (this.scriptObject){
                    console.log(params.message, this.scriptObject.processFacade.currentToken().currentNode().name());

                    var that = this;

                    setTimeout(function() {
                        that.scriptObject.returnResult(null)
                    }, 2000);
                } else {
                    throw 'scriptObject не определен'
                }
            }
        });

        return TestScript;
    }
)
