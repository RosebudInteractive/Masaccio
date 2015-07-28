/**
 * Created by staloverov on 27.07.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        './event',
        './../controls'],
    function(Event, Controls){
        var MessageThrowEvent = Event.extend({

            className: 'MessageThrowEvent',
            classGuid: Controls.guidOf('MessageThrowEvent'),
            metaFields : [
                {
                    fname : 'OutgoingMessage',
                    ftype : {
                        type : 'ref',
                        res_elem_type : Controls.guidOf('MessageFlow')
                    }
                }
            ],

            execute : function(callback) {

            }

        });

        return MessageThrowEvent;
    }
);
