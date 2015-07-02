/**
 * Created by staloverov on 01.07.2015.
 */
var ProcessDefinition = require('./processDefinition');
    var FlowNode = require('./flowNode');
    var SequenceFlow = require('./sequenceFlow');
    var Parameter = require('./parameter');
    var Request = require('./request');

var Process = require('./process');
    var Token = require('./token');
    var NodeProps = require('./NodeProps/nodeProperties');

var Register = {
    exec : function(controlManager){
        new Parameter(controlManager);
        new SequenceFlow(controlManager);
        new FlowNode(controlManager);
        new Request(controlManager);
        new ProcessDefinition(controlManager);

        new NodeProps(controlManager);
        new Token(controlManager);
        new Process(controlManager);

    }
}


if (module) {module.exports.exec = Register.exec}