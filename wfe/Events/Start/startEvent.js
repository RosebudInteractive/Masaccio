/**
 * Created by staloverov on 27.08.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        './../event',
        './../../flowNode',
        './../../controls',
        './../../../public/logger',
        './../../engineSingleton'
    ],
    function(
        Event,
        FlowNode,
        Controls,
        Logger,
        EngineSingleton
    ){
        var StartEvent = Event.extend({

            className: 'StartEvent',
            classGuid: Controls.guidOf('StartEvent'),
            metaFields : [
                {fname: 'IsInterrupting', ftype: 'boolean'}
            ],

            isInterrupting : function(value) {
                return this._genericSetter('IsInterrupting', value);
            },

            createInstance : function(cm, params){
                return new StartEvent(cm, params);
            },

            execute : function(callback) {
                UccelloClass.super.apply(this, [callback]);
                this.state(FlowNode.state.ExecutionComplete);
                Logger.info('Произошло стартовое событие [%s]', this.name());

                var that = this;
                setTimeout(function () {
                    EngineSingleton.getInstance().notifyAboutStart(that.getRoot().processID());
                }, 0);

                this.callExecuteCallBack(callback)
            }
        });

        return StartEvent;
    }
);
