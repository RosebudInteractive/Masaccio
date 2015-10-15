/**
 * Created by staloverov on 17.09.2015.
 */

var StartNone = require('./Start/startEvent');
var StartMessage = require('./Start/messageStartEvent');
var MessageThrow = require('./Intermediate/messageThrowEvent');
var MessageCatch = require('./Intermediate/messageCatchEvent');
var EndNone = require('./End/endEvent');


var types = {
    start : {
        name: 'start events',
        none: {trigger: 'none', code : 100},
        message: {trigger: 'message', code : 101},
        timer: {trigger: 'timer', code : 102},
        error: {trigger: 'error', code : 103}
    },

    intermediate : {
        name: 'intermediate events',
        catching: {
            name: 'catching',
            message: {trigger: 'message', code : 201},
            timer: {trigger: 'timer', code : 202}
        },

        throwing: {
            name: 'throwing',
            message: {trigger: 'message', code : 221}
        }
    },

    end : {
        name: 'end events',
        none: {trigger: 'none', code : 300},
        message: {trigger: 'message', code : 301},
        error: {trigger: 'error', code : 302}
    }
};

var constructor = {
    getForType : function(eventType) {
        switch (eventType) {
            case types.start.none : return StartNone;
            case types.start.message : return StartMessage;
            case types.intermediate.throwing.message : return MessageThrow;
            case types.intermediate.catching.message : return MessageCatch;
            case types.end.none : return EndNone;
            default : return null;
        }

    }
};

if (module) {
    module.exports.constructor = constructor;
    module.exports.types = types
}
