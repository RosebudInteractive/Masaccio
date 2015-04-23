/**
 * Created by staloverov on 14.04.2015.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/* Todo : возможно необходимо промежуточное наследование Activity -> Task -> UserTask */

define(
    ['./activity', './../request', './../flowNode'],
    function(Activity, Request, FlowNode){
        var UserTask = Activity.extend({

            className: "UserTask",
            classGuid: UCCELLO_CONFIG.classGuids.UserTask,
            //metaFields: [ {fname:"Name",ftype:"string"}, {fname:"State",ftype:"string"} ],
            //metaCols: [],

            init: function(cm, params){
                this._super(cm);

                this.requests = [];
                this.responses = [];
            },

            //name: function(value) {
            //    return this._genericSetter("Name",value);
            //},
            //
            //state: function(value) {
            //    return this._genericSetter("State",value);
            //},

            execute : function() {
                //this._super();
                console.log("Выполняется узел %s [%s]", this.name, typeof(this));
                /* Todo : свое выполнение */
                if (this.state == FlowNode.state.Executing) {
                    var _activityState = this.exposeRequests()
                    if (_activityState == Activity.state.Waiting) {
                        this.state = FlowNode.state.WaitingRequest;
                    }
                    else if (_activityState == Activity.stat.Executing) {
                        this.state = FlowNode.state.ExecutionComplete
                    }

                }
                else if (this.state == FlowNode.state.WaitingRequest) {
                    if (this.processInstance.currentToken.getPropertiesOfNode(this.name).isAllResponseReceived()) {
                        var _param = this.processInstance.currentToken.getPropertiesOfNode(this.name).parameters[0];
                        console.log('[%s] : %s', _param.name, _param.value)
                        this.state = FlowNode.state.ExecutionComplete
                    }
                    else { this.state = FlowNode.state.WaitingRequest }
                }
                else {
                    this.state = FlowNode.state.ExecutionComplete
                }
            },

            cancel : function() {

            },

            addRequest : function(name) {
                var _request = new Request(this.pvt.controlMgr);
                _request.name = name;
                this.requests.push(_request);
                return _request;
            },


            exposeRequests : function() {
                if (this.requests.length > 0){
                    var _process = this.processInstance;
                    var _token = _process.currentToken;

                    for (var i in this.requests) {
                        if (!this.requests.hasOwnProperty(i)) continue;

                        var _request = this.requests[i].clone();
                        _request.processID = _process.processID;
                        _request.tokenID = _token.tokenID;
                        var _props = _token.getPropertiesOfNode(this.name);
                        /* Todo : нужна проверка*/
                        _props.addRequest(_request);
                    }

                    return Activity.state.Waiting
                }
                else {
                    return Activity.state.Executing
                }
            }

        });

        return UserTask;
    }
)

