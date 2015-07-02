/**
 * Created by staloverov on 18.05.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define([],
    function(){
        var ConditionsResult = Class.extend({

            init: function(){
                this.storage = [];
            },

            findConditionObject : function(conditon) {
                for (var i = 0; i < this.storage.length; i++) {
                    if (this.storage[i].condition == conditon) {
                        return this.storage[i];
                    }
                }
            },

            addResult : function(condition, result) {
                var _obj = this.findConditionObject(condition);
                if (!_obj) {
                    this.storage.push( {condition : condition, result : result} )
                } else {
                    _obj.result = result;
                }
            },

            clearResult : function(condtion) {
                this.addResult(condtion, false)
            },

            getConfirmedNodes : function() {
                var _confirmedNodes = [];
                for (var i = 0; i < this.storage.length; i++) {
                    if (this.storage[i].result) {
                        _confirmedNodes.push(this.storage[i].condition.target())
                    }
                }
                return _confirmedNodes;
            }
        });

        return ConditionsResult;
    }
)

