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
                    // Найдем параметр процесса с именем 'param1' - это наш счетчик
                    var _param = this.scriptObject.processFacade.findParameter('param1')
                    if (_param) {
                        // Доступ к респонсу можно получить this.scriptObject.response
                        _param.value(_param.value() + 1);
                    }
                    console.log('[token %s]->[%s] = [%s]', this.scriptObject.processFacade.currentToken().tokenID(), this.scriptObject.processFacade.currentToken().currentNode().name(), _param.value());
                    this.scriptObject.returnResult(null);
                } else {
                    throw 'scriptObject не определен'
                }
            }
        });
    }
)
