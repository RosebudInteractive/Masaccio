/**
 * Created by staloverov on 27.07.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        './../flowNode',
        './../controls'],
    function(FlowNode, Controls){
        var Event = FlowNode.extend({

            className: "Event",
            classGuid: Controls.guidOf('Event'),

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
                            //this.processInstance.wait();
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
            }

        });

        return Event;
    }
);
