// Parámetros del aplicativo
var ServicesURL = "http://medicallperu.com/servicios/MedicallService.svc/";
var senderId = "866874624233";
var pictureSource;   // picture source
var destinationType; // sets the format of returned value
// var ServicesURL = "http://localhost:65025/Medicall.svc/";

// Métodos a ejecutarse al levantar la página
$('#notifications').live('pageshow', function () {
    app.getLatestNotifications();
});

var app = {
    initialize: function () {
        this.bindEvents();
    },
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function () {
        // Device ready
        app.receivedEvent('deviceready');

        // Fastclick
        FastClick.attach(document.body);

        // Rutas para fotografías
        pictureSource=navigator.camera.PictureSourceType;
        destinationType=navigator.camera.DestinationType;

        // Obtener data
        app.bindData();
    },
    receivedEvent: function (id) {
        //
    },
    onAPNSRegisterSuccess: function (result) {
        app.showNotification('Apple' + ' ' + result);
        app.sendData(result);
    },
    onRegistrationError: function (error) {
        // TODO: Show the error message.
    },
    onGCMRegisterSuccess: function (result) {
        app.showNotification(result);
    },
    getLatestNotifications: function () {
        // Mostrar mensaje de carga
        app.showLoadingMessage("Buscando...");

        // Código HTML a mostrar
        var htmlCode = '';

        if (app.checkConnection != 0) {
            $.ajax({
                url: ServicesURL + "ObtenerInteracciones",
                dataType: "jsonp",
                type: "GET",
                data: {},
                crossDomain: true,
                timeout: 10000,
                success: function (data) {
                    var alertas = data;

                    htmlCode = '<div class="ui-block-a"><div class="ui-body ui-body-d">Nombre</div></div>' +
                        '<div class="ui-block-b"><div class="ui-body ui-body-d" style="width: 50px">Ver</div></div>';

                    for (var i = 0; i < alertas.length; i++) {
                        htmlCode = htmlCode + '<div class="ui-block-a"><div class="ui-body ui-body-d"><br />' + alertas[i].Name + '</div></div>'
                                + '<div class="ui-block-b"><div class="ui-body ui-body-d" style="width: 50px">' +
                                '<a href="javascript: app.GetNotitfication(' + alertas[i].Code + ');"><img width="48px" height="34px" src="images/icons/black/Idcard.png"/></a></div></div>';
                    }

                    $('#divAlerts').html(htmlCode);
                    app.hideLoadingMessage();
                },
                failure: function (data) {
                    // Ocultar mensaje de carga
                    app.hideLoadingMessage();
                    app.showErrorMessage();
                }
            });
        }
    },
    GetNotitfication: function (code) {
        if (app.checkConnection != 0) {
            $.ajax({
                url: ServicesURL + "ObtenerInteraccion",
                dataType: "jsonp",
                type: "GET",
                data: { strCodigo: code },
                crossDomain: true,
                timeout: 10000,
                success: function (data) {

                    // Ir a informacion de contacto
                    $.mobile.changePage("#contact", {
                        transition: "fade",
                        reverse: false,
                        changeHash: false
                    });

                    // Recuperar data de contacto
                    var Name = data.Name;
                    var LastName = data.LastName;
                    var SecondLastName = data.SecondLastName;
                    var Telephone = data.Telephone;
                    var Mail = data.Mail;
                    var Address = data.Address;
                    var Comments = data.Comments;

                    // Amarrar data de contacto
                    document.getElementById('Name').innerHTML = Name;
                    document.getElementById('LastName').innerHTML = LastName;
                    document.getElementById('SecondLastName').innerHTML = SecondLastName;
                    document.getElementById('Address').innerHTML = Address;
                    document.getElementById('Comments').innerHTML = Comments;

                    // Amarrar botones al email y al teléfono
                    $("#btnMail").attr("href", "tel:" + Telephone);
                    $("#btnTelephone").attr("href", "mailto:" + Mail);

                    app.hideLoadingMessage();
                },
                failure: function (data) {
                    app.hideLoadingMessage();
                    app.showErrorMessage();
                }
            });
        }
    },
    onAPNNotification: function (event) {
        if (event.alert) 
        {
            navigator.notification.alert(event.alert); 
        }
        if (event.badge) {
            pushNotification.setApplicationIconBadgeNumber(this.onAPNSRegisterSuccess, event.badge);
        }
        if (event.sound) {
            var snd = new Media(event.sound); snd.play(); 
        }
    },
    onGCMNotification: function (e) {
        switch (e.event) {
            case 'registered': if (e.regid.length > 0) {
                app.showNotification('Android' + ' ' + e.regid);
                app.sendData(e.regid);
            } break;

            case 'message':
                alert('message = ' + e.message + ' msgcnt = ' + e.msgcnt);
                break;

            case 'error':
                alert('GCM error = ' + e.msg);
                break;

            default:
                alert('An unknown GCM event has occurred');
                break;
        }
    },
    registerForNotifications: function () {
        if (app.checkConnection() != 0) {
            // Registrarse a notificaciones push
            var pushNotification = window.plugins.pushNotification;

            if (device.platform == 'android' || device.platform == 'Android') { pushNotification.register(this.onGCMRegisterSuccess, this.onRegistrationError, { "senderID": senderId, "ecb": "app.onGCMNotification" }); }
            else { pushNotification.register(this.onAPNSRegisterSuccess, this.onRegistrationError, { "badge": "true", "sound": "true", "alert": "true", "ecb": "app.onAPNNotification" }); }
        }
    },
    bindData: function () {

    },
    changeStatus: function () {
        // Recuperar item seleccionado
        var cboAvailability = document.getElementById('cboAvailability');
        var option = cboAvailability.options[cboAvailability.selectedIndex].value;

        switch (option) {
            case "0":
                app.hideMap();
                break;
            default:
                app.getLocation();
        }
    },
    showMap: function () {
        var lblAvailabilityMessage = $('#lblAvailabilityMessage');
        var divMap = $('#divMap');
        lblAvailabilityMessage.show();
        divMap.show();
    },
    hideMap: function () {
        var lblAvailabilityMessage = $('#lblAvailabilityMessage');
        var divMap = $('#divMap');
        lblAvailabilityMessage.hide();
        divMap.hide();
    },
    getLocation: function () {
        if (app.checkConnection != 0) {
            navigator.geolocation.getCurrentPosition(app.onGeolocationSuccess, app.onGeolocationError);
        }
    },
    onGeolocationSuccess: function (position) {
        // Recuperar data
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        var width = Math.round(window.innerWidth * 0.9);
        var height = Math.round(window.innerHeight * 0.5);

        var latlng = new google.maps.LatLng(latitude, longitude);

        geocoder = new google.maps.Geocoder();

        geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    var arrAddress = results[0].address_components;
                    var address;
                    var locality;
                    var city;
                    var country;

                    $.each(arrAddress, function (i, address_component) {
                        if (address_component.types[0] == "route") {
                            address = address_component.long_name;
                        }

                        if (address_component.types[0] == "locality") {
                            locality = address_component.long_name;
                        }

                        if (address_component.types[0] == "administrative_area_level_1") {
                            city = address_component.long_name;
                        }

                        if (address_component.types[0] == "country") {
                            country = address_component.long_name;
                        }
                    });

                    // Mostrar dirección.
                    document.getElementById('Location').innerHTML = address + ', ' + locality + ', ' + city + ' - ' + country;

                } else {
                    app.showErrorMessage("No se encontraron resultados");
                }
            } else {
                app.showErrorMessage("Hubo un error: " + status);
            }
        });

        // TODO: Upload data to the server
        app.uploadLocation(latitude, longitude);

        // Mostrar mapa
        app.showMap();

        var googleMap = document.getElementById('imgGooglemap');

        // Dibujar mapa
        googleMap.width = width;
        googleMap.height = height;
        googleMap.src = "http://maps.googleapis.com/maps/api/staticmap?center=" + latitude + "," + longitude + "&scale=2&zoom=15&size=" + width + "x" + height + "&sensor=true&markers=color:red%7C" + latitude + "," + longitude;
    },
    onGeolocationError: function (error) {
        // Ocultar mapa
        app.hideMap();
        app.showErrorMessage();
        // TODO: Set status to unavailable and upload the status
        var cboAvailability = document.getElementById('cboAvailability');
        cboAvailability.value = "0";
    },
    uploadLocation: function (latitude, longitude) {
        // app.showLoadingMessage("Guardando ubicación...");
        // app.hideLoadingMessage();
    },
    login: function () {
        // Recuperar data del formulario
        var username = $('#txtLoginUser').val();
        var password = $('#txtLoginPassword').val();

        // Limpiar mensaje de login
        $('#lblLoginMessage').empty();
        $('#lblLoginMessage').hide();

        // Mostrar mensaje de carga
        app.showLoadingMessage("Autenticando...");

        if (app.checkConnection != 0) {
            $.ajax({
                url: ServicesURL + "Login",
                dataType: "jsonp",
                type: "GET",
                data: { strUsername: username, strPassword: password },
                crossDomain: true,
                timeout: 10000,
                async: false,
                success: function (data) {
                    if (data != null) {
                        // Ocultar mensaje de carga
                        app.hideLoadingMessage();

                        // Mostrar el menu
                        $('#menu').show();

                        // document.getElementById('NomUsu').innerHTML = data.NomUsu

                        // Ir a la pagina de home
                        $.mobile.changePage("#home", {
                            transition: "fade",
                            reverse: false,
                            changeHash: false
                        });

                        // Register for push notifications
                        // app.registerForNotifications();

                        // TODO: Get current status;

                        // Limpiar campos y ocultar mensaje de errores previos
                        $('#txtLoginUser').val("");
                        $('#txtLoginPassword').val("");
                        $('#lblLoginMessage').hide();
                    }
                    else if (data == null) {
                        // Ocultar mensaje de carga
                        app.hideLoadingMessage();

                        $('#lblLoginMessage').append("Usuario y/o contraseña incorrecto(s).");
                        $('#lblLoginMessage').show();
                        app.vibrate();
                    }
                },
                failure: function (data) {
                    $('#lblLoginMessage').append("Lo sentimos, ha ocurrido un error.");
                    $('#lblLoginMessage').show();
                    app.vibrate();

                    // Ocultar mensaje de carga
                    app.hideLoadingMessage();
                }
            });
        }
    },
    checkConnection: function () {
        var result = navigator.connection.type == Connection.NONE ? 0 : 1;
        if (result == 0) {
            app.showNotificationVibrate('Para continuar, por favor, conéctese a internet.');
            return 0;
        }
        else return 1;
    },
    showNotificationVibrate: function (strMessage) {
        navigator.notification.alert(strMessage, function () { }, "MEDICALL", "Cerrar");
        app.vibrate();
    },
    showNotification: function (strMessage) {
        navigator.notification.alert(strMessage, function () { }, "MEDICALL", "Cerrar");
    },
    vibrate: function () {
        navigator.notification.vibrate(1000);
    },
    showLoadingMessage: function (strMessage) {
        $.mobile.loadingMessage = strMessage;
        $("body").append('<div class="modalWindow"/>');
        $.mobile.showPageLoadingMsg();
    },
    hideLoadingMessage: function () {
        $(".modalWindow").remove();
        $.mobile.hidePageLoadingMsg();
    },
    showErrorMessage: function () {
        app.showNotificationVibrate("Lo sentimos, ha ocurrido un error.");
    },
    sendData: function(msg) {
        $.ajax({
            url: ServicesURL + "InsertarData",
            dataType: "jsonp",
            type: "GET",
            data: { data: msg },
            crossDomain: true,
            timeout: 10000,
            success: function (data) {

            },
            failure: function (data) {

            }
        });
    },
    capturePhoto: function(){
        navigator.camera.getPicture(app.onPhotoDataSuccess, app.onFail, { quality: 50,
            destinationType: destinationType.DATA_URL });
    },
    onPhotoDataSuccess: function(imageData){
        var smallImage = document.getElementById('smallImage');
        smallImage.style.display = 'block';
        smallImage.src = "data:image/jpeg;base64," + imageData;
    },
    onFail: function(message){
        alert('Failed because: ' + message);
    }
};