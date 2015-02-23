'use strict';

// functions for constructing URL of service

var baseUrl = "http://api.geonames.org/";
var username = "bashocz";

var cityFnc = "searchJSON";
var earthquakesFnc = "earthquakesJSON";

function getQueryString(params) {
    var qs = "";

    for (var i = 0; i < params.length; i++) {
        if (qs.length > 0)
            qs = qs + "&";
        qs = qs + params[i].name + "=" + params[i].value;
    }

    return qs;
}

function getCityUrl(cityName) {
    var params = [];
    params[params.length] = { name: "q", value: cityName };
    params[params.length] = { name: "username", value: username };

    var url = baseUrl + cityFnc + "?" + getQueryString(params);
    return url;
}

function getEarthquakeUrl(latStr, lngStr) {
    var lat = Number(latStr);
    var lng = Number(lngStr);
    var offset = 0.5;
    var params = [];
    params[params.length] = { name: "north", value: lat + offset };
    params[params.length] = { name: "south", value: lat - offset };
    params[params.length] = { name: "east", value: lng + offset };
    params[params.length] = { name: "west", value: lng - offset };
    params[params.length] = { name: "username", value: username };

    var url = baseUrl + earthquakesFnc + "?" + getQueryString(params);
    return url;
}

// functions for constructing URL of service




// functions for searching results from service

function findCity(cityName) {
    $.ajax({
        url: getCityUrl(cityName)
    }).then(function (data) {
        if ((data === undefined) || (data === null)) {
            alert("Error: geonames service did not return result when searching city='" + cityName + "'");
            return;
        }

        if (data.geonames.length === 0) {
            alert("Warning: there is not city='" + cityName + "' found on geonames service.");
            return;
        }

        // I take just the first city from the list for finding earthquakes
        findEarthquakeByCity(data.geonames[0]);
    });
}

function findEarthquakeByCity(city) {
    $.ajax({
        url: getEarthquakeUrl(city.lat, city.lng)
    }).then(function (data) {
        if ((data === undefined) || (data === null)) {
            alert("Error: geonames service did not return result when searching earthquakes for city='" + city.name + "'");
            return;
        }

        if (data.earthquakes.length === 0) {
            alert("Warning: there is not earthquake for city='" + city.name + "' found on geonames service.");
            return;
        }

        drawEarthquakes(city.lat, city.lng, data.earthquakes);
    });
}

function drawEarthquakes(lat, lng, earthquakes) {
    var latlng = new google.maps.LatLng(lat, lng);

    var mapCanvas = document.getElementById('map-canvas');
    var mapOptions = {
        center: latlng,
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    var map = new google.maps.Map(mapCanvas, mapOptions)

    for (var i = 0; i < earthquakes.length; i++) {
        drawEarthquakeMarker(earthquakes[i], map);
    }
}

function drawEarthquakeMarker(earthquake, map) {
    var latlng = new google.maps.LatLng(earthquake.lat, earthquake.lng);

    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: getEarthquakeMarkerTitle(earthquake)
    });
}

function getEarthquakeMarkerTitle(earthquake) {
    var title = "";
    title = title + "Datetime: " + earthquake.datetime + "\n";
    title = title + "Magnitude: " + earthquake.magnitude + "\n";
    title = title + "Depth: " + earthquake.depth + "\n";

    return title;
}

// functions for searching results from service




// element events

function showClick() {
    var cityInput = document.getElementById("city-name");
    if ((cityInput === undefined) || (cityInput === null)) {
        alert("Error: element 'city-name' was not found.");
        return;
    }

    var cityName = cityInput.value;
    if ((cityName === undefined) || (cityName === null) || (cityName === "")) {
        alert("Warning: name of city is not defined.");
        return;
    }

    findCity(cityName);
}

// element events




// function intializing google maps element

function initialize() {
    var mapCanvas = document.getElementById('map-canvas');
    var mapOptions = {
        center: new google.maps.LatLng(49.464195, 18.134055),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    var map = new google.maps.Map(mapCanvas, mapOptions)
}

google.maps.event.addDomListener(window, 'load', initialize);