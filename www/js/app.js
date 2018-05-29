// Dom7
//document.write("<script src='js/load_conceptos.js'></script>");

var $ = Dom7;
var sv = "http://gbargo.net", myDB = null, jsidusr = 0, jsnombres = "", jsap_pat = "", jsfoto = "";
var jslat = 0, jslon = 0;
var create_table_activities = 'CREATE TABLE IF NOT EXISTS ACTIVITIES (id INTEGER PRIMARY KEY, id_sv, actividad, id_usuario, usuarioN, id_cliente, id_cliente_sv, fecha_actividad TIMESTAMP, fecha_captura TIMESTAMP)';
var create_table_cte = 'CREATE TABLE IF NOT EXISTS CTE (id int unique, id_cte int, nombre, nombre_corto, rfc, tipo_cliente, estatus, direccion, estado_republica, municipio)';
var create_table_cto = 'CREATE TABLE IF NOT EXISTS CTO (id int unique, id_cto int, id_local_cte int, id_cte int, nombre, apellidos, nombre_corto, tipo_cto, direccion, estado, municipio, status, puesto, telefono_oficina)';
var create_table_session_hobi = 'CREATE TABLE IF NOT EXISTS SESSION_HOBI (id unique, nombres, apellidos, foto)';
var create_table_settings = 'CREATE TABLE IF NOT EXISTS SETTINGS (id unique, direccion_servidor)';
var create_table_conceptos = 'CREATE TABLE IF NOT EXISTS CONCEPTOS (id unique, concepto, valor)';
var jsclientes = [["ID", "Nombre","Nombre_corto","rfc", "tipo_cliente", "estatus", "direccion", "estado_republica", "municipio"]];
var jscontactos = [["ID", "id_cte", "nombre", "apellidos", "nombre_corto", "tipo_cto","direccion","estado","municipio","status","puesto","telefono_oficina"]];

function showPosition(position) { jslat = position.coords.latitude; jslon = position.coords.longitude; }
function getLocation() { if (navigator.geolocation) { navigator.geolocation.getCurrentPosition(showPosition); } else { alert("Geolocation is not supported by this app."); } }

// Theme
var theme = 'auto';
if (document.location.search.indexOf('theme=') >= 0) { theme = document.location.search.split('theme=')[1].split('&')[0]; }

// Init App
var app = new Framework7({
  id: 'io.gbm.hobi', root: '#app', theme: theme,
  data: function () {
    return { user: { firstName: 'J', lastName: 'D', }, }; },
  methods: { helloWorld: function () { app.dialog.alert('Hello HOBI!'); }, },
  routes: routes,
  vi: { placementId: 'pltd4o7ibb9rc653x14', },
  on: {
    // each object key means same name event handler
    pageInit: function (page) {
      getLocation();
      document.getElementById('ifmIndex').src = sv;
      if(page.route.url == '/addactivity/'){
        if(addopcs()){ $("#slc_act").focus(); }
        if(addctes()){ $("#slc_act").removeAttr("disabled"); }
        if(addctos()){ $("#slc_act").removeAttr("disabled"); }
        CargarTimePicker("#divHoraLlegada", "#txtHoraLlegada");
        CargarTimePicker("#divHoraInicio", "#txtHoraInicio");
        CargarTimePicker("#divHoraFin", "#txtHoraFin");
        //insert_next_reg();
      }else if(page.route.url == '/activities/'){
        load_act_timeline_local();
        load_act_timeline();
      }else if(page.route.url == '/cte/'){
        load_cte_local();
      }else if(page.route.url == '/settings/'){
        $("#txtServer").val(sv);

        /*FCMPlugin.getToken(function(token){
          alert('token:'+token );
          //app.dialog.prompt(token, "Hola", function(){console.log("ok");}, console.log("err"););
          $("#txtServer").val('token:'+token);
        });*/


      }else if(page.route.url.substring(0,13) == '/cte_detalle/'){
        loadCteDetail(page.route.url.substring(14,100000));
      }else if(page.route.url == '/login/'){
        CloseSesion();
      }
    },
    popupOpen: function (popup) {
      // do something on popup open
    },
  },
});

/*Buscaremos en el api del servidor los conceptos para cargar en el formulario de ADDACTIVITY, previamente cargándolos a la db local*/
var jsconceptos = [];
app.request({
  url: sv+"/api/conceptos/",
  dataType: 'json', method: "POST", crossDomain: true,
  statusCode: { 404: function(xhr) { console.log('Recurso no Encontrado.'); } },
  complete: function(){ },
  success: function(response) {
    if (response.status != 0){   //datos = false;
      console.log("Entra al if...");
    }else{
      for (var i = 0; i < response.data.length; i++) {
        jsconceptos.push(response.data[i].concepto);
      }
    }
  }, error: function(){
      console.log("Entra al Error...");
  }
});

/*Buscaremos en el api del servidor los clientes para cargar en el formulario de ADDACTIVITY, previamente cargándolos a la db local*/
function download_cte_cat(id_usr){
  if(jsidusr){
    app.request({
          url: sv+"/api/readcte/", dataType: 'json',
          data: {'usr' : jsidusr},
          method: "POST", crossDomain: true,
          statusCode: { 404: function(xhr) { console.log('Recurso no Encontrado.'); } },
          complete: function(){ },
          success: function(response) {
            if (response.status != 200){
              app.dialog.setText(response.message);
            } else{
                if(jsclientes){
                  for (var i = 0; i < response.data.length; i++) {
                    jsclientes.push([response.data[i].ID, response.data[i].nombre, response.data[i].nombre_corto, response.data[i].rfc, response.data[i].tipo_cliente, response.data[i].direccion, response.data[i].status, response.data[i].estado, response.data[i].municipio]);
                  }
                }else{
                  app.dialog.setText("No se encontró el ARRAY para Clientes.");
                }
              }
          }, error: function(){
            app.dialog.setText("Error al recuperar el catálogo de clientes.");
          }
        });
  }else{
    app.dialog.setText("Error al leer el id del usuario");
    jsidusr = id_usr;
  }
}

/*app.request({
  url: sv+"/api/readcte/",
  dataType: 'json', data: {'id_usr' : jsidusr},
  method: "POST",
  crossDomain: true,
  statusCode: { 404: function(xhr) { console.log('Recurso no Encontrado.'); } },
  complete: function(){ },
  success: function(response) {
    if (response.status != 0){   //datos = false;
      var toast = app.toast.create({ text: "No se encontraron clientes en el servidor...", closeButton: true, closeButtonText: '¡Entendido!', closeButtonColor: 'white', });
    }else{
      for (var i = 0; i < response.data.length; i++) {
        jsclientes.push([response.data[i].ID, response.data[i].nombre,response.data[i].nombre_corto]);
      }
    }
  }, error: function(){
      var toast = app.toast.create({ text: "Error al recuperar el catálogo de clientes...", closeButton: true, closeButtonText: '¡Entendido!', closeButtonColor: 'white', });
  }
});*/

/*Buscaremos en el api del servidor los contactos para cargar en el formulario de ADDACTIVITY, previamente cargándolos a la db local*/
function download_cto_cat(id_usr){
  if(jsidusr){
    app.request({
          url: sv+"/api/readcto/", dataType: 'json',
          data: {'usr' : jsidusr},
          method: "POST", crossDomain: true,
          statusCode: { 404: function(xhr) { console.log('Recurso no Encontrado.'); } },
          complete: function(){ },
          success: function(response) {
            if (response.status != 200){
              app.dialog.setText(response.message);
            } else{
                if(jscontactos){
                  for (var i = 0; i < response.data.length; i++) {
                    jscontactos.push([response.data[i].ID, response.data[i].id_cte, response.data[i].nombre, response.data[i].apellidos, response.data[i].nombre_corto, response.data[i].tipo_cto, response.data[i].direccion, response.data[i].estado, response.data[i].municipio, response.data[i].status, response.data[i].puesto, response.data[i].telefono_oficina]);
                  }
                }else{
                  alert("No se encontró el ARRAY para Contactos.");
                }
              }
          }, error: function(){
            app.dialog.setText("Error al recuperar el catálogo de contactos.");
          }
        });
  }else{
    app.dialog.setText("Error al leer el id del usuario");
    jsidusr = id_usr;
  }
}

function addopcs(){ myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 10000000); myDB.transaction(queryconceptos, errorCB, querySuccess); }
function queryconceptos(tx) {tx.executeSql('SELECT * FROM CONCEPTOS', [], querySuccess_conceptos, errorCB); }
function querySuccess_conceptos(tx, results) {
   var len = results.rows.length;
   if(len == 0){ console.log('No existen conceptos en la base de datos.'); }
   else{ for (var i = 0; i < len; i++) { $("#slc_act").append('<option value="'+results.rows.item(i).concepto+'">'+results.rows.item(i).concepto+'</option>'); } }
  console.log("Conceptos en db local cargados exitosamente.");
}

/*Leeremos los clientes registrados en la base de datos local*/
function addctes(){ myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 10000000); myDB.transaction(queryconctes, errorCB, querySuccess); }
function queryconctes(tx) { tx.executeSql('SELECT * FROM CTE LIMIT 250', [], querySuccess_ctes, errorCB); }
function querySuccess_ctes(tx, results) {
   var len = results.rows.length;
   if(len == 0){ console.log('No existen clientes en la base de datos.'); }
   else{
     for (var i = 0; i < len; i++) {
       $("#slcClienteOptgroup").append('<option value="'+results.rows.item(i).id+','+results.rows.item(i).id_cte+'">'+results.rows.item(i).nombre+'</option>');
     }
   }
  console.log("Conceptos en db local cargados exitosamente.");
}

/*Leeremos los clientes registrados en la base de datos local*/
function addctos(){
  myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 10000000);
  myDB.transaction(queryconctos, errorCB, querySuccess);
}
function queryconctos(tx) {tx.executeSql('SELECT * FROM CTO LIMIT 50', [], querySuccess_ctos, errorCB); }
function querySuccess_ctos(tx, results) {
   var len = results.rows.length;
   $("#slc_contacto_optgroup").append('<option value="0">ok</option>');
   if(len == 0){ console.log('No existen contactos en la base de datos.'); }
   else{
     for (var i = 0; i < len; i++) {
       $("#slc_contacto_optgroup").append('<option value="'+results.rows.item(i).nombre+'">'+results.rows.item(i).nombre+'</option>');
     }
   }
  console.log("Conceptos en db local cargados exitosamente.");
}

function load_act_timeline_local(){
  app.dialog.preloader('Consultando Actividades en el Equipo...');
  //Consultamos los registros Locals
  myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 10000000);
  myDB.transaction(function(tx){
         tx.executeSql(create_table_activities);
       },errorDB,successDB);
  myDB.transaction(function(tx) {
    tx.executeSql('SELECT act.id , act.id_sv, act.actividad, act.id_usuario, act.usuarioN, act.id_cliente, act.id_cliente_sv, act.fecha_actividad, act.fecha_captura, (SELECT cte.nombre FROM CTE cte WHERE cte.id = id_cliente) As nombre_cliente FROM ACTIVITIES act', [],function (tx, results) {
       var len = results.rows.length;
       if(len == 0){ console.log('No existe registros de actividades localmente.'); app.dialog.close();
       } else{
         for (var i = 0; i < len; i++) {
           if($("#activities_timeline").append('<div class="timeline-item" onClick="verInfoActividad(1)">'+
                 '<div class="timeline-item-date">' + results.rows.item(i).fecha_captura.substr(0,10) + '</div>'+
                 '<div class="timeline-item-divider"></div>'+
                 '<div class="timeline-item-content">'+ results.rows.item(i).fecha_captura.substr(10,5) +'<div class="timeline-item-inner">'+
                   '<div class="timeline-item-title"><i class="f7-icons" style="color:gray; font-size:15px;">check</i> <b style="color:#3498DB;">'+results.rows.item(i).usuarioN+'</b> registró <b>' + results.rows.item(i).actividad + '</b> para <b style="color:green;">' + results.rows.item(i).nombre_cliente + '</b>' + results.rows.item(i).fecha_actividad + '</div>'+
                 '</div></div>'+
               '</div>')){ }
         }
       }app.dialog.close();
      console.log("success");
    }, errorCB);
  }, errorCB, function (tx, results) {
     var len = results.rows.length;
     if(len == 0){ console.log('No existe registros de actividades localmente.');
     } else{ console.log(results.rows.item(0).actividad); } console.log("success");
  });
}

function load_act_timeline(){
  //Consultamos los registros en el servidor
  app.dialog.preloader('Consultando Actividades en el Servidor...');
  if(jsidusr){
    app.dialog.preloader('Consultando Actividades en el Servidor...');
    app.request({
          url: sv+"/api/readact/", dataType: 'json', method: "POST", data: {'usr':jsidusr}, crossDomain: true,
          statusCode: { 404: function(xhr) { console.log('Recurso no Encontrado.'); }
          }, complete: function(){ },
          success: function(response) {
              if (response.status != 0){
                  app.dialog.setText(response.message);
              } else{
                //for (var i = 0; i < response.data.length; i++) {
                app.dialog.preloader('Consultando Actividades en la Red...');
                for (var i = 0; i < 10; i++) {
                  if($("#activities_timeline").append('<div class="timeline-item" onClick="verInfoActividad('+response.data[i].id_actividad+')">'+
                    '<div class="timeline-item-date">'+response.data[i].fecha+'</div>'+
                    '<div class="timeline-item-divider"></div>'+
                    '<div class="timeline-item-content"><div class="timeline-item-inner">'+
                      '<div class="timeline-item-title"><i class="f7-icons" style="color:green; font-size:15px;">cloud_fill</i>&nbsp;<b style="color:#3498DB;">' + response.data[i].UsuarioN + '</b> registró <b>' + response.data[i].actividad + '</b> para <b style="color:green;">' + response.data[i].Sitio + '</b></div>'+
                    '</div></div>'+
                  '</div>')){
                    app.dialog.close();
                  }
                }
              }
          },
          error: function(){
            app.dialog.close();
              toastWithCustomButton.open();
          }
        });
  }else{
    app.dialog.setText("No se cargó el ID del usuario en la sesión.");
    //app.dialog.close();
  }
}

function load_cte_local(){
  app.dialog.preloader('Consultando Clientes en el Equipo...');
  /*Consultamos los registros Locales*/
  myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 10000000);
  myDB.transaction(function(tx){
         tx.executeSql(create_table_cte);
       },errorDB,successDB);
  myDB.transaction(function(tx) {
    tx.executeSql('SELECT * FROM CTE', [],function (tx, results) {
       var len = results.rows.length;
       $("#lblCantidadClientes").text("("+len+")");
       if(len == 0){ console.log('No existen clientes registrados localmente.'); app.dialog.close();
       } else{
         for (var i = 0; i < len; i++) {
           if($("#cte_cteslist").append('<ul><li><a href="/cte_detalle/?'+results.rows.item(i).id+'/'+results.rows.item(i).id_cte+'/'+results.rows.item(i).nombre+'"><i class="material-icons size-22">business</i>&nbsp;&nbsp;'+results.rows.item(i).nombre+'</a></li> </ul>')){

           }
         }
       }
       app.dialog.close();
       $("#loginscreen").hide();
      console.log("success");
      app.dialog.close();
    }, errorCB);
  }, errorCB, function (tx, results) {
     var len = results.rows.length;
     if(len == 0){ console.log('No existen clientes registrados localmente.');
     } else{ } console.log("success");
  });
}

function load_cto_local(id_cte, donde_buscar){
  app.dialog.preloader('Consultando Contactos en el Equipo...');
  /*Consultamos los registros Locales*/
  myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 10000000);
  myDB.transaction(function(tx){ tx.executeSql(create_table_cto); },errorDB,successDB);
  myDB.transaction(function(tx) {
    tx.executeSql('SELECT * FROM CTO WHERE '+donde_buscar+' ='+id_cte, [],function (tx, results) {
       var len = results.rows.length;
       $("#titleTabContactos").html(len+' Contacto(s)');
       if(len == 0){
       //var toastNoHayContactos = app.toast.create({ text: 'No existen contactos registrados localmente.', closeButton: true, closeButtonText: '¡Entendido!', closeButtonColor: 'white', });
       //toastNoHayContactos.open();
       app.dialog.close();
       } else{
         for (var i = 0; i < len; i++) {
           if($("#cto_ctoslist").append('<ul onClick="verInfoContacto('+results.rows.item(i).id_cto+')"><li><a href="#"><i class="material-icons size-22">perm_contact_calendar</i>&nbsp;&nbsp;'+results.rows.item(i).nombre+' '+results.rows.item(i).apellidos+'</a></li> </ul>')){
           }
         }
       }app.dialog.close();
      console.log("success");
    }, errorCB);
  }, errorCB, function (tx, results) {
     var len = results.rows.length;
     if(len == 0){ console.log('No existen contactos registrados localmente.');
     } else{ } console.log("success");
  });
}

function login(){
  if($("#usuario").val() && $("#pass").val()){
    app.dialog.preloader('Cargando...');
    app.request({
          url: sv+"/api/login/", dataType: 'json',
          data: {'lat' : '1', 'lon' : '1', 'fecha_hora':'0', 'imei':'0',
                  'plat':'iOS', 'usr' : $("#usuario").val(),
                  'pass' : $("#pass").val()},
          method: "POST", crossDomain: true,
          statusCode: { 404: function(xhr) { console.log('Recurso no Encontrado.'); } },
          complete: function(){},
          success: function(response) {
            if (response.status != 200){
               app.dialog.setText(response.message);
            } else{
                  jsap_pat = response.data.apellidos; jsfoto = response.data.foto; jsidusr = response.data.id;
                  if(jsnombres = response.data.nombres){
                    if(inserta_datos_sesion()){
                      console.log("Se insertan los datos de sesión correctamente.");
                  }
                }
              }
          },
          error: function(){
            app.dialog.alert("Error al consultar, intenta más tarde.", "HOBI");
          }
        });
  }else{
    app.dialog.alert('Debes indicar Usuario y Contraseña.', "HOBI");
  }
}

cargarSesion();
///////////////////////////////////////////////////////////////////////////////
function inserta_datos_sesion(){
  app.dialog.close();
  app.dialog.preloader('Descargando datos al equipo...');
  myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 10000000);
  myDB.transaction(function(tx){
    tx.executeSql('SELECT COUNT(*) AS r FROM SESSION_HOBI', [],
      function(tx, results){
        tx.executeSql('INSERT INTO SESSION_HOBI (id, nombres, apellidos, foto) VALUES ('+jsidusr+', "'+jsnombres+'", "'+jsap_pat+'", "'+jsfoto+'")');
        app.dialog.close();
        app.dialog.preloader('Carga correcta, procesando sesión...');
        sincroniza_conceptos();
      }, errorCB);
    }, errorDB, function(){ console.log("Inserción correcta."); });
}

function sincroniza_conceptos(){
  app.dialog.close();
  app.dialog.preloader('Sincronizando conceptos...');
  myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 10000000);
  myDB.transaction(function(tx){
    tx.executeSql('SELECT COUNT(*) AS r FROM CONCEPTOS', [],
      function(tx, results){
        tx.executeSql('CREATE TABLE IF NOT EXISTS CONCEPTOS (id, concepto, valor)');
          for (var i = 0; i < jsconceptos.length; i++) {
            tx.executeSql('INSERT INTO CONCEPTOS (id, concepto, valor) VALUES('+(i+1)+',"'+jsconceptos[i]+'", "'+jsconceptos[i]+'")');
          }
        app.dialog.close();
        app.dialog.preloader('Conceptos cargados, procesando datos...');
        sincronizaClientes();
      }, errorCB); }, errorDB, function(){ console.log("Inserción correcta."); });
}

function sincronizaClientes(){
  app.dialog.close(); app.dialog.preloader('Descargando Clientes...');
  myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 10000000);
  myDB.transaction(function(tx){
    tx.executeSql('SELECT COUNT(*) AS r FROM CTE', [],
      function(tx, results){
        tx.executeSql(create_table_cte);
          for (var i = 1; i < jsclientes.length; i++) {
            //app.dialog.setText('Registrando a '+jsclientes[i][1]);
            tx.executeSql('INSERT INTO CTE (id, id_cte, nombre, nombre_corto, rfc, tipo_cliente, direccion, estatus, estado_republica, municipio) VALUES('+i+','+jsclientes[i][0]+',"'+jsclientes[i][1]+'","'+jsclientes[i][2]+'","'+jsclientes[i][3]+'","'+jsclientes[i][4]+'","'+jsclientes[i][5]+'","'+jsclientes[i][6]+'","'+jsclientes[i][7]+'","'+jsclientes[i][8]+'")');
          }
        app.dialog.close();
        app.dialog.preloader('Clientes cargados, procesando datos...');
        sincroniza_contactos();
      }, errorCB);
    }, errorDB,
    function(){ console.log("Inserción correcta."); });
}

function sincroniza_contactos(){
  app.dialog.close(); app.dialog.preloader('Descargando Contactos...');
  myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 10000000);
  myDB.transaction(function(tx){
    tx.executeSql('SELECT COUNT(*) AS r FROM CTO', [],
      function(tx, results){
        tx.executeSql(create_table_cto);
          for (var i = 1; i < jscontactos.length; i++) {
            var insertStatement = 'INSERT INTO CTO (id, id_cto, id_local_cte, id_cte, nombre, apellidos, nombre_corto, tipo_cto, direccion) ';
            insertStatement+=' VALUES('+i+','+jscontactos[i][0]+','+i+','+jscontactos[i][1]+',"'+jscontactos[i][2]+'","'+jscontactos[i][3]+'","'+jscontactos[i][4]+'","'+jscontactos[i][5]+'","'+jscontactos[i][6]+'")';
            tx.executeSql(insertStatement);
          }
        app.dialog.close();
        app.dialog.preloader('Contactos cargados, procesando datos...');
        load_cte_local();
      }, errorCB);
    },
    errorDB,
    function(){ console.log("Inserción correcta."); });
}

function cargarSesion(){
    myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 10000000);
    myDB.transaction(function(tx){
           tx.executeSql(create_table_session_hobi); tx.executeSql(create_table_conceptos);
           tx.executeSql(create_table_cte); tx.executeSql(create_table_cto); tx.executeSql(create_table_activities);
         },errorDB,successDB);
    myDB.transaction(function(tx) { tx.executeSql('SELECT * FROM SESSION_HOBI', [], querySuccess, errorCB); }, errorCB, querySuccess);
    startInterval(); /*Iniciamos el lanzamiento de PULSOS*/
 }
 var manda_pulsos = setInterval(function () { startInterval() }, 10000);
 function startInterval(){ getLocation(); mandaPulso(jslat,jslon,jsidusr,device.platform); }

 function querySuccess(tx, results) {
    var len = results.rows.length;
    if(len == 0){ console.log('No existe usuario en sesión.'); $("#usr_pic").html("<label>Cargando Usuario...</label>"); cargarSesion();
    } else{
      $("#lblBuild").text(" Versión 1.0.47 (Build 240518)");
      $("#lblBuild").text(" Versión 1.0.47 (Build 280518)");
      $("#loginscreen").hide();
      /*Validamos usuario Jesus Gómez/Rafael Iñiguez*/
      /*if(!FCMPlugin){
        console.error("No funciona el plugin FCM");
      }else{
        FCMPlugin.getToken(function(token){
          alert('token:'+token );
          //app.dialog.prompt(token, "Hola", function(){console.log("ok");}, console.log("err"););
          $("#txtServer").val('token:'+token);
        });

        FCMPlugin.subscribeToTopic('Bargo', function(){app.dialog.alert('Suscrito correctamente a "Bargo". ');}, function(){app.dialog.alert('Error al suscribirse a "Bargo". ');});
      }*/
      /*FCMPlugin.getToken(function(token){
        alert('token:'+token );
      });*/

      /*FCMPlugin.onTokenRefresh(function(token){
          alert( token );
      });*/

      if(results.rows.item(0).id == 1 || results.rows.item(0).id == 205){ $(".developerexclusive").show(); }
      var foto = '/intranet.bargo/nuevaweb/php/uploads/'+results.rows.item(0).foto;
      if(results.rows.item(0).foto == '-'){ foto = '/intranet.bargo/fotos/usuario.png'; }
      $("#usr_pic").html('<img src="'+sv+foto+'" alt="HOBI" style="width:23px; border-radius: 50%;" /> <label style="position: absolute;right: 20px; padding-top:7px;">'+results.rows.item(0).nombres + ' ' + results.rows.item(0).apellidos+'</label>');
      jsidusr = results.rows.item(0).id;
      download_cte_cat(results.rows.item(0).id);
      download_cto_cat(results.rows.item(0).id);
    }
   console.log("success");
 }

 function CloseSesion(){
   clearInterval(manda_pulsos);
   console.log("cerrar sesion... 1.");
   myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 10000000);
   myDB.transaction(function(tx){
     console.log("cerrar sesion... 2.");
     tx.executeSql('DROP TABLE IF EXISTS SESSION_HOBI'); tx.executeSql(create_table_session_hobi);
     tx.executeSql('DROP TABLE IF EXISTS CONCEPTOS'); tx.executeSql(create_table_conceptos);
     tx.executeSql('DROP TABLE IF EXISTS CTE'); tx.executeSql(create_table_cte);
     tx.executeSql('DROP TABLE IF EXISTS CTO'); tx.executeSql(create_table_cto);
     tx.executeSql('DROP TABLE IF EXISTS ACTIVITIES');
     tx.executeSql(create_table_activities);
   },errorDB,successDB);

   $("#loginscreen").show();
 }

function errorDB(error){ var toastWithCustomButton = app.toast.create({ text: 'Error '+error, closeButton: true, closeButtonText: '¡Entendido!', closeButtonColor: 'white', });}
function successDB(){ console.log("Database is created successfully"); }
function errorCB(err){ console.log("Error procesando SQL: "+err.code); }
function spn_clear_login_form(){$("#pass").val("");}
var toastWithCustomButton = app.toast.create({ text: 'Verifica tu conexión a Internet.', closeButton: true, closeButtonText: '¡Entendido!', closeButtonColor: 'white', });


/*Funciones en addactivity*/
function GuardarActividad(){
  app.dialog.alert($("#slc_prod").val());
  //12345
  if(!$("#slc_tipo_cte").val()){
    app.dialog.confirm("Debes indicar El tipo de Cliente","HOBI.", function(){ $("#slc_tipo_cte").focus(); }); return false;
  }
  if(!$("#txtFechaActividad").val()){
    app.dialog.confirm("Debes indicar la Fecha de la Actividad.","HOBI", function(){ $("#txtFechaActividad").focus(); }); return false;
  }
  if(!$("#slc_prod").val()){
    app.dialog.confirm("Debes indicar El producto Analizado.","HOBI", function(){ $("#slc_prod").focus(); }); return false;
  }
  if(!$("#txtTelefono").val()){
    app.dialog.confirm("Debes indicar El Teléfono de Contacto.","HOBI", function(){ $("#txtTelefono").focus(); }); return false;
  }
  if(!$("#txtDireccion").val()){
    app.dialog.confirm("Debes indicar la Dirección/Domicilio.","HOBI", function(){ $("#txtDireccion").focus(); }); return false;
  }
  if(!$("#txtHoraLlegada").val().replace(" horas.","")){
    app.dialog.confirm("Debes indicar la Hora de Llegada.","HOBI", function(){ $("#txtHoraLlegada").focus(); }); return false;
  }
  if(!$("#txtHoraInicio").val().replace(" horas.","")){
    app.dialog.confirm("Debes indicar la Hora de Inicio de la actividad.","HOBI", function(){ $("#txtHoraInicio").focus(); }); return false;
  }
  if(!$("#txtHoraFin").val().replace(" horas.","")){
    app.dialog.confirm("Debes indicar la Hora de Fin de la actividad.","HOBI", function(){ $("#txtHoraFin").focus(); }); return false;
  }
  if(!$("#txtDetalles").val()){
    app.dialog.confirm("Debes indicar el resultado de la actividad.","HOBI", function(){ $("#txtDetalles").focus(); }); return false;
  }

  var fecha_actual = new Date(); var anio = fecha_actual.getFullYear();
  var mes = fecha_actual.getMonth()+1; if(mes<10){mes = '0'+mes.toString();}
  var dia = fecha_actual.getDate(); if(dia<10){dia = '0'+dia.toString();}
  var hora = fecha_actual.getHours(); if(hora<10){hora = '0'+hora.toString();}
  var minutos = fecha_actual.getMinutes(); if(minutos<10){minutos = '0'+minutos.toString();}
  var segundos = fecha_actual.getSeconds(); if(segundos<10){segundos = '0'+segundos.toString();}
  fecha_actual = anio+"-"+mes+"-"+dia+" "+hora+":"+minutos+":"+segundos;


  app.dialog.preloader('Guardando Actividad...');

  app.request({
      url: sv+"/api/addact/", dataType: 'json',
      data: {'usr' : jsidusr, 'empresa':'-CT-1', 'tipo_cliente': $("#slc_tipo_cte").val() ,'fecha_act':$("#txtFechaActividad").val(),
      'producto_ofrecido':$("#slc_prod").val(),'contacto':'-CTO-1', 'telefono': $("#txtTelefono").val(), 'direccion':$("#txtDireccion").val(),
      'actividad':$("#slc_act").val(),'hora_llegada':$("#txtHoraLlegada").val().replace(" horas.",""), 'hora_inicio':$("#txtHoraInicio").val().replace(" horas.",""),
      'hora_fin':$("#txtHoraFin").val().replace(" horas.",""), 'proyecto':'busqueda',
      'resultado':$("#txtDetalles").val(),'evolucion_comercial':'1','pic':'A', 'fecha':fecha_actual, 'lat':jslat, 'lon':jslon, 'plataforma' : (navigator.platform == 'iPhone') ? 'iOS app' : navigator.platform },
      method: "POST", crossDomain: true,
      statusCode: { 404: function(xhr) {
                        app.dialog.alert('Recurso no Encontrado.');
                      }
                    },
      complete: function(){
        //app.dialog.alert('Complete');
      },
      success: function(response) {
        if (response.status != 200){
            app.dialog.close();
            app.dialog.alert(response.message, "HOBI");
        } else{
          app.dialog.close(); app.toast.create({
            icon: app.theme === 'ios' ? '<i class="f7-icons">check</i>' : '<i class="material-icons">Listo</i>',
            text: 'Actividad Guardada!', position: 'center', closeTimeout: 4000,}).open();
            setInterval(function () { location.reload(); }, 700);
        }
      },
      error: function(){
        app.dialog.alert("Error al consultar.","HOBI");
      }
  });

  /*myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 10000000);
  myDB.transaction(function(tx){
    tx.executeSql('SELECT * FROM SESSION_HOBI', [],
      function(tx, results){
        tx.executeSql(create_table_activities);
        var id_cliente_local = 0; var id_cliente_sv = 0;
        var array_id_cliente = $("#slcCliente").val().split(",");
        id_cliente_local = array_id_cliente[0];
        id_cliente_sv = array_id_cliente[1];
        tx.executeSql('INSERT INTO ACTIVITIES (id_sv, actividad, id_usuario, usuarioN, id_cliente, id_cliente_sv, fecha_actividad, fecha_captura) VALUES(0,"'+$("#slc_act").val()+'", '+results.rows.item(0).id+' ,"'+results.rows.item(0).nombres+" "+results.rows.item(0).apellidos+'", "'+id_cliente_local+'", "'+id_cliente_sv+'", "'+$("#txtFechaActividad").val()+'", "'+fecha_actual+'")');
        app.dialog.close(); app.toast.create({
          icon: app.theme === 'ios' ? '<i class="f7-icons">check</i>' : '<i class="material-icons">done</i>',
          text: 'Actividad Guardada!', position: 'center', closeTimeout: 4000,}).open();
          setInterval(function () { location.reload(); }, 700);
      }, errorCB);
    }, errorDB, function(){ console.log("Inserción correcta."); });*/



}


function mandaPulso(lat,lon,usr,plat){
  if(lat&&lon&&usr&&plat){
    app.request({
          url: sv+"/api/pulsos/", dataType: 'json', method: "POST",
          data: {
            'usr':usr, 'lat': lat, 'lon': lon, 'plat' : plat
          }, crossDomain: true,
          statusCode: { 404: function(xhr) { console.log('Recurso no Encontrado.'); }
          }, complete: function(){ },
          success: function(response) {

              if (response.status != 0){
                  app.dialog.setText(response.message);
              } else{
                //for (var i = 0; i < response.data.length; i++) {
                //app.dialog.preloader('Consultando información en la Red...');
                /*for (var i = 0; i < 10; i++) {
                  if($("#activities_timeline").append('<div class="timeline-item ver_informacion_actividad">'+
                    '<div class="timeline-item-date">'+response.data[i].fecha+'</div>'+
                    '<div class="timeline-item-divider"></div>'+
                    '<div class="timeline-item-content"><div class="timeline-item-inner">'+
                      '<div class="timeline-item-title"><i class="f7-icons" style="color:green; font-size:15px;">cloud_fill</i>&nbsp;<b style="color:#3498DB;">' + response.data[i].UsuarioN + '</b> registró <b>' + response.data[i].actividad + '</b> para <b style="color:#2ECC71;">' + response.data[i].Sitio + '</b></div>'+
                    '</div></div>'+
                  '</div>')){
                    app.dialog.close();
                  }
                }*/
              }
          },
          error: function(){
            app.dialog.close();
              toastWithCustomButton.open();
          }
        });
  }else{
    console.log("Faltan datos para el envío de coordenadas.");
  }
}
function cteOpciones(){
  var verOpcionesClientesBody = [
    { text: 'Sincronizar Clientes', bold: true , onClick: function () {
        if(download_cte_cat(jsidusr)){ sincronizaClientes(); }
        sincronizaClientes();
      }},
    { text: 'Agregar Cliente', bold: true },
    //{ text: 'Button 2', },
    //{ text: 'Cancel', color: 'red' },
  ];
  app.verOpcionesClientes = app.actions.create({buttons: verOpcionesClientesBody});
  app.actionsToPopover = app.actions.create({ buttons: verOpcionesClientesBody, });
  app.verOpcionesClientes.open();
}

function loadCteDetail(variables){
  $("#titleCteDetalle").html('<i class="material-icons size-22">business</i> ID '+variables.split("/")[1]+' | '+variables.split("/")[2]); /*nombre*/
  $("#txtCteDetalle_NombreRazonSocial").val(variables.split("/")[2]);

    myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 10000000);
    myDB.transaction(function (tx) { tx.executeSql('SELECT * FROM CTE WHERE id = '+variables.split("/")[0], [], function (tx, results) {
       var len = results.rows.length;
       if(len == 0){ console.log('No existe el cliente en la base de datos.'); }
       else{
         for (var i = 0; i < len; i++) {
           $("#txtCteDetalle_NombreCorto").val(results.rows.item(i).nombre_corto);
           $("#txtCteDetalle_RFC").val(results.rows.item(i).rfc);
           $("#txtCteDetalle_TipoCliente").val(results.rows.item(i).tipo_cliente);
           $("#txtCteDetalle_Estatus").val(results.rows.item(i).estatus);
           $("#txtCteDetalle_Direccion").val(results.rows.item(i).direccion);
           $("#txtCteDetalle_EstadoRepublica").val(results.rows.item(i).estado_republica);
           $("#txtCteDetalle_Municipio").val(results.rows.item(i).municipio);
           load_cto_local(results.rows.item(i).id, "id_cte"); /*id_local_cte o id_cte*/
           //$("#slc_cliente_optgroup").append('<option value="'+results.rows.item(i).id+','+results.rows.item(i).id_cte+'">'+results.rows.item(i).nombre+'</option>');
         }
       }
       console.log("Conceptos en db local cargados exitosamente.");
    }, errorCB); }, errorCB, querySuccess);

}

function verInfoContacto(id_cto){
  myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 10000000);
  myDB.transaction(function (tx) { tx.executeSql('SELECT * FROM CTO WHERE id_cto = '+id_cto, [], function (tx, results) {
     var len = results.rows.length;
     if(len == 0){ alert('No se encontró el contacto.'); }
     else{
         $("#popUpTitleNombreContacto").html('<i class="material-icons size-22">perm_contact_calendar</i>&nbsp;&nbsp;'+results.rows.item(0).nombre_corto);
         $("#txtCteDetalle_Cto_Nombre").val(results.rows.item(0).nombre);
         $("#txtCteDetalle_Cto_Apellidos").val(results.rows.item(0).apellidos);
         $("#txtCteDetalle_Cto_NombreCorto").val(results.rows.item(0).nombre_corto);
         $("#txtCteDetalle_Cto_Tipo").val(results.rows.item(0).tipo_cto);
         $("#txtCteDetalle_Cto_Direccion").val(results.rows.item(0).direccion);
     }
  }, errorCB); }, errorCB, querySuccess);

        var self = this;
        self.popup = self.app.popup.create({
          content: '\
            <div class="popup">\
              <div class="page">\
                <div class="navbar">\
                  <div class="navbar-inner">\
                    <div class="left" id="popUpTitleNombreContacto">Cargando...</div>\
                    <div class="right"><a href="#" class="link popup-close">Cerrar</a></div>\
                  </div>\
                </div>\
                <div class="page-content">\
                  <div class="block">\
                  \
                  <div class="list no-hairlines-md">\
                    <ul>\
                      <li class="item-content item-input">\
                        <div class="item-inner">\
                          <div class="item-title item-floating-label">Nombre</div>\
                          <div class="item-input-wrap">\
                            <input type="text" placeholder="Nombre" id="txtCteDetalle_Cto_Nombre" disabled>\
                          </div>\
                        </div>\
                      </li>\
                      <li class="item-content item-input">\
                        <div class="item-inner">\
                          <div class="item-title item-floating-label">Apellidos</div>\
                          <div class="item-input-wrap">\
                            <input type="text" placeholder="Apellidos" id="txtCteDetalle_Cto_Apellidos" disabled>\
                          </div>\
                        </div>\
                      </li>\
                      <li class="item-content item-input">\
                        <div class="item-inner">\
                          <div class="item-title item-floating-label">Nombre Corto (Apodo)</div>\
                          <div class="item-input-wrap">\
                            <input type="text" placeholder="Nombre Corto (Apodo)" id="txtCteDetalle_Cto_NombreCorto" disabled>\
                          </div>\
                        </div>\
                      </li>\
                      <li class="item-content item-input">\
                        <div class="item-inner">\
                          <div class="item-title item-floating-label">Tipo</div>\
                          <div class="item-input-wrap">\
                            <input type="text" placeholder="Tipo" id="txtCteDetalle_Cto_Tipo" disabled>\
                          </div>\
                        </div>\
                      </li>\
                      <li class="item-content item-input">\
                        <div class="item-inner">\
                          <div class="item-title item-floating-label">Dirección</div>\
                          <div class="item-input-wrap">\
                            <input type="text" placeholder="Dirección" id="txtCteDetalle_Cto_Direccion" disabled>\
                          </div>\
                        </div>\
                      </li>\
                      <li class="item-content item-input">\
                        <div class="item-inner">\
                          <div class="item-title item-floating-label">Estado</div>\
                          <div class="item-input-wrap">\
                            <input type="text" placeholder="Estado" id="txtCteDetalle_Cto_Estado" disabled>\
                          </div>\
                        </div>\
                      </li>\
                      <li class="item-content item-input">\
                        <div class="item-inner">\
                          <div class="item-title item-floating-label">Municipio</div>\
                          <div class="item-input-wrap">\
                            <input type="text" placeholder="Municipio" id="txtCteDetalle_Cto_Municipio" disabled>\
                          </div>\
                        </div>\
                      </li>\
                      <li class="item-content item-input">\
                        <div class="item-inner">\
                          <div class="item-title item-floating-label">Puesto</div>\
                          <div class="item-input-wrap">\
                            <input type="text" placeholder="Puesto" id="txtCteDetalle_Cto_Puesto" disabled>\
                          </div>\
                        </div>\
                      </li>\
                    </ul>\
                  </div>\
                  \
                  </div>\
                </div>\
              </div>\
            </div>\
          '
        });
      // Open it
      self.popup.open();
}

function verInfoActividad(id_actividad){
  /*myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 10000000);
  myDB.transaction(function (tx) { tx.executeSql('SELECT * FROM CTO WHERE id_cto = '+id_cto, [], function (tx, results) {
     var len = results.rows.length;
     if(len == 0){ alert('No se encontró el contacto.'); }
     else{
         $("#popUpTitleNombreContacto").html('<i class="material-icons size-22">perm_contact_calendar</i>&nbsp;&nbsp;'+results.rows.item(0).nombre_corto);
         $("#txtCteDetalle_Cto_Nombre").val(results.rows.item(0).nombre);
         $("#txtCteDetalle_Cto_Apellidos").val(results.rows.item(0).apellidos);
         $("#txtCteDetalle_Cto_NombreCorto").val(results.rows.item(0).nombre_corto);
         $("#txtCteDetalle_Cto_Tipo").val(results.rows.item(0).tipo_cto);
         $("#txtCteDetalle_Cto_Direccion").val(results.rows.item(0).direccion);
     }
  }, errorCB); }, errorCB, querySuccess);*/
      app.dialog.preloader('Cargando detalle de la Actividad...');
      var self = this;
      self.popup = self.app.popup.create({
        content: '\
          <div class="popup">\
            <div class="page">\
              <div class="navbar">\
                <div class="navbar-inner">\
                  <div class="center" style="padding-left:15px;" id="popUpTitleDetalleActividad"><i class="material-icons blue002">work</i> Detalles de la Actividad</div>\
                  <div class="right"><a href="#" class="link popup-close">Cerrar</a></div>\
                </div>\
              </div>\
              <div class="page-content">\
                <div class="block">\
                \
                <div class="list no-hairlines-md">\
                  <ul>\
                    <li class="item-content item-input">\
                      <div class="item-inner">\
                        <div class="item-title"><i class="material-icons" style="color:gray; font-size:15px;">people</i> Tipo de Cliente: <label id="lblDetalleActividadTipo_Cliente">Cargando...</label></div>\
                        <div class="item-input-wrap">\
                          \
                        </div>\
                      </div>\
                    </li>\
                    <li class="item-content item-input">\
                      <div class="item-inner">\
                        <div class="item-title"><i class="material-icons" style="color:gray; font-size:15px;">gavel</i> Se ofreció: <label id="lblDetalleActividadSe_Ofrecio">Cargando...</label></div>\
                        <div class="item-input-wrap">\
                          \
                        </div>\
                      </div>\
                    </li>\
                    <li class="item-content item-input">\
                      <div class="item-inner">\
                        <div class="item-title"><i class="material-icons" style="color:gray; font-size:15px;">person</i> Contacto: <label id="lblDetalleActividadContacto">Cargando...</label></div>\
                        <div class="item-input-wrap">\
                          \
                        </div>\
                      </div>\
                    </li>\
                    <li class="item-content item-input">\
                      <div class="item-inner">\
                        <div class="item-title"><i class="material-icons" style="color:gray; font-size:15px;">phone</i> Teléfono: <a id="lblDetalleActividadTelefono" href="#">Cargando...</a></div>\
                        <div class="item-input-wrap">\
                          \
                        </div>\
                      </div>\
                    </li>\
                    <li class="item-content item-input">\
                      <div class="item-inner">\
                        <div class="item-title"><i class="material-icons" style="color:gray; font-size:15px;">free_breakfast</i> Agenda: <label id="lblAgenda">Cargando...</label></div>\
                        <div class="item-input-wrap">\
                          \
                        </div>\
                      </div>\
                    </li>\
                    <li class="item-content item-input">\
                      <div class="item-inner">\
                        <div class="item-title"><i class="material-icons" style="color:gray; font-size:15px;">room</i> Dirección: <label id="lblDireccion">Cargando...</label></div>\
                        <div class="item-input-wrap">\
                          \
                        </div>\
                      </div>\
                    </li>\
                    <li class="item-content item-input">\
                      <div class="item-inner">\
                        <div class="item-title"><i class="material-icons" style="color:gray; font-size:15px;">local_mall</i> Actividad: <label id="lblActividad">Cargando...</label></div>\
                        <div class="item-input-wrap">\
                          \
                        </div>\
                      </div>\
                    </li>\
                    <li class="item-content item-input">\
                      <div class="item-inner">\
                        <div class="item-title"><i class="material-icons" style="color:gray; font-size:15px;">timer</i> De: <label id="lblDe">Cargando...</label> a: <label id="lblA">Cargando...</label></div>\
                        <div class="item-input-wrap">\
                          \
                        </div>\
                      </div>\
                    </li>\
                    <li class="item-content item-input">\
                      <div class="item-inner">\
                        <div class="item-title"><i class="material-icons" style="color:gray; font-size:15px;">show_chart</i> Evolución Comercial: <label id="lblEvolucion_Comercial">Cargando...</label></div>\
                        <div class="item-input-wrap">\
                          \
                        </div>\
                      </div>\
                    </li>\
                    <li class="item-content item-input">\
                      <div class="item-inner">\
                        <div class="item-title"><i class="material-icons" style="color:gray; font-size:15px;">library_books</i> PIC: <label id="lblPic">Cargando...</label></div>\
                        <div class="item-input-wrap">\
                          \
                        </div>\
                      </div>\
                    </li>\
                  </ul>\
                </div>\
                \
                </div>\
              </div>\
            </div>\
          </div>\
        '
      });

      self.popup.open();

  app.request({
        url: sv+"/api/readact/", dataType: 'json', method: "POST", data: {'usr':jsidusr, 'id_actividad':id_actividad}, crossDomain: true,
        statusCode: { 404: function(xhr) { app.dialog.alert('Recurso no Encontrado.'); }
        }, complete: function(){ },
        success: function(response) {
            if (response.status != 0){
                app.dialog.setText(response.message);
            } else{
              $("#lblDetalleActividadTipo_Cliente").text(response.data[0].tipo_cliente);
              $("#lblDetalleActividadSe_Ofrecio").text(response.data[0].producto_ofrecido);
              $("#lblDetalleActividadContacto").text(response.data[0].contacto);
              $("#lblDetalleActividadTelefono").text(response.data[0].telefono);
              app.dialog.close();
            }
        },
        error: function(){
          app.dialog.close();
            toastWithCustomButton.open();
        }
      });
}

ConsultarClientes = function () {
  app.dialog.preloader('Cargando Clientes...');
  app.request({
        url: sv+"/api/readcte/", dataType: 'json',
        //data: {'usr' : jsidusr},
        data: {'usr' : '45'},
        method: "POST", crossDomain: true,
        statusCode: { 404: function(xhr) { app.dialog.alert('Recurso no Encontrado.'); } },
        complete: function(){ },
        success: function(response) {
          if (response.status != 200){
            app.dialog.setText(response.message);
            $("#slcClienteOptgroup").append('<option value="2114313434">Prueba 3</option>');
          } else{
          $("#slcClienteOptgroup").append('<option value="2114313434">Prueba 2</option>');
              for (var i = 0; i < response.data.length; i++) {
                //jsclientes.push([response.data[i].ID, response.data[i].nombre, response.data[i].nombre_corto, response.data[i].rfc, response.data[i].tipo_cliente, response.data[i].direccion, response.data[i].status, response.data[i].estado, response.data[i].municipio]);
                //$("#slcClienteOptgroup").append('<option value="'+response.data[i].ID+','+response.data[i].ID+'">'+response.data[i].nombre+'</option>');
                //$("#cte_cteslist").append('<ul><li><a href="/cte_detalle/?'+results.rows.item(i).id+'/'+results.rows.item(i).id_cte+'/'+results.rows.item(i).nombre+'"><i class="material-icons size-22">business</i>&nbsp;&nbsp;'+results.rows.item(i).nombre+'</a></li> </ul>');
              }


              app.dialog.close();
            }
        }, error: function(){
          app.dialog.setText("Error al recuperar el catálogo de clientes.");
        }
      });
}

if(app.device.iphone){
  //app.dialog.alert("iPhoneX");
  //app.dialog.alert($(window).height());
  $(".statusbar").hide();
    //$("#app").css({"padding-top": "0px"});
}

OcultarTimePicker = function (lbl, div) { $(lbl).hide(); $(div).hide(); }
MostrarTimePicker = function (lbl, div) { $(lbl).show(); $(div).show(); }
CargarTimePicker = function (div, txt) {
  var today = new Date();
  var pickerInline = app.picker.create({
    containerEl: div,
    inputEl: txt,
    toolbar: false,
    rotateEffect: false,
    value: [ today.getHours(),
              today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes() ],
    formatValue: function (values, displayValues) {
      return displayValues[0] + ':' + values[1] + ' horas.';
    },
    cols: [
      // Space divider
      {
        divider: true,
        content: '  '
      },
      // Hours
      {
        values: (function () {
          var arr = [];
          for (var i = 0; i <= 23; i++) { arr.push(i); }
            return arr;
        })(),
      },
      // Divider
      {
        divider: true,
        content: ':'
      },
      // Minutes
      {
        values: (function () {
          var arr = [];
          for (var i = 0; i <= 59; i++) { arr.push(i < 10 ? '0' + i : i); }
            return arr;
        })(),
      }
    ],
    on: {
      change: function (picker, values, displayValues) {
        var daysInMonth = new Date(picker.value[2], picker.value[0]*1 + 1, 0).getDate();
        if (values[1] > daysInMonth) {
          picker.cols[1].setValue(daysInMonth);
        }
      },
    }
  });
}
