if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define([
        './process',
        './processDefinition',
        './flowNode',
        './token',
        './notify',
        './EngineTools/requestStorage',
        './EngineTools/responseStorage',
        './Gateways/gateway',
        './Gateways/exclusiveGateway',
        './EngineTools/engineInitializer',
        './controls',
        './processDefinition',
        UCCELLO_CONFIG.uccelloPath + 'system/utils',
        './Messages/messageDefinition',
        './Messages/messageInstance',
        './Activities/userTask',
        './answer',
        './EngineTools/subprocessCallback',
        './EngineTools/messageCache',
        './EngineTools/fileAdapter',
        './EngineTools/dbAdapter',
        './Task/taskDef',
        './EngineTools/processCache'
    ],
    function(
        Process,
        Definition,
        FlowNode,
        Token,
        Notify,
        RequestStorage,
        ResponseStorage,
        Gateway,
        ExclusiveGateway,
        Initializer,
        Controls,
        ProcessDefinition,
        UUtils,
        MessageDefinition,
        MessageInstance,
        UserTask,
        Answer,
        SubProcessCallback,
        MessageCache,
        FileAdapter,
        DbAdapter,
        TaskDef,
        ProcessCache
    ) {

        var wfeInterfaceGUID = "a75970d5-f9dc-4b1b-90c7-f70c37bbbb9b";

        var wfeInterface = {

            className: "InterfWFE",
            classGuid: wfeInterfaceGUID,

            startProcessInstance: "function",
            getProcessInstance: "function",
            submitResponse: "function",
            addProcessDefinition: "function",
            getRequests: "function",
            newProcessDefinition : "function",
            startProcessInstanceAndWait : "function",
            submitResponseAndWait : "function",
            waitForRequest : "function",
            processResponse : 'function',
            getProcessDefParameters : 'function'
        };

        var Engine = UccelloClass.extend({
            init: function (initParams) {
                this.controlManager = Initializer.createControlManager(initParams);
                this.constructHolder = initParams.constructHolder;
                this.resman = initParams.resman;
                // Initializer.registerTypes(this.controlManager);

                this.db = this.controlManager;
                this.adapter = new DbAdapter();

                this.notifier = new Notify();
                this.requestStorage = new RequestStorage();
                this.responseStorage = new ResponseStorage();
                this.subprocesses = new SubProcessCallback();
                this.messageCache = new MessageCache();

                this.processes = new ProcessCache({resman : initParams.resman});

                this.uploadedProcesses = [];
                this.tokensArchive = [];
                this.processDefinitions = [];
                this.messageDefinitions = [];
                this.processIntsances = [];
                this.messageInstances = [];

                if (initParams && initParams.router) {
                    this.router = initParams.router;
                    this.router.add('wfeInterface', function (data, done)
                    {
                        done({ intf: wfeInterface });
                    });
                }
            },

            getGuid : function() {
                return Controls.guidOf('Engine')
            },

            getInterface: function () {
                return wfeInterface;
            },

            /*  ----- Definitions ----- */
            findDefinition: function (definitionID) {
                return this.processDefinitions.find(function(definition) {
                   return definition.definitionID() == definitionID
                });
            },

            addProcessDefinition : function(definition, callback) {
                var _def = this.findDefinition(definition.definitionID())
                if (!_def) {
                    this.processDefinitions.push(definition);
                    console.log('[%s] : => Добавлено описание процесса [%s]', (new Date()).toLocaleTimeString(), definition.name())
                }

                if (callback) {
                    callback({result : 'OK'})
                }
            },
            /*  ----- Definitions ----- */


            startProcessInstanceAndWait : function(definitionID, options, callback) {
                if (!options) {
                    Answer.error('Не указаны параметры запуска процесса [%s]', [definitionID]).handle(callback)
                }
                console.log('[%s] : => Создание процесса definitionID [%s]', (new Date()).toLocaleTimeString(), definitionID);

                var _processOptions = {};
                if (options.hasOwnProperty('taskParams')){
                    _processOptions.params = options.taskParams
                }

                var that = this;
                this.createNewProcess1(definitionID, _processOptions).then(
                    function(process) {
                        console.log('[%s] : => запуск процесса processID [%s]', (new Date()).toLocaleTimeString(), process.processID());
                        var _requestName = options.requestName;
                        var _timeout = options.timeout;
                        that.waitForRequest({processID : process.processID(), tokenID : 1, requestName : _requestName}, _timeout, callback);
                        setTimeout(function () {
                            that.runProcess(process);
                            console.log('[%s] : => процесс processID [%s] запущен', (new Date()).toLocaleTimeString(), process.processID());
                        }, 0);
                    },
                    function(reason) {
                        Answer.error('Не удалось создать процесс [%s]', [reason.message]).handle(callback);
                    }
                );

                return Controls.MegaAnswer;
            },

            startProcessInstance : function(definitionID, options, callback) {
                console.log('[%s] : => Создание процесса definitionID [%s]', (new Date()).toLocaleTimeString(), definitionID);
                var _processOptions = {};
                if (options.hasOwnProperty('taskParams')){
                    _processOptions.params = options.taskParams
                }

                var that = this;
                this.createNewProcess1(definitionID, _processOptions).then(
                    function(process) {
                        that.runProcess(process);
                        var _answer = Answer.success('Процесс processID [%s] запущен',  process.processID());
                        _answer.processID = process.processID();
                        _answer.tokenID = process.currentToken().tokenID();
                        _answer.handle(callback);
                    },
                    function(reason){
                        Answer.error('Не удалось создать процесс [%s]', [reason.message]).handle(callback);
                    }
                );
            },

            createNewProcess1 : function(definitionName, options) {
                var that = this;
                return new Promise(promiseBody);

                function promiseBody(resolve, reject){
                    var _def = that.processDefinitions.find(function(definition){
                        return definition.name() == definitionName
                    });

                    if (!_def) {
                        that.resman.loadRes([{resName : definitionName, resType : '08b97860-179a-4292-a48d-bfb9535115d3'}], function(result){
                            if ((result.result) && (result.result == 'ERROR')) {
                                reject(new Error(result.message))
                            } else {
                                var _defResource = result.datas[0].resource;
                                var _options = {
                                    definitionResourceID : result.datas[0].resVerId
                                };
                                if (options) {
                                    _options.params = options.params
                                }
                                var _process = new Process(that.controlManager, _options, _defResource);
                                resolve(_process);
                            }
                        })
                    } else {
                        resolve(new Process(that.controlManager, {}, _def))
                    }
                }
            },

                createNewProcess: function (definitionID) {
                    console.log('[%s] : => Создание инстанса процесса %s', (new Date()).toLocaleTimeString(), definitionID);
                    var _def = this.findDefinition(definitionID);
                    if (_def) {
                        return new Process(this.controlManager, {}, _def)
                    }
                },

                runProcess : function(processInstance) {
                    this.processIntsances.push(processInstance);

                    this.defineTokens(processInstance);

                    processInstance.activate();
                    var _startToken = processInstance.dequeueToken();
                    _startToken.currentNode().state(FlowNode.state.Initialized);
                    _startToken.execute();
                },

                findOrUploadProcess: function (processID) {
                    var that = this;

                    return new Promise(function(resolve, reject){
                        var _process = that.getProcessInstance(processID);
                        if (_process) {
                            resolve(_process)
                        } else {
                            var _index = that.uploadedProcesses.findIndex(function(element){
                               return element.processID == processID
                            });

                            if (_index != -1) {
                                that.adapter.deserialize(processID).then(
                                    function(process){
                                        that.processIntsances.push(process);
                                        that.uploadedProcesses.splice(_index, 1);
                                        resolve(process)
                                    },
                                    reject
                                )
                            } else {
                                resolve(null)
                            }
                        }
                    });
                },

                defineTokens: function (processInstance) {
                    var _token = new Token(this.getControlManager(), {parent  : processInstance, colName : 'Tokens'});
                    var _node = processInstance.getStartNode();
                    if (!_node) {
                        throw 'Неопределен стартовый узел для процесса'
                    }
                    _token.currentNode(_node.getInstance(_token));
                    _token.state(Token.state.Alive);
                    processInstance.enqueueToken(_token);
                },

            findProcessByPredicate : function(predicate) {
                return this.processIntsances.find(predicate);
            },

            getProcessInstance : function(processID) {
                return this.processIntsances.find(function(instance){
                    return instance.processID() == processID
                });
            },
            
            _createRequestOptions : function (requestInfo) {
                var _result ={};
                
                if (requestInfo.hasOwnProperty('requestID')){
                    // Todo : искать реквест в памяти и базе!
                } else {
                    _result.processID = requestInfo.processID;
                    if (requestInfo.hasOwnProperty('tokenID')) {
                        _result.tokenID = requestInfo.tokenID
                    } else {
                        _result.tokenID = null;    
                    }
                    _result.requestName = requestInfo.requestName;
                }  
                
                return _result;
            },

            waitForRequest : function(requestInfo, timeout, callback){
                var _options = this._createRequestOptions(requestInfo);
                
                var _isNeedNotify = this.requestStorage.isActiveRequestExistsByName(_options.requestName, _options.processID);

                this.notifier.registerObserverOnRequest(
                    _options,
                    timeout,
                    callback);

                if (_isNeedNotify) {
                    this.notifier.notify(this.requestStorage.getRequestParamsByName(requestName, processID))
                }
                return Controls.MegaAnswer;
            },

            activateProcess : function(processID) {
                var that = this;
                return new Promise(function(resolve, reject){
                    that.findOrUploadProcess(processID).then(
                        function(_process) {
                            _process.activate();
                            resolve();
                        },
                        function() {
                            reject(new Error('Неизвестный ID процесса'))
                        }
                    );
                });
            },

            deactivateProcess: function (processInstance) {
                if (!processInstance.isAllTokensDead()) {
                    console.log('[%s] : => Процесс [%s] деактивирован', (new Date()).toLocaleTimeString(), processInstance.processID());
                    if (!processInstance.isWaitingScriptAnswer())
                        processInstance.wait();
                } else {
                    processInstance.finish();
                }

            },

            startOutgoingNodes : function(token) {
                var _newToken = null;

                var _process = token.processInstance();
                var _outgoingNodes = token.currentNode().getOutgoingNodes();

                if (_outgoingNodes.length > 0) {
                    var _isGateway = (token.currentNode() instanceof Gateway);
                    var _isExclusiveGateWay = (token.currentNode() instanceof ExclusiveGateway);
                    var _hasSingleIn = token.currentNode().incoming().count() <= 1;
                    var _hasSingleOut = _outgoingNodes.length == 1;

                    var _needNewToken = _isGateway && !_isExclusiveGateWay && (_hasSingleIn && !_hasSingleOut);

                    if (_needNewToken) {
                        token.die();
                        for (var i = 0; i < _outgoingNodes.length; i++){
                            _newToken = new Token(this.getControlManager(), {parent  : _process, colName : 'Tokens'});
                            _newToken.currentNode(_outgoingNodes[i].getInstance(_newToken));
                            _newToken.currentNode().state(FlowNode.state.Initialized);
                            _newToken.state(Token.state.Alive);
                            _newToken.copyNodePropsFromToken(token);
                            _process.enqueueToken(_newToken);
                            _process.activate()
                        }
                    } else {
                        token.currentNode().close();
                        token.currentNode(_outgoingNodes[0].getInstance(token));
                        token.currentNode().state(FlowNode.state.Initialized);
                        _process.enqueueToken(token);
                        _process.activate()
                    }
                } else {
                    token.currentNode().close();
                    token.die();
                }

                this.switchTokens(token);
            },

            switchTokens : function(token){
                var _process = this.getActiveProcess(token.processInstance().processID());
                var _token;

                if (_process) {
                    var _newToken = _process.dequeueToken();
                    if (_newToken && _process.canContinue()) {
                        _token = _newToken
                    } else {
                        _token = token
                    }

                    _process.currentToken(_token);
                    _token.execute()
                } else {
                    /* Todo : здесь какая-то лажа!!!! */
                    if (!token.processInstance().isWaiting()) {
                        if (!token.processInstance().isAllTokensDead()) {
                            token.currentNode().close();
                            token.execute();
                        }
                    }
                }
            },

            getActiveProcess : function(processID) {
                return this.processIntsances.find(function(instance) {
                    return (instance.processID() == processID) && instance.isRunning()
                })
            },

            exposeRequest : function(request, eventParams){
                var _request = request.clone(this.controlManager, {});
                _request.ID(request.ID());
                this.requestStorage.addRequest(_request, eventParams);
                this.requestStorage.addForSave(_request);
                console.log('[%s] : => Выставлен request [%s]', (new Date()).toLocaleTimeString(), request.name());
                this.notifier.notify(eventParams);
            },

            submitResponse : function(answer, callback) {
                var _request = this.requestStorage.getRequest(answer.requestID);
                if (_request && _request.isActive()) {
                    var _processID = _request.processID();

                    var that = this;
                    this.findOrUploadProcess(_processID).then(
                        function(_process){
                            if (_process.canContinue()) {
                                _process.activate();
                            }

                            var _token = _process.getToken(_request.tokenID());

                            var _receivingNode = _token.currentNode();

                            _request = _token.getPropertiesOfNode(_receivingNode.name()).findRequest(_request.requestID());
                            if (!_request) {
                                throw 'Error!'
                            }

                            var response = _request.createResponse(_request.getParent());
                            response.fillParams(answer);

                            that.responseStorage.addResponseCallback(response, 0, callback);
                            that.requestStorage.addForSave(_request);
                            that.responseStorage.addForSave(response);

                            if (_process.isRunning()) {
                                /* Todo ТОКЕN!!!  Может быть много токенов, возможно надо передавать токен в execute() */
                                if (_receivingNode['handleResponse']){
                                    _receivingNode.handleResponse(function () {
                                        _token.execute();
                                    });    
                                }
                                
                            } else {
                                if (!_process.isTokenInQueue(_token)) {
                                    _process.enqueueToken(_token)
                                }

                                if (_receivingNode['handleResponse']){
                                    _receivingNode.handleResponse(function () {
                                        _token.execute();
                                    });
                                }
                            }
                        },
                        function(error){
                            Answer.error('Процесс [%s] не найден message [%s]', [_processID, error.message]).handle(callback);
                        }
                    );


                } else {
                    Answer.error('Unknown error').handle(callback);
                }

                return Controls.MegaAnswer;
            },

            processResponse : function(answer, timeout, callback) {
                var _request = this.requestStorage.getActiveRequest(answer.requestID);

                if (!_request) {
                    Answer.error('Реквест [%s] не найден среди активных', [answer.requestID]).handle(callback);
                } else {
                    _request.responseReceived();
                }

                var that = this;

                this.findOrUploadProcess(_request.processID()).then(
                    function(_process){
                        var _token = _process.getToken(_request.tokenID());
                        var _receivingNode = _token.currentNode();

                        _request = _token.getPropertiesOfNode(_receivingNode.name()).findRequest(_request.ID());
                        if (!_request) {
                            throw 'System Error!'
                        }

                        _request.responseReceived();

                        var response = _request.createResponse(_request.getParent());
                        response.fillParams(answer);


                        // _receivingNode.requests().count() == 0 - будет служебный request
                        if ((_receivingNode instanceof UserTask) && ((_receivingNode.hasScript() || _receivingNode._hasUserSelectedNextNode()))) {
                            that.responseStorage.addResponseCallback(response, timeout, callback)
                        }
                        that.requestStorage.addForSave(_request);
                        that.responseStorage.addForSave(response);

                        if (_receivingNode['handleResponse']){
                            _receivingNode.handleResponse(function () {
                                _token.execute();
                            });
                        }

                        if (_process.canContinue()) {
                            if (_process.isRunning()) {
                                /* Todo ТОКЕN!!!  Может быть много токенов, возможно надо передавать токен в execute() */
                                _receivingNode.execute(function () {
                                    _token.execute();
                                });
                            } else {
                                if (!_process.isTokenInQueue(_token)) {
                                    _process.enqueueToken(_token)
                                }

                                _receivingNode.execute(function () {
                                    _token.execute();
                                });
                            }
                        }
                    },
                    function(error) {
                        Answer.error('Процесс [%s] не найден\n error : [%s]', [_request.processID(), error.message]).handle(callback);
                    }
                );

                return Controls.MegaAnswer;
            },

            submitResponseAndWait : function(response, requestName, timeout, callback) {
                // Todo : Исправить в waitForRequest передавать объект
                this.waitForRequest(response.processID, response.tokenID, requestName, timeout, callback);
                this.submitResponse(response, callback);

                return Controls.MegaAnswer;
            },

            saveAndUploadProcess : function(processID) {
                var that = this;

                return new Promise(function(resolve, reject) {
                    that.justSaveProcess(processID).
                    then(function () {
                        var _index = that.processIntsances.findIndex(function (instance) {
                            return instance.processID() == processID
                        });

                        if (_index != -1) {
                            that.uploadedProcesses.push({
                                processID: processID,
                                isFinished: that.processIntsances[_index].isFinished()
                            });
                            that.processIntsances.splice(_index, 1);
                        }
                        resolve();
                    }).
                    catch(reject);
                });
            },

            getProcessDefParameters : function(definitionIdentifier, done){
                if (typeof definitionIdentifier == 'object') {
                    if (!definitionIdentifier.hasOwnProperty('resType')) {
                        definitionIdentifier.resType = UCCELLO_CONFIG.classGuids.ProcessDefinition
                    }
                }
                
                this.processes.getDefinitionParameters(definitionIdentifier).
                then(function(params){
                    Answer.success('Параметры найдены').add({params : params}).handle(done);
                }).
                catch(function(err){
                    Answer.error('Параметры не найдены message [%s]', [err.message]).handle(done);
                });

                return Controls.MegaAnswer;
            },

            justSaveProcess: function(processID){
                var that = this;

                return new Promise(function(resolve, reject){
                    var _process = that.getProcessInstance(processID);

                    if (_process) {
                        that.adapter.serialize(_process).then(
                            resolve,
                            reject)
                    } else {
                        reject(new Error('Can not find process [' + processID + ']'))
                    }
                });
            },

            getControlManager : function() {
                return this.controlManager;
            },

            archiveToken : function(token) {
                var that = this;
                this.findOrUploadProcess(token.processInstance().processID()).then(
                    function(_process){
                        that.tokensArchive.push({processID : _process.processID(), token : token});
                    }
                );
            },

            getRequests : function(processGuid) {
                if (!processGuid) {
                    return this.requestStorage.storage
                } else {
                    return this.requestStorage.getProcessRequests(processGuid)
                }
            },

            getRequestsAsync : function(processGuid, callback) {
                var that = this;
                setTimeout(function() {
                    var _requests = that.getRequests();
                    return {result : 'OK', requests : _requests}
                }, 0)
            },

            newProcessDefinition : function() {
                var _definition = new ProcessDefinition(this.getControlManager(), {});
                _definition.definitionID(UUtils.guid());
                return _definition;
            },

            newTaskDefinition : function() {
                var _definition = new TaskDef(this.getControlManager(), {});
                return _definition;
            },

            //<editor-fold desc="messaging">
            newMessageDefinition : function(messageDefinitionName) {
                var _definition = new MessageDefinition(this.getControlManager(), {});
                _definition.definitionID(UUtils.guid());
                if (messageDefinitionName) {
                    _definition.name(messageDefinitionName)
                }
                return _definition;
            },

            getMessageDefinition : function(definitionName) {
                var _definition = null;
                this.messageDefinitions.some(function(definition) {
                    if (definition.name() == definitionName) {
                        _definition = definition;
                        return true;
                    }
                });

                return _definition;
            },


            addMessageDefinition : function(definition, callback) {
                if (this.messageDefinitions.every(function(element) {
                        return element.definitionID() != definition.definitionID()
                    })) {
                    this.messageDefinitions.push(definition);
                    Answer.success('Добавлено описание сообщения [%s]', definition.name()).handle(callback);
                } else {
                    Answer.error('Описание сообщения [%s] уже существует', definition.definitionID()).handle(callback);
                }
            },

            clearMessageDefinitions : function() {
                this.messageDefinitions.length = 0;
            },

            newMessageInstance : function() {
                var _instance = new MessageInstance(this.getControlManager(), {});
                this.messageInstances.push(_instance);
                return _instance;
            },
            //</editor-fold>

            deleteProcess : function(processID) {
                this.requestStorage.cancelActiveRequestsForProcess(processID);

                var _process = this.getProcessInstance(processID);
                if (_process) {
                    _process.finish()
                }
            },

            isProcessFinished : function(processID) {
                var _process = this.getProcessInstance(processID);
                if (_process) {
                    return _process.isFinished();
                }

                return this.uploadedProcesses.some(function (element) {
                    return ((element.processID == processID) && element.isFinished);
                });
            },

            startSubProcess : function(definitionID, startCallback, finishCallback) {
                var _process = this.createNewProcess(definitionID);

                if (_process) {
                    this.subprocesses.register(_process.processID(), startCallback, finishCallback);
                    this.runProcess(_process);
                } else {
                    return Answer.error('Описание процесса [%s] не найден', definitionID)
                }
            },

            notifyAboutStart : function(subprocessID){
                var that = this;
                this.findOrUploadProcess(subprocessID).then(
                    function() {
                        that.subprocesses.execStartCallback(subprocessID)
                    },
                    function(error){
                        throw error
                    }
                );
            },

            notifyAboutFinish : function(subprocessID) {
                var that = this;
                this.findOrUploadProcess(subprocessID).then(
                    function() {
                        that.subprocesses.execEndCallback(subprocessID)
                    },
                    function(error){
                        throw error
                    }
                );
            },

            deliverMessage : function(messageInstance, messageRequest) {
                var _targetProcess = this.activateProcess(messageRequest.sourceProcessId());
                var _token = _targetProcess.getToken(messageRequest.sourceTokenId());
                var _node = _token.findNodeInstanceByID(messageRequest.sourceNodeId());
                if (!_node) {
                    throw "deliverMessage : Не найден узел"
                }
                _targetProcess.addNewReceivedMessage(messageInstance, _node);
                messageInstance.isDelivered(true);

                _node.execute(function () {
                    _token.execute();
                });
            },

            startProcessByMessage : function(messageInstance) {
                var _index = -1;
                this.processDefinitions.some(function(definition, index){
                    if (definition.name() == messageInstance.targetProcessName()) {
                        _index = index;
                        return true;
                    }
                });

                if (_index == -1) { return }

                var _definition = this.processDefinitions[_index];
                var _node = _definition.findNodeByName(messageInstance.targetNodeName());

                if (!_node || !_node.canStartProcess()) { return }

                var _process = new Process(this.controlManager, {}, _definition);
                var _nodeInstance = _process.findNode(_node);

                _nodeInstance.incomingInstance(messageInstance);

                messageInstance.isDelivered(true);

                //this.runProcess(_process);
                var that = this;
                var _processInstance = _process;
                setTimeout(function() {
                    var _nodeInstance = _process.findNode(_node);
                    _nodeInstance.incomingInstance(messageInstance);

                    that.runProcess(_processInstance);
                }, 0)
            }
        });

        return Engine;
    }
);
