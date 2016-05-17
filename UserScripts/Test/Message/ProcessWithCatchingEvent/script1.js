/**
 * Created by staloverov on 01.06.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(PATH.Uccello + 'system/uccello-class');
}

define(
    [PATH.Masaccio + 'public/logger'],
    function (Logger){
        return UccelloClass.extend({
            init: function () {
                this.scriptObject = null;
            },

            execScript: function () {
                if (this.scriptObject) {
                    var _param = this.scriptObject.response.findParameter('param1');
                    if (_param) {
                        var _node = this.scriptObject.processFacade.findNodeByName('activity');
                        var _nodeParam = _node.findParameter('ParameterForTaskID');
                        _nodeParam.value(_param.value());
                        Logger.scriptExecuted(module.filename);
                    }
                    console.log('[%s] : ES [token %s]->[%s] = [%s]',
                        (new Date()).toLocaleTimeString(),
                        this.scriptObject.processFacade.currentToken().tokenId(),
                        this.scriptObject.processFacade.currentToken().currentNode().name(),
                        _param.value());
                    this.scriptObject.returnResult(null);
                } else {
                    throw 'scriptObject не определен'
                }
            }
        });
    }
)
