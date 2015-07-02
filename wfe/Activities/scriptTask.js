/**
 * Created by staloverov on 22.05.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    //var Class = require('class.extend');
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        './activity',
        './../flowNode',
        './../scriptObject',
        './../../public/utils',
        './../parameter'],
    function(
        Activity,
        FlowNode,
        ScriptObject,
        Utils,
        Parameter
    ){
        var ScriptTask = Activity.extend({

            className: "ScriptTask",
            classGuid: UCCELLO_CONFIG.classGuids.ScriptTask,
            metaFields: [
                {fname : 'ScriptName',      ftype : 'string'},
                {fname : 'ScriptMethod',    ftype : 'string'}

            ],
            metaCols: [
                {'cname' : 'ScriptParams', 'ctype' : 'Parameter'}
            ],

            init: function(cm, params, script){
                UccelloClass.super.apply(this, [cm, params]);

                if (script) {
                    this.setUserScript(script);
                }
            },

            scriptName: function(value) {
                return this._genericSetter("ScriptName",value);
            },

            scriptMethod: function(value) {
                return this._genericSetter("ScriptMethod",value);
            },

            scriptParams : function(){
                return this.getCol('ScriptParams');
            },

            setUserScript : function(script) {
                if (script.hasOwnProperty('moduleName')) {
                    this.scriptName(script.moduleName);
                };

                if (script.hasOwnProperty('methodName')) {
                    this.scriptMethod(script.methodName);
                };

                if (script.hasOwnProperty('methodParams')) {
                    for (param in script.methodParams) {
                        var _param = new Parameter(this.getControlManager(), {parent : this, colName : 'ScriptParams'});
                        _param.name(param);
                        _param.value(script.methodParams[param]);
                    }
                }
            },

            createInstance : function(cm, params){
                return new ScriptTask(cm, params);
            },

            assign : function(source, controlManager){
                UccelloClass.super.apply(this, [source, controlManager]);

                this.scriptName(source.scriptName());
                this.scriptMethod(source.scriptMethod());
                Utils.copyCollection(source.scriptParams(), this.scriptParams());
            },

            createScriptObject : function(callback) {
                var _scriptObject = new ScriptObject(this.processInstance());
                _scriptObject.moduleName = this.scriptName();
                _scriptObject.methodName = this.scriptMethod();
                _scriptObject.methodParams = this.scriptParams();
                _scriptObject.subject = this;

                _scriptObject.setCallback(
                    function(subject, result){
                        subject.state(FlowNode.state.ExecutionComplete);
                        subject.processInstance().activate();
                        callback();
                    }
                )

                return _scriptObject;
            },

            execute : function(callback) {
                this.processInstance().enqueueCurrentToken();
                this.processInstance().waitScriptAnswer();

                console.log('[%s] : => Выполняется узел [%s]', (new Date()).toLocaleTimeString(), this.name())
                var _scriptObject = this.createScriptObject(callback);
                this.state(FlowNode.state.WaitingUserScriptAnswer);
                Utils.execScript(_scriptObject);
            }
        });

        return ScriptTask;
    }
)