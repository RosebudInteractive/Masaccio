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
        {className:'Engine', component:'./wfe/engine', guid:'387E8D92-E2CA-4A94-9732-B4A479FF8BB8'},
        {className:'ProcessDefinition', component:'./wfe/processDefinition', guid:'ACD97FFF-93F9-47ED-84BB-E24FFDF28FC5'},
        {className:'Process', component:'./wfe/process', guid:'74441683-A11F-4B59-9E04-0AEFCC5BC18A'},
        {className:'FlowNode', component:'./wfe/flowNode', guid:'199A78B0-B555-4F97-9D8F-41234AE7F06F'},
        {className:'SequenceFlow', component:'./wfe/sequenceFlow', guid:'C7A6CD70-653F-4E12-B6DC-8A6085B7FC7F'},
        {className:'Activity', component:'./wfe/activity', guid:'173a2e1f-909d-432d-9255-895f35335f65'},
        {className:'Gateway', component:'./wfe/Gateway', guid:'05e31d1c-7b7e-4fb8-b23d-063fee27b9f6'}
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

// код для Engine
var ControlMgr = require('../'+uccelloDir+'/controls/controlMgr');
var UObject = require('../'+uccelloDir+'/system/uobject');
var Engine = require('./wfe/engine');

// objects
var dbc = uccelloServ.getUserMgr().getController();
var db = dbc.newDataBase({name: "Engine", kind: "master", guid:'fb9653ea-4fc3-aee0-7a31-172a91aa196b'});
var cm = new ControlMgr(db);

// meta
new UObject(cm);
new Engine(cm);

// создаем объект
var engine = new Engine(cm, { ini: { fields: { Name: 'Engine', State: 'Ok' } } });


// запускаем http сервер
http.createServer(app).listen(1328);
console.log('Сервер запущен на http://127.0.0.1:1328/masaccio');