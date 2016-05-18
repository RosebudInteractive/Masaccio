// дирректория где лежит Uccello
var uccelloDir = process.argv[2] ? process.argv[2] : 'Uccello';
console.log('Using folder: ' + uccelloDir);

// Модули nodejs
var http = require('http');
var express = require('express');
var app = express();

// Обработчики express
// ----------------------------------------------------------------------------------------------------------------------

require('ejs');
// обработчик файлов html будет шаблонизатор ejs
app.engine('html', require('ejs').renderFile);

// обработка /masaccio
app.get('/masaccio', function(req, res){
    res.render('index.html');
});

// статические данные и модули для подгрузки на клиент
app.use("/public", express.static(__dirname + '/public'));
app.use("/public/uccello", express.static(__dirname + '/../'+uccelloDir));
app.use("/tests", express.static(__dirname + '/tests'));

/**
 * Функция заглушка для аутентификации
 * @param user
 * @param pass
 * @param done
 */
function fakeAuthenticate(user, pass, done) {
    var err = null, row = null;
    if (user.substring(0, 1)=='u' && pass.substring(0, 1)=='p')
        row = {user:user, user_id:1, email:user+'@gmail.com'};
    else {
        var users = {
            'Ivan':'123',
            'Olivier':'123',
            'Plato':'123'
        };
        if (users[user] && users[user]==pass) {
            row = {user:user, user_id:1, email:user+'@gmail.com'};
        }
    }
    done(err, row);
}

var config = {
    controls:[
        {className:'Engine', component:'wfe/engine', guid:'387e8d92-e2ca-4a94-9732-b4a479ff8bb8'},
        {className:'ProcessDefinition', component:'wfe/processDefinition', guid:'acd97fff-93f9-47ed-84bb-e24ffdf28fc5'},
        {className:'Process', component:'wfe/process', guid:'74441683-a11f-4b59-9e04-0aefcc5bc18a'},
        {className:'FlowNode', component:'wfe/flowNode', guid:'199a78b0-b555-4f97-9d8f-41234ae7f06f'},
        {className:'SequenceFlow', component:'wfe/sequenceFlow', guid:'c7a6cd70-653f-4e12-b6dc-8a6085b7fc7f'},
        {className:'NodeProperties', component:'wfe/NodeProps/nodeProperties', guid:'867a7d2e-8868-48f7-8086-3d2817aec604'},
        /*Activities*/
        {className:'Activity', component:'wfe/Activities/activity', guid:'173a2e1f-909d-432d-9255-895f35335f65'},
        {className:'UserTask', component:'wfe/Activities/userTask', guid:'e9af2d49-ef3c-4b9a-b693-36a9f7a5cd4a'},
        {className:'ScriptTask', component:'wfe/Activities/scriptTask', guid:'db02ee41-b89e-4a33-ba60-109008945bf5'},
        /*Gateways*/
        {className:'Gateway', component:'wfe/Gateways/gateway', guid:'05e31d1c-7b7e-4fb8-b23d-063fee27b9f6'},
        {className:'ExclusiveGateway', component:'wfe/Gateways/exclusiveGateway', guid:'8a1cfe3d-d0d5-4ee6-aa4b-667b1f8934ec'},
        {className:'InclusiveGateway', component:'wfe/Gateways/inclusiveGateway', guid:'fb2384a6-ea09-4c48-a069-864d6af845f7'},
        {className:'ConditionsResult', component:'wfe/Gateways/conditionsResult', guid:'7c19308e-fbb1-40c9-aecf-18b76f5e960a'},

        {className:'Token', component:'wfe/token', guid:'d09117fc-b298-42f6-84fc-c8807e83ca12'},
        {className:'Request', component:'wfe/request', guid:'783cc459-0b03-4cbd-9960-6401a031537c'},
        {className:'RequestStorage', component:'wfe/requestStorage', guid:'d59ea34f-a525-4551-b8e8-8d182e32571c'},
        {className:'Notifier', component:'wfe/notify', guid:'98f90a0e-0fdf-482a-996e-8197d982689a'},
        {className:'Parameter', component:'wfe/parameter', guid:'9232bbd5-e2f8-466a-877f-5bc6576b5d02'}
        //{className:'ScriptExecutor', component:'wfe/scriptExecutor', guid:'047402a6-3e36-4e4f-857a-755adbd04ab8'}
    ],

    controlsPath :  __dirname + '/../Masaccio/',
    dataPath :      __dirname + '/../Masaccio/data/',
    uccelloPath :   __dirname + '/../' + uccelloDir + '/',
    scriptsPath :   __dirname + '/../Masaccio/UserScripts/',
    webSocketServer : { port:8082 }
};

// модуль настроек
var UccelloConfig = require('../' + uccelloDir + '/config/config');
UCCELLO_CONFIG = new UccelloConfig(config);
DEBUG = true;

// модуль сервера
var UccelloServ = require('../'+uccelloDir+'/uccelloServ');
var uccelloServ = new UccelloServ({authenticate:fakeAuthenticate});

// код для Engine
var ControlMgr = require('../'+uccelloDir+'/controls/controlMgr');
var UObject = require('../'+uccelloDir+'/system/uobject');
var Engine = require('./wfe/engine');
var EngineSingleton = require('./wfe/engineSingleton');

var TestClient = require('./test/testClient');

// objects
var dbc = uccelloServ.getUserMgr().getController();
var dbp = {name: "Engine", kind: "master", guid:'fb9653ea-4fc3-aee0-7a31-172a91aa196b'};
var db = dbc.newDataBase(dbp);
var cm = new ControlMgr({ controller: db.pvt.controller, dbparams: dbp});

// meta
new UObject(cm);
// создаем объект

var engine = new Engine(cm, { ini: { fields: { Name: 'Engine', State: 'Ok' } } });
EngineSingleton.setInstance(engine);

var testClient = new TestClient(engine);
engine.notifier.registerObserver(testClient, testClient.handleNewRequest);

// запускаем http сервер
http.createServer(app).listen(1328);
console.log('[%s] : => Сервер запущен на http://127.0.0.1:1328/masaccio', (new Date()).toLocaleTimeString());

//var _def1 = TestDefinitions.exclusiveGatewayTest_Definition(cm);
//var _def2 = TestDefinitions.inclusiveGatewayTest_Definition(cm);
//EngineSingleton.getInstance().addProcessDefinition(_def1);
//EngineSingleton.getInstance().addProcessDefinition(_def2);
//
//EngineSingleton.getInstance().startProcessInstance(_def2.definitionId);