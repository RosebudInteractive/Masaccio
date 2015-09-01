/**
 * Created by staloverov on 27.07.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        './../flowNode',
        './../controls',
        './../scriptObject'
    ],
    function(
        FlowNode,
        Controls,
        ScriptObject
    ){
        var Event = FlowNode.extend({

            className: "Event",
            classGuid: Controls.guidOf('Event'),

            metaFields: [
                {
                    fname: 'Script',
                    ftype: {
                        type: 'ref',
                        res_elem_type: Controls.guidOf('UserScript')
                    }
                }
            ],

            script: function(value) {
                return this._genericSetter('Script', value);
            },

            setUserScript : function(script) {
                this.script(this.getRoot().getOrCreateScript(script));
            },

            hasScript : function() {
                return (this.script() ? true : false);
            },

            calcOutgoingNodes: function (callback) {
                if (this.outgoing().count() == 0) {
                    setTimeout(callback(null), 0)
                }

                for (var i = 0; i < this.outgoing().count(); i++) {
                    var _sequence = this.outgoing().get(i);
                    if (_sequence.hasCondition()) {
                        var _scriptObject = this.createSequenceScriptObject(_sequence, callback);

                        this.waitUserScriptAnswer();
                        _sequence.checkConditionSatisfied(_scriptObject);
                    }
                    else {
                        this.conditionsResult.addResult(_sequence, true);
                        _sequence.check();
                        if (this.isAllOutgoingChecked()) {
                            setTimeout(callback(null), 0)
                        }
                    }
                }
            },

            getOutgoingNodes: function () {
                if (!this.isAllOutgoingChecked()) {
                    throw 'Не все исходящие ветви проверены'
                }

                return this.conditionsResult.getConfirmedNodes();
            },

            createScriptObject : function() {
                if (!this.hasScript()) {
                    return null
                }

                var _scriptObject = new ScriptObject(this.processInstance());

                _scriptObject.moduleName = this.script().moduleName();
                _scriptObject.methodName = this.script().methodName();
                _scriptObject.methodParams = this.script().parameters();
                _scriptObject.subject = this;

                return _scriptObject;
            }

        });

        return Event;
    }
);
