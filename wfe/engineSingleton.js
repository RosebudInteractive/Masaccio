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
            var params = {ini: sobj, parent: parent.obj, colName: parent.colName, isDeserialize : true};
            var constr = _instance.constructHolder.getComponent(typeObj.getGuid()).constr;
            var _obj = new constr(_instance.getControlManager(), params);
            return _obj
        };

        _instance.createComponentFunction = createComponent;

        var Controls = require('./controls');
        Controls.register(_instance.constructHolder);

        var _Initializer = require('./EngineTools/engineInitializer');
        _Initializer.registerTypes(_instance.controlManager);
        _Initializer.registerTypeProvider(_instance.controlManager, _instance.constructHolder, initParams.rpc)
    },

    getInstance : function () {
        return _instance;
    }
}


if (module) { module.exports = Singleton };