/***
* cmdaan.js
*   Bevat functies voor CMDAan stijl geolocatie welke uitgelegd
*   zijn tijdens het techniek college in week 5.
*
*   Author: J.P. Sturkenboom <j.p.sturkenboom@hva.nl>
*   Credit: Dive into html5, geo.js, Nicholas C. Zakas
*
*   Copyleft 2012, all wrongs reversed.
*/

// Variable declaration

(function(){

    var  SANDBOX: 'SANDBOX',
        LINEAIR : "LINEAIR",
        GPS_AVAILABLE : 'GPS_AVAILABLE',
        GPS_UNAVAILABLE : 'GPS_UNAVAILABLE',
        POSITION_UPDATED : 'POSITION_UPDATED',
        REFRESH_RATE : 1000;
    }

    var currentPosition :false,
        currentPositionMarker:false,
        map:false,
        interval:false,
        intervalCounter:false,
        updateMap:false,
        locatieRij:[],
        markerRij:[]


    var positionFunctions = {
        // Test of GPS beschikbaar is (via geo.js) en vuur een event af
        init: function (){
            debug_message("Controleer of GPS beschikbaar is...");

            ET.addListener(GPS_AVAILABLE, this._start_interval);
            ET.addListener(GPS_UNAVAILABLE, function(){debug_message('GPS is niet beschikbaar.')});

            (geo_position_js.init())?ET.fire(GPS_AVAILABLE):ET.fire(GPS_UNAVAILABLE);
        },

        // Start een interval welke op basis van REFRESH_RATE de positie updated
        _start_interval: function (event){
            debug_message("GPS is beschikbaar, vraag positie.");
            this._update_position();
            interval = self.setInterval(this._update_position, REFRESH_RATE);
            ET.addListener(POSITION_UPDATED, this._check_locations);
        },

        // Vraag de huidige positie aan geo.js, stel een callback in voor het resultaat
        _update_position: function (){
            intervalCounter++;
            geo_position_js.getCurrentPosition(this._set_position, debugging._geo_error_handler, {enableHighAccuracy:true});
        },

        // Callback functie voor het instellen van de huidige positie, vuurt een event af
        _set_position: function (position){
            currentPosition = position;
            ET.fire("POSITION_UPDATED");
            debug_message(intervalCounter+" positie lat:"+position.coords.latitude+" long:"+position.coords.longitude);
        },

        // Controleer de locaties en verwijs naar een andere pagina als we op een locatie zijn
        _check_locations: function (event){
            // Liefst buiten google maps om... maar helaas, ze hebben alle coole functies
            for (var i = 0; i < locaties.length; i++) {
                var locatie = {coords:{latitude: locaties[i][3],longitude: locaties[i][4]}};

                if(this._calculate_distance(locatie, currentPosition)<locaties[i][2]){

                    // Controle of we NU op die locatie zijn, zo niet gaan we naar de betreffende page
                    if(window.location!=locaties[i][1] && localStorage[locaties[i][0]]=="false"){
                        // Probeer local storage, als die bestaat incrementeer de locatie
                        try {
                            (localStorage[locaties[i][0]]=="false")?localStorage[locaties[i][0]]=1:localStorage[locaties[i][0]]++;
                        } catch(error) {
                            debug_message("Localstorage kan niet aangesproken worden: "+error);
                        }

        // TODO: Animeer de betreffende marker

                        window.location = locaties[i][1];
                        debug_message("Speler is binnen een straal van "+ locaties[i][2] +" meter van "+locaties[i][0]);
                    }
                }
            }
        },

        // Bereken het verchil in meters tussen twee punten
        _calculate_distance: function (p1, p2){
            var pos1 = new google.maps.LatLng(p1.coords.latitude, p1.coords.longitude);
            var pos2 = new google.maps.LatLng(p2.coords.latitude, p2.coords.longitude);
            return Math.round(google.maps.geometry.spherical.computeDistanceBetween(pos1, pos2), 0);
        }
    }

    var ET = new EventTarget();

    customDebugging = debugId


    // GOOGLE MAPS FUNCTIES
    /**
     * generate_map(myOptions, canvasId)
     *  roept op basis van meegegeven opties de google maps API aan
     *  om een kaart te genereren en plaatst deze in het HTML element
     *  wat aangeduid wordt door het meegegeven id.
     *
     *  @param myOptions:object - een object met in te stellen opties
     *      voor de aanroep van de google maps API, kijk voor een over-
     *      zicht van mogelijke opties op http://
     *  @param canvasID:string - het id van het HTML element waar de
     *      kaart in ge-rendered moet worden, <div> of <canvas>
     */
    var mapsFunctions = {
        generate_map: function (myOptions, canvasId){
        // TODO: Kan ik hier asynchroon nog de google maps api aanroepen? dit scheelt calls
            debug_message("Genereer een Google Maps kaart en toon deze in #"+canvasId)
            map = new google.maps.Map(document.getElementById(canvasId), myOptions);

            var routeList = [];
            // Voeg de markers toe aan de map afhankelijk van het tourtype
            debug_message("Locaties intekenen, tourtype is: "+tourType);
            for (var i = 0; i < locaties.length; i++) {

                // Met kudos aan Tomas Harkema, probeer local storage, als het bestaat, voeg de locaties toe
                try {
                    (localStorage.visited==undefined||this.isNumber(localStorage.visited))?localStorage[locaties[i][0]]=false:null;
                } catch (error) {
                    debug_message("Localstorage kan niet aangesproken worden: "+error);
                }

                var markerLatLng = new google.maps.LatLng(locaties[i][3], locaties[i][4]);
                routeList.push(markerLatLng);

                markerRij[i] = {};
                for (var attr in locatieMarker) {
                    markerRij[i][attr] = locatieMarker[attr];
                }
                markerRij[i].scale = locaties[i][2]/3;

                var marker = new google.maps.Marker({
                    position: markerLatLng,
                    map: map,
                    icon: markerRij[i],
                    title: locaties[i][0]
                });
            }
        // TODO: Kleur aanpassen op het huidige punt van de tour
            if(tourType == LINEAIR){
                // Trek lijnen tussen de punten
                debug_message("Route intekenen");
                var route = new google.maps.Polyline({
                    clickable: false,
                    map: map,
                    path: routeList,
                    strokeColor: 'Black',
                    strokeOpacity: .6,
                    strokeWeight: 3
                });

            }

            // Voeg de locatie van de persoon door
            currentPositionMarker = new google.maps.Marker({
                position: kaartOpties.center,
                map: map,
                icon: positieMarker,
                title: 'U bevindt zich hier'
            });

            // Zorg dat de kaart geupdated wordt als het POSITION_UPDATED event afgevuurd wordt
            ET.addListener(constants.POSITION_UPDATED, this.update_positie);
        },

        isNumber: function (n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        },

        // Update de positie van de gebruiker op de kaart
        update_positie:function (event){
            // use currentPosition to center the map
            var newPos = new google.maps.LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude);
            map.setCenter(newPos);
            currentPositionMarker.setPosition(newPos);
        }
    }
    // FUNCTIES VOOR DEBUGGING
    var debugging = {
        _geo_error_handler: function (code, message) {
            this.debug_message('geo.js error '+code+': '+message);
        },
        debug_message: function (message){
            (customDebugging && debugId)?document.getElementById(debugId).innerHTML:console.log(message);
        },
        set_custom_debugging: function (debugId){
            debugId = this.debugId;
            customDebugging = true;
        }
    }
})



 










