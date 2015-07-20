/**
 * Created by staloverov on 20.05.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [],
    function(){
        return UccelloClass.extend({

            exec: function (scriptObject) {
                var Script = require(UCCELLO_CONFIG.wfe.scriptsPath + scriptObject.moduleName);
                if (!Script) {
                    var _instance = new Script();
                    _instance.scriptObject = scriptObject.processFacade;
                    _instance[scriptObject.methodName];
                }
            }

        });
    }
)
