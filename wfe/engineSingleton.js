/**
 * Created by staloverov on 22.04.2015.
 */
var _instance = null;

var Singleton = {
    initInstance : function (initParams) {
        var Engine = require('./engine');
        _instance = new Engine(initParams);
        _instance.constructHolder = initParams.constructHolder;

        var createComponent = function (typeObj, parent, sobj) {
            var params = {ini: sobj, parent: parent.obj, colName: parent.colName};
            var constr = _instance.constructHolder.getComponent(typeObj.getGuid()).constr;
            return new constr(_instance.getControlManager(), params);
        };

        _instance.createComponentFunction = createComponent;
    },

    getInstance : function () {
        return _instance;
    }
}


if (module) { module.exports = Singleton };