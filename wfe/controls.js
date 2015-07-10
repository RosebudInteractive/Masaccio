/**
 * Created by staloverov on 03.07.2015.
 */
var MegaAnswer = 'XXX';

var controls = [
    {className: 'Engine',               component: './engine',                    guid: '387e8d92-e2ca-4a94-9732-b4a479ff8bb8'},
    {className: 'ProcessDefinition',    component: './processDefinition',         guid: 'acd97fff-93f9-47ed-84bb-e24ffdf28fc5'},
    {className: 'Process',              component: './process',                   guid: '74441683-a11f-4b59-9e04-0aefcc5bc18a'},
    {className: 'FlowNode',             component: './flowNode',                  guid: '199a78b0-b555-4f97-9d8f-41234ae7f06f'},
    {className: 'SequenceFlow',         component: './sequenceFlow',              guid: 'c7a6cd70-653f-4e12-b6dc-8a6085b7fc7f'},
    {className: 'NodeProperties',       component: './NodeProps/NodeProperties',  guid: '867a7d2e-8868-48f7-8086-3d2817aec604'},
    /*Activities*/
    {className: 'Activity',             component: './Activities/activity',       guid: '173a2e1f-909d-432d-9255-895f35335f65'},
    {className: 'UserTask',             component: './Activities/userTask',       guid: 'e9af2d49-ef3c-4b9a-b693-36a9f7a5cd4a'},
    {className: 'ScriptTask',           component: './Activities/scriptTask',     guid: 'db02ee41-b89e-4a33-ba60-109008945bf5'},
    /*Gateways*/
    {className: 'Gateway',              component: './Gateways/Gateway',          guid: '05e31d1c-7b7e-4fb8-b23d-063fee27b9f6'},
    {className: 'ExclusiveGateway',     component: './Gateways/exclusiveGateway', guid: '8a1cfe3d-d0d5-4ee6-aa4b-667b1f8934ec'},
    {className: 'InclusiveGateway',     component: './Gateways/inclusiveGateway', guid: 'fb2384a6-ea09-4c48-a069-864d6af845f7'},

    {className: 'Token',                component: './token',                     guid: 'd09117fc-b298-42f6-84fc-c8807e83ca12'},
    {className: 'Request',              component: './request',                   guid: '783cc459-0b03-4cbd-9960-6401a031537c'},
    {className: 'RequestStorage',       component: './requestStorage',            guid: 'd59ea34f-a525-4551-b8e8-8d182e32571c'},
    {className: 'Parameter',            component: './parameter',                 guid: '9232bbd5-e2f8-466a-877f-5bc6576b5d02'}
]

var guidOf = function(className) {
    for (var i = 0; i < controls.length; i++) {
        if (controls[i].className == className) {
            return controls[i].guid
        }
    }
};

var register = function(constructHolder){
    for (var i = 0; i < controls.length; i++) {
        var Class = require(controls[i].component);
        if (Class) {
            constructHolder.addComponent(Class, {});
        }
    }
};

if (module) {
    module.exports.guidOf = guidOf;
    module.exports.register = register
    module.exports.MegaAnswer = MegaAnswer;
}

