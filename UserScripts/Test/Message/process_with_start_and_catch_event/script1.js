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
                    var _inputParam = this.scriptObject.processFacade.findInputParameter('ProcessID');
                    var _param = this.scriptObject.processFacade.findParameter('ProcessIDFromParent');
                    if (_param && _inputParam) {
                        _param.value(_inputParam.value());
                        Logger.scriptExecuted(module.filename);
                    }
                    this.scriptObject.returnResult(null);
                } else {
                    throw 'scriptObject не определен'
                }
            }
        });
    }
)
