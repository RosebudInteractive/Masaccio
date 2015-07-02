/**
 * Created by staloverov on 21.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define([],
    function(){
        var Notifier = Class.extend({

            init: function(){
                this.observers = [];
            },

            registerObserver : function (observer, callback) {
                this.observers.push({observer : observer, callback : callback});
            },

            notify : function (eventParams) {
                this.observers.forEach(function(item, i, arr) {
                    item.callback(eventParams);
                })
            }

        });

        return Notifier;
    }
)


