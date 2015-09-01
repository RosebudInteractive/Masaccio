/**
 * Created by staloverov on 28.08.2015.
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
        var EndEvent = Event.extend({

            className: 'EndEvent',
            classGuid: Controls.guidOf('EndEvent'),

            createInstance : function(cm, params){
                return new EndEvent(cm, params);
            },

            execute : function(callback) {
                UccelloClass.super.apply(this, [callback]);
                this.state(FlowNode.state.ExecutionComplete);
                Logger.info('Произошло завершающее событие [%s]', this.name());

                var that = this;
                setTimeout(function() {
                    EngineSingleton.getInstance().notifyAboutFinish(that.getRoot().processID());
                }, 0);

                this.callExecuteCallBack(callback)
            }
        });

        return EndEvent;
    }
);