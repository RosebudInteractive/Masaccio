/**
 * Created by staloverov on 22.04.2015.
 */
var _instance = null;

var Singleton = {};
Singleton.setInstance = function (engine) {
    _instance = engine;
};

Singleton.getInstance = function() {
    return _instance;
};

if (module) { module.exports = Singleton };