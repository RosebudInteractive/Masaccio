/**
 * Created by staloverov on 18.05.2015.
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

            execScript: function (params) {
                if (this.scriptObject) {
                    var _param = this.scriptObject.processFacade.findParameter('ProcessID');
                    var _result;
                    if (_param) {
                        _result = (_param.value() > 2);
                    } else {
                        _result = false;
                    }
                    Logger.scriptExecuted('result : ' + _result + ' ' + module.filename);

                    this.scriptObject.returnResult(_result);
                } else {
                    throw 'scriptObject не определен'
                }
            }
        });
    }
)
