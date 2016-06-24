/**
 * Created by staloverov on 03.07.2015.
 */
var MegaAnswer = 'XXX';

var controls = [
    {className: 'Engine',                           component: './engine',                                  guid: '387e8d92-e2ca-4a94-9732-b4a479ff8bb8'},
    {className: 'ProcessDefinition',                component: './processDefinition',                       guid: '08b97860-179a-4292-a48d-bfb9535115d3'},
    {className: 'Process',                          component: './process',                                 guid: '74441683-a11f-4b59-9e04-0aefcc5bc18a'},
    {className: 'FlowNode',                         component: './flowNode',                                guid: '199a78b0-b555-4f97-9d8f-41234ae7f06f'},
    {className: 'SequenceFlow',                     component: './sequenceFlow',                            guid: 'c7a6cd70-653f-4e12-b6dc-8a6085b7fc7f'},
    {className: 'NodeProperties',                   component: './NodeProps/nodeProperties',                guid: '867a7d2e-8868-48f7-8086-3d2817aec604'},
    {className: 'UserScript',                       component: './userScript',                              guid: '410b06ae-205e-4610-a1c6-d6dcc901e4ac'},
    /*Activities*/
    {className: 'Activity',                         component: './Activities/activity',                     guid: '173a2e1f-909d-432d-9255-895f35335f65'},
    {className: 'UserTask',                         component: './Activities/userTask',                     guid: 'e9af2d49-ef3c-4b9a-b693-36a9f7a5cd4a'},
    {className: 'ScriptTask',                       component: './Activities/scriptTask',                   guid: 'db02ee41-b89e-4a33-ba60-109008945bf5'},
    {className: 'CallActivity',                     component: './Activities/callActivity',                 guid: 'f05f235f-6906-4c25-8c05-77299307f3f8'},

    /*Gateways*/
    {className: 'Gateway',                          component: './Gateways/gateway',                        guid: '05e31d1c-7b7e-4fb8-b23d-063fee27b9f6'},
    {className: 'ExclusiveGateway',                 component: './Gateways/exclusiveGateway',               guid: '8a1cfe3d-d0d5-4ee6-aa4b-667b1f8934ec'},
    {className: 'InclusiveGateway',                 component: './Gateways/inclusiveGateway',               guid: 'fb2384a6-ea09-4c48-a069-864d6af845f7'},
    /*Events*/
    {className: 'Event',                            component: './Events/event',                            guid: '65949e5d-85bc-4e95-94a3-ba8ed8a14275'},
    {className: 'MessageThrowEvent',                component: './Events/Intermediate/messageThrowEvent',   guid: '4a9b774d-99a5-486e-893f-e16c7cd7fe37'},
    {className: 'MessageCatchEvent',                component: './Events/Intermediate/messageCatchEvent',   guid: '96e3f1e1-cfc6-4eff-ae16-a405c9d24ab5'},
    {className: 'StartEvent',                       component: './Events/Start/startEvent',                 guid: 'af2ad908-748c-40c8-93f4-bd84a417f4b9'},
    {className: 'MessageStartEvent',                component: './Events/Start/messageStartEvent',          guid: '111e7666-fa3a-42ce-96d8-130399d1b735'},
    {className: 'EndEvent',                         component: './Events/End/endEvent',                     guid: '97f2e2a5-5216-49b0-b179-bf51cffb09ab'},

    {className: 'Token',                            component: './token',                                   guid: 'd09117fc-b298-42f6-84fc-c8807e83ca12'},
    {className: 'Request',                          component: './request',                                 guid: '783cc459-0b03-4cbd-9960-6401a031537c'},
    {className: 'WfeParameter',                     component: './parameter',                               guid: '9232bbd5-e2f8-466a-877f-5bc6576b5d02'},

    {className: 'MessageFlow',                      component: './Messages/messageFlow',                    guid: 'c10a9573-1274-4008-9353-d6c466fb0e35'},
    {className: 'MessageDefinition',                component: './Messages/messageDefinition',              guid: 'f24ec009-3e62-479b-935e-c9779655d548'},
    {className: 'MessageInstance',                  component: './Messages/messageInstance',                guid: '8b6fc96d-e149-4ec6-8f83-f2a43814f4af'},
    {className: 'CorrelationKey',                   component: './Messages/correlationKey',                 guid: '5f0d0be4-e276-49c7-ac28-688b4b4dd257'},
    {className: 'CorrelationKeyInstance',           component: './Messages/correlationKeyInstance',         guid: 'c6f954c6-ee4e-474c-a27e-603e9b97c1b1'},
    {className: 'CorrelationProperty',              component: './Messages/correlationProperty',            guid: '8794c286-a10b-442a-abb1-27dc2f54409d'},
    {className: 'RetrievalExpression',              component: './Messages/retrievalExpression',            guid: '36136243-425c-439d-a782-eed5c1e7bee8'},

    {className: 'MessageRetrievalExpression',       component: './Messages/messageRetrievalExpression',     guid: '4d02d5e9-4df5-44dc-8eed-7008e114b812'},
    {className: 'ObjectRef',                        component: './objectRef',                               guid: 'd59ea34f-a525-4551-b8e8-8d182e32571c'},

    {className: 'TaskDef',                          component: './Task/taskDef',                            guid: 'ccbe0ea3-994d-4733-a8d6-64bb8c5ae2df'},
    {className: 'TaskDefStage',                     component: './Task/taskDefStage',                       guid: '783d3c15-1c4d-4890-8a73-629b16d7c770'},
    {className: 'TaskStage',                        component: './Task/taskStage',                          guid: 'c2f02b7a-1204-4dca-9ece-3400b4550c8d'},
    {className: 'TaskParameter',                    component: './Task/taskParameter',                      guid: 'b3746562-946f-46f6-b74f-a50eaff7a771'},
    {className: 'TaskRequestParameter',             component: './Task/taskRequestParameter',               guid: '31809e1f-a2c2-4dbb-b653-51e8bdf950a2'},
    {className: 'ProcessVar',                       component: './processVar',                              guid: 'b8fd05dc-08de-479e-8557-dba372e2b4b6'},

    {className: 'TypeProvider',                     component: './EngineTools/typeProvider',                guid: '58b2d0ce-68a7-466b-8b97-080cd3e847b0'}
];

var masaccioContols = [
    
];

var guidOf = function(className) {
    for (var i = 0; i < controls.length; i++) {
        if (controls[i].className == className) {
            return controls[i].guid
        }
    }
};

var register = function(constructHolder){
    controls.forEach(function(control){
        var _registeredGuid = UCCELLO_CONFIG.classGuids[control.className];
        if (_registeredGuid && (_registeredGuid != control.guid)) {
            throw new Error('Class [' + control.className + '] already registered with other guid')
        } else {
            UCCELLO_CONFIG.classGuids[control.className] = control.guid
        }

        var Class = require(control.component);
        if (Class) {
            constructHolder.addComponent(Class, {});
        }
    });


    masaccioContols.forEach(function(control){
        var Class = require(control.component);
        if (Class) {
            constructHolder.addComponent(Class, {});
        }
    })
};

if (module) {
    module.exports.guidOf = guidOf;
    module.exports.register = register;
    module.exports.MegaAnswer = MegaAnswer;
}

