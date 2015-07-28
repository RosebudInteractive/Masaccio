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
        var MessageCatchEvent = Event.extend({

            className: 'MessageCatchEvent',
            classGuid: Controls.guidOf('MessageCatchEvent')

        });

        return MessageCatchEvent;
    }
);
