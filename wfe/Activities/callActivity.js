/**
 * Created by staloverov on 31.08.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        './activity',
        './../flowNode',
        './../controls',
        './../engineSingleton',
        './../../public/logger'
    ],
    function(
        Activity,
        FlowNode,
        Controls,
        EngineSingleton,
        Logger
    ){
        var CallActivity = Activity.extend({

            className: "CallActivity",
            classGuid: Controls.guidOf('CallActivity'),
            metaFields: [
                {fname: 'DefinitionID', ftype: 'string'}
            ],

            init: function(cm, params, definitionID) {
                UccelloClass.super.apply(this, [cm, params]);

                if (!params) {
                    return
                }

                this.definitionID(definitionID);
            },

            definitionID : function(value) {
                return this._genericSetter('DefinitionID', value);
            },

            createInstance : function(cm, params){
                return new CallActivity(cm, params);
            },

            assign : function(source){
                UccelloClass.super.apply(this, [source]);
                this.definitionID(source.definitionID());
            },

            execute : function(callback) {
                this.processInstance().enqueueCurrentToken();
                this.processInstance().waitScriptAnswer();
                this.state(FlowNode.state.WaitingRequest);
                Logger.info('Запускается подпроцесс [%s]', this.definitionID());

                var that = this;
                var _startCallback = function() {
                    that.state(FlowNode.state.WaitingRequest);
                    that.callExecuteCallBack(callback);
                };

                var _endCallback = function() {
                    that.state(FlowNode.state.ExecutionComplete);
                    that.processInstance().activate();
                    that.callExecuteCallBack(callback);
                };

                EngineSingleton.getInstance().startSubProcess(this.definitionID(), _startCallback, _endCallback);
                this.callExecuteCallBack(callback);
            }
        });

        return CallActivity;
    }
);