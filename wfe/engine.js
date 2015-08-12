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
        './requestStorage',
        './responseStorage',
        './Gateways/gateway',
        './Gateways/exclusiveGateway',
        'fs',
        './engineInitializer',
        './controls',
        './processDefinition',
        UCCELLO_CONFIG.uccelloPath + 'system/utils',
        './Messages/messageDefinition',
        './Activities/userTask',
        './answer'
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
        fs,
        Initializer,
        Controls,
        ProcessDefinition,
        UUtils,
        MessageDefinition,
        UserTask,
        Answer
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
            processResponse : 'function'
        };

        var Engine = UccelloClass.extend({
            init: function (initParams) {
                this.db = Initializer.createInternalDb(initParams.dbController);
                this.controlManager = Initializer.createControlManager(this.db);
                this.constructHolder = initParams.constructHolder;
                Initializer.registerTypes(this.controlManager);

                this.db = this.controlManager;

                this.notifier = new Notify();
                this.requestStorage = new RequestStorage();
                this.responseStorage = new ResponseStorage();

                this.uploadedProcesses = [];
                this.tokensArchive = [];
                this.processDefinitions = [];
                this.messageDefinitions = [];
                this.processIntsances = [];
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

            clearProcessDefinitions : function() {
                this.processDefinitions.length = 0;
            },

            /*  ----- Definitions ----- */
            findDefinition: function (definitionID)
            {
                for (var i = 0; i < this.processDefinitions.length; i++) {
                    var _def = this.processDefinitions[i];
                    if (_def.definitionID() == definitionID) {
                        return _def;
                    }
                }
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


            startProcessInstanceAndWait : function(definitionID, requestName, timeout, callback) {
                console.log('[%s] : => Создание процесса definitionID [%s]', (new Date()).toLocaleTimeString(), definitionID);
                var _process = this.createNewProcess(definitionID);

                if (_process) {
                    console.log('[%s] : => запуск процесса processID [%s]', (new Date()).toLocaleTimeString(), _process.processID());
                    this.waitForRequest(_process.processID(), 1, requestName, timeout, callback);
                    var that = this;
                    setTimeout(function() {
                        that.runProcess(_process);
                        console.log('[%s] : => процесс processID [%s] запущен', (new Date()).toLocaleTimeString(), _process.processID());
                    }, 0);

                } else {
                    console.log('[%s] : => %s', (new Date()).toLocaleTimeString(), _result.message);
                    callback({result : 'ERROR', message : 'Не удалось создать процесс'});
                }

                return Controls.MegaAnswer;
            },

            startProcessInstance : function(definitionID, callback) {
                var _result = {};
                console.log('[%s] : => Создание процесса definitionID [%s]', (new Date()).toLocaleTimeString(), definitionID);
                var _process = this.createNewProcess(definitionID);

                if (_process) {
                    console.log('[%s] : => запуск процесса processID [%s]', (new Date()).toLocaleTimeString(), _process.processID());
                    this.runProcess(_process, function (result) {
                        //console.log(result + ' [%s]', _process.processID)
                    });

                    _result.result = 'OK';
                    _result.processID = _process.processID();
                    _result.tokenID = _process.currentToken().tokenID();
                } else {
                    _result.result = 'ERROR';
                    _result.message = 'не удалось создать процесс';
                    console.log('[%s] : => %s', (new Date()).toLocaleTimeString(), _result.message);
                };

                if (callback) {
                    setTimeout( function() {callback(_result)}, 0);
                };

                return _result;
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
                    var _process = this.getProcessInstance(processID);
                    if (_process) {
                        return _process
                    }

                    for (var i = 0; i < this.uploadedProcesses.length; i++) {
                        if (this.uploadedProcesses[i].processID == processID) {
                            var _process = this.deserializeProcess(processID, this.createComponentFunction);
                            //this.processes()._add(_process);
                            this.processIntsances.push(_process);
                            this.uploadedProcesses.splice(i, 1);

                            return _process;
                        }
                    }

                    return null;
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

            getProcessIndex : function(predicate) {
                var _index = -1;
                this.processIntsances.some(function(element, index) {
                    if (predicate(element)) {
                        _index = index;
                        return true;
                    }
                });

                return _index;
            },

            findProcessByPredicate : function(predicate) {
                var _index = this.getProcessIndex(predicate)

                if (_index != -1) {
                    return this.processIntsances[_index];
                } else {
                    return null;
                }
            },

            getProcessInstance : function(processID) {
                return this.findProcessByPredicate(function(element) {
                    return element.processID() == processID
                })
            },

            waitForRequest : function(processID, tokenID, requestID, timeout, callback){
                var _isNeedNotify = this.requestStorage.isActiveRequestExistsByName(requestID);

                this.notifier.registerObserverOnRequest(
                    {
                        processID: processID,
                        tokenID: tokenID,
                        requestName: requestID
                    },
                    timeout,
                    callback);

                if (_isNeedNotify) {
                    this.notifier.notify(this.requestStorage.getRequestParamsByName(requestID))
                }
                return Controls.MegaAnswer;
            },

            activateProcess : function(processID) {
                var _process = this.findOrUploadProcess(processID);
                if (_process) {
                    _process.activate();
                    return _process;
                }
                else {
                    throw 'Неизвестный ID процесса'
                }
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

                if (_process !== null) {
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
                return this.findProcessByPredicate(function(element) {
                    return (element.processID() == processID) && element.isRunning()
                })
            },

            exposeRequest : function(request, eventParams){
                this.requestStorage.addRequest(request, eventParams);
                console.log('[%s] : => Выставлен request [%s]', (new Date()).toLocaleTimeString(), request.name());
                this.notifier.notify(eventParams);
            },

            submitResponse : function(answer, callback) {
                var _request = this.requestStorage.getRequest(answer.requestID);
                if (_request && _request.isActive()) {
                    var _processID = answer.processID;
                    var _process = this.findOrUploadProcess(_processID);

                    if (!_process) {
                        if (callback) {
                            console.log('[%s] : ER Процесс [%s] не найден', (new Date()).toLocaleTimeString(), _processID);
                            callback({result: 'ERROR', message : 'Процесс не найден'});
                        }
                    } else {
                        if (_process.canContinue()) {
                            _process = this.activateProcess(_processID);
                        }

                        var _token = _process.getToken(answer.tokenID);

                        var _receivingNode = _token.currentNode();

                        _request = _token.getPropertiesOfNode(_receivingNode.name()).findRequest(answer.requestID);
                        if (!_request) {
                            throw 'Error!'
                        }

                        var response = _request.createResponse(_request.getParent());
                        response.fillParams(answer.response);

                        this.responseStorage.addResponseCallback(response, 0, callback);

                        if (_process.isRunning()) {
                            /* Todo ТОКЕN!!!  Может быть много токенов, возможно надо передавать токен в execute() */
                            _receivingNode.execute(function () {
                                _token.execute();
                            });
                        } else {
                            if (!_process.isTokenInQueue(_token)) {
                                _process.enqueueToken(_token)
                            }

                            _receivingNode.execute();
                        }
                        //setTimeout(function () {
                        //    /* Todo : результат в callback */
                        //    if (callback) {
                        //        callback({result: 'OK'})
                        //    }
                        //
                        //    _token.execute();
                        //}, 0);
                    }
                } else {
                    setTimeout(function () {
                        /* Todo : результат в callback */
                        if (callback) {
                            callback({result: 'ERROR'})
                        }
                    }, 0);
                }

                return Controls.MegaAnswer;
            },

            processResponse : function(message, timeout, callback) {

                var _request = this.requestStorage.getActiveRequest(message.requestID);
                _request.responseReceived();

                if (!_request) {
                    Answer.error('Реквест [%s] не найден среди активных', [message.requestID]).handle(callback);
                    return Controls.MegaAnswer;
                }

                var _process = this.findOrUploadProcess(message.processID);
                if (!_process) {
                    Answer.error('Процесс [%s] не найден', [message.processID]).handle(callback);
                    return Controls.MegaAnswer;
                }

                var _token = _process.getToken(message.tokenID);
                var _receivingNode = _token.currentNode();

                _request = _token.getPropertiesOfNode(_receivingNode.name()).findRequest(message.requestID);
                if (!_request) {
                    throw 'System Error!'
                }

                _request.responseReceived();

                var response = _request.createResponse(_request.getParent());
                response.fillParams(message.response);

                //this.responseStorage.addResponseCallback(response, timeout, callback);
                if ((_receivingNode instanceof UserTask) && (_receivingNode.hasScript())) {
                    this.responseStorage.addResponseCallback(response, timeout, callback)
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

                return Controls.MegaAnswer;

                //var _request1 = this.requestStorage.getRequest(message.requestID);
                //if (_request1 && _request1.isActive()) {
                //    var _processID = message.processID;
                //    var _process = this.findOrUploadProcess(_processID);
                //
                //    if (!_process) {
                //        if (callback) {
                //            console.log('[%s] : ER Процесс [%s] не найден', (new Date()).toLocaleTimeString(), _processID);
                //            callback({result: 'ERROR', message : 'Процесс не найден'});
                //        }
                //    } else {
                //        if (_process.canContinue()) {
                //            _process = this.activateProcess(_processID);
                //        }
                //
                //        var _token = _process.getToken(message.tokenID);
                //
                //        var _receivingNode = _token.currentNode();
                //        if ((_receivingNode instanceof UserTask) && (_receivingNode.hasScript())) {
                //            this.responseStorage.addResponseCallback(re)
                //        }
                //
                //
                //
                //        _request1 = _token.getPropertiesOfNode(_receivingNode.name()).findRequest(message.requestID);
                //        if (!_request1) {
                //            throw 'Error!'
                //        }
                //
                //        var response = _request1.createResponse(_request1.getParent());
                //        response.fillParams(message.response)
                //
                //        if (_process.isRunning()) {
                //            /* Todo ТОКЕN!!!  Может быть много токенов, возможно надо передавать токен в execute() */
                //            _receivingNode.execute(function () {
                //                _token.execute();
                //            });
                //        } else {
                //            if (!_process.isTokenInQueue(_token)) {
                //                _process.enqueueToken(_token)
                //            }
                //
                //            _receivingNode.execute();
                //        }
                //        setTimeout(function () {
                //            /* Todo : результат в callback */
                //            if (callback) {
                //                callback({result: 'OK'})
                //            }
                //
                //            _token.execute();
                //        }, 0);
                //    }
                //} else {
                //    setTimeout(function () {
                //        /* Todo : результат в callback */
                //        if (callback) {
                //            callback({result: 'ERROR'})
                //        }
                //    }, 0);
                //}
            },

            submitResponseAndWait : function(response, requestName, timeout, callback) {
                this.waitForRequest(response.processID, response.tokenID, requestName, timeout, callback);
                this.submitResponse(response, callback);

                return Controls.MegaAnswer;
            },

            saveProcess : function(processID) {
                console.log('[%s] : {{ А ничего пока не выгружаем', (new Date()).toLocaleTimeString())

                //this.serializeProcess(processID);
                //var _index = this.getProcessIndex(function(element) {
                //    return element.processID() == processID
                //});
                //
                //if (_index != -1) {
                //    this.uploadedProcesses.push({processID : processID, isFinished : this.processIntsances[_index].isFinished()});
                //    this.processIntsances.splice(_index, 1);
                //}
            },

            serializeProcess : function(processID) {
                var _process = this.getProcessInstance(processID);

                if (_process) {
                    var _obj = _process.pvt.db.serialize(_process);
                    if (_obj) {
                        fs.writeFileSync(UCCELLO_CONFIG.wfe.processStorage + processID + '.txt', JSON.stringify(_obj));
                        console.log('[%s] : {{ Процесс [%s] выгружен из памяти', (new Date()).toLocaleTimeString(), processID)
                    }
                }
            },

            deserializeProcess : function(processID, callback){
                if (!callback) {
                    callback = this.createComponentFunction
                }

                var _obj = fs.readFileSync(UCCELLO_CONFIG.wfe.processStorage + processID + '.txt');
                _obj = JSON.parse(_obj);

                var _process = this.db.deserialize(_obj, {}, callback);
                console.log('[%s] : }} Процесс [%s] восстановлен', (new Date()).toLocaleTimeString(), processID);
                fs.unlink(UCCELLO_CONFIG.wfe.processStorage + processID + '.txt');

                return _process;
            },

            getControlManager : function() {
                return this.controlManager;
            },

            archiveToken : function(token) {
                var _process = this.findOrUploadProcess(token.processInstance().processID());
                this.tokensArchive.push({processID : _process.processID(), token : token})
                _process.tokens()._del(token);
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
                _definition.definitionID(UUtils.guid())
                return _definition;
            },

            //<editor-fold desc="messaging">
            newMessageDefinition : function() {
                var _definition = new MessageDefinition(this.getControlManager(), {});
                _definition.definitionID(UUtils.guid())
                return _definition;
            },

            addMessageDefinition : function(definition, callback) {
                if (this.messageDefinitions.every(function(element) {
                        element.definitionID() != definition.definitionID()
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
            //</editor-fold>

            deleteProcess : function(processID) {
                this.requestStorage.cancelActiveRequestsForProcess(processID);

                var _process = this.getProcessInstance(processID);
                if (_process) {
                    _process.finish()
                }
            },

            processExists : function(processID) {
                //for (var i = 0; i < this.processes().count(); i++) {
                //    if (this.processes().get(i).processID() == processID) {
                //        return true;
                //    }
                //}
                //
                //return this.uploadedProcesses.some(function (element) {
                //    return element == processID;
                //});
            },

            processFinished : function(processID) {
                var _process = this.getProcessInstance(processID);
                if (_process) {
                    return _process.isFinished();
                }

                return this.uploadedProcesses.some(function (element) {
                    return ((element.processID == processID) && element.isFinished);
                });
            }
        });

        return Engine;
    }
);
