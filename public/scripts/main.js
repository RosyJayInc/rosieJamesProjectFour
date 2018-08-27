(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var app = {};

app.apiKey = "Aps9Ru4I2VE16SVT-Uqa1m0_dnEV3AI15tq6yOCMbctU6mkJFtcs4CQiiet2bJvX";
app.cityAndCountry = ", Toronto, Canada";
app.map;
app.pin;
app.searchManager;
app.directionsManager;
app.points;

// Initialize Firebase
app.config = {
    apiKey: "AIzaSyDK_ozYtdxMbAEhZ6T3g79O5K-eHfCBKZw",
    authDomain: "rosiejamesprojectfour.firebaseapp.com",
    databaseURL: "https://rosiejamesprojectfour.firebaseio.com",
    projectId: "rosiejamesprojectfour",
    storageBucket: "rosiejamesprojectfour.appspot.com",
    messagingSenderId: "360785100105"
};

firebase.initializeApp(app.config);

app.dbRef = firebase.database().ref("project4SafeAreas");

app.dbChanges = function () {
    var result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "empty";

    if (result != "empty") {
        app.dbRef.on("value", function (snapshot) {
            var doesExist = false;
            var safeAreas = snapshot.val();

            for (var area in safeAreas) {
                if (safeAreas[area].address === result.address.formattedAddress) {
                    doesExist = true;
                }
            }
            if (doesExist === false) {
                var id = app.dbRef.push().key;
                var itemReference = firebase.database().ref("project4SafeAreas/" + id);

                itemReference.set({
                    address: result.address.formattedAddress,
                    safe: true,
                    lat: result.location.latitude,
                    long: result.location.longitude,
                    key: id
                });
            }
        });
    } else {}
};

app.determineResults = function (addressData, results) {

    var resultString = "";

    var resultButtons = $("<div class=\"resultButtons\"><button class=\"findSafe\">Find Safer Area</button><button class=\"anotherQuery\">Test Another Address</button></div>");

    var resultMonth = (results / 12).toFixed(2);

    if (results > 450) {
        resultString = $("<h3 id=\"resultNumber\">Severe</h3><p class=\"resultNumber\">" + results + "</p> <p>reported bike thefts within a 1km radius of " + addressData.address.addressLine + " in 2017.</p> <p>That is an average of approximately <span class=\"highlightMonthly\">" + resultMonth + " </span>thefts a month.</p>");
        app.findSafeArea(addressData);
    } else if (results > 350) {
        resultString = $("<h3 id=\"resultNumber\">Extremely high</h3><p class=\"resultNumber\">" + results + "</p> <p>reported bike thefts within a 1km radius of " + addressData.address.addressLine + " in 2017.</p> <p>That is an average of approximately <span class=\"highlightMonthly\">" + resultMonth + " </span>thefts a month.</p>");
        app.findSafeArea(addressData);
    } else if (results > 250) {
        resultString = $("<h3 id=\"resultNumber\">High</h3><p class=\"resultNumber\">" + results + "</p> <p>reported bike thefts within a 1km radius of " + addressData.address.addressLine + " in 2017.</p> <p>That is an average of approximately <span class=\"highlightMonthly\">" + resultMonth + " </span>thefts a month.</p>");
        app.findSafeArea(addressData);
    } else if (results > 150) {
        resultString = $("<h3 id=\"resultNumber\">Moderate</h3><p class=\"resultNumber\">" + results + "</p> <p>reported bike thefts within a 1km radius of " + addressData.address.addressLine + " in 2017.</p> <p>That is an average of approximately <span class=\"highlightMonthly\">" + resultMonth + " </span>thefts a month.</p>");
        app.dbChanges(addressData);
    } else if (results > 50) {
        resultString = $("<h3 id=\"resultNumber\">Low</h3><p class=\"resultNumber\">" + results + "</p> <p>reported bike thefts within a 1km radius of " + addressData.address.addressLine + " in 2017.</p> <p>That is an average of approximately <span class=\"highlightMonthly\">" + resultMonth + " </span>thefts a month.</p>");
        app.dbChanges(addressData);
    } else if (results >= 0) {
        resultString = $("<h3 id=\"resultNumber\">Negligible</h3><p class=\"resultNumber\">" + results + "</p> <p>reported bike thefts within a 1km radius of " + addressData.address.addressLine + " in 2017.</p> <p>That is an average of approximately <span class=\"highlightMonthly\">" + resultMonth + " </span>thefts a month.</p>");
        app.dbChanges(addressData);
    } else {
        resultString = $("No results Found, Try Again");
    }

    $(".textResults").empty().append(resultString, resultButtons);

    $(".anotherQuery").on("click", function () {

        $(".textResults").empty();
        $("#resultMap").removeClass("resultMapDisplay").addClass("resultMapHidden");
        $(".resultButtons").empty();
        $("footer").removeClass("footerDisplay");

        $(".line").removeClass("lineDisplay");
        $(".separatingLine").removeClass("separatingLineDisplay");
        $(".textResults").removeClass("textResultsHeight");

        $(".results").removeClass("resultsDisplay");
        $("#directions").empty();

        $('html, body').animate({
            scrollTop: 650
        }, 1000);

        app.map.entities.remove(app.pin);
    });
};

app.findSafeArea = function (unsafeAddress) {
    // console.log(app.dbRef);

    var curLat = unsafeAddress.location.latitude;
    var curLon = unsafeAddress.location.longitude;

    // console.log(curLat, curLon);

    var rangeVal = 0.02;

    app.dbRef.once("value", function (snapshot) {
        var isNear = false;
        var safeList = snapshot.val();
        var closeAreas = [];

        for (var area in safeList) {
            if (curLat - rangeVal < safeList[area].lat && safeList[area].lat < curLat + rangeVal && curLon - rangeVal < safeList[area].long && safeList[area].long < curLon + rangeVal) {
                isNear = true;
                closeAreas.push(safeList[area]);
            }
        }
        if (isNear === true) {
            // console.log(closeAreas);

            var ranSpot = Math.floor(Math.random() * closeAreas.length);
            console.log(closeAreas[ranSpot]);

            $(".resultButtons .findSafe").removeClass("noNearbySafe");
            $(".textResults").on("click", ".findSafe", function () {
                app.getDirections(unsafeAddress, closeAreas[ranSpot]);
            });
        } else {
            console.log('Testy mcTestface');

            $(".resultButtons .findSafe").addClass("noNearbySafe");
        }
    });
};
app.getDirections = function (unsafe, safe) {
    var unsafeString = unsafe.address.formattedAddress;
    var safeString = safe.address;
    var safeLat = safe.lat;
    var safeLong = safe.long;

    Microsoft.Maps.loadModule("Microsoft.Maps.Directions", function () {
        //Create an instance of the directions manager.
        app.directionsManager = new Microsoft.Maps.Directions.DirectionsManager(app.map);

        //Create waypoints to route between.
        var currentPoint = new Microsoft.Maps.Directions.Waypoint({
            address: unsafeString
        });

        app.directionsManager.addWaypoint(currentPoint);

        var safePoint = new Microsoft.Maps.Directions.Waypoint({
            address: safeString
        });

        app.directionsManager.addWaypoint(safePoint);

        //Specify the element in which the itinerary will be rendered.
        app.directionsManager.setRenderOptions({ itineraryContainer: '#directions' });
        app.map.entities.remove(app.pin);
        //Calculate directions.
        app.directionsManager.calculateDirections();

        $("#directions").append("<div class='backToResults'><button class='backButton'>Back To Results</button>");
        $(".backButton").on("click", function () {
            $('html, body').animate({
                scrollTop: 650
            }, 1000);
        });
    });
};
app.getMap = function (query) {
    var navigationBarMode = Microsoft.Maps.NavigationBarMode;
    app.map = new Microsoft.Maps.Map("#resultMap", {
        credentials: app.apiKey,
        center: new Microsoft.Maps.Location(43.6482, -79.39782),
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        navigationBarMode: navigationBarMode.minified,
        zoom: 12
    });

    // defining points of polygon here: boundaries of Toronto
    app.points = [new Microsoft.Maps.Location(43.584721, -79.541365), new Microsoft.Maps.Location(43.610629, -79.567029), new Microsoft.Maps.Location(43.627276, -79.563436), new Microsoft.Maps.Location(43.625848, -79.575361), new Microsoft.Maps.Location(43.629626, -79.585825), new Microsoft.Maps.Location(43.644599, -79.591420), new Microsoft.Maps.Location(43.667592, -79.589045), new Microsoft.Maps.Location(43.743851, -79.648292), new Microsoft.Maps.Location(43.832546, -79.267848), new Microsoft.Maps.Location(43.798602, -79.132959), new Microsoft.Maps.Location(43.789980, -79.121711), new Microsoft.Maps.Location(43.667366, -79.103675), new Microsoft.Maps.Location(43.552493, -79.500425), new Microsoft.Maps.Location(43.584721, -79.541365)];

    var polygon = new Microsoft.Maps.Polygon(app.points).setOptions({ fillColor: 'transparent' });

    // pushing the polygon into the map
    app.map.entities.push(polygon);
};

// function to check if the point is acutally in the polygon
app.pointInPolygon = function (pin) {
    var lon = pin.geometry.x;
    var lat = pin.geometry.y;

    var j = app.points.length - 1;
    var inPoly = false;

    for (var i = 0; i < app.points.length; i = i + 1) {
        if (app.points[i].longitude < lon && app.points[j].longitude >= lon || app.points[j].longitude < lon && app.points[i].longitude >= lon) {
            if (app.points[i].latitude + (lon - app.points[i].longitude) / (app.points[j].longitude - app.points[i].longitude) * (app.points[j].latitude - app.points[i].latitude) < lat) {
                inPoly = !inPoly;
            }
        }
        j = i;
    }

    if (inPoly) {
        app.map.entities.push(pin);
    } else {
        alert("This location is outside the boundaries for this data set");
    }
};

app.geocodeQuery = function (query) {

    query = query.toLowerCase().split(" ").map(function (s) {
        return s.charAt(0).toUpperCase() + s.substring(1);
    }).join(" ");

    // if the search manager isn't defined yet, create an instance of the search manager class
    if (!app.searchManager) {
        Microsoft.Maps.loadModule("Microsoft.Maps.Search", function () {
            app.searchManager = new Microsoft.Maps.Search.SearchManager(app.map);
            app.geocodeQuery(query);
        });
    } else {
        var searchRequest = {
            where: query,
            callback: function callback(r) {
                // get the results from the geocoding function 
                if (r && r.results && r.results.length > 0) {

                    var firstResult = r.results[0];

                    app.pin = new Microsoft.Maps.Pushpin(firstResult.location, {
                        color: "red",
                        title: query
                    });
                    // make the database call here
                    app.getCrimeData(firstResult);

                    // make the call to check if within polygon here
                    app.pointInPolygon(app.pin);

                    app.map.setView({ center: firstResult.location });
                }
            },
            errorCallback: function errorCallback() {
                alert("no results found");
            }
        };

        app.searchManager.geocode(searchRequest);
    } // else statement ends
}; // geocode query ends


app.getCrimeData = function (addressData) {

    var url = "https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Bicycle_Thefts/FeatureServer/0/query?";

    var locationX = addressData.location.longitude;
    var locationY = addressData.location.latitude;

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        data: {
            geometry: locationX + "," + locationY,
            geometryType: "esriGeometryPoint",
            inSR: 4326,
            spatialRel: "esriSpatialRelIntersects",
            distance: 1000,
            units: "esriSRUnit_Meter",
            f: "json",
            outSR: 4326,
            outFields: "*",
            where: "Occurrence_Year > 2016"
        }
    }).then(function (res) {

        var results = res.features.length;
        app.determineResults(addressData, results);
    });
};

app.submitQuery = function () {
    $(".addressQuery").on("submit", function (e) {
        e.preventDefault();
        var addressString = $(".queryText").val().trim();
        app.geocodeQuery("" + addressString + app.cityAndCountry);

        $(".queryText").val("");

        $("#resultMap").removeClass("resultMapHidden").addClass("resultMapDisplay");

        $("footer").addClass("footerDisplay");

        $('html, body').animate({
            scrollTop: 650
        }, 1000);

        $(".line").addClass("lineDisplay");
        $(".separatingLine").addClass("separatingLineDisplay");

        $(".textResults").addClass("textResultsHeight");

        $(".results").addClass("resultsDisplay");
    });
};

app.init = function () {
    app.getMap();
    app.submitQuery();
    app.dbChanges();
};

$(function () {
    app.init();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNDQSxJQUFNLE1BQU0sRUFBWjs7QUFFQSxJQUFJLE1BQUosR0FBYSxrRUFBYjtBQUNBLElBQUksY0FBSixHQUFxQixtQkFBckI7QUFDQSxJQUFJLEdBQUo7QUFDQSxJQUFJLEdBQUo7QUFDQSxJQUFJLGFBQUo7QUFDQSxJQUFJLGlCQUFKO0FBQ0EsSUFBSSxNQUFKOztBQUVBO0FBQ0EsSUFBSSxNQUFKLEdBQWE7QUFDVCxZQUFRLHlDQURDO0FBRVQsZ0JBQVksdUNBRkg7QUFHVCxpQkFBYSw4Q0FISjtBQUlULGVBQVcsdUJBSkY7QUFLVCxtQkFBZSxtQ0FMTjtBQU1ULHVCQUFtQjtBQU5WLENBQWI7O0FBU0EsU0FBUyxhQUFULENBQXVCLElBQUksTUFBM0I7O0FBRUEsSUFBSSxLQUFKLEdBQVksU0FBUyxRQUFULEdBQW9CLEdBQXBCLENBQXdCLG1CQUF4QixDQUFaOztBQUVBLElBQUksU0FBSixHQUFnQixZQUEwQjtBQUFBLFFBQWpCLE1BQWlCLHVFQUFSLE9BQVE7O0FBQ3RDLFFBQUcsVUFBVSxPQUFiLEVBQXFCO0FBQ2pCLFlBQUksS0FBSixDQUFVLEVBQVYsQ0FBYSxPQUFiLEVBQXNCLFVBQVMsUUFBVCxFQUFrQjtBQUNwQyxnQkFBSSxZQUFZLEtBQWhCO0FBQ0EsZ0JBQUksWUFBWSxTQUFTLEdBQVQsRUFBaEI7O0FBRUEsaUJBQUksSUFBSSxJQUFSLElBQWdCLFNBQWhCLEVBQTBCO0FBQ3RCLG9CQUFHLFVBQVUsSUFBVixFQUFnQixPQUFoQixLQUE0QixPQUFPLE9BQVAsQ0FBZSxnQkFBOUMsRUFBK0Q7QUFDM0QsZ0NBQVksSUFBWjtBQUNIO0FBQ0o7QUFDRCxnQkFBRyxjQUFjLEtBQWpCLEVBQXVCO0FBQ25CLG9CQUFNLEtBQUssSUFBSSxLQUFKLENBQVUsSUFBVixHQUFpQixHQUE1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QjtBQUNBLFVBQUUsaUJBQUYsRUFBcUIsUUFBckIsQ0FBOEIsdUJBQTlCOztBQUVBLFVBQUUsY0FBRixFQUFrQixRQUFsQixDQUEyQixtQkFBM0I7O0FBRUEsVUFBRSxVQUFGLEVBQWMsUUFBZCxDQUF1QixnQkFBdkI7QUFFSCxLQXRCRDtBQXVCSCxDQXhCRDs7QUEyQkEsSUFBSSxJQUFKLEdBQVcsWUFBVztBQUNsQixRQUFJLE1BQUo7QUFDQSxRQUFJLFdBQUo7QUFDQSxRQUFJLFNBQUo7QUFFSCxDQUxEOztBQU9BLEVBQUUsWUFBVTtBQUNSLFFBQUksSUFBSjtBQUNILENBRkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcclxuY29uc3QgYXBwID0ge307XHJcblxyXG5hcHAuYXBpS2V5ID0gXCJBcHM5UnU0STJWRTE2U1ZULVVxYTFtMF9kbkVWM0FJMTV0cTZ5T0NNYmN0VTZta0pGdGNzNENRaWlldDJiSnZYXCI7XHJcbmFwcC5jaXR5QW5kQ291bnRyeSA9IFwiLCBUb3JvbnRvLCBDYW5hZGFcIjtcclxuYXBwLm1hcDtcclxuYXBwLnBpbjtcclxuYXBwLnNlYXJjaE1hbmFnZXI7XHJcbmFwcC5kaXJlY3Rpb25zTWFuYWdlcjtcclxuYXBwLnBvaW50cztcclxuXHJcbi8vIEluaXRpYWxpemUgRmlyZWJhc2VcclxuYXBwLmNvbmZpZyA9IHtcclxuICAgIGFwaUtleTogXCJBSXphU3lES19vell0ZHhNYkFFaFo2VDNnNzlPNUstZUhmQ0JLWndcIixcclxuICAgIGF1dGhEb21haW46IFwicm9zaWVqYW1lc3Byb2plY3Rmb3VyLmZpcmViYXNlYXBwLmNvbVwiLFxyXG4gICAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9yb3NpZWphbWVzcHJvamVjdGZvdXIuZmlyZWJhc2Vpby5jb21cIixcclxuICAgIHByb2plY3RJZDogXCJyb3NpZWphbWVzcHJvamVjdGZvdXJcIixcclxuICAgIHN0b3JhZ2VCdWNrZXQ6IFwicm9zaWVqYW1lc3Byb2plY3Rmb3VyLmFwcHNwb3QuY29tXCIsXHJcbiAgICBtZXNzYWdpbmdTZW5kZXJJZDogXCIzNjA3ODUxMDAxMDVcIlxyXG59O1xyXG5cclxuZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChhcHAuY29uZmlnKTtcclxuXHJcbmFwcC5kYlJlZiA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKFwicHJvamVjdDRTYWZlQXJlYXNcIik7XHJcblxyXG5hcHAuZGJDaGFuZ2VzID0gZnVuY3Rpb24ocmVzdWx0ID0gXCJlbXB0eVwiKXtcclxuICAgIGlmKHJlc3VsdCAhPSBcImVtcHR5XCIpe1xyXG4gICAgICAgIGFwcC5kYlJlZi5vbihcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KXtcclxuICAgICAgICAgICAgbGV0IGRvZXNFeGlzdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBsZXQgc2FmZUFyZWFzID0gc25hcHNob3QudmFsKCk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBmb3IobGV0IGFyZWEgaW4gc2FmZUFyZWFzKXtcclxuICAgICAgICAgICAgICAgIGlmKHNhZmVBcmVhc1thcmVhXS5hZGRyZXNzID09PSByZXN1bHQuYWRkcmVzcy5mb3JtYXR0ZWRBZGRyZXNzKXtcclxuICAgICAgICAgICAgICAgICAgICBkb2VzRXhpc3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKGRvZXNFeGlzdCA9PT0gZmFsc2Upe1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBhcHAuZGJSZWYucHVzaCgpLmtleTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1SZWZlcmVuY2UgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZihgcHJvamVjdDRTYWZlQXJlYXMvJHtpZH1gKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpdGVtUmVmZXJlbmNlLnNldCh7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRkcmVzczogcmVzdWx0LmFkZHJlc3MuZm9ybWF0dGVkQWRkcmVzcyxcclxuICAgICAgICAgICAgICAgICAgICBzYWZlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhdDogcmVzdWx0LmxvY2F0aW9uLmxhdGl0dWRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGxvbmc6IHJlc3VsdC5sb2NhdGlvbi5sb25naXR1ZGUsXHJcbiAgICAgICAgICAgICAgICAgICAga2V5OiBpZFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGVsc2V7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbn1cclxuXHJcbmFwcC5kZXRlcm1pbmVSZXN1bHRzID0gKGFkZHJlc3NEYXRhLCByZXN1bHRzKSA9PiB7XHJcbiAgICBcclxuICAgIGxldCByZXN1bHRTdHJpbmcgPSBcIlwiO1xyXG5cclxuICAgIGxldCByZXN1bHRCdXR0b25zID0gJChgPGRpdiBjbGFzcz1cInJlc3VsdEJ1dHRvbnNcIj48YnV0dG9uIGNsYXNzPVwiZmluZFNhZmVcIj5GaW5kIFNhZmVyIEFyZWE8L2J1dHRvbj48YnV0dG9uIGNsYXNzPVwiYW5vdGhlclF1ZXJ5XCI+VGVzdCBBbm90aGVyIEFkZHJlc3M8L2J1dHRvbj48L2Rpdj5gKVxyXG5cclxuICAgIGxldCByZXN1bHRNb250aCA9IChyZXN1bHRzLzEyKS50b0ZpeGVkKDIpO1xyXG5cclxuICAgIGlmIChyZXN1bHRzID4gNDUwKSB7XHJcbiAgICAgICAgcmVzdWx0U3RyaW5nID0gJChgPGgzIGlkPVwicmVzdWx0TnVtYmVyXCI+U2V2ZXJlPC9oMz48cCBjbGFzcz1cInJlc3VsdE51bWJlclwiPiR7cmVzdWx0c308L3A+IDxwPnJlcG9ydGVkIGJpa2UgdGhlZnRzIHdpdGhpbiBhIDFrbSByYWRpdXMgb2YgJHthZGRyZXNzRGF0YS5hZGRyZXNzLmFkZHJlc3NMaW5lfSBpbiAyMDE3LjwvcD4gPHA+VGhhdCBpcyBhbiBhdmVyYWdlIG9mIGFwcHJveGltYXRlbHkgPHNwYW4gY2xhc3M9XCJoaWdobGlnaHRNb250aGx5XCI+JHtyZXN1bHRNb250aH0gPC9zcGFuPnRoZWZ0cyBhIG1vbnRoLjwvcD5gKTtcclxuICAgICAgICBhcHAuZmluZFNhZmVBcmVhKGFkZHJlc3NEYXRhKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYocmVzdWx0cyA+IDM1MCl7XHJcbiAgICAgICAgcmVzdWx0U3RyaW5nID0gJChgPGgzIGlkPVwicmVzdWx0TnVtYmVyXCI+RXh0cmVtZWx5IGhpZ2g8L2gzPjxwIGNsYXNzPVwicmVzdWx0TnVtYmVyXCI+JHtyZXN1bHRzfTwvcD4gPHA+cmVwb3J0ZWQgYmlrZSB0aGVmdHMgd2l0aGluIGEgMWttIHJhZGl1cyBvZiAke2FkZHJlc3NEYXRhLmFkZHJlc3MuYWRkcmVzc0xpbmV9IGluIDIwMTcuPC9wPiA8cD5UaGF0IGlzIGFuIGF2ZXJhZ2Ugb2YgYXBwcm94aW1hdGVseSA8c3BhbiBjbGFzcz1cImhpZ2hsaWdodE1vbnRobHlcIj4ke3Jlc3VsdE1vbnRofSA8L3NwYW4+dGhlZnRzIGEgbW9udGguPC9wPmApO1xyXG4gICAgICAgIGFwcC5maW5kU2FmZUFyZWEoYWRkcmVzc0RhdGEpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZihyZXN1bHRzID4gMjUwKXtcclxuICAgICAgICByZXN1bHRTdHJpbmcgPSAkKGA8aDMgaWQ9XCJyZXN1bHROdW1iZXJcIj5IaWdoPC9oMz48cCBjbGFzcz1cInJlc3VsdE51bWJlclwiPiR7cmVzdWx0c308L3A+IDxwPnJlcG9ydGVkIGJpa2UgdGhlZnRzIHdpdGhpbiBhIDFrbSByYWRpdXMgb2YgJHthZGRyZXNzRGF0YS5hZGRyZXNzLmFkZHJlc3NMaW5lfSBpbiAyMDE3LjwvcD4gPHA+VGhhdCBpcyBhbiBhdmVyYWdlIG9mIGFwcHJveGltYXRlbHkgPHNwYW4gY2xhc3M9XCJoaWdobGlnaHRNb250aGx5XCI+JHtyZXN1bHRNb250aH0gPC9zcGFuPnRoZWZ0cyBhIG1vbnRoLjwvcD5gKTtcclxuICAgICAgICBhcHAuZmluZFNhZmVBcmVhKGFkZHJlc3NEYXRhKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYocmVzdWx0cyA+IDE1MCl7XHJcbiAgICAgICAgcmVzdWx0U3RyaW5nID0gJChgPGgzIGlkPVwicmVzdWx0TnVtYmVyXCI+TW9kZXJhdGU8L2gzPjxwIGNsYXNzPVwicmVzdWx0TnVtYmVyXCI+JHtyZXN1bHRzfTwvcD4gPHA+cmVwb3J0ZWQgYmlrZSB0aGVmdHMgd2l0aGluIGEgMWttIHJhZGl1cyBvZiAke2FkZHJlc3NEYXRhLmFkZHJlc3MuYWRkcmVzc0xpbmV9IGluIDIwMTcuPC9wPiA8cD5UaGF0IGlzIGFuIGF2ZXJhZ2Ugb2YgYXBwcm94aW1hdGVseSA8c3BhbiBjbGFzcz1cImhpZ2hsaWdodE1vbnRobHlcIj4ke3Jlc3VsdE1vbnRofSA8L3NwYW4+dGhlZnRzIGEgbW9udGguPC9wPmApO1xyXG4gICAgICAgIGFwcC5kYkNoYW5nZXMoYWRkcmVzc0RhdGEpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZihyZXN1bHRzID4gNTApe1xyXG4gICAgICAgIHJlc3VsdFN0cmluZyA9ICQoYDxoMyBpZD1cInJlc3VsdE51bWJlclwiPkxvdzwvaDM+PHAgY2xhc3M9XCJyZXN1bHROdW1iZXJcIj4ke3Jlc3VsdHN9PC9wPiA8cD5yZXBvcnRlZCBiaWtlIHRoZWZ0cyB3aXRoaW4gYSAxa20gcmFkaXVzIG9mICR7YWRkcmVzc0RhdGEuYWRkcmVzcy5hZGRyZXNzTGluZX0gaW4gMjAxNy48L3A+IDxwPlRoYXQgaXMgYW4gYXZlcmFnZSBvZiBhcHByb3hpbWF0ZWx5IDxzcGFuIGNsYXNzPVwiaGlnaGxpZ2h0TW9udGhseVwiPiR7cmVzdWx0TW9udGh9IDwvc3Bhbj50aGVmdHMgYSBtb250aC48L3A+YCk7XHJcbiAgICAgICAgYXBwLmRiQ2hhbmdlcyhhZGRyZXNzRGF0YSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmKHJlc3VsdHMgPj0gMCApe1xyXG4gICAgICAgIHJlc3VsdFN0cmluZyA9ICQoYDxoMyBpZD1cInJlc3VsdE51bWJlclwiPk5lZ2xpZ2libGU8L2gzPjxwIGNsYXNzPVwicmVzdWx0TnVtYmVyXCI+JHtyZXN1bHRzfTwvcD4gPHA+cmVwb3J0ZWQgYmlrZSB0aGVmdHMgd2l0aGluIGEgMWttIHJhZGl1cyBvZiAke2FkZHJlc3NEYXRhLmFkZHJlc3MuYWRkcmVzc0xpbmV9IGluIDIwMTcuPC9wPiA8cD5UaGF0IGlzIGFuIGF2ZXJhZ2Ugb2YgYXBwcm94aW1hdGVseSA8c3BhbiBjbGFzcz1cImhpZ2hsaWdodE1vbnRobHlcIj4ke3Jlc3VsdE1vbnRofSA8L3NwYW4+dGhlZnRzIGEgbW9udGguPC9wPmApO1xyXG4gICAgICAgIGFwcC5kYkNoYW5nZXMoYWRkcmVzc0RhdGEpO1xyXG4gICAgfVxyXG4gICAgZWxzZXtcclxuICAgICAgICByZXN1bHRTdHJpbmcgPSAkKGBObyByZXN1bHRzIEZvdW5kLCBUcnkgQWdhaW5gKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgJChcIi50ZXh0UmVzdWx0c1wiKS5lbXB0eSgpLmFwcGVuZChyZXN1bHRTdHJpbmcsIHJlc3VsdEJ1dHRvbnMpO1xyXG4gICAgXHJcbiAgICAkKFwiLmFub3RoZXJRdWVyeVwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgJChcIi50ZXh0UmVzdWx0c1wiKS5lbXB0eSgpO1xyXG4gICAgICAgICQoXCIjcmVzdWx0TWFwXCIpLnJlbW92ZUNsYXNzKFwicmVzdWx0TWFwRGlzcGxheVwiKS5hZGRDbGFzcyhcInJlc3VsdE1hcEhpZGRlblwiKTtcclxuICAgICAgICAkKFwiLnJlc3VsdEJ1dHRvbnNcIikuZW1wdHkoKTtcclxuICAgICAgICAkKFwiZm9vdGVyXCIpLnJlbW92ZUNsYXNzKFwiZm9vdGVyRGlzcGxheVwiKVxyXG5cclxuICAgICAgICAkKFwiLmxpbmVcIikucmVtb3ZlQ2xhc3MoXCJsaW5lRGlzcGxheVwiKTtcclxuICAgICAgICAkKFwiLnNlcGFyYXRpbmdMaW5lXCIpLnJlbW92ZUNsYXNzKFwic2VwYXJhdGluZ0xpbmVEaXNwbGF5XCIpXHJcbiAgICAgICAgJChcIi50ZXh0UmVzdWx0c1wiKS5yZW1vdmVDbGFzcyhcInRleHRSZXN1bHRzSGVpZ2h0XCIpXHJcblxyXG4gICAgICAgICQoXCIucmVzdWx0c1wiKS5yZW1vdmVDbGFzcyhcInJlc3VsdHNEaXNwbGF5XCIpXHJcbiAgICAgICAgJChcIiNkaXJlY3Rpb25zXCIpLmVtcHR5KCk7XHJcblxyXG4gICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcclxuICAgICAgICAgICAgc2Nyb2xsVG9wOiA2NTBcclxuICAgICAgICB9LCAxMDAwKTtcclxuXHJcbiAgICAgICAgYXBwLm1hcC5lbnRpdGllcy5yZW1vdmUoYXBwLnBpbik7XHJcbiAgICB9KTtcclxuXHJcbn1cclxuXHJcbmFwcC5maW5kU2FmZUFyZWEgPSBmdW5jdGlvbih1bnNhZmVBZGRyZXNzKSB7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhhcHAuZGJSZWYpO1xyXG5cclxuICAgIGxldCBjdXJMYXQgPSB1bnNhZmVBZGRyZXNzLmxvY2F0aW9uLmxhdGl0dWRlO1xyXG4gICAgbGV0IGN1ckxvbiA9IHVuc2FmZUFkZHJlc3MubG9jYXRpb24ubG9uZ2l0dWRlO1xyXG5cclxuICAgIC8vIGNvbnNvbGUubG9nKGN1ckxhdCwgY3VyTG9uKTtcclxuICAgIFxyXG4gICAgbGV0IHJhbmdlVmFsID0gMC4wMjtcclxuXHJcbiAgICBhcHAuZGJSZWYub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KXtcclxuICAgICAgICBsZXQgaXNOZWFyID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IHNhZmVMaXN0ID0gc25hcHNob3QudmFsKCk7XHJcbiAgICAgICAgbGV0IGNsb3NlQXJlYXMgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgYXJlYSBpbiBzYWZlTGlzdCl7XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICAgICgoY3VyTGF0IC0gcmFuZ2VWYWwpIDwgc2FmZUxpc3RbYXJlYV0ubGF0ICYmIHNhZmVMaXN0W2FyZWFdLmxhdCA8IChjdXJMYXQgKyByYW5nZVZhbCkpXHJcbiAgICAgICAgICAgICAgICAmJlxyXG4gICAgICAgICAgICAgICAgKChjdXJMb24gLSByYW5nZVZhbCkgPCBzYWZlTGlzdFthcmVhXS5sb25nICYmIHNhZmVMaXN0W2FyZWFdLmxvbmcgPCAoY3VyTG9uICsgcmFuZ2VWYWwpKVxyXG4gICAgICAgICAgICApe1xyXG4gICAgICAgICAgICAgICAgaXNOZWFyID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGNsb3NlQXJlYXMucHVzaChzYWZlTGlzdFthcmVhXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoaXNOZWFyID09PSB0cnVlKXtcclxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coY2xvc2VBcmVhcyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgcmFuU3BvdCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNsb3NlQXJlYXMubGVuZ3RoKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coY2xvc2VBcmVhc1tyYW5TcG90XSk7XHJcblxyXG4gICAgICAgICAgICAkKFwiLnJlc3VsdEJ1dHRvbnMgLmZpbmRTYWZlXCIpLnJlbW92ZUNsYXNzKFwibm9OZWFyYnlTYWZlXCIpO1xyXG4gICAgICAgICAgICAkKFwiLnRleHRSZXN1bHRzXCIpLm9uKFwiY2xpY2tcIiwgXCIuZmluZFNhZmVcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGFwcC5nZXREaXJlY3Rpb25zKHVuc2FmZUFkZHJlc3MsIGNsb3NlQXJlYXNbcmFuU3BvdF0pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1Rlc3R5IG1jVGVzdGZhY2UnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICQoXCIucmVzdWx0QnV0dG9ucyAuZmluZFNhZmVcIikuYWRkQ2xhc3MoXCJub05lYXJieVNhZmVcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuYXBwLmdldERpcmVjdGlvbnMgPSBmdW5jdGlvbih1bnNhZmUsIHNhZmUpe1xyXG4gICAgbGV0IHVuc2FmZVN0cmluZyA9IHVuc2FmZS5hZGRyZXNzLmZvcm1hdHRlZEFkZHJlc3M7XHJcbiAgICBsZXQgc2FmZVN0cmluZyA9IHNhZmUuYWRkcmVzcztcclxuICAgIGxldCBzYWZlTGF0ID0gc2FmZS5sYXQ7XHJcbiAgICBsZXQgc2FmZUxvbmcgPSBzYWZlLmxvbmdcclxuICAgIFxyXG4gICAgTWljcm9zb2Z0Lk1hcHMubG9hZE1vZHVsZShcIk1pY3Jvc29mdC5NYXBzLkRpcmVjdGlvbnNcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAvL0NyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgZGlyZWN0aW9ucyBtYW5hZ2VyLlxyXG4gICAgICAgIGFwcC5kaXJlY3Rpb25zTWFuYWdlciA9IG5ldyBNaWNyb3NvZnQuTWFwcy5EaXJlY3Rpb25zLkRpcmVjdGlvbnNNYW5hZ2VyKGFwcC5tYXApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vQ3JlYXRlIHdheXBvaW50cyB0byByb3V0ZSBiZXR3ZWVuLlxyXG4gICAgICAgIGxldCBjdXJyZW50UG9pbnQgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuRGlyZWN0aW9ucy5XYXlwb2ludCh7IFxyXG4gICAgICAgICAgICBhZGRyZXNzOiB1bnNhZmVTdHJpbmcgXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGFwcC5kaXJlY3Rpb25zTWFuYWdlci5hZGRXYXlwb2ludChjdXJyZW50UG9pbnQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBzYWZlUG9pbnQgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuRGlyZWN0aW9ucy5XYXlwb2ludCh7XHJcbiAgICAgICAgICAgIGFkZHJlc3M6IHNhZmVTdHJpbmdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYXBwLmRpcmVjdGlvbnNNYW5hZ2VyLmFkZFdheXBvaW50KHNhZmVQb2ludCk7XHJcblxyXG4gICAgICAgIC8vU3BlY2lmeSB0aGUgZWxlbWVudCBpbiB3aGljaCB0aGUgaXRpbmVyYXJ5IHdpbGwgYmUgcmVuZGVyZWQuXHJcbiAgICAgICAgYXBwLmRpcmVjdGlvbnNNYW5hZ2VyLnNldFJlbmRlck9wdGlvbnMoeyBpdGluZXJhcnlDb250YWluZXI6ICcjZGlyZWN0aW9ucycgfSk7XHJcbiAgICAgICAgYXBwLm1hcC5lbnRpdGllcy5yZW1vdmUoYXBwLnBpbik7XHJcbiAgICAgICAgLy9DYWxjdWxhdGUgZGlyZWN0aW9ucy5cclxuICAgICAgICBhcHAuZGlyZWN0aW9uc01hbmFnZXIuY2FsY3VsYXRlRGlyZWN0aW9ucygpO1xyXG5cclxuICAgICAgICAkKFwiI2RpcmVjdGlvbnNcIikuYXBwZW5kKFwiPGRpdiBjbGFzcz0nYmFja1RvUmVzdWx0cyc+PGJ1dHRvbiBjbGFzcz0nYmFja0J1dHRvbic+QmFjayBUbyBSZXN1bHRzPC9idXR0b24+XCIpXHJcbiAgICAgICAgJChcIi5iYWNrQnV0dG9uXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiA2NTBcclxuICAgICAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG59XHJcbmFwcC5nZXRNYXAgPSBmdW5jdGlvbihxdWVyeSkge1xyXG4gICAgbGV0IG5hdmlnYXRpb25CYXJNb2RlID0gTWljcm9zb2Z0Lk1hcHMuTmF2aWdhdGlvbkJhck1vZGU7XHJcbiAgICBhcHAubWFwID0gbmV3IE1pY3Jvc29mdC5NYXBzLk1hcChcIiNyZXN1bHRNYXBcIiwge1xyXG4gICAgICAgIGNyZWRlbnRpYWxzOiBhcHAuYXBpS2V5LFxyXG4gICAgICAgIGNlbnRlcjogbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjY0ODIsIC03OS4zOTc4MiksXHJcbiAgICAgICAgbWFwVHlwZUlkOiBNaWNyb3NvZnQuTWFwcy5NYXBUeXBlSWQucm9hZCxcclxuICAgICAgICBuYXZpZ2F0aW9uQmFyTW9kZTogbmF2aWdhdGlvbkJhck1vZGUubWluaWZpZWQsXHJcbiAgICAgICAgem9vbTogMTJcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIGRlZmluaW5nIHBvaW50cyBvZiBwb2x5Z29uIGhlcmU6IGJvdW5kYXJpZXMgb2YgVG9yb250b1xyXG4gICAgYXBwLnBvaW50cyA9IFtcclxuICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNTg0NzIxLCAtNzkuNTQxMzY1KSxcclxuICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNjEwNjI5LCAtNzkuNTY3MDI5KSxcclxuICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNjI3Mjc2LCAtNzkuNTYzNDM2KSxcclxuICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNjI1ODQ4LCAtNzkuNTc1MzYxKSxcclxuICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNjI5NjI2LCAtNzkuNTg1ODI1KSxcclxuXHJcbiAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjY0NDU5OSwgLTc5LjU5MTQyMCksXHJcbiAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjY2NzU5MiwgLTc5LjU4OTA0NSksXHJcbiAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjc0Mzg1MSwgLTc5LjY0ODI5MiksXHJcbiAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjgzMjU0NiwgLTc5LjI2Nzg0OCksXHJcbiAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjc5ODYwMiwgLTc5LjEzMjk1OSksXHJcblxyXG4gICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My43ODk5ODAsIC03OS4xMjE3MTEpLFxyXG4gICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My42NjczNjYsIC03OS4xMDM2NzUpLFxyXG4gICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My41NTI0OTMsIC03OS41MDA0MjUpLFxyXG4gICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My41ODQ3MjEsIC03OS41NDEzNjUpXHJcbiAgICBdXHJcblxyXG5cclxuICAgIGxldCBwb2x5Z29uID0gbmV3IE1pY3Jvc29mdC5NYXBzLlBvbHlnb24oYXBwLnBvaW50cykuc2V0T3B0aW9ucyh7IGZpbGxDb2xvcjogJ3RyYW5zcGFyZW50J30pO1xyXG5cclxuICAgIC8vIHB1c2hpbmcgdGhlIHBvbHlnb24gaW50byB0aGUgbWFwXHJcbiAgICBhcHAubWFwLmVudGl0aWVzLnB1c2gocG9seWdvbik7XHJcbn1cclxuXHJcbi8vIGZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBwb2ludCBpcyBhY3V0YWxseSBpbiB0aGUgcG9seWdvblxyXG5hcHAucG9pbnRJblBvbHlnb24gPSBmdW5jdGlvbiAocGluKSB7XHJcbiAgICBsZXQgbG9uID0gcGluLmdlb21ldHJ5Lng7XHJcbiAgICBsZXQgbGF0ID0gcGluLmdlb21ldHJ5Lnk7XHJcblxyXG4gICAgbGV0IGogPSBhcHAucG9pbnRzLmxlbmd0aCAtIDE7XHJcbiAgICBsZXQgaW5Qb2x5ID0gZmFsc2U7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcHAucG9pbnRzLmxlbmd0aDsgaSA9IGkgKyAxKSB7XHJcbiAgICAgICAgaWYgKGFwcC5wb2ludHNbaV0ubG9uZ2l0dWRlIDwgbG9uICYmIGFwcC5wb2ludHNbal0ubG9uZ2l0dWRlID49IGxvbiB8fCBhcHAucG9pbnRzW2pdLmxvbmdpdHVkZSA8IGxvbiAmJiBhcHAucG9pbnRzW2ldLmxvbmdpdHVkZSA+PSBsb24pIHtcclxuICAgICAgICAgICAgaWYgKGFwcC5wb2ludHNbaV0ubGF0aXR1ZGUgKyAobG9uIC0gYXBwLnBvaW50c1tpXS5sb25naXR1ZGUpIC8gKGFwcC5wb2ludHNbal0ubG9uZ2l0dWRlIC0gYXBwLnBvaW50c1tpXS5sb25naXR1ZGUpICogKGFwcC5wb2ludHNbal0ubGF0aXR1ZGUgLSBhcHAucG9pbnRzW2ldLmxhdGl0dWRlKSA8IGxhdCkge1xyXG4gICAgICAgICAgICAgICAgaW5Qb2x5ID0gIWluUG9seTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBqID0gaTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaW5Qb2x5KSB7XHJcbiAgICAgICAgYXBwLm1hcC5lbnRpdGllcy5wdXNoKHBpbik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGFsZXJ0KFwiVGhpcyBsb2NhdGlvbiBpcyBvdXRzaWRlIHRoZSBib3VuZGFyaWVzIGZvciB0aGlzIGRhdGEgc2V0XCIpXHJcbiAgICB9XHJcbn1cclxuXHJcbmFwcC5nZW9jb2RlUXVlcnkgPSBmdW5jdGlvbihxdWVyeSkge1xyXG4gICAgXHJcbiAgICBxdWVyeSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgLnNwbGl0KFwiIFwiKVxyXG4gICAgICAgICAgICAubWFwKChzKSA9PiBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSkpXHJcbiAgICAgICAgICAgIC5qb2luKFwiIFwiKTtcclxuXHJcbiAgICAgICAgICAgIFxyXG4gICAgLy8gaWYgdGhlIHNlYXJjaCBtYW5hZ2VyIGlzbid0IGRlZmluZWQgeWV0LCBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhlIHNlYXJjaCBtYW5hZ2VyIGNsYXNzXHJcbiAgICBpZiAoIWFwcC5zZWFyY2hNYW5hZ2VyKSB7XHJcbiAgICAgICAgTWljcm9zb2Z0Lk1hcHMubG9hZE1vZHVsZShcIk1pY3Jvc29mdC5NYXBzLlNlYXJjaFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgYXBwLnNlYXJjaE1hbmFnZXIgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuU2VhcmNoLlNlYXJjaE1hbmFnZXIoYXBwLm1hcCk7XHJcbiAgICAgICAgICAgIGFwcC5nZW9jb2RlUXVlcnkocXVlcnkpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBzZWFyY2hSZXF1ZXN0ID0ge1xyXG4gICAgICAgICAgICB3aGVyZTogcXVlcnksXHJcbiAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbihyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIHJlc3VsdHMgZnJvbSB0aGUgZ2VvY29kaW5nIGZ1bmN0aW9uIFxyXG4gICAgICAgICAgICAgICAgaWYgKHIgJiYgci5yZXN1bHRzICYmIHIucmVzdWx0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpcnN0UmVzdWx0ID0gci5yZXN1bHRzWzBdXHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgYXBwLnBpbiA9IG5ldyBNaWNyb3NvZnQuTWFwcy5QdXNocGluKGZpcnN0UmVzdWx0LmxvY2F0aW9uLHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwicmVkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBxdWVyeVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIG1ha2UgdGhlIGRhdGFiYXNlIGNhbGwgaGVyZVxyXG4gICAgICAgICAgICAgICAgICAgIGFwcC5nZXRDcmltZURhdGEoZmlyc3RSZXN1bHQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIHRoZSBjYWxsIHRvIGNoZWNrIGlmIHdpdGhpbiBwb2x5Z29uIGhlcmVcclxuICAgICAgICAgICAgICAgICAgICBhcHAucG9pbnRJblBvbHlnb24oYXBwLnBpbik7XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGFwcC5tYXAuc2V0Vmlldyh7Y2VudGVyOmZpcnN0UmVzdWx0LmxvY2F0aW9ufSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yQ2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgYWxlcnQoXCJubyByZXN1bHRzIGZvdW5kXCIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFwcC5zZWFyY2hNYW5hZ2VyLmdlb2NvZGUoc2VhcmNoUmVxdWVzdCk7XHJcblxyXG4gICAgfSAvLyBlbHNlIHN0YXRlbWVudCBlbmRzXHJcbn0gLy8gZ2VvY29kZSBxdWVyeSBlbmRzXHJcblxyXG5cclxuYXBwLmdldENyaW1lRGF0YSA9IGZ1bmN0aW9uKGFkZHJlc3NEYXRhKSB7XHJcblxyXG4gICAgY29uc3QgdXJsID0gXCJodHRwczovL3NlcnZpY2VzLmFyY2dpcy5jb20vUzl0aDBqQUo3YnFnSVJqdy9hcmNnaXMvcmVzdC9zZXJ2aWNlcy9CaWN5Y2xlX1RoZWZ0cy9GZWF0dXJlU2VydmVyLzAvcXVlcnk/XCI7XHJcblxyXG4gICAgbGV0IGxvY2F0aW9uWCA9IGFkZHJlc3NEYXRhLmxvY2F0aW9uLmxvbmdpdHVkZTtcclxuICAgIGxldCBsb2NhdGlvblkgPSBhZGRyZXNzRGF0YS5sb2NhdGlvbi5sYXRpdHVkZTtcclxuXHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXHJcbiAgICAgICAgZGF0YTp7XHJcbiAgICAgICAgICAgIGdlb21ldHJ5OiBgJHtsb2NhdGlvblh9LCR7bG9jYXRpb25ZfWAsXHJcbiAgICAgICAgICAgIGdlb21ldHJ5VHlwZTogXCJlc3JpR2VvbWV0cnlQb2ludFwiLFxyXG4gICAgICAgICAgICBpblNSOiA0MzI2LFxyXG4gICAgICAgICAgICBzcGF0aWFsUmVsOiBcImVzcmlTcGF0aWFsUmVsSW50ZXJzZWN0c1wiLFxyXG4gICAgICAgICAgICBkaXN0YW5jZTogMTAwMCxcclxuICAgICAgICAgICAgdW5pdHM6IFwiZXNyaVNSVW5pdF9NZXRlclwiLFxyXG4gICAgICAgICAgICBmOiBcImpzb25cIixcclxuICAgICAgICAgICAgb3V0U1I6IDQzMjYsXHJcbiAgICAgICAgICAgIG91dEZpZWxkczogXCIqXCIsXHJcbiAgICAgICAgICAgIHdoZXJlOiBcIk9jY3VycmVuY2VfWWVhciA+IDIwMTZcIlxyXG4gICAgICAgIH1cclxuICAgIH0pLnRoZW4oKHJlcyk9PntcclxuICAgICAgICBcclxuICAgICAgICBsZXQgcmVzdWx0cyA9IHJlcy5mZWF0dXJlcy5sZW5ndGg7XHJcbiAgICAgICAgYXBwLmRldGVybWluZVJlc3VsdHMoYWRkcmVzc0RhdGEsIHJlc3VsdHMpO1xyXG4gICAgfSk7XHJcblxyXG59XHJcblxyXG5cclxuYXBwLnN1Ym1pdFF1ZXJ5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkKFwiLmFkZHJlc3NRdWVyeVwiKS5vbihcInN1Ym1pdFwiLCBmdW5jdGlvbihlKXtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgbGV0IGFkZHJlc3NTdHJpbmcgPSAkKFwiLnF1ZXJ5VGV4dFwiKS52YWwoKS50cmltKCk7XHJcbiAgICAgICAgYXBwLmdlb2NvZGVRdWVyeShgJHthZGRyZXNzU3RyaW5nfSR7YXBwLmNpdHlBbmRDb3VudHJ5fWApO1xyXG5cclxuICAgICAgICAkKFwiLnF1ZXJ5VGV4dFwiKS52YWwoXCJcIik7XHJcblxyXG4gICAgICAgICQoXCIjcmVzdWx0TWFwXCIpLnJlbW92ZUNsYXNzKFwicmVzdWx0TWFwSGlkZGVuXCIpLmFkZENsYXNzKFwicmVzdWx0TWFwRGlzcGxheVwiKTtcclxuXHJcbiAgICAgICAgJChcImZvb3RlclwiKS5hZGRDbGFzcyhcImZvb3RlckRpc3BsYXlcIik7XHJcblxyXG4gICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcclxuICAgICAgICAgICAgc2Nyb2xsVG9wOiA2NTBcclxuICAgICAgICB9LCAxMDAwKTtcclxuXHJcbiAgICAgICAgJChcIi5saW5lXCIpLmFkZENsYXNzKFwibGluZURpc3BsYXlcIilcclxuICAgICAgICAkKFwiLnNlcGFyYXRpbmdMaW5lXCIpLmFkZENsYXNzKFwic2VwYXJhdGluZ0xpbmVEaXNwbGF5XCIpXHJcblxyXG4gICAgICAgICQoXCIudGV4dFJlc3VsdHNcIikuYWRkQ2xhc3MoXCJ0ZXh0UmVzdWx0c0hlaWdodFwiKVxyXG5cclxuICAgICAgICAkKFwiLnJlc3VsdHNcIikuYWRkQ2xhc3MoXCJyZXN1bHRzRGlzcGxheVwiKVxyXG5cclxuICAgIH0pO1xyXG59XHJcblxyXG5cclxuYXBwLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGFwcC5nZXRNYXAoKTtcclxuICAgIGFwcC5zdWJtaXRRdWVyeSgpO1xyXG4gICAgYXBwLmRiQ2hhbmdlcygpO1xyXG4gICAgXHJcbn1cclxuXHJcbiQoZnVuY3Rpb24oKXtcclxuICAgIGFwcC5pbml0KCk7XHJcbn0pIl19
