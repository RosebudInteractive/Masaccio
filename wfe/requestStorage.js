/**
 * Created by staloverov on 23.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject'],
    function(UObject) {
        var RequestStorage = UObject.extend({

                className: "RequestStorage",
                classGuid: UCCELLO_CONFIG.classGuids.RequestStorage,
                //metaFields: [
                //    {fname:"Name",ftype:"string"},
                //    {fname:"State",ftype:"string"},
                //    {fname:"TokenID",ftype:"string"},
                //    {fname:"ProcessID",ftype:"string"},
                //    {fname:"ID", ftype:"string"}
                //],
                /* Todo : Необходимо сохраннять коллекцию параметров */
                metaCols: [],

                init: function (cm, params) {
                    this._super(cm, params);
                    this.storage = [];
                },

                addRequest : function(request, callback){
                    if (!this.isRequestExists(request.ID)){
                        this.storage.push({request : request, callback : callback})
                    }
                },

                getStorageItem : function(requestID){
                    for (var i = 0; i < this.storage.length; i++) {
                        var _item = this.storage[i];

                        if (_item.request.ID == requestID) {return _item}
                    }

                    return null;
                },

                getRequest : function(requestID){
                    var _item = this.getStorageItem(requestID);
                    if (_item !== null) {
                        return _item.request
                    }
                    else {
                        return null;
                    }
                },

                isRequestExists : function(requestID) {
                    return (this.getRequest(requestID) !== null);
                },

                getCallback : function(requestID){
                    var _item = this.getStorageItem(requestID);
                    if (_item !== null) {
                        return _item.callback
                    }
                    else {
                        return null;
                    }
                }

            }
        )

        return RequestStorage;
    }

)

