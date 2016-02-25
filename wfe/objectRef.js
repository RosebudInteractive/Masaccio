/**
 * Created by staloverov on 16.10.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        './controls'
    ], function(
        UObject,
        Controls
    ) {
        var ObjectRef = UObject.extend({
            className: "ObjectRef",
            classGuid: Controls.guidOf('ObjectRef'),
            metaFields: [
                {
                    fname: 'Object',
                    ftype: {
                        type: 'ref',
                        res_elem_type: UCCELLO_CONFIG.classGuids.UObject
                    }
                }
            ],

            object : function(value) {
                return this._genericSetter('Object', value);
            }
        });

        return ObjectRef;
    }
);