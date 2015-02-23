'use strict';

// functions for constructing URL of service

var baseUrl = "http://api.geonames.org/";
var username = "bashocz";

var cityFnc = "searchJSON";
var earthquakesFnc = "earthquakesJSON";
var nearbyFnc = "findNearbyPlaceNameJSON";

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
    //params[params.length] = { name: "fuzzy", value: 0.8 };
    params[params.length] = { name: "username", value: username };

    var url = baseUrl + cityFnc + "?" + getQueryString(params);
    return url;
}

function getEarthquakeUrlByLatLng(latStr, lngStr) {
    var lat = Number(latStr);
    var lng = Number(lngStr);
    var offset = 0.5;

    return getEarthquakeUrlByNSEW(lat + offset, lat - offset, lng + offset, lng - offset);
}

function getEarthquakeUrlByNSEW(north, south, east, west) {
    var params = [];
    params[params.length] = { name: "north", value: north };
    params[params.length] = { name: "south", value: south };
    params[params.length] = { name: "east", value: east };
    params[params.length] = { name: "west", value: west };
    params[params.length] = { name: "username", value: username };

    var url = baseUrl + earthquakesFnc + "?" + getQueryString(params);
    return url;
}

function getNearByUrl(lat, lng) {
    var params = [];
    params[params.length] = { name: "lat", value: lat };
    params[params.length] = { name: "lng", value: lng };
    //params[params.length] = { name: "radius", value: 1000 };
    params[params.length] = { name: "username", value: username };

    var url = baseUrl + nearbyFnc + "?" + getQueryString(params);
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
        url: getEarthquakeUrlByLatLng(city.lat, city.lng)
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
    };
    var map = new google.maps.Map(mapCanvas, mapOptions);

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




// functions for top 10 largest earthquakes

function findTop10Earthquakes() {
    $.ajax({
        url: getEarthquakeUrlByNSEW(80, -80, 179, -179)
    }).then(function (data) {
        if ((data === undefined) || (data === null)) {
            alert("Error: geonames service did not return result when searching earthquakes for city='" + city.name + "'");
            return;
        }

        if (data.earthquakes.length === 0) {
            alert("Warning: there is not earthquake for city='" + city.name + "' found on geonames service.");
            return;
        }

        drawEarthquakesTable(data.earthquakes);
    });
}

function drawEarthquakesTable(earthquakes) {
    var table = document.getElementById("top10");

    for (var i = 0; i < earthquakes.length; i++)
        createEarthquakesTableRow(table, i, earthquakes[i]);

    createEarthquakesTableHeader(table);
}

function createEarthquakesTableHeader(table) {
    var header = table.createTHead();
    var row = header.insertRow(0);

    var cell0 = row.insertCell(0); // magnitude
    var cell1 = row.insertCell(1); // datetime
    var cell2 = row.insertCell(2); // depth
    var cell3 = row.insertCell(3); // lat
    var cell4 = row.insertCell(4); // lng
    var cell5 = row.insertCell(5); // near by city
    var cell6 = row.insertCell(6); // country
    var cell7 = row.insertCell(7); // distance

    cell0.innerHTML = "<b>Magnitude</b>";
    cell1.innerHTML = "<b>Date</b>";
    cell2.innerHTML = "<b>Depth</b>";
    cell3.innerHTML = "<b>Latitude</b>";
    cell4.innerHTML = "<b>Longitude</b>";
    cell5.innerHTML = "<b>Near by city</b>";
    cell6.innerHTML = "<b>Country</b>";
    cell7.innerHTML = "<b>Distance [km]</b>";
}

function createEarthquakesTableRow(table, i, earthquake) {
    var row = table.insertRow(i);

    var cell0 = row.insertCell(0); // magnitude
    var cell1 = row.insertCell(1); // datetime
    var cell2 = row.insertCell(2); // depth
    var cell3 = row.insertCell(3); // lat
    var cell4 = row.insertCell(4); // lng
    var cell5 = row.insertCell(5); // near by city
    var cell6 = row.insertCell(6); // country
    var cell7 = row.insertCell(7); // distance

    cell0.innerHTML = earthquake.magnitude;
    cell1.innerHTML = earthquake.datetime;
    cell2.innerHTML = earthquake.depth;
    cell3.innerHTML = earthquake.lat;
    cell4.innerHTML = earthquake.lng;
    findEarthquakeNearByCity(cell5, cell6, cell7, earthquake);
}

function findEarthquakeNearByCity(cellcity, cellcountry,  celldistance, earthquake) {
    $.ajax({
        url: getNearByUrl(earthquake.lat, earthquake.lng)
    }).then(function (data) {
        if ((data === undefined) || (data === null)) {
            console.warn("Error: geonames service did not return result when searching near by city for earthquake.");
            return;
        }

        if (data.geonames.length === 0) {
            console.warn("Warning: there is not near by city for earthquake.");
            return;
        }

        cellcity.innerHTML = data.geonames[0].name;
        cellcountry.innerHTML = data.geonames[0].countryName;
        celldistance.innerHTML = data.geonames[0].distance;
    });
}

// functions for top 10 largest earthquakes




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
    };
    var map = new google.maps.Map(mapCanvas, mapOptions);

    findTop10Earthquakes();
}

google.maps.event.addDomListener(window, 'load', initialize);