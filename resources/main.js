/**
 * Created by staloverov on 28.05.2015.
 */
var _parentDir = __dirname;
var _uccelloDir = _parentDir + '/../../Uccello/';
var _enginePath = _parentDir + '/../wfe/';
var _dbPath = _parentDir + '/../../ProtoOne/data/';

var _path = {
    engine : _enginePath,
    Uccello : _uccelloDir,
    DbPath : _dbPath
};

var EngineSingleton = require(_path.engine + 'engineSingleton');

var _initializer = {
    getConfig : function(){
        return {
            dataPath        : _path.DbPath,
            uccelloPath     : _path.Uccello,
            savePath        : _path.DbPath + 'processDefinitions/',
            webSocketServer : {port: 8082}
        };
    },

    init : function() {
        // модуль сервера
        var UccelloServ = require(_path.Uccello + 'uccelloServ');
        /**
         * Функция заглушка для аутентификации
         * @param user
         * @param pass
         * @param done
         */
        function fakeAuthenticate(user, pass, done) {
            var err = null, row = null;
            if (user.substring(0, 1) == 'u' && pass.substring(0, 1) == 'p')
                row = {user: user, user_id: 1, email: user + '@gmail.com'};
            else {
                var users = {
                    'Ivan': '123',
                    'Olivier': '123',
                    'Plato': '123'
                };
                if (users[user] && users[user] == pass) {
                    row = {user: user, user_id: 1, email: user + '@gmail.com'};
                }
            }
            done(err, row);
        }
        var uccelloServ = new UccelloServ({authenticate: fakeAuthenticate});
        this.constructHolder = uccelloServ.pvt.constructHolder;

        var dbc = uccelloServ.getUserMgr().getController();


        EngineSingleton.initInstance({dbController : dbc, constructHolder : this.constructHolder});
        this.controlManager = EngineSingleton.getInstance().getControlManager();

        var TestClient = require('./../test/testClient');
        this.testClient = new TestClient();
        var that = this;
        EngineSingleton.getInstance().notifier.registerObserver(that.testClient, that.testClient.handleNewRequest);
    },

    getControlManager : function() {
        if (!this.controlManager) {this.init()}
        return this.controlManager
    },

    initServer : function() {
        var EngineSingleton = require(_path.engine + 'engineSingleton');

        if (!EngineSingleton.getInstance()) {
            this.init();
        }
    }
};

var UccelloConfig = require(_path.Uccello + 'config/config');
UCCELLO_CONFIG = new UccelloConfig(_initializer.getConfig());
DEBUG = true;
PATH = _path;

_initializer.initServer();
var Builder = require('./builder');
var _builder = new Builder(EngineSingleton.getInstance());
_builder.saveDefintions();


if (module) {
    module.exports.Path = _path;
    module.exports.Config = _initializer;
}