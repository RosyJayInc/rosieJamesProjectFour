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

    if (results <= 150) {
        $(".resultButtons .findSafe").addClass("noNearbySafe");
    }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNDQSxJQUFNLE1BQU0sRUFBWjs7QUFFQSxJQUFJLE1BQUosR0FBYSxrRUFBYjtBQUNBLElBQUksY0FBSixHQUFxQixtQkFBckI7QUFDQSxJQUFJLEdBQUo7QUFDQSxJQUFJLEdBQUo7QUFDQSxJQUFJLGFBQUo7QUFDQSxJQUFJLGlCQUFKO0FBQ0EsSUFBSSxNQUFKOztBQUVBO0FBQ0EsSUFBSSxNQUFKLEdBQWE7QUFDVCxZQUFRLHlDQURDO0FBRVQsZ0JBQVksdUNBRkg7QUFHVCxpQkFBYSw4Q0FISjtBQUlULGVBQVcsdUJBSkY7QUFLVCxtQkFBZSxtQ0FMTjtBQU1ULHVCQUFtQjtBQU5WLENBQWI7O0FBU0EsU0FBUyxhQUFULENBQXVCLElBQUksTUFBM0I7O0FBRUEsSUFBSSxLQUFKLEdBQVksU0FBUyxRQUFULEdBQW9CLEdBQXBCLENBQXdCLG1CQUF4QixDQUFaOztBQUVBLElBQUksU0FBSixHQUFnQixZQUEwQjtBQUFBLFFBQWpCLE1BQWlCLHVFQUFSLE9BQVE7O0FBQ3RDLFFBQUcsVUFBVSxPQUFiLEVBQXFCO0FBQ2pCLFlBQUksS0FBSixDQUFVLEVBQVYsQ0FBYSxPQUFiLEVBQXNCLFVBQVMsUUFBVCxFQUFrQjtBQUNwQyxnQkFBSSxZQUFZLEtBQWhCO0FBQ0EsZ0JBQUksWUFBWSxTQUFTLEdBQVQsRUFBaEI7O0FBRUEsaUJBQUksSUFBSSxJQUFSLElBQWdCLFNBQWhCLEVBQTBCO0FBQ3RCLG9CQUFHLFVBQVUsSUFBVixFQUFnQixPQUFoQixLQUE0QixPQUFPLE9BQVAsQ0FBZSxnQkFBOUMsRUFBK0Q7QUFDM0QsZ0NBQVksSUFBWjtBQUNIO0FBQ0o7QUFDRCxnQkFBRyxjQUFjLEtBQWpCLEVBQXVCO0FBQ25CLG9CQUFNLEtBQUssSUFBSSxLQUFKLENBQVUsSUFBVixHQUFpQixHQUE1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QUVHLElBRkg7O0FBSUEsVUFBRSxPQUFGLEVBQVcsUUFBWCxDQUFvQixhQUFwQjtBQUNBLFVBQUUsaUJBQUYsRUFBcUIsUUFBckIsQ0FBOEIsdUJBQTlCOztBQUVBLFVBQUUsY0FBRixFQUFrQixRQUFsQixDQUEyQixtQkFBM0I7O0FBRUEsVUFBRSxVQUFGLEVBQWMsUUFBZCxDQUF1QixnQkFBdkI7QUFFSCxLQXRCRDtBQXVCSCxDQXhCRDs7QUEyQkEsSUFBSSxJQUFKLEdBQVcsWUFBVztBQUNsQixRQUFJLE1BQUo7QUFDQSxRQUFJLFdBQUo7QUFDQSxRQUFJLFNBQUo7QUFFSCxDQUxEOztBQU9BLEVBQUUsWUFBVTtBQUNSLFFBQUksSUFBSjtBQUNILENBRkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcbmNvbnN0IGFwcCA9IHt9O1xuXG5hcHAuYXBpS2V5ID0gXCJBcHM5UnU0STJWRTE2U1ZULVVxYTFtMF9kbkVWM0FJMTV0cTZ5T0NNYmN0VTZta0pGdGNzNENRaWlldDJiSnZYXCI7XG5hcHAuY2l0eUFuZENvdW50cnkgPSBcIiwgVG9yb250bywgQ2FuYWRhXCI7XG5hcHAubWFwO1xuYXBwLnBpbjtcbmFwcC5zZWFyY2hNYW5hZ2VyO1xuYXBwLmRpcmVjdGlvbnNNYW5hZ2VyO1xuYXBwLnBvaW50cztcblxuLy8gSW5pdGlhbGl6ZSBGaXJlYmFzZVxuYXBwLmNvbmZpZyA9IHtcbiAgICBhcGlLZXk6IFwiQUl6YVN5REtfb3pZdGR4TWJBRWhaNlQzZzc5TzVLLWVIZkNCS1p3XCIsXG4gICAgYXV0aERvbWFpbjogXCJyb3NpZWphbWVzcHJvamVjdGZvdXIuZmlyZWJhc2VhcHAuY29tXCIsXG4gICAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9yb3NpZWphbWVzcHJvamVjdGZvdXIuZmlyZWJhc2Vpby5jb21cIixcbiAgICBwcm9qZWN0SWQ6IFwicm9zaWVqYW1lc3Byb2plY3Rmb3VyXCIsXG4gICAgc3RvcmFnZUJ1Y2tldDogXCJyb3NpZWphbWVzcHJvamVjdGZvdXIuYXBwc3BvdC5jb21cIixcbiAgICBtZXNzYWdpbmdTZW5kZXJJZDogXCIzNjA3ODUxMDAxMDVcIlxufTtcblxuZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChhcHAuY29uZmlnKTtcblxuYXBwLmRiUmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoXCJwcm9qZWN0NFNhZmVBcmVhc1wiKTtcblxuYXBwLmRiQ2hhbmdlcyA9IGZ1bmN0aW9uKHJlc3VsdCA9IFwiZW1wdHlcIil7XG4gICAgaWYocmVzdWx0ICE9IFwiZW1wdHlcIil7XG4gICAgICAgIGFwcC5kYlJlZi5vbihcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KXtcbiAgICAgICAgICAgIGxldCBkb2VzRXhpc3QgPSBmYWxzZTtcbiAgICAgICAgICAgIGxldCBzYWZlQXJlYXMgPSBzbmFwc2hvdC52YWwoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yKGxldCBhcmVhIGluIHNhZmVBcmVhcyl7XG4gICAgICAgICAgICAgICAgaWYoc2FmZUFyZWFzW2FyZWFdLmFkZHJlc3MgPT09IHJlc3VsdC5hZGRyZXNzLmZvcm1hdHRlZEFkZHJlc3Mpe1xuICAgICAgICAgICAgICAgICAgICBkb2VzRXhpc3QgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGRvZXNFeGlzdCA9PT0gZmFsc2Upe1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gYXBwLmRiUmVmLnB1c2goKS5rZXk7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbVJlZmVyZW5jZSA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKGBwcm9qZWN0NFNhZmVBcmVhcy8ke2lkfWApO1xuXG4gICAgICAgICAgICAgICAgaXRlbVJlZmVyZW5jZS5zZXQoe1xuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiByZXN1bHQuYWRkcmVzcy5mb3JtYXR0ZWRBZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBzYWZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBsYXQ6IHJlc3VsdC5sb2NhdGlvbi5sYXRpdHVkZSxcbiAgICAgICAgICAgICAgICAgICAgbG9uZzogcmVzdWx0LmxvY2F0aW9uLmxvbmdpdHVkZSxcbiAgICAgICAgICAgICAgICAgICAga2V5OiBpZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZXtcbiAgICAgICAgXG4gICAgfVxufVxuXG5hcHAuZGV0ZXJtaW5lUmVzdWx0cyA9IChhZGRyZXNzRGF0YSwgcmVzdWx0cykgPT4ge1xuICAgIFxuICAgIGxldCByZXN1bHRTdHJpbmcgPSBcIlwiO1xuXG4gICAgbGV0IHJlc3VsdEJ1dHRvbnMgPSAkKGA8ZGl2IGNsYXNzPVwicmVzdWx0QnV0dG9uc1wiPjxidXR0b24gY2xhc3M9XCJmaW5kU2FmZVwiPkZpbmQgU2FmZXIgQXJlYTwvYnV0dG9uPjxidXR0b24gY2xhc3M9XCJhbm90aGVyUXVlcnlcIj5UZXN0IEFub3RoZXIgQWRkcmVzczwvYnV0dG9uPjwvZGl2PmApXG5cbiAgICBsZXQgcmVzdWx0TW9udGggPSAocmVzdWx0cy8xMikudG9GaXhlZCgyKTtcblxuICAgIGlmIChyZXN1bHRzID4gNDUwKSB7XG4gICAgICAgIHJlc3VsdFN0cmluZyA9ICQoYDxoMyBpZD1cInJlc3VsdE51bWJlclwiPlNldmVyZTwvaDM+PHAgY2xhc3M9XCJyZXN1bHROdW1iZXJcIj4ke3Jlc3VsdHN9PC9wPiA8cD5yZXBvcnRlZCBiaWtlIHRoZWZ0cyB3aXRoaW4gYSAxa20gcmFkaXVzIG9mICR7YWRkcmVzc0RhdGEuYWRkcmVzcy5hZGRyZXNzTGluZX0gaW4gMjAxNy48L3A+IDxwPlRoYXQgaXMgYW4gYXZlcmFnZSBvZiBhcHByb3hpbWF0ZWx5IDxzcGFuIGNsYXNzPVwiaGlnaGxpZ2h0TW9udGhseVwiPiR7cmVzdWx0TW9udGh9IDwvc3Bhbj50aGVmdHMgYSBtb250aC48L3A+YCk7XG4gICAgICAgIGFwcC5maW5kU2FmZUFyZWEoYWRkcmVzc0RhdGEpO1xuICAgIH1cbiAgICBlbHNlIGlmKHJlc3VsdHMgPiAzNTApe1xuICAgICAgICByZXN1bHRTdHJpbmcgPSAkKGA8aDMgaWQ9XCJyZXN1bHROdW1iZXJcIj5FeHRyZW1lbHkgaGlnaDwvaDM+PHAgY2xhc3M9XCJyZXN1bHROdW1iZXJcIj4ke3Jlc3VsdHN9PC9wPiA8cD5yZXBvcnRlZCBiaWtlIHRoZWZ0cyB3aXRoaW4gYSAxa20gcmFkaXVzIG9mICR7YWRkcmVzc0RhdGEuYWRkcmVzcy5hZGRyZXNzTGluZX0gaW4gMjAxNy48L3A+IDxwPlRoYXQgaXMgYW4gYXZlcmFnZSBvZiBhcHByb3hpbWF0ZWx5IDxzcGFuIGNsYXNzPVwiaGlnaGxpZ2h0TW9udGhseVwiPiR7cmVzdWx0TW9udGh9IDwvc3Bhbj50aGVmdHMgYSBtb250aC48L3A+YCk7XG4gICAgICAgIGFwcC5maW5kU2FmZUFyZWEoYWRkcmVzc0RhdGEpO1xuICAgIH1cbiAgICBlbHNlIGlmKHJlc3VsdHMgPiAyNTApe1xuICAgICAgICByZXN1bHRTdHJpbmcgPSAkKGA8aDMgaWQ9XCJyZXN1bHROdW1iZXJcIj5IaWdoPC9oMz48cCBjbGFzcz1cInJlc3VsdE51bWJlclwiPiR7cmVzdWx0c308L3A+IDxwPnJlcG9ydGVkIGJpa2UgdGhlZnRzIHdpdGhpbiBhIDFrbSByYWRpdXMgb2YgJHthZGRyZXNzRGF0YS5hZGRyZXNzLmFkZHJlc3NMaW5lfSBpbiAyMDE3LjwvcD4gPHA+VGhhdCBpcyBhbiBhdmVyYWdlIG9mIGFwcHJveGltYXRlbHkgPHNwYW4gY2xhc3M9XCJoaWdobGlnaHRNb250aGx5XCI+JHtyZXN1bHRNb250aH0gPC9zcGFuPnRoZWZ0cyBhIG1vbnRoLjwvcD5gKTtcbiAgICAgICAgYXBwLmZpbmRTYWZlQXJlYShhZGRyZXNzRGF0YSk7XG4gICAgfVxuICAgIGVsc2UgaWYocmVzdWx0cyA+IDE1MCl7XG4gICAgICAgIHJlc3VsdFN0cmluZyA9ICQoYDxoMyBpZD1cInJlc3VsdE51bWJlclwiPk1vZGVyYXRlPC9oMz48cCBjbGFzcz1cInJlc3VsdE51bWJlclwiPiR7cmVzdWx0c308L3A+IDxwPnJlcG9ydGVkIGJpa2UgdGhlZnRzIHdpdGhpbiBhIDFrbSByYWRpdXMgb2YgJHthZGRyZXNzRGF0YS5hZGRyZXNzLmFkZHJlc3NMaW5lfSBpbiAyMDE3LjwvcD4gPHA+VGhhdCBpcyBhbiBhdmVyYWdlIG9mIGFwcHJveGltYXRlbHkgPHNwYW4gY2xhc3M9XCJoaWdobGlnaHRNb250aGx5XCI+JHtyZXN1bHRNb250aH0gPC9zcGFuPnRoZWZ0cyBhIG1vbnRoLjwvcD5gKTtcbiAgICAgICAgYXBwLmRiQ2hhbmdlcyhhZGRyZXNzRGF0YSk7XG4gICAgfVxuICAgIGVsc2UgaWYocmVzdWx0cyA+IDUwKXtcbiAgICAgICAgcmVzdWx0U3RyaW5nID0gJChgPGgzIGlkPVwicmVzdWx0TnVtYmVyXCI+TG93PC9oMz48cCBjbGFzcz1cInJlc3VsdE51bWJlclwiPiR7cmVzdWx0c308L3A+IDxwPnJlcG9ydGVkIGJpa2UgdGhlZnRzIHdpdGhpbiBhIDFrbSByYWRpdXMgb2YgJHthZGRyZXNzRGF0YS5hZGRyZXNzLmFkZHJlc3NMaW5lfSBpbiAyMDE3LjwvcD4gPHA+VGhhdCBpcyBhbiBhdmVyYWdlIG9mIGFwcHJveGltYXRlbHkgPHNwYW4gY2xhc3M9XCJoaWdobGlnaHRNb250aGx5XCI+JHtyZXN1bHRNb250aH0gPC9zcGFuPnRoZWZ0cyBhIG1vbnRoLjwvcD5gKTtcbiAgICAgICAgYXBwLmRiQ2hhbmdlcyhhZGRyZXNzRGF0YSk7XG4gICAgfVxuICAgIGVsc2UgaWYocmVzdWx0cyA+PSAwICl7XG4gICAgICAgIHJlc3VsdFN0cmluZyA9ICQoYDxoMyBpZD1cInJlc3VsdE51bWJlclwiPk5lZ2xpZ2libGU8L2gzPjxwIGNsYXNzPVwicmVzdWx0TnVtYmVyXCI+JHtyZXN1bHRzfTwvcD4gPHA+cmVwb3J0ZWQgYmlrZSB0aGVmdHMgd2l0aGluIGEgMWttIHJhZGl1cyBvZiAke2FkZHJlc3NEYXRhLmFkZHJlc3MuYWRkcmVzc0xpbmV9IGluIDIwMTcuPC9wPiA8cD5UaGF0IGlzIGFuIGF2ZXJhZ2Ugb2YgYXBwcm94aW1hdGVseSA8c3BhbiBjbGFzcz1cImhpZ2hsaWdodE1vbnRobHlcIj4ke3Jlc3VsdE1vbnRofSA8L3NwYW4+dGhlZnRzIGEgbW9udGguPC9wPmApO1xuICAgICAgICBhcHAuZGJDaGFuZ2VzKGFkZHJlc3NEYXRhKTtcbiAgICB9XG4gICAgZWxzZXtcbiAgICAgICAgcmVzdWx0U3RyaW5nID0gJChgTm8gcmVzdWx0cyBGb3VuZCwgVHJ5IEFnYWluYCk7XG4gICAgfVxuICAgIFxuICAgICQoXCIudGV4dFJlc3VsdHNcIikuZW1wdHkoKS5hcHBlbmQocmVzdWx0U3RyaW5nLCByZXN1bHRCdXR0b25zKTtcbiAgICBcbiAgICBpZiAocmVzdWx0cyA8PSAxNTApIHtcbiAgICAgICAgJChcIi5yZXN1bHRCdXR0b25zIC5maW5kU2FmZVwiKS5hZGRDbGFzcyhcIm5vTmVhcmJ5U2FmZVwiKTtcbiAgICB9XG4gICAgXG4gICAgJChcIi5hbm90aGVyUXVlcnlcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgJChcIi50ZXh0UmVzdWx0c1wiKS5lbXB0eSgpO1xuICAgICAgICAkKFwiI3Jlc3VsdE1hcFwiKS5yZW1vdmVDbGFzcyhcInJlc3VsdE1hcERpc3BsYXlcIikuYWRkQ2xhc3MoXCJyZXN1bHRNYXBIaWRkZW5cIik7XG4gICAgICAgICQoXCIucmVzdWx0QnV0dG9uc1wiKS5lbXB0eSgpO1xuICAgICAgICAkKFwiZm9vdGVyXCIpLnJlbW92ZUNsYXNzKFwiZm9vdGVyRGlzcGxheVwiKVxuXG4gICAgICAgICQoXCIubGluZVwiKS5yZW1vdmVDbGFzcyhcImxpbmVEaXNwbGF5XCIpO1xuICAgICAgICAkKFwiLnNlcGFyYXRpbmdMaW5lXCIpLnJlbW92ZUNsYXNzKFwic2VwYXJhdGluZ0xpbmVEaXNwbGF5XCIpXG4gICAgICAgICQoXCIudGV4dFJlc3VsdHNcIikucmVtb3ZlQ2xhc3MoXCJ0ZXh0UmVzdWx0c0hlaWdodFwiKVxuXG4gICAgICAgICQoXCIucmVzdWx0c1wiKS5yZW1vdmVDbGFzcyhcInJlc3VsdHNEaXNwbGF5XCIpXG4gICAgICAgICQoXCIjZGlyZWN0aW9uc1wiKS5lbXB0eSgpO1xuXG4gICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogNjUwXG4gICAgICAgIH0sIDEwMDApO1xuXG4gICAgICAgIGFwcC5tYXAuZW50aXRpZXMucmVtb3ZlKGFwcC5waW4pO1xuICAgIH0pO1xuXG59XG5cbmFwcC5maW5kU2FmZUFyZWEgPSBmdW5jdGlvbih1bnNhZmVBZGRyZXNzKSB7XG4gICAgLy8gY29uc29sZS5sb2coYXBwLmRiUmVmKTtcblxuICAgIGxldCBjdXJMYXQgPSB1bnNhZmVBZGRyZXNzLmxvY2F0aW9uLmxhdGl0dWRlO1xuICAgIGxldCBjdXJMb24gPSB1bnNhZmVBZGRyZXNzLmxvY2F0aW9uLmxvbmdpdHVkZTtcblxuICAgIC8vIGNvbnNvbGUubG9nKGN1ckxhdCwgY3VyTG9uKTtcbiAgICBcbiAgICBsZXQgcmFuZ2VWYWwgPSAwLjAyO1xuXG4gICAgYXBwLmRiUmVmLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihzbmFwc2hvdCl7XG4gICAgICAgIGxldCBpc05lYXIgPSBmYWxzZTtcbiAgICAgICAgbGV0IHNhZmVMaXN0ID0gc25hcHNob3QudmFsKCk7XG4gICAgICAgIGxldCBjbG9zZUFyZWFzID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgYXJlYSBpbiBzYWZlTGlzdCl7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgKChjdXJMYXQgLSByYW5nZVZhbCkgPCBzYWZlTGlzdFthcmVhXS5sYXQgJiYgc2FmZUxpc3RbYXJlYV0ubGF0IDwgKGN1ckxhdCArIHJhbmdlVmFsKSlcbiAgICAgICAgICAgICAgICAmJlxuICAgICAgICAgICAgICAgICgoY3VyTG9uIC0gcmFuZ2VWYWwpIDwgc2FmZUxpc3RbYXJlYV0ubG9uZyAmJiBzYWZlTGlzdFthcmVhXS5sb25nIDwgKGN1ckxvbiArIHJhbmdlVmFsKSlcbiAgICAgICAgICAgICl7XG4gICAgICAgICAgICAgICAgaXNOZWFyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjbG9zZUFyZWFzLnB1c2goc2FmZUxpc3RbYXJlYV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKGlzTmVhciA9PT0gdHJ1ZSl7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhjbG9zZUFyZWFzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHJhblNwb3QgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjbG9zZUFyZWFzLmxlbmd0aCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjbG9zZUFyZWFzW3JhblNwb3RdKTtcblxuICAgICAgICAgICAgJChcIi5yZXN1bHRCdXR0b25zIC5maW5kU2FmZVwiKS5yZW1vdmVDbGFzcyhcIm5vTmVhcmJ5U2FmZVwiKTtcbiAgICAgICAgICAgICQoXCIudGV4dFJlc3VsdHNcIikub24oXCJjbGlja1wiLCBcIi5maW5kU2FmZVwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGFwcC5nZXREaXJlY3Rpb25zKHVuc2FmZUFkZHJlc3MsIGNsb3NlQXJlYXNbcmFuU3BvdF0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2V7ICAgICAgICAgICAgXG4gICAgICAgICAgICAkKFwiLnJlc3VsdEJ1dHRvbnMgLmZpbmRTYWZlXCIpLmFkZENsYXNzKFwibm9OZWFyYnlTYWZlXCIpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5hcHAuZ2V0RGlyZWN0aW9ucyA9IGZ1bmN0aW9uKHVuc2FmZSwgc2FmZSl7XG4gICAgbGV0IHVuc2FmZVN0cmluZyA9IHVuc2FmZS5hZGRyZXNzLmZvcm1hdHRlZEFkZHJlc3M7XG4gICAgbGV0IHNhZmVTdHJpbmcgPSBzYWZlLmFkZHJlc3M7XG4gICAgbGV0IHNhZmVMYXQgPSBzYWZlLmxhdDtcbiAgICBsZXQgc2FmZUxvbmcgPSBzYWZlLmxvbmdcbiAgICBcbiAgICBNaWNyb3NvZnQuTWFwcy5sb2FkTW9kdWxlKFwiTWljcm9zb2Z0Lk1hcHMuRGlyZWN0aW9uc1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAvL0NyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgZGlyZWN0aW9ucyBtYW5hZ2VyLlxuICAgICAgICBhcHAuZGlyZWN0aW9uc01hbmFnZXIgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuRGlyZWN0aW9ucy5EaXJlY3Rpb25zTWFuYWdlcihhcHAubWFwKTtcbiAgICAgICAgXG4gICAgICAgIC8vQ3JlYXRlIHdheXBvaW50cyB0byByb3V0ZSBiZXR3ZWVuLlxuICAgICAgICBsZXQgY3VycmVudFBvaW50ID0gbmV3IE1pY3Jvc29mdC5NYXBzLkRpcmVjdGlvbnMuV2F5cG9pbnQoeyBcbiAgICAgICAgICAgIGFkZHJlc3M6IHVuc2FmZVN0cmluZyBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmRpcmVjdGlvbnNNYW5hZ2VyLmFkZFdheXBvaW50KGN1cnJlbnRQb2ludCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgc2FmZVBvaW50ID0gbmV3IE1pY3Jvc29mdC5NYXBzLkRpcmVjdGlvbnMuV2F5cG9pbnQoe1xuICAgICAgICAgICAgYWRkcmVzczogc2FmZVN0cmluZ1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZGlyZWN0aW9uc01hbmFnZXIuYWRkV2F5cG9pbnQoc2FmZVBvaW50KTtcblxuICAgICAgICAvL1NwZWNpZnkgdGhlIGVsZW1lbnQgaW4gd2hpY2ggdGhlIGl0aW5lcmFyeSB3aWxsIGJlIHJlbmRlcmVkLlxuICAgICAgICBhcHAuZGlyZWN0aW9uc01hbmFnZXIuc2V0UmVuZGVyT3B0aW9ucyh7IGl0aW5lcmFyeUNvbnRhaW5lcjogJyNkaXJlY3Rpb25zJyB9KTtcbiAgICAgICAgYXBwLm1hcC5lbnRpdGllcy5yZW1vdmUoYXBwLnBpbik7XG4gICAgICAgIC8vQ2FsY3VsYXRlIGRpcmVjdGlvbnMuXG4gICAgICAgIGFwcC5kaXJlY3Rpb25zTWFuYWdlci5jYWxjdWxhdGVEaXJlY3Rpb25zKCk7XG5cbiAgICAgICAgJChcIiNkaXJlY3Rpb25zXCIpLmFwcGVuZChcIjxkaXYgY2xhc3M9J2JhY2tUb1Jlc3VsdHMnPjxidXR0b24gY2xhc3M9J2JhY2tCdXR0b24nPkJhY2sgVG8gUmVzdWx0czwvYnV0dG9uPlwiKVxuICAgICAgICAkKFwiLmJhY2tCdXR0b25cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIHNjcm9sbFRvcDogNjUwXG4gICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgfSlcbiAgICB9KTtcbn1cbmFwcC5nZXRNYXAgPSBmdW5jdGlvbihxdWVyeSkge1xuICAgIGxldCBuYXZpZ2F0aW9uQmFyTW9kZSA9IE1pY3Jvc29mdC5NYXBzLk5hdmlnYXRpb25CYXJNb2RlO1xuICAgIGFwcC5tYXAgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuTWFwKFwiI3Jlc3VsdE1hcFwiLCB7XG4gICAgICAgIGNyZWRlbnRpYWxzOiBhcHAuYXBpS2V5LFxuICAgICAgICBjZW50ZXI6IG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My42NDgyLCAtNzkuMzk3ODIpLFxuICAgICAgICBtYXBUeXBlSWQ6IE1pY3Jvc29mdC5NYXBzLk1hcFR5cGVJZC5yb2FkLFxuICAgICAgICBuYXZpZ2F0aW9uQmFyTW9kZTogbmF2aWdhdGlvbkJhck1vZGUubWluaWZpZWQsXG4gICAgICAgIHpvb206IDEyXG4gICAgfSk7XG5cbiAgICAvLyBkZWZpbmluZyBwb2ludHMgb2YgcG9seWdvbiBoZXJlOiBib3VuZGFyaWVzIG9mIFRvcm9udG9cbiAgICBhcHAucG9pbnRzID0gW1xuICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNTg0NzIxLCAtNzkuNTQxMzY1KSxcbiAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjYxMDYyOSwgLTc5LjU2NzAyOSksXG4gICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My42MjcyNzYsIC03OS41NjM0MzYpLFxuICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNjI1ODQ4LCAtNzkuNTc1MzYxKSxcbiAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjYyOTYyNiwgLTc5LjU4NTgyNSksXG5cbiAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjY0NDU5OSwgLTc5LjU5MTQyMCksXG4gICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My42Njc1OTIsIC03OS41ODkwNDUpLFxuICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNzQzODUxLCAtNzkuNjQ4MjkyKSxcbiAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjgzMjU0NiwgLTc5LjI2Nzg0OCksXG4gICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My43OTg2MDIsIC03OS4xMzI5NTkpLFxuXG4gICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My43ODk5ODAsIC03OS4xMjE3MTEpLFxuICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNjY3MzY2LCAtNzkuMTAzNjc1KSxcbiAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjU1MjQ5MywgLTc5LjUwMDQyNSksXG4gICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My41ODQ3MjEsIC03OS41NDEzNjUpXG4gICAgXVxuXG5cbiAgICBsZXQgcG9seWdvbiA9IG5ldyBNaWNyb3NvZnQuTWFwcy5Qb2x5Z29uKGFwcC5wb2ludHMpLnNldE9wdGlvbnMoeyBmaWxsQ29sb3I6ICd0cmFuc3BhcmVudCd9KTtcblxuICAgIC8vIHB1c2hpbmcgdGhlIHBvbHlnb24gaW50byB0aGUgbWFwXG4gICAgYXBwLm1hcC5lbnRpdGllcy5wdXNoKHBvbHlnb24pO1xufVxuXG4vLyBmdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgcG9pbnQgaXMgYWN1dGFsbHkgaW4gdGhlIHBvbHlnb25cbmFwcC5wb2ludEluUG9seWdvbiA9IGZ1bmN0aW9uIChwaW4pIHtcbiAgICBsZXQgbG9uID0gcGluLmdlb21ldHJ5Lng7XG4gICAgbGV0IGxhdCA9IHBpbi5nZW9tZXRyeS55O1xuXG4gICAgbGV0IGogPSBhcHAucG9pbnRzLmxlbmd0aCAtIDE7XG4gICAgbGV0IGluUG9seSA9IGZhbHNlO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcHAucG9pbnRzLmxlbmd0aDsgaSA9IGkgKyAxKSB7XG4gICAgICAgIGlmIChhcHAucG9pbnRzW2ldLmxvbmdpdHVkZSA8IGxvbiAmJiBhcHAucG9pbnRzW2pdLmxvbmdpdHVkZSA+PSBsb24gfHwgYXBwLnBvaW50c1tqXS5sb25naXR1ZGUgPCBsb24gJiYgYXBwLnBvaW50c1tpXS5sb25naXR1ZGUgPj0gbG9uKSB7XG4gICAgICAgICAgICBpZiAoYXBwLnBvaW50c1tpXS5sYXRpdHVkZSArIChsb24gLSBhcHAucG9pbnRzW2ldLmxvbmdpdHVkZSkgLyAoYXBwLnBvaW50c1tqXS5sb25naXR1ZGUgLSBhcHAucG9pbnRzW2ldLmxvbmdpdHVkZSkgKiAoYXBwLnBvaW50c1tqXS5sYXRpdHVkZSAtIGFwcC5wb2ludHNbaV0ubGF0aXR1ZGUpIDwgbGF0KSB7XG4gICAgICAgICAgICAgICAgaW5Qb2x5ID0gIWluUG9seTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBqID0gaTtcbiAgICB9XG5cbiAgICBpZiAoaW5Qb2x5KSB7XG4gICAgICAgIGFwcC5tYXAuZW50aXRpZXMucHVzaChwaW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGFsZXJ0KFwiVGhpcyBsb2NhdGlvbiBpcyBvdXRzaWRlIHRoZSBib3VuZGFyaWVzIGZvciB0aGlzIGRhdGEgc2V0XCIpXG4gICAgfVxufVxuXG5hcHAuZ2VvY29kZVF1ZXJ5ID0gZnVuY3Rpb24ocXVlcnkpIHtcbiAgICBcbiAgICBxdWVyeSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIC5zcGxpdChcIiBcIilcbiAgICAgICAgICAgIC5tYXAoKHMpID0+IHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnN1YnN0cmluZygxKSlcbiAgICAgICAgICAgIC5qb2luKFwiIFwiKTtcblxuICAgICAgICAgICAgXG4gICAgLy8gaWYgdGhlIHNlYXJjaCBtYW5hZ2VyIGlzbid0IGRlZmluZWQgeWV0LCBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhlIHNlYXJjaCBtYW5hZ2VyIGNsYXNzXG4gICAgaWYgKCFhcHAuc2VhcmNoTWFuYWdlcikge1xuICAgICAgICBNaWNyb3NvZnQuTWFwcy5sb2FkTW9kdWxlKFwiTWljcm9zb2Z0Lk1hcHMuU2VhcmNoXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXBwLnNlYXJjaE1hbmFnZXIgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuU2VhcmNoLlNlYXJjaE1hbmFnZXIoYXBwLm1hcCk7XG4gICAgICAgICAgICBhcHAuZ2VvY29kZVF1ZXJ5KHF1ZXJ5KTtcbiAgICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgc2VhcmNoUmVxdWVzdCA9IHtcbiAgICAgICAgICAgIHdoZXJlOiBxdWVyeSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbihyKSB7XG4gICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSByZXN1bHRzIGZyb20gdGhlIGdlb2NvZGluZyBmdW5jdGlvbiBcbiAgICAgICAgICAgICAgICBpZiAociAmJiByLnJlc3VsdHMgJiYgci5yZXN1bHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGxldCBmaXJzdFJlc3VsdCA9IHIucmVzdWx0c1swXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgYXBwLnBpbiA9IG5ldyBNaWNyb3NvZnQuTWFwcy5QdXNocGluKGZpcnN0UmVzdWx0LmxvY2F0aW9uLHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBcInJlZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIHRoZSBkYXRhYmFzZSBjYWxsIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgYXBwLmdldENyaW1lRGF0YShmaXJzdFJlc3VsdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gbWFrZSB0aGUgY2FsbCB0byBjaGVjayBpZiB3aXRoaW4gcG9seWdvbiBoZXJlXG4gICAgICAgICAgICAgICAgICAgIGFwcC5wb2ludEluUG9seWdvbihhcHAucGluKTtcbiAgICAgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICAgICAgYXBwLm1hcC5zZXRWaWV3KHtjZW50ZXI6Zmlyc3RSZXN1bHQubG9jYXRpb259KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3JDYWxsYmFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgYWxlcnQoXCJubyByZXN1bHRzIGZvdW5kXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBhcHAuc2VhcmNoTWFuYWdlci5nZW9jb2RlKHNlYXJjaFJlcXVlc3QpO1xuXG4gICAgfSAvLyBlbHNlIHN0YXRlbWVudCBlbmRzXG59IC8vIGdlb2NvZGUgcXVlcnkgZW5kc1xuXG5cbmFwcC5nZXRDcmltZURhdGEgPSBmdW5jdGlvbihhZGRyZXNzRGF0YSkge1xuXG4gICAgY29uc3QgdXJsID0gXCJodHRwczovL3NlcnZpY2VzLmFyY2dpcy5jb20vUzl0aDBqQUo3YnFnSVJqdy9hcmNnaXMvcmVzdC9zZXJ2aWNlcy9CaWN5Y2xlX1RoZWZ0cy9GZWF0dXJlU2VydmVyLzAvcXVlcnk/XCI7XG5cbiAgICBsZXQgbG9jYXRpb25YID0gYWRkcmVzc0RhdGEubG9jYXRpb24ubG9uZ2l0dWRlO1xuICAgIGxldCBsb2NhdGlvblkgPSBhZGRyZXNzRGF0YS5sb2NhdGlvbi5sYXRpdHVkZTtcblxuICAgICQuYWpheCh7XG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgZGF0YTp7XG4gICAgICAgICAgICBnZW9tZXRyeTogYCR7bG9jYXRpb25YfSwke2xvY2F0aW9uWX1gLFxuICAgICAgICAgICAgZ2VvbWV0cnlUeXBlOiBcImVzcmlHZW9tZXRyeVBvaW50XCIsXG4gICAgICAgICAgICBpblNSOiA0MzI2LFxuICAgICAgICAgICAgc3BhdGlhbFJlbDogXCJlc3JpU3BhdGlhbFJlbEludGVyc2VjdHNcIixcbiAgICAgICAgICAgIGRpc3RhbmNlOiAxMDAwLFxuICAgICAgICAgICAgdW5pdHM6IFwiZXNyaVNSVW5pdF9NZXRlclwiLFxuICAgICAgICAgICAgZjogXCJqc29uXCIsXG4gICAgICAgICAgICBvdXRTUjogNDMyNixcbiAgICAgICAgICAgIG91dEZpZWxkczogXCIqXCIsXG4gICAgICAgICAgICB3aGVyZTogXCJPY2N1cnJlbmNlX1llYXIgPiAyMDE2XCJcbiAgICAgICAgfVxuICAgIH0pLnRoZW4oKHJlcyk9PntcbiAgICAgICAgXG4gICAgICAgIGxldCByZXN1bHRzID0gcmVzLmZlYXR1cmVzLmxlbmd0aDtcbiAgICAgICAgYXBwLmRldGVybWluZVJlc3VsdHMoYWRkcmVzc0RhdGEsIHJlc3VsdHMpO1xuICAgIH0pO1xuXG59XG5cblxuYXBwLnN1Ym1pdFF1ZXJ5ID0gZnVuY3Rpb24oKSB7XG4gICAgJChcIi5hZGRyZXNzUXVlcnlcIikub24oXCJzdWJtaXRcIiwgZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbGV0IGFkZHJlc3NTdHJpbmcgPSAkKFwiLnF1ZXJ5VGV4dFwiKS52YWwoKS50cmltKCk7XG4gICAgICAgIGFwcC5nZW9jb2RlUXVlcnkoYCR7YWRkcmVzc1N0cmluZ30ke2FwcC5jaXR5QW5kQ291bnRyeX1gKTtcblxuICAgICAgICAkKFwiLnF1ZXJ5VGV4dFwiKS52YWwoXCJcIik7XG5cbiAgICAgICAgJChcIiNyZXN1bHRNYXBcIikucmVtb3ZlQ2xhc3MoXCJyZXN1bHRNYXBIaWRkZW5cIikuYWRkQ2xhc3MoXCJyZXN1bHRNYXBEaXNwbGF5XCIpO1xuXG4gICAgICAgICQoXCJmb290ZXJcIikuYWRkQ2xhc3MoXCJmb290ZXJEaXNwbGF5XCIpO1xuXG4gICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogNjUwXG4gICAgICAgIH0sIDEwMDApO1xuXG4gICAgICAgICQoXCIubGluZVwiKS5hZGRDbGFzcyhcImxpbmVEaXNwbGF5XCIpXG4gICAgICAgICQoXCIuc2VwYXJhdGluZ0xpbmVcIikuYWRkQ2xhc3MoXCJzZXBhcmF0aW5nTGluZURpc3BsYXlcIilcblxuICAgICAgICAkKFwiLnRleHRSZXN1bHRzXCIpLmFkZENsYXNzKFwidGV4dFJlc3VsdHNIZWlnaHRcIilcblxuICAgICAgICAkKFwiLnJlc3VsdHNcIikuYWRkQ2xhc3MoXCJyZXN1bHRzRGlzcGxheVwiKVxuXG4gICAgfSk7XG59XG5cblxuYXBwLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICBhcHAuZ2V0TWFwKCk7XG4gICAgYXBwLnN1Ym1pdFF1ZXJ5KCk7XG4gICAgYXBwLmRiQ2hhbmdlcygpO1xuICAgIFxufVxuXG4kKGZ1bmN0aW9uKCl7XG4gICAgYXBwLmluaXQoKTtcbn0pIl19
