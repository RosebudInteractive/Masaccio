// дирректория где лежит Uccello
var uccelloDir = process.argv[2]?process.argv[2]:'Uccello';
console.log('Using folder: '+uccelloDir);

// Модули nodejs
var http = require('http');
var express = require('express');
var app = express();

// Обработчики express
// ----------------------------------------------------------------------------------------------------------------------

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
        {className:'Engine', component:'./wfe/engine', guid:'387e8d92-e2ca-4a94-9732-b4a479ff8bb8'},
        {className:'ProcessDefinition', component:'./wfe/processDefinition', guid:'acd97fff-93f9-47ed-84bb-e24ffdf28fc5'},
        {className:'Process', component:'./wfe/process', guid:'74441683-a11f-4b59-9e04-0aefcc5bc18a'},
        {className:'FlowNode', component:'./wfe/flowNode', guid:'199a78b0-b555-4f97-9d8f-41234ae7f06f'},
        {className:'SequenceFlow', component:'./wfe/sequenceFlow', guid:'c7a6cd70-653f-4e12-b6dc-8a6085b7fc7f'},
        {className:'TokenProperties', component:'./wfe/tokenProperties', guid:'867a7d2e-8868-48f7-8086-3d2817aec604'},
        /*Activities*/
        {className:'Activity', component:'/wfe/Activities/activity', guid:'173a2e1f-909d-432d-9255-895f35335f65'},
        {className:'UserTask', component:'wfe/Activities/userTask', guid:'e9af2d49-ef3c-4b9a-b693-36a9f7a5cd4a'},
        /*Gateways*/
        {className:'Gateway', component:'./wfe/Gateways/Gateway', guid:'05e31d1c-7b7e-4fb8-b23d-063fee27b9f6'},
        {className:'Token', component:'./wfe/token', guid:'d09117fc-b298-42f6-84fc-c8807e83ca12'},
        {className:'Request', component:'./wfe/request', guid:'783cc459-0b03-4cbd-9960-6401a031537c'}
    ],

    controlsPath: __dirname+'/../Masaccio/public/controls/',
    dataPath: __dirname+'/../Masaccio/data/',
    uccelloPath: __dirname+'/../'+uccelloDir+'/',
    webSocketServer: {port:8082}
};

// модуль настроек
var UccelloConfig = require('../'+uccelloDir+'/config/config');
UCCELLO_CONFIG = new UccelloConfig(config);
DEBUG = true;

// модуль сервера
var UccelloServ = require('../'+uccelloDir+'/uccelloServ');
var uccelloServ = new UccelloServ({authenticate:fakeAuthenticate});
var that = this;
uccelloServ.getRouter().add('createProcess', function() {return that.createProcess.apply(that, arguments)});

// код для Engine
var ControlMgr = require('../'+uccelloDir+'/controls/controlMgr');
var UObject = require('../'+uccelloDir+'/system/uobject');
var Engine = require('./wfe/engine');
var EngineSingleton = require('./wfe/engineSingleton');

var TestClient = require('./test/testClient');
var TestDefinitions = require('./test/definitions')

// objects
var dbc = uccelloServ.getUserMgr().getController();
var db = dbc.newDataBase({name: "Engine", kind: "master", guid:'fb9653ea-4fc3-aee0-7a31-172a91aa196b'});
var cm = new ControlMgr(db);

// meta
new UObject(cm);

// создаем объект

var engine = new Engine(cm, { ini: { fields: { Name: 'Engine', State: 'Ok' } } });
EngineSingleton.setInstance(engine);

var testClient = new TestClient(engine);
engine.notifier.registerObserver(testClient, testClient.handleNewRequest);

// запускаем http сервер
http.createServer(app).listen(1328);
console.log('Сервер запущен на http://127.0.0.1:1328/masaccio');

var _def1 = TestDefinitions.exclusiveGatewayTest_Definition(cm);
var _def2 = TestDefinitions.inclusiveGatewayTest_Definition(cm);
EngineSingleton.getInstance().addProcessDefinition(_def1);
EngineSingleton.getInstance().addProcessDefinition(_def2);

EngineSingleton.getInstance().startProcessInstance(_def2.definitionID);