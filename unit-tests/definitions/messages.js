/**
 * Created by staloverov on 22.07.2015.
 */
var Main = require('./../main');
var EngineSingleton = require(PATH.engine + 'engineSingleton');

var Definitions = {
    simpleMessage : function() {
        var _message = EngineSingleton.getInstance().newMessageDefinition();
        _message.addParameter('TaskID');
        _message.addParameter('TaskName');

        return _message;
    }
};

if (module) {module.exports = Definitions}