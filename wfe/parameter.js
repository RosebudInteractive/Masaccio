/**
 * Created by staloverov on 20.04.2015.
 */
'use strict';

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
    [UCCELLO_CONFIG.uccelloPath+'system/uobject'],
    function(UObject) {
        return class Parameter extends UObject {

            get className() {
                return "WfeParameter"
            }

            get classGuid() {
                return UCCELLO_CONFIG.classGuids.WfeParameter
            }

            get metaFields() {
                return [
                    {fname: "Name", ftype: "string"},
                    {fname: "Value", ftype: "string"}
                ]
            }

            name(value) {
                return this._genericSetter("Name", value);
            }

            value(value) {
                return this._genericSetter("Value", value);
            }

            clone(cm, params) {
                var _newParam = new Parameter(cm, params);
                _newParam.name(this.name());
                _newParam.value(this.value());
                return _newParam;
            }

            addNewCopyTo(parent) {
                return this.clone(parent.getControlManager(), {parent: parent, colName: 'Parameters'})
            }
        }
    }
);

