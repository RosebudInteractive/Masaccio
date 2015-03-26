requirejs.config({
    baseUrl: 'public',
    nodeRequire: require,
    paths: {
        text       : '/public/uccello/uses/text',
        underscore : '/public/uccello/uses/underscore'
    }
});

var uccelloClt = null;

// когда документ загружен
$(document).ready( function() {
    require(['./uccello/config/config'], function(Config){

        var config = {
            controls: [
                /*{className:'DataContact', component:'../DataControls/dataContact', guid:'73596fd8-6901-2f90-12d7-d1ba12bae8f4'},
                {className:'DataContract', component:'../DataControls/dataContract', guid:'08a0fad1-d788-3604-9a16-3544a6f97721'},
                {className:'DataCompany', component:'../DataControls/dataCompany', guid:'59583572-20fa-1f58-8d3f-5114af0f2c514'},
                {className:'DataAddress', component:'../DataControls/dataAddress', guid:'16ec0891-1144-4577-f437-f98699464948'},
                {className:'DataLead', component:'../DataControls/dataLead', guid:'86c611ee-ed58-10be-66f0-dfbb60ab8907'},
                {className:'DataIncomeplan', component:'../DataControls/dataIncomeplan', guid:'56cc264c-5489-d367-1783-2673fde2edaf'},
                {className:'DbNavigator', component:'dbNavigator', viewset:true, guid:'38aec981-30ae-ec1d-8f8f-5004958b4cfa'},
                {className:'MatrixGrid', component:'matrixGrid', viewset:true, guid:'827a5cb3-e934-e28c-ec11-689be18dae97'},
                {className:'PropEditor', component:'propEditor', viewset:true, guid:'a0e02c45-1600-6258-b17a-30a56301d7f1'},
                {className:'Container', viewset:true},
                {className:'Form', viewset:true},
                {className:'Button', viewset:true},
                {className:'DataGrid', viewset:true},
                {className:'DataEdit', viewset:true},
                {className:'Edit', viewset:true},
                {className:'Label', viewset:true}*/
            ],
            controlsPath: 'controls/',
            uccelloPath: 'uccello/',
            viewSet: {name: 'simpleview', path:'ProtoControls/simpleview/'},
            webSocketServer: {port:8082}
        };
        UCCELLO_CONFIG = new Config(config);

    require(
        ['./uccello/uccelloClt'],
        function(UccelloClt){

            var that = this;
			this.tabCount = 0;
            this.currRoot=null;
            this.rootsGuids=[];
            this.rootsContainers={};
            this.resultForm = '#result0';
            this.hashchange = true;

            this.clearTabs = function() {
                $(that.resultForm).empty();
                that.tabCount = 0;
                that.rootsContainers = {};
                that.rootsGuids = [];
                that.resultForm = '#result0';
                $('#tabs').empty();
                $('#container').empty();
            }

            this.setContextUrl = function(context, formGuids) {
                that.hashchange = false;
                document.location = that.getContextUrl(context, formGuids);

            }

            this.getContextUrl = function(context, formGuids) {
                var location = document.location.href;
                location = location.replace(/#.*/, '');
                formGuids = !formGuids || formGuids=='all'?'all':formGuids;
                if (formGuids !='all' && typeof formGuids == "string") formGuids = [formGuids];
                return location+'#context='+context+'&formGuids='+(!formGuids || formGuids=='all'?'all':formGuids.join(','))
            }

            /**
             * Выбрать контекст
             * @param guidcd
             */
            this.selectContext = function(params) {
                that.clearTabs();

                var formGuids = 'all';
                var urlGuids = url('#formGuids');
                if (urlGuids != null) {
                    formGuids = urlGuids.split(',');
                }

                // выборочная подписка
                var selSub = $('#selSub').is(':checked');
                if (selSub) {
                    formGuids = $('#selForm').val();
                    formGuids = formGuids!=null? formGuids: [];
                }


                if (formGuids == null || formGuids == 'all') {
                    // запросить гуиды рутов
                    uccelloClt.getClient().socket.send({action:"getRootGuids", db:params.masterGuid, rootKind:'res', type:'method', formGuids:formGuids}, function(result) {
                        that.rootsGuids = result.roots;
                        uccelloClt.setContext(params, function(result) {
                            that.setContextUrl(params.vc, formGuids);
                            that.setAutoSendDeltas(true);
                            that.getContexts();
                        }, that.renderRoot);
                    });
                } else {
                    that.rootsGuids = formGuids;
                    params.formGuids = formGuids;
                    uccelloClt.setContext(params, function(result) {
                        uccelloClt.getClient().socket.send({action:"getRootGuids", db:params.masterGuid, rootKind:'res', type:'method', formGuids:formGuids}, function(result2) {
                            var newFormGuids = [];
                            for(var i in formGuids) {
                                var found = false;
                                for(var j in result2.roots) {
                                    if (result2.roots[j] == formGuids[i])
                                        found = true;
                                }
                                if (!found)
                                    newFormGuids.push(formGuids[i]);
                            }
                            if (newFormGuids.length > 0)
                                uccelloClt.createRoot(newFormGuids, "res");
                        });
                        that.setContextUrl(params.vc, formGuids);
                        that.setAutoSendDeltas(true);
                        that.getContexts();
                    }, that.renderRoot);
                }
            }

            /**
             * Рендер переключателя рута
             * @param rootGuid {string}
             * @returns {object}
             */
            this.renderRoot = function(rootGuid){

                if (that.rootsContainers[rootGuid] !== undefined) {
                    return {rootContainer: "#result"+that.rootsContainers[rootGuid]};
                }

                var i = that.tabCount;
                $('#tabs').append('<input type="button" class="tabs '+(i==0?'active':'')+'" value="Root '+i+'" onclick="selectTab('+i+');"> ');
                $('#container').append('<div id="result'+i+'" class="tabs-page" style="'+(i!=0?'display: none;':'')+'"/>');
                that.rootsGuids[i]=rootGuid;
                that.rootsContainers[that.rootsGuids[i]] = i;
                fixHeight();
                that.tabCount++;

                if (i==0)
                    that.currRoot = that.rootsGuids[0];

                return {rootContainer: "#result"+i};
            }

            /**
             * Получить контексты и отобразить в комбо
             */
            this.getContexts = function() {
                var sel = $('#userContext');
                var selOn = $('#userContextOn');
                sel.empty();
                selOn.empty();
                selOn.append('<option value=""></option>');

                for (var i = 0, len = uccelloClt.getSysDB().countRoot(); i < len; i++) {
                    var root = uccelloClt.getSysDB().getRoot(i);
                    var obj = root.obj;
                    for (var j = 0, len2 = obj.countCol(); j < len2; j++) {
                        var col = obj.getCol(j);
                        var name = col.getName();
                        if (name == "VisualContext") {
                            for (var k = 0, len3 = col.count(); k < len3; k++) {
                                var item = col.get(k);
                                var option = $('<option/>');
                                var isOn = uccelloClt.getSysCM().getByGuid(item.getGuid()).isOn();
                                option.data('ContextGuid', item.get('ContextGuid'));
                                option.val(item.get('DataBase')).html(item.get('Name')+(isOn?' isOn ':''));
                                sel.append(option);
                                if (isOn) {
                                    var option = $('<option/>');
                                    option.data('ContextGuid', item.get('ContextGuid'));
                                    option.val(item.get('DataBase')).html(item.get('Name'));
                                    selOn.append(option);
                                }
                            }

                            var masterGuid = uccelloClt.getContext()? uccelloClt.getContext().dataBase(): null;
                            if (masterGuid) {
                                var urlGuids = url('#formGuids');
                                urlGuids = urlGuids==null || urlGuids=='all'?'all':urlGuids.split(',');
                                that.setContextUrl($(sel.find('option[value='+masterGuid+']')).data('ContextGuid'), urlGuids);
                            }
                            sel.val(masterGuid);
                            return;
                        }
                    }
                }
            }

            /**
             * автодельта
             * @param check
             */
            this.setAutoSendDeltas = function(check) {
                var cm = uccelloClt.getContextCM(that.currRoot);
                if (cm) {
                    if (check)
                        $('#autoSendDelta').prop('checked', cm.autoSendDeltas());
                    else
                        cm.autoSendDeltas($('#autoSendDelta').is(':checked'));
                }

            }

            this.newTab = function(data) {
                window.open(that.getContextUrl(data.contextGuid, data.resGuids));
            }




            uccelloClt = new UccelloClt({
                callback: function(){
                    var user = uccelloClt.getUser();
                    if (user) {
                        that.getContexts();
                        $('#login').hide(); $('#logout').show();$('#loginForm').hide();
                        $('#userInfo').html('User: '+user.name()+' <br>Session:'+uccelloClt.getSessionGuid()/*+' <br>DeviceName:'+uccelloClt.getSession().deviceName*/);

                        var vc = url('#context');
                        var vcObj = uccelloClt.getSysCM().getByGuid(vc);
                        if(vcObj && vc)
                            $('#userContext').val(vcObj.dataBase()).change();

                    } else {
                        $('#logout').hide(); $('#login').show();
                        $('#userInfo').html('');
                    }
                },
                //renderRoot: that.renderRoot,
                newTabCallback: that.newTab
            });


            // --------------------------------------------------------------------------------------------------------
            // --------------------- Глобальные методы для кнопок управления -----------------------------------------
            // --------------------------------------------------------------------------------------------------------

            /**
             * subscribe user
             */
            window.subscribeRootSys = function() {
                // подписываемся на корневой объект контейнера
                uccelloClt.getSysDB().subscribeRoots(uccelloClt.pvt.guids.sysRootGuid, function(result){
                    that.getContexts();
                }, function() {

                } );
            }

            var addControlId = 1000;
            window.addControl = function(guid, ini, cm) {
                if (!cm) cm = uccelloClt.getContextCM(that.currRoot);
                if (!ini) {
                    ini = {fields: {"Id": addControlId, "Name": 'Component'+addControlId, "Left":"300", "Top":"150"}};
                    addControlId++;
                }

                var rootCont = null;
                var gl = cm._getCompGuidList();
                for (var f in gl)
                    if (gl[f].getClassName() == "Container") { rootCont=gl[f]; break; }

                var constr = uccelloClt.getConstr(guid);
                var control = new constr(cm, {parent: rootCont, colName: "Children", ini:ini }, {parent:that.resultForm});
                sendDeltas(false);
                uccelloClt.getContext().renderAll(true);
            }

            /**
             * Удалить контрол
             * @param guid
             * @param cm
             */
            window.delControl = function(guid, cm) {
                if (!cm) cm = uccelloClt.getContextCM(that.currRoot);
                cm.del(guid);
                uccelloClt.getController().genDeltas(cm.getDB().getGuid());
                uccelloClt.getContext().renderAll(true);
            }

            /**
             * Получить  получить на клиент от сервера структуру - все сессии с номерами и когда созданы,
             * все коннекты этих сессий - с номерами и когда созданы - и чтобы эту инфо можно было вывести
             * в мемо поле по кнопке (трассировка)
             */
            window.getSessions = function() {
                uccelloClt.getClient().socket.send({action:"getSessions", type:'method'}, function(result){
                    console.log(result);
                });
            }

            /**
             * Логин
             * @param name
             * @param pass
             */
            window.login = function(name, pass){
                var session = $.cookie('session_'+name)? JSON.parse($.cookie('session_'+name)): {guid:uccelloClt.getSessionGuid(), deviceName:'MyComputer', deviceType:'C', deviceColor:'#6ca9f0'};
                uccelloClt.getClient().authenticate({user:name, pass:pass, session:session}, function(result){
                    if (result.user) {
                        $.cookie('session_'+name, JSON.stringify(result.user.session), { expires: 30 });
                        uccelloClt.subscribeUser(function(result2){
                            if (!result2) {
                                $('#logout').hide(); $('#login').show();
                                $('#loginError').html('Ошибка подписки').show();
                                $('#userInfo').html('');
                            } else {
                                that.getContexts();
                                $('#login').hide(); $('#logout').show();
                                $('#loginForm').hide();
                                $('#loginError').hide();
                                $('#userInfo').html('User: '+result.user.user+' <br>Session:'+uccelloClt.getSessionGuid()/*+' <br>DeviceName:'+uccelloClt.getSession().deviceName*/);
                            }
                        });
                    } else {
                        $('#logout').hide(); $('#login').show();
                        $('#loginError').html('Неправильный логин или пароль').show();
                        $('#userInfo').html('');
                    }
                });
            }

            /**
             * Выход
             */
            window.logout = function(){
                uccelloClt.deauthenticate(function(result){
                    $('#login').show(); $('#logout').hide();
                    $('#userInfo').html('');$('#loginForm').show();
                });
            }

            /**
             * Отправить дельту
             * @param force {bool} Всегда отправлять
             */
            window.sendDeltas = function (force) {
                if ($('#autoSendDelta').is(':checked') || force)
                    uccelloClt.getController().genDeltas(uccelloClt.getContextCM(that.currRoot).getDB().getGuid());
            }

            /**
             * Создать серверный контекст
             * @param formGuids массив гуидов ресурсов, который загружается в контекст
             */
            window.createContext = function(formGuids) {
                if (!formGuids) formGuids = ['88b9280f-7cce-7739-1e65-a883371cd498'];
                $(that.resultForm).empty();
                that.clearTabs();
                uccelloClt.createContext('server', formGuids, function(result){
                    that.selectContext(result);
                });
            }


            /**
             * Создать клиентский контекст
             * @param guid
             */
            window.createClientContext = function(formGuids) {
                if (!formGuids) return;
                that.clearTabs();
                uccelloClt.createContext('client', formGuids, function(result){
                    that.setAutoSendDeltas(true);
                    that.getContexts();
                });
            }



            /**
             * Выбрать рут
             * @param i
             */
            window.selectTab = function (i){
                $('.tabs').removeClass('active');
                $($('.tabs')[i]).addClass('active');
                $('.tabs-page').hide();
                $($('.tabs-page')[i]).show();
                that.resultForm = '#result'+i;
                that.currRoot = that.rootsGuids[i];
                that.setAutoSendDeltas(true);
            }


            /**
             * Создать рут ресурсов (не данных)
             */
            window.createRoot = function(){
                var formGuids = $('#selForm').val();
                if (!formGuids) {
                    console.log('выберите формы для создания рута');
                    return;
                }
                uccelloClt.createRoot(formGuids, "res", function(result){
                    if (result.guids)
                        that.setContextUrl(url('#context'), result.guids);
                });
            }

            /**
             * Кнопка query
             */
            window.loadQuery = function(rootGuid){
                var context = uccelloClt.getContext();
                if (!context) return;
                uccelloClt.createRoot(rootGuid, "data", function(result){
                    var cm = uccelloClt.getContextCM(that.currRoot);
                    var db = cm.getDB();
                    if (result[0]) {
                        var dataset = cm.getByName("DatasetCompany");
                        dataset.root(result[0]);
                        sendDeltas(false);
                    }
                });
            }

            /**
             * Сериализовать форму и вывести в консоль
             */
            window.serializeForm = function(){
                if (!uccelloClt.getContext()) return;
                var root = uccelloClt.getContextCM(that.currRoot).getDB().getObj(that.currRoot);
                console.log(uccelloClt.getContextCM(that.currRoot).getDB().serialize(root));
            }

            /**
             * присваивается значение параметру формы
             * @param value
             */
            window.setParam = function(value) {
                var cm = uccelloClt.getContextCM(that.currRoot);
                var formParam1 = cm.getByName("FormParam1");
                formParam1.value(value);
                sendDeltas(true);
            }

            window.openTab = function() {
                // выборочная подписка
                var selSub = $('#selSub').is(':checked');
                var formGuids = 'all';
                if (selSub) {
                    formGuids = $('#selForm').val();
                }
                uccelloClt.getClient().newTab(url('#context'), uccelloClt.getSysCM().getByGuid(url('#context')).dataBase(), formGuids, $('#sessionGuid').val()==''?uccelloClt.getSessionGuid():$('#sessionGuid').val());
            }

            window.refreshContexts = function() {
                    that.getContexts();
            }

            // ----------------------------------------------------------------------------------------------------
            // ---------------------- Функции обработчики хтмл объектов -------------------------------------------

            // высота окошка результатов
            fixHeight = function() {
                var h = $(window).height();
                $('.tabs-page').height(h-120);
                $('#editor').height(h-100);
                $('#console').width('100%');
            };
            fixHeight();
            $(window).resize(fixHeight);

            // форма логина
            $('#login').click(function(e){
                e.stopPropagation();

                // автологин
                login($('#loginName').val(), $('#loginPass').val());
                return;

                // старый логин
                if ($('#loginForm').is(':visible')) {
                    $('#loginForm').hide();
                } else {
                    var offset = $(this).offset();
                    offset.top += 20;
                    $('#loginForm').show().offset(offset);
                }
                return false;
            });
            $(window).click(function(){$('#loginForm').hide();});
            $('#loginForm').click(function(e){e.stopPropagation();});

            $('#userContext').change(function(){
                var masterGuid = $(this).val();
                var vc = $(this).find('option[value="'+masterGuid+'"]').data('ContextGuid');
                if(masterGuid && vc)
                    that.selectContext({masterGuid: masterGuid, vc:vc,  side: "server"});
                else
                    that.clearTabs();
            });

            $('#userContextOn').change(function(){
                var masterGuid = $(this).val();
                var vc = $(this).find('option[value="'+masterGuid+'"]').data('ContextGuid');
                if(masterGuid && vc) {
                    var vcObj = uccelloClt.getSysCM().getByGuid(vc);
                    vcObj.off(function(){
                        that.getContexts();
                    });
                }
            });

            $('#autoSendDelta').click(function(e){
                  that.setAutoSendDeltas(false);
            });

            $(window).on('hashchange', function() {
                if (that.hashchange) {
                    var vc = url('#context');
                    var vcObj = uccelloClt.getSysCM().getByGuid(vc);
                    if(vcObj && vc)
                        $('#userContext').val(vcObj.dataBase()).change();
                }
                that.hashchange = true;
            });

            // ----------------------------------------------------------------------------------------------------

        });
    });
});