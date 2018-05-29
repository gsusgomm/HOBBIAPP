// Dom7
var $ = Dom7;
/*$(document).ready(function(){
  $("#btn_signIn").click(function(){
    $.ajax({
  	        url: "http://becas.guadalajara.gob.mx/backend/autenticacion/login",
  	        type: "POST",
  	        dataType: "json",
  	        cache: true,
  	        data: {'usuario': $("#username").val(), 'pass': $("#pass").val()},
  	        error: function (XMLHttpRequest, textStatus, errorThrown) {
  	            alert("Status: " + textStatus);
  	            alert("Error: " + errorThrown);
  	        },
  	        success: function (data) {
  	            if (data.status)
  	            {
              				alert("bien");
  	            }
  	            else
  	            {
      				$(".alert").show();
  	            	alert("incorrecto");
  	            }
  	        }
  	    });
  });
});*/

// Theme
var theme = 'auto';
if (document.location.search.indexOf('theme=') >= 0) {
  theme = document.location.search.split('theme=')[1].split('&')[0];
}
// Init App
var app = new Framework7({
  id: 'io.framework7.testapp',
  root: '#app',
  theme: theme,
  data: function () {
    return {
      user: {
        firstName: 'John',
        lastName: 'Doe',
      },
    };
  },
  methods: {
    helloWorld: function () {
      app.dialog.alert('Hello World!');
    },
  },
  routes: routes,
  vi: {
    placementId: 'pltd4o7ibb9rc653x14',
  },
});

var myapp = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
