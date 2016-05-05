/**
 * Created by staloverov on 28.05.2015.
 */
var _parentDir = __dirname;
var _uccelloDir = _parentDir + '/../../Uccello/';
var _enginePath = _parentDir + '/../wfe/';
var _dbPath = _parentDir + '/../../ProtoOne/data/';
var _definitionsPath = _parentDir + '/definitions/';

var _path = {
    engine : _enginePath,
    definitions : _definitionsPath,
    Uccello : _uccelloDir,
    Masaccio : _parentDir + '/../',
    DbPath : _dbPath,
    testDataPath : __dirname + '/data/'
};

var mssql_connection = { //MSSQL
    host: "localhost", // "SQL-SERVER"
    port: 1435,       // instanceName: "SQL2008R2"
    username: "sa",
    password: "",
    database: "masaccio_test",
    provider: "mssql",
    connection_options: { instanceName: "SQLEXPRESS", requestTimeout: 0 },
    provider_options: {},
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
};

var mysql_connection = { //MySql
    host: "localhost",
    username: "root",
    password: "1q2w3e",
    database: "masaccio_test",
    provider: "mysql",
    connection_options: {},
    provider_options: {},
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
};

USE_MSSQL_SERVER = true;

var _config = {
    wfe: {
        processStorage: _path.Masaccio + 'data/',
        scriptsPath: _path.Masaccio + 'UserScripts/',
        idleTimeout: 3000
    },

    controlsPath: _path.Masaccio,
    dataPath: _path.DbPath,
    uccelloPath: _path.Uccello,
    masaccioPath : _path.Masaccio + 'wfe/',
    
    webSocketServer: {port: 8082},

    testClientTimeout : 3,

    needRecreateDB : false,

    dataman: {
        connection: USE_MSSQL_SERVER ? mssql_connection : mysql_connection,

        importData: {
            autoimport: false,
            dir: __dirname + "/data/tables/"
        },
        trace: {
            sqlCommands: true,
            importDir: true
        }
    },
    resman: {
        useDb: true,
        defaultProduct: "ProtoOne",
        sourceDir: [
            //{path: __dirname + '/data/forms/', type: 'FRM'},
            {path: __dirname + '/data/processDefinitions/', type: 'PR_DEF', generator: __dirname + '/generators/processDefGenerator.js'}
        ]
    },
    resourceBuilder: {
        types: [
            //{Code: "FRM", Name: "User Form", ClassName: "ResForm", Description: "Пользовательская форма"},
            {Code: "PR_DEF", Name: "Process Definition", ClassName: "ProcessDefinition", Description: "Определение процесса"}
        ],
        destDir : __dirname + "/data/tables/",
        formResTypeId: 1,
        productId: 2,
        currBuildId: 2
    }
};

var UccelloConfig = require(_path.Uccello + 'config/config');
UCCELLO_CONFIG = new UccelloConfig(_config);
PATH = _path;
DEBUG = true;