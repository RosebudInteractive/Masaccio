'use strict';

var Util = require('util');
var TraceTypes = require(UCCELLO_CONFIG.uccelloPath + 'system/tracer/common/types');

var _logger = null;

var Logger = class Logger{
    static getInstance(){
        return new Promise(function(resolve){
            if (!_logger) {
                _logger = new Logger();
                $tracer.createSource('Masaccio').then(function(source) {
                    _logger.traceSource = source;
                    _logger.useTracer = true;
                }).
                catch(function(reason){
                    console.log(reason.message)
                })
            }

            resolve(_logger)
        })
    }

    constructor(){
        this.traceSource = null;
        this.useTracer = false;
    }

    _log(record){
        if (this.useTracer) {
            this.traceSource.trace(record)
        } else {
            var _logMessage = Util.format('[%s] : => %s', record.ts,  record.message);
            if (record.eventType === TraceTypes.TraceEventType.Error) {
                console.error(_logMessage)
            } else {
                console.log(_logMessage)
            }
        }
    }


    
    static info(message){
        var _messageArgs = arguments;
        Logger.getInstance().then(function(logger){
            _prepareRecord.apply(message, _messageArgs).then(function(record){
                if (!record.eventType) {
                    record.eventType = TraceTypes.TraceEventType.Information;
                }
                logger._log(record)
            }).catch(function(reason){
                logger.log(_createErrorRecord(reason))
            });
        }).
        catch(function(reason){
            console.error(reason.message)
        });
    }

    static error(message) {
        var _messageArgs = arguments;
        Logger.getInstance().then(function(logger) {
            _prepareRecord.apply(message, _messageArgs).then(function(record){
                if (!record.eventType) {
                    record.eventType = TraceTypes.TraceEventType.Error;
                }
                logger._log(record)
            }).catch(function(reason){
                logger.log(_createErrorRecord(reason))
            });
        }).
        catch(function(reason){
            console.error(reason.message)
        });
    };
    
    static scriptExecuted (message) {
        var _messageArgs = arguments;
        Logger.getInstance().then(function(logger){
            _prepareRecord.apply(message, _messageArgs).then(function(record){
                if (!record.eventType) {
                    record.eventType = TraceTypes.TraceEventType.Information;
                }
                record.message = Util.format('Выполнен скрипт [%s]', record.message);

                logger._log(record)
            }).catch(function(reason){
                logger.log(_createErrorRecord(reason))
            });
        }).
        catch(function(reason){
            console.error(reason.message)
        });
    }
};


function _prepareRecord(message){
    var _messageArgs = arguments;
    return new Promise(function(resolve, reject) {
        var _record = {
            eventType: null,
            message: null,
            ts: (new Date()).toLocaleTimeString(),
            module: 'Masaccio',
            detail: null
        };

        if (typeof message === 'string') {
            _record.message = _handleMessage.apply(message, _messageArgs);
            resolve(_record)
        } else {
            if (typeof message === 'object') {
                if (message.hasOwnProperty('message')) {
                    _record.message = message.message;
                }

                if (message.hasOwnProperty('module')) {
                    _record.module = message.module;
                }

                if (message.hasOwnProperty('detail')) {
                    _record.detail = message.detail;
                }

                resolve(_record)
            }
            else {
                reject(new Error('Undefined message type'))
            }
        }
    })
}

function _handleMessage(messageArgs){
    var _message = '';
    if (arguments.length > 1) {
        _message = Util.format.apply(messageArgs, arguments);
    } else {
        _message = messageArgs
    }
    return _message
}

function _createErrorRecord(error){
    return {
        eventType: TraceTypes.TraceEventType.Error,
        message: error.message,
        ts: (new Date()).toLocaleTimeString(),
        module: 'Masaccio',
        detail: null
    }
}

if (module) {module.exports = Logger}