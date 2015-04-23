/**
 * Created by staloverov on 14.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

var assert = require("assert");
var Token = require('./../wfe/token');
var Definition = require('./../wfe/processDefinition');
var Process = require('./../wfe/processDefinition');





describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
        var _def = getTestDefinition();
        var _process =new Process(null, {}, _def);

        defineTokens(_process);
        var _token = _process.dequeueToken();
        _token.currentNode.state = FlowNode.state.Initialized;
        _token.execute();
    })
})

function getTestDefinition() {
    var _definition = new Definition(this.pvt.controlMgr, {});
    _definition.definitionID = "60CAC005-4DBB-4A22-BEB1-1AFAE6604791";
    _definition.name = 'Определение тестового процесса';

    new FlowNode(this.pvt.controlMgr, {});
    var _activity1 = new Activity(this.pvt.controlMgr);
    _activity1.name = "testActivity1";
    var _activity2 = new Activity(this.pvt.controlMgr);
    _activity2.name = "testActivity2";

    _definition.addActivity(_activity1);
    _definition.addActivity(_activity2);
    var _sq = new SequenceFlow(this.pvt.controlMgr);
    _sq.connect(_activity1, _activity2);
    _definition.addConnector(_sq);
    this.addProcessDefinition(_definition);

    return _definition.definitionID;
};

function defineTokens(processInstance) {
    var _token = new Token(null, {}, processInstance);
    _token.currentNode = processInstance.getStartNode();
    _token.state = Token.tokenState.alive;
    processInstance.enqueueToken(_token);
};