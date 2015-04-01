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

    classGuids : {
        'ClientConnection':"5f27198a-0dd2-81b1-3eeb-2834b93fb514",
        'Connect':'66105954-4149-1491-1425-eac17fbe5a72',
        'ConnectInfo':"42dbc6c0-f8e4-80a5-a95f-e43601cccc71",
        'Session':"70c9ac53-6fe5-18d1-7d64-45cfff65dbbb",
        'SessionInfo':"479c72e9-29d1-3d6b-b17b-f5bf02e52002",
        'User':"dccac4fc-c50b-ed17-6da7-1f6230b5b055",
        'UserInfo':"e14cad9b-3895-3dc9-91ef-1fb12c343f10",
        'AComponent':"5b8c93e7-350d-de2a-e2b4-1025a03b17db",
        'AControl':"c576cb6e-cdbc-50f4-91d1-4dc3b48b0b59",
        'ADataControl':"b2c132fd-c6bc-b3c7-d149-27a926916216",
        'ADataFieldControl':"00a12976-6fe3-6592-1984-635684b30885",
        'ADataModel':"5e89f6c7-ccc2-a850-2f67-b5f5f20c3d47",
        'DataField':"4bade3a6-4a25-3887-4868-9c3de4213729",
        'Dataset':"3f3341c7-2f06-8d9d-4099-1075c158aeee",
        'FormParam':"4943ce3e-a6cb-65f7-8805-ec339555a981",
        'SubForm':"d7785c24-0b96-76ee-46a7-b0103cda4aa0",
        'DataRoot':"87510077-53d2-00b3-0032-f1245ab1b74d",
        'Label':"32932036-3c90-eb8b-dd8d-4f19253fabed",
        'Form':"7f93991a-4da9-4892-79c2-35fe44e69083",
        'Edit':"f79d78eb-4315-5fac-06e0-d58d07572482",
        'DataEdit':"affff8b1-10b0-20a6-5bb5-a9d88334b48e",
        'DataColumn':"100f774a-bd84-8c46-c55d-ba5981c09db5",
        'Container':"1d95ab61-df00-aec8-eff5-0f90187891cf",
        'Button':"af419748-7b25-1633-b0a9-d539cada8e0d",
        'DataGrid':"ff7830e2-7add-e65e-7ddf-caba8992d6d8",
        'UModule':"8fead303-a4e1-98bb-efb6-ee38ee021265",
        'VisualContext':"64827c89-e73e-215f-f71a-7f90627ae61d",
        'Vcresource':"870c63b5-7aed-bb44-3109-bb63a407988f",
        //---------------- МОИ -----------
        'Engine' : "387E8D92-E2CA-4A94-9732-B4A479FF8BB8",
        'ProcessDefinition' : "ACD97FFF-93F9-47ED-84BB-E24FFDF28FC5",
        'Process' : "74441683-A11F-4B59-9E04-0AEFCC5BC18A",
        'FlowNode' : "199A78B0-B555-4F97-9D8F-41234AE7F06F",
        'SequenceFlow' : "C7A6CD70-653F-4E12-B6DC-8A6085B7FC7F",
        'Activity' : "173a2e1f-909d-432d-9255-895f35335f65",
        'Gateway' : "05e31d1c-7b7e-4fb8-b23d-063fee27b9f6"
    },

    controlsPath: __dirname+'/../Masaccio/public/controls/',
    dataPath: __dirname+'/../Masaccio/data/',
    uccelloPath: __dirname+'/../'+uccelloDir+'/',
    webSocketServer: {port:8082}
};

// модуль настроек
var UccelloConfig = require('../'+uccelloDir+'/config/config');
UCCELLO_CONFIG = new UccelloConfig(config);

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