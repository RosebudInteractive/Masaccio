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
        './../parameter',
        './../controls',
        './../engineSingleton'
    ],
    function(
        Activity,
        FlowNode,
        ScriptObject,
        Utils,
        Parameter,
        Controls,
        EngineSingleton
    ){
        var ScriptTask = Activity.extend({

            className: "ScriptTask",
            classGuid: Controls.guidOf('ScriptTask'),
            metaFields: [
                {
                    fname: 'Script',
                    ftype: {
                        type: 'ref',
                        res_elem_type: Controls.guidOf('UserScript')
                    }
                }
            ],
            //metaCols: [
            //    {'cname' : 'Scripts', 'ctype' : 'UserScript'}
            //],

            init: function(cm, params, script){
                UccelloClass.super.apply(this, [cm, params]);

                if (!params) {return}

                if (script) {
                    this.setUserScript(script);
                }
            },

            getRoot : function() {
                return this.getParent().getRoot();
            },
            //scripts : function() {
            //    return this.getCol('Scripts');
            //},

            script: function(value) {
                return this._genericSetter('Script', value);
            },

            setUserScript : function(script) {
                this.script(this.getRoot().getOrCreateScript(script));

                //if (!this.script()) {
                //    this.script(new UserScript(this.getControlManager(), {parent : this.getParent(), colName : 'Scripts'}))
                //}
                //
                //this.script().parse(script);
            },

            createInstance : function(cm, params){
                return new ScriptTask(cm, params);
            },

            assign : function(source){
                UccelloClass.super.apply(this, [source]);

                if (source.hasScript()) {
                    var _script = source.script().asSimpleObject();
                    this.script(this.getRoot().getOrCreateScript(_script));
                }
            },

            createScriptObject : function(callback) {
                var _scriptObject = new ScriptObject(this.processInstance());

                _scriptObject.moduleName = this.script().moduleName();
                _scriptObject.methodName = this.script().methodName();
                _scriptObject.methodParams = this.script().parameters();
                _scriptObject.subject = this;

                _scriptObject.setCallback(
                    function(subject, result){
                        subject.state(FlowNode.state.ExecutionComplete);
                        subject.processInstance().activate();

                        if ((_scriptObject.response) && (result)) {
                            EngineSingleton.getInstance().responseStorage.executeResponseCallback(_scriptObject.response.ID(), result);
                        }

                        callback();
                    }
                );

                return _scriptObject;
            },

            execute : function(callback) {
                this.processInstance().enqueueCurrentToken();
                this.processInstance().waitScriptAnswer();

                console.log('[%s] : => Выполняется узел [%s]', (new Date()).toLocaleTimeString(), this.name())
                var _scriptObject = this.createScriptObject(callback);
                this.state(FlowNode.state.WaitingUserScriptAnswer);
                Utils.execScript(_scriptObject);
            },

            hasScript : function() {
                return (this.script() ? true : false);
            }
        });

        return ScriptTask;
    }
)