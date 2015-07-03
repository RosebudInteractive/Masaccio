/**
 * Created by staloverov on 30.03.2015.
 */
var Utils = {};

Utils.copyObject = function(obj)
{
    var copy = {};
    for (var key in obj)
    {
        copy[key] = obj[key];
    }
    return copy;
};

Utils.copyArray = function(array)
{
    var copy = [];
    for (var i=0, l=array.length; i<l; i++)
    {
        if (array[i] && typeof array[i] == "object")
            copy[i] = this.copyObject( array[i] );
        else
            copy[i] = array[i];
    }
    return copy;
};

Utils.copyCollection = function(source, dest)
{
    //var copy = [];
    for (var i = 0, l = source.count(); i < l; i++)
    {
        if (source.get(i) && typeof source.get(i) == "object")
            dest._add(this.copyObject(source.get(i)));
        else
            dest._add(source.get(i));
    }
};

Utils.deepCopy = function (obj) {
    if (typeof obj !== "object" || !obj)
        return obj;
    var cons = obj.constructor;
    if (cons === RegExp)
        return obj;

    var copy = cons();
    for (var key in obj) {
        if (typeof obj[key] === "object") {
            copy[key] = Utils.deepCopy(obj[key]);
        } else {
            if ((obj[key] !== undefined) && ((typeof obj[key] !== "function"))) {
                copy[key] = obj[key]
            };
        }
    }
    return copy;
};


Utils.execScript = function(scriptObject) {
    var Script = require(UCCELLO_CONFIG.wfe.scriptsPath + scriptObject.moduleName);
    if (Script) {
        var _instance = new Script();
        _instance.scriptObject = scriptObject;
        if ((!scriptObject.methodParams) || (scriptObject.methodParams.count() == 0)) {
            setTimeout(function() {
                _instance[scriptObject.methodName]()
            }, 0);
        } else {
            var _params = {};
            for (var i = 0; i < scriptObject.methodParams.count(); i++) {
                _params[scriptObject.methodParams.get(i).name()] = scriptObject.methodParams.get(i).value()
            }

            setTimeout(function() {
                _instance[scriptObject.methodName](_params)
            }, 0)
        }
    }
}

if (module) { module.exports = Utils}