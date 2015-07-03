/**
 * Created by staloverov on 22.04.2015.
 */
var _instance = null;

var Singleton = {
    controls: [
        //{className: 'ProcessDefinition',    component: 'wfe/processDefinition',         guid: 'acd97fff-93f9-47ed-84bb-e24ffdf28fc5'},
        //{className: 'Engine',               component: 'wfe/engine',                    guid: '387e8d92-e2ca-4a94-9732-b4a479ff8bb8'},
        //{className: 'ProcessDefinition',    component: 'wfe/processDefinition',         guid: 'acd97fff-93f9-47ed-84bb-e24ffdf28fc5'},
        //{className: 'Process',              component: 'wfe/process',                   guid: '74441683-a11f-4b59-9e04-0aefcc5bc18a'},
        //{className: 'FlowNode',             component: 'wfe/flowNode',                  guid: '199a78b0-b555-4f97-9d8f-41234ae7f06f'},
        //{className: 'SequenceFlow',         component: 'wfe/sequenceFlow',              guid: 'c7a6cd70-653f-4e12-b6dc-8a6085b7fc7f'},
        //{className: 'NodeProperties',       component: 'wfe/NodeProps/NodeProperties',  guid: '867a7d2e-8868-48f7-8086-3d2817aec604'},
        ///*Activities*/
        //{className: 'Activity',             component: 'wfe/Activities/activity',       guid: '173a2e1f-909d-432d-9255-895f35335f65'},
        //{className: 'UserTask',             component: 'wfe/Activities/userTask',       guid: 'e9af2d49-ef3c-4b9a-b693-36a9f7a5cd4a'},
        //{className: 'ScriptTask',           component: 'wfe/Activities/scriptTask',     guid: 'db02ee41-b89e-4a33-ba60-109008945bf5'},
        ///*Gateways*/
        //{className: 'Gateway',              component: 'wfe/Gateways/Gateway',          guid: '05e31d1c-7b7e-4fb8-b23d-063fee27b9f6'},
        //{className: 'ExclusiveGateway',     component: 'wfe/Gateways/exclusiveGateway', guid: '8a1cfe3d-d0d5-4ee6-aa4b-667b1f8934ec'},
        //{className: 'InclusiveGateway',     component: 'wfe/Gateways/inclusiveGateway', guid: 'fb2384a6-ea09-4c48-a069-864d6af845f7'},
        ////{className: 'ConditionsResult',     component: 'wfe/Gateways/conditionsResult', guid: '7c19308e-fbb1-40c9-aecf-18b76f5e960a'},
        //
        //{className: 'Token',                component: 'wfe/token',                     guid: 'd09117fc-b298-42f6-84fc-c8807e83ca12'},
        //{className: 'Request',              component: 'wfe/request',                   guid: '783cc459-0b03-4cbd-9960-6401a031537c'},
        //{className: 'RequestStorage',       component: 'wfe/requestStorage',            guid: 'd59ea34f-a525-4551-b8e8-8d182e32571c'},
        ////{className: 'Notifier',             component: 'wfe/notify',                    guid: '98f90a0e-0fdf-482a-996e-8197d982689a'},
        //{className: 'Parameter',            component: 'wfe/parameter',                 guid: '9232bbd5-e2f8-466a-877f-5bc6576b5d02'}
    ],


    initInstance : function (initParams) {
        var Engine = require('./engine');
        _instance = new Engine(initParams);
        _instance.constructHolder = initParams.constructHolder;

        var createComponent = function (typeObj, parent, sobj) {
            var params = {ini: sobj, parent: parent.obj, colName: parent.colName};
            var constr = _instance.constructHolder.getComponent(typeObj.getGuid()).constr;
            return new constr(_instance.getControlManager(), params);
        };

        _instance.createComponentFunction = createComponent;

        var Controls = require('./controls');
        Controls.register(_instance.constructHolder);
    },

    getInstance : function () {
        return _instance;
    }
}


if (module) { module.exports = Singleton };