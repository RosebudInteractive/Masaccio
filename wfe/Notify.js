/**
 * Created by staloverov on 21.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject'],
    function(UObject){
        var Notifier = UObject.extend({

            className: "Notifier",
            classGuid: UCCELLO_CONFIG.classGuids.Notifier,
            //metaFields: [
            //    {fname:"Name",ftype:"string"},
            //    {fname:"State",ftype:"string"},
            //    {fname:"TokenID",ftype:"string"},
            //    {fname:"ProcessID",ftype:"string"}
            //],
            ///* Todo : Необходимо сохраннять коллекцию параметров */
            //metaCols: [],

            init: function(cm, params){
                this._super(cm,params);

                //this.state = requestState.Exposed;
                this.observers = [];
            },

            registerObserver : function (observer, callback) {
                this.observers.push({observer : observer, callback : callback});
            },

            notify : function (eventParams) {
                this.observers.forEach(function(item, i, arr) {
                    /* Todo возможно тоже callback нужен*/
                    //item.handleNewRequest(eventParams);
                    item.callback(eventParams);
                })
            }

        });

        return Notifier;
    }
)


