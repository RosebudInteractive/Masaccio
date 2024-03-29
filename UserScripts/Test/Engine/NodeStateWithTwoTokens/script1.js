/**
 * Created by staloverov on 01.06.2015.
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

            execScript: function () {
                if (this.scriptObject) {
                    var _param = this.scriptObject.processFacade.findParameter('count')
                    if (_param) {
                        _param.value(_param.value() + 1);
                    }
                    console.log('[%s] : ES [token %s]->[%s] = [%s]',
                        (new Date()).toLocaleTimeString(),
                        this.scriptObject.processFacade.currentToken().tokenId(),
                        this.scriptObject.processFacade.currentToken().currentNode().name(),
                        _param.value());
                    this.scriptObject.returnResult({result : 'OK'});
                } else {
                    throw 'scriptObject не определен'
                }
            }
        });
    }
)
