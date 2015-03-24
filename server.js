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
        /*{className:'DataContact', component:'../DataControls/dataContact', guid:'73596fd8-6901-2f90-12d7-d1ba12bae8f4'},
        {className:'DataContract', component:'../DataControls/dataContract', guid:'08a0fad1-d788-3604-9a16-3544a6f97721'},
        {className:'DataCompany', component:'../DataControls/dataCompany', guid:'59583572-20fa-1f58-8d3f-5114af0f2c514'},
        {className:'DataAddress', component:'../DataControls/dataAddress', guid:'16ec0891-1144-4577-f437-f98699464948'},
        {className:'DataLead', component:'../DataControls/dataLead', guid:'86c611ee-ed58-10be-66f0-dfbb60ab8907'},
        {className:'DataIncomeplan', component:'../DataControls/dataIncomeplan', guid:'56cc264c-5489-d367-1783-2673fde2edaf'},
        {className:'DbNavigator', component:'dbNavigator', guid:'38aec981-30ae-ec1d-8f8f-5004958b4cfa'},
        {className:'MatrixGrid', component:'matrixGrid', guid:'827a5cb3-e934-e28c-ec11-689be18dae97'},
        {className:'PropEditor', component:'propEditor', guid:'a0e02c45-1600-6258-b17a-30a56301d7f1'}*/
    ],
    controlsPath: __dirname+'/../Masaccio/public/controls/',
    dataPath: __dirname+'/../Masaccio/data/',
    uccelloPath: __dirname+'/../'+uccelloDir+'/'
};

// модуль настроек
var UccelloConfig = require('../'+uccelloDir+'/config/config');
UCCELLO_CONFIG = new UccelloConfig(config);

// модуль сервера
var UccelloServ = require('../'+uccelloDir+'/uccelloServ');
var uccelloServ = new UccelloServ({port:8081, authenticate:fakeAuthenticate});

// запускаем http сервер
http.createServer(app).listen(1328);
console.log('Сервер запущен на http://127.0.0.1:1328/masaccio');