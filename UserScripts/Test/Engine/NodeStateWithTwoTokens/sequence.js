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

            execScript: function (params) {
                if (this.scriptObject) {
                    var _param = this.scriptObject.processFacade.findParameter('count')
                    var _result;
                    if (_param) {
                        _result = (_param.value() > params.minValue) && (_param.value() < params.maxValue);
                    } else {
                        _result = false;
                    }
                    console.log('[%s]:[%s] = [%s]', this.scriptObject.processFacade.currentToken().tokenID(), this.scriptObject.subject.name(), _result);

                    this.scriptObject.returnResult(_result);
                } else {
                    throw 'scriptObject не определен'
                }
            }
        });
    }
)
