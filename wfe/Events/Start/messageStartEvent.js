/**
 * Created by staloverov on 16.09.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        './../Start/startEvent',
        './../../flowNode',
        './../../controls',
        './../../../public/logger'
    ],
    function(
        StartEvent,
        FlowNode,
        Controls,
        Logger
    ){
        var MessageStartEvent = StartEvent.extend({
            className: 'MessageStartEvent',
            classGuid: Controls.guidOf('MessageStartEvent'),
            metaFields : [
                {
                    fname : 'IncomingMessage',
                    ftype : {
                        type : 'ref',
                        res_elem_type : Controls.guidOf('MessageFlow')
                    }
                },
                {
                    fname : 'IncomingInstance',
                    ftype : {
                        type: 'ref',
                        external: true,
                        res_type: Controls.guidOf('MessageInstance'),
                        res_elem_type: Controls.guidOf('MessageInstance')
                    }
                }
            ],

            incomingMessage: function(value) {
                 return this._genericSetter('IncomingMessage', value);
             },

            incomingInstance: function(value) {
                 return this._genericSetter('IncomingInstance', value);
             },

            createInstance : function(cm, params){
                return new MessageStartEvent(cm, params);
            },

            execute : function(callback) {
                if (this.incomingInstance()) {
                    /*
                    *  Пока сделал что не анализируется какое сообщение пришло, то есть проверяется только ProcessName и NodeName
                    *  Процесс запускается и копирует параметры из корреляционного набора
                    */
                    if (!this.processInstance()) {
                        Logger.info('У узла нет родительского процесса');
                        throw 'Error'
                    }

                    for (var i = 0; i < this.processInstance().inputParameters().count(); i++) {
                        var _inputParam = this.processInstance().inputParameters().get(i);
                        var _param = this.incomingInstance().correlationKeyInstance().getProperty(_inputParam.name());

                        if (_param) {
                            _inputParam.value(_param.value())
                        }
                    }

                    this.completeExecution();
                }

                /*
                *   Что делать если при запуске процесса вдруг не оказалось сообщения???
                */
                this.callExecuteCallBack(callback)
            },

            canStartProcess : function() {
                return true
            },

            assign : function(source){
                UccelloClass.super.apply(this, [source]);
                this.incomingInstance(source.incomingInstance());
            }
        });

        return MessageStartEvent;
    }
);