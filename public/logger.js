var Util = require('util');

var Logger = {};

var handleMessage = function(messageArgs){
    var _message = '';
    if (arguments.length > 1) {
        _message = Util.format.apply(messageArgs, arguments);
    } else {
        _message = messageArgs
    }
    return _message
};

Logger.info = function(message) {
  if (typeof message === 'string') {
      console.log('[%s] : => %s', (new Date()).toLocaleTimeString(), handleMessage.apply(message, arguments));
  } else {
      if ((typeof message === 'object') && (message.hasOwnProperty('message'))) {
          console.log('[%s] : => %s', (new Date()).toLocaleTimeString(), message.message);
      }
      else {
          throw 'undefined message type'
      }
  }
};

Logger.error = function(message) {
    if (typeof message === 'string') {
        console.error('[%s] : => %s', (new Date()).toLocaleTimeString(), handleMessage.apply(message, arguments));
    } else {
        if ((typeof message === 'object') && (message.hasOwnProperty('message'))) {
            console.error('[%s] : => %s', (new Date()).toLocaleTimeString(), message.message);
        }
        else {
            throw 'undefined message type'
        }
    }
};

Logger.scriptExecuted = function(message) {
    var _message = handleMessage.apply(message, arguments);
    console.log('[%s] : => Выполнен скрипт [%s]', (new Date()).toLocaleTimeString(), _message);
};

if (module) {module.exports = Logger}