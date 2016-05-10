/**
 * Created by staloverov on 09.07.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        UCCELLO_CONFIG.uccelloPath+'system/uobject',
        '../../public/utils',
        './../parameter',
        './../controls'
    ],
    function(
        UObject,
        Utils,
        Parameter,
        Controls
    ){
        var MessageDefinition = UObject.extend({

            //<editor-fold desc="Class description">
            className: "MessageDefinition",
            classGuid : Controls.guidOf('MessageDefinition'),
            metaFields: [
                {fname : 'Name', ftype : 'string'},
                {fname : 'DefinitionID', ftype : 'string'}
            ],
            metaCols: [
                {'cname' : 'Parameters', 'ctype' : 'WfeParameter'}

            ],
            //</editor-fold>

            //<editor-fold desc="MetaFields & MetaCols">
            name: function(value) {
                return this._genericSetter("Name",value);
            },

            definitionID: function(value) {
                return this._genericSetter("DefinitionID",value);
            },

            parameters : function() {
                return this.getCol('Parameters');
            },
            //</editor-fold>

            getControlManager : function() {
                return this.pvt.controlMgr;
            },

            addParameter : function(parameterName) {
                var _param = new Parameter(this.getControlManager(), {parent : this, colName : 'Parameters'});
                _param.name(parameterName);
                return _param;
            },

            clone : function()
            {
                var _newDefinition = new MessageDefinition(this.getControlManager(), {});

                _newDefinition.definitionID = this.definitionID;
                _newDefinition.name(this.name());

                return _newDefinition;
            }
        });

        return MessageDefinition;
    }
);
