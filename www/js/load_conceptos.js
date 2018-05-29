function cargar_conceptos(){
    myDB = window.openDatabase("hobi", "1.0", "Hobi DB", 1000000);
    myDB.transaction(PopulateDatabaseConceptos,errorDB,successDB);
    myDB.transaction(queryDBConceptos, errorCB, querySuccessConceptos);
 }
 function PopulateDatabaseConceptos(tx){
   tx.executeSql('DROP TABLE IF EXISTS CONCEPTOS');
    tx.executeSql('CREATE TABLE IF NOT EXISTS CONCEPTOS (id, concepto, valor)');
    tx.executeSql('INSERT INTO CONCEPTOS (id, concepto, valor) VALUES(1,"Arre 2", "ok")');
  }
 function queryDBConceptos(tx) {
   tx.executeSql('SELECT * FROM CONCEPTOS', [], querySuccess, errorCB);
 }
 function querySuccess(tx, results) {
   console.log(results);
    var len = results.rows.length;
    if(len == 0){
         console.log('No existen conceptos.');
        //$("#usr_pic").html("<label>no user.</label>");
      /*REDIRECT TO LOGIN */
    }
    else{
      alert(results.rows.item(0).concepto);
      /*var foto = '/intranet.bargo/nuevaweb/php/uploads/'+results.rows.item(0).foto;
      if(results.rows.item(0).foto == '-'){
        foto = '/intranet.bargo/fotos/usuario.png';
      }
      $("#usr_pic").html('<img src="'+sv+foto+'" alt="HOBI" style="width:23px; border-radius: 50%;" /> <label style="position: absolute;right: 20px; padding-top:7px;">'+results.rows.item(0).nombres + ' ' + results.rows.item(0).apellidos+'</label>')

      jsidusr = results.rows.item(0).id;*/
    }
   console.log("success");
 }
 //function errorDB(error){ console.log("Error on Database creation : " + error); }
 //function successDB(){ console.log("Database is created successfully"); }



/*
 app.request({
   url: sv+"/api/conceptos/",
   dataType: 'json',
   method: "POST",
   crossDomain: true,
   statusCode: { 404: function(xhr) { console.log('Recurso no Encontrado.'); } },
   complete: function(){ },
   success: function(response) {
     if (response.status != 0){   //datos = false;
       console.log("Entra al if...");
     }
     else{
       for (var i = 0; i < data.length; i++) {
         alert(response.data[i].ID);
         tx.executeSql('INSERT INTO CONCEPTOS (id, concepto, valor) VALUES ('+response.data[i].ID+', "'+response.data[i].concepto+'", "'+response.data[i].valor+'")');
       }
     }
   }, error: function(){
       //datos = false;
       console.log("Entra al Error...");
   }
 });*/
