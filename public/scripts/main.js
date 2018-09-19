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

    var resultButtons = $("<div class=\"resultButtons\"><button class=\"findSafe\">Find Safer Area</button><button class=\"anotherQuery\" onClick=\"window.location.href=window.location.href\">Test Another Address</button></div>");

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

        console.log(app.map);

        // let navigationBarMode = Microsoft.Maps.NavigationBarMode;

        // app.map = new Microsoft.Maps.Map("#resultMap", {
        //     credentials: app.apiKey,
        //     center: new Microsoft.Maps.Location(43.6482, -79.39782),
        //     mapTypeId: Microsoft.Maps.MapTypeId.road,
        //     navigationBarMode: navigationBarMode.minified,
        //     zoom: 12
        // });

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
        console.log(app.map);
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

// function to check if the point is acutally in the polygon
app.pointInPolygon = function (pin) {
    console.log("polygon");
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
        console.log("if");

        var navigationBarMode = Microsoft.Maps.NavigationBarMode;

        app.map = new Microsoft.Maps.Map("#resultMap", {
            credentials: "Aps9Ru4I2VE16SVT-Uqa1m0_dnEV3AI15tq6yOCMbctU6mkJFtcs4CQiiet2bJvX",
            center: new Microsoft.Maps.Location(43.6482, -79.39782),
            mapTypeId: Microsoft.Maps.MapTypeId.road,
            navigationBarMode: navigationBarMode.minified,
            zoom: 12
        });

        app.points = [new Microsoft.Maps.Location(43.584721, -79.541365), new Microsoft.Maps.Location(43.610629, -79.567029), new Microsoft.Maps.Location(43.627276, -79.563436), new Microsoft.Maps.Location(43.625848, -79.575361), new Microsoft.Maps.Location(43.629626, -79.585825), new Microsoft.Maps.Location(43.644599, -79.591420), new Microsoft.Maps.Location(43.667592, -79.589045), new Microsoft.Maps.Location(43.743851, -79.648292), new Microsoft.Maps.Location(43.832546, -79.267848), new Microsoft.Maps.Location(43.798602, -79.132959), new Microsoft.Maps.Location(43.789980, -79.121711), new Microsoft.Maps.Location(43.667366, -79.103675), new Microsoft.Maps.Location(43.552493, -79.500425), new Microsoft.Maps.Location(43.584721, -79.541365)];

        var polygon = new Microsoft.Maps.Polygon(app.points).setOptions({ fillColor: 'transparent' });

        // pushing the polygon into the map
        app.map.entities.push(polygon);

        Microsoft.Maps.loadModule("Microsoft.Maps.Search", function () {
            app.searchManager = new Microsoft.Maps.Search.SearchManager(app.map);
            app.geocodeQuery(query);
        });
    } else {
        console.log("else");
        var searchRequest = {
            where: query,
            callback: function callback(r) {
                console.log(r);
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

app.infoBox = function () {
    $(".info").on("click", function () {
        $(".infoBox").css("display", "block");
        $(this).css("display", "none");
    });

    $(".close").on("click", function () {
        $(".infoBox").css("display", "none");
        $(".info").css("display", "block");
    });
};

app.init = function () {
    // app.getMap();
    app.submitQuery();
    app.dbChanges();
    app.infoBox();
};

$(function () {
    app.init();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLE1BQU0sRUFBWjs7QUFFQSxJQUFJLE1BQUosR0FBYSxrRUFBYjtBQUNBLElBQUksY0FBSixHQUFxQixtQkFBckI7QUFDQSxJQUFJLEdBQUo7QUFDQSxJQUFJLEdBQUo7QUFDQSxJQUFJLGFBQUo7QUFDQSxJQUFJLGlCQUFKO0FBQ0EsSUFBSSxNQUFKOztBQUVBO0FBQ0EsSUFBSSxNQUFKLEdBQWE7QUFDVCxZQUFRLHlDQURDO0FBRVQsZ0JBQVksdUNBRkg7QUFHVCxpQkFBYSw4Q0FISjtBQUlULGVBQVcsdUJBSkY7QUFLVCxtQkFBZSxtQ0FMTjtBQU1ULHVCQUFtQjtBQU5WLENBQWI7O0FBU0EsU0FBUyxhQUFULENBQXVCLElBQUksTUFBM0I7O0FBRUEsSUFBSSxLQUFKLEdBQVksU0FBUyxRQUFULEdBQW9CLEdBQXBCLENBQXdCLG1CQUF4QixDQUFaOztBQUVBLElBQUksU0FBSixHQUFnQixZQUEwQjtBQUFBLFFBQWpCLE1BQWlCLHVFQUFSLE9BQVE7O0FBQ3RDLFFBQUcsVUFBVSxPQUFiLEVBQXFCO0FBQ2pCLFlBQUksS0FBSixDQUFVLEVBQVYsQ0FBYSxPQUFiLEVBQXNCLFVBQVMsUUFBVCxFQUFrQjtBQUNwQyxnQkFBSSxZQUFZLEtBQWhCO0FBQ0EsZ0JBQUksWUFBWSxTQUFTLEdBQVQsRUFBaEI7O0FBRUEsaUJBQUksSUFBSSxJQUFSLElBQWdCLFNBQWhCLEVBQTBCO0FBQ3RCLG9CQUFHLFVBQVUsSUFBVixFQUFnQixPQUFoQixLQUE0QixPQUFPLE9BQVAsQ0FBZSxnQkFBOUMsRUFBK0Q7QUFDM0QsZ0NBQVksSUFBWjtBQUNIO0FBQ0o7QUFDRCxnQkFBRyxjQUFjLEtBQWpCLEVBQXVCO0FBQ25CLG9CQUFNLEtBQUssSUFBSSxLQUFKLENBQVUsSUFBVixHQUFpQixHQUE1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QUVBLFVBQUUsWUFBRixFQUFnQixXQUFoQixDQUE0QixpQkFBNUIsRUFBK0MsUUFBL0MsQ0FBd0Qsa0JBQXhEOztBQUVBLFVBQUUsUUFBRixFQUFZLFFBQVosQ0FBcUIsZUFBckI7O0FBRUEsVUFBRSxZQUFGLEVBQWdCLE9BQWhCLENBQXdCO0FBQ3BCLHVCQUFXO0FBRFMsU0FBeEIsRUFFRyxJQUZIOztBQUlBLFVBQUUsT0FBRixFQUFXLFFBQVgsQ0FBb0IsYUFBcEI7QUFDQSxVQUFFLGlCQUFGLEVBQXFCLFFBQXJCLENBQThCLHVCQUE5Qjs7QUFFQSxVQUFFLGNBQUYsRUFBa0IsUUFBbEIsQ0FBMkIsbUJBQTNCOztBQUVBLFVBQUUsVUFBRixFQUFjLFFBQWQsQ0FBdUIsZ0JBQXZCO0FBRUgsS0F2QkQ7QUF3QkgsQ0F6QkQ7O0FBMkJBLElBQUksT0FBSixHQUFjLFlBQVc7QUFDckIsTUFBRSxPQUFGLEVBQVcsRUFBWCxDQUFjLE9BQWQsRUFBdUIsWUFBVztBQUM5QixVQUFFLFVBQUYsRUFBYyxHQUFkLENBQWtCLFNBQWxCLEVBQTZCLE9BQTdCO0FBQ0EsVUFBRSxJQUFGLEVBQVEsR0FBUixDQUFZLFNBQVosRUFBdUIsTUFBdkI7QUFDSCxLQUhEOztBQUtBLE1BQUUsUUFBRixFQUFZLEVBQVosQ0FBZSxPQUFmLEVBQXdCLFlBQVc7QUFDL0IsVUFBRSxVQUFGLEVBQWMsR0FBZCxDQUFrQixTQUFsQixFQUE2QixNQUE3QjtBQUNBLFVBQUUsT0FBRixFQUFXLEdBQVgsQ0FBZSxTQUFmLEVBQTBCLE9BQTFCO0FBQ0gsS0FIRDtBQUlILENBVkQ7O0FBYUEsSUFBSSxJQUFKLEdBQVcsWUFBVztBQUNsQjtBQUNBLFFBQUksV0FBSjtBQUNBLFFBQUksU0FBSjtBQUNBLFFBQUksT0FBSjtBQUVILENBTkQ7O0FBUUEsRUFBRSxZQUFVO0FBQ1IsUUFBSSxJQUFKO0FBQ0gsQ0FGRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGFwcCA9IHt9O1xuXG5hcHAuYXBpS2V5ID0gXCJBcHM5UnU0STJWRTE2U1ZULVVxYTFtMF9kbkVWM0FJMTV0cTZ5T0NNYmN0VTZta0pGdGNzNENRaWlldDJiSnZYXCI7XG5hcHAuY2l0eUFuZENvdW50cnkgPSBcIiwgVG9yb250bywgQ2FuYWRhXCI7XG5hcHAubWFwO1xuYXBwLnBpbjtcbmFwcC5zZWFyY2hNYW5hZ2VyO1xuYXBwLmRpcmVjdGlvbnNNYW5hZ2VyO1xuYXBwLnBvaW50cztcblxuLy8gSW5pdGlhbGl6ZSBGaXJlYmFzZVxuYXBwLmNvbmZpZyA9IHtcbiAgICBhcGlLZXk6IFwiQUl6YVN5REtfb3pZdGR4TWJBRWhaNlQzZzc5TzVLLWVIZkNCS1p3XCIsXG4gICAgYXV0aERvbWFpbjogXCJyb3NpZWphbWVzcHJvamVjdGZvdXIuZmlyZWJhc2VhcHAuY29tXCIsXG4gICAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly9yb3NpZWphbWVzcHJvamVjdGZvdXIuZmlyZWJhc2Vpby5jb21cIixcbiAgICBwcm9qZWN0SWQ6IFwicm9zaWVqYW1lc3Byb2plY3Rmb3VyXCIsXG4gICAgc3RvcmFnZUJ1Y2tldDogXCJyb3NpZWphbWVzcHJvamVjdGZvdXIuYXBwc3BvdC5jb21cIixcbiAgICBtZXNzYWdpbmdTZW5kZXJJZDogXCIzNjA3ODUxMDAxMDVcIlxufTtcblxuZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChhcHAuY29uZmlnKTtcblxuYXBwLmRiUmVmID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoXCJwcm9qZWN0NFNhZmVBcmVhc1wiKTtcblxuYXBwLmRiQ2hhbmdlcyA9IGZ1bmN0aW9uKHJlc3VsdCA9IFwiZW1wdHlcIil7XG4gICAgaWYocmVzdWx0ICE9IFwiZW1wdHlcIil7XG4gICAgICAgIGFwcC5kYlJlZi5vbihcInZhbHVlXCIsIGZ1bmN0aW9uKHNuYXBzaG90KXtcbiAgICAgICAgICAgIGxldCBkb2VzRXhpc3QgPSBmYWxzZTtcbiAgICAgICAgICAgIGxldCBzYWZlQXJlYXMgPSBzbmFwc2hvdC52YWwoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yKGxldCBhcmVhIGluIHNhZmVBcmVhcyl7XG4gICAgICAgICAgICAgICAgaWYoc2FmZUFyZWFzW2FyZWFdLmFkZHJlc3MgPT09IHJlc3VsdC5hZGRyZXNzLmZvcm1hdHRlZEFkZHJlc3Mpe1xuICAgICAgICAgICAgICAgICAgICBkb2VzRXhpc3QgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGRvZXNFeGlzdCA9PT0gZmFsc2Upe1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gYXBwLmRiUmVmLnB1c2goKS5rZXk7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbVJlZmVyZW5jZSA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKGBwcm9qZWN0NFNhZmVBcmVhcy8ke2lkfWApO1xuXG4gICAgICAgICAgICAgICAgaXRlbVJlZmVyZW5jZS5zZXQoe1xuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiByZXN1bHQuYWRkcmVzcy5mb3JtYXR0ZWRBZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBzYWZlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBsYXQ6IHJlc3VsdC5sb2NhdGlvbi5sYXRpdHVkZSxcbiAgICAgICAgICAgICAgICAgICAgbG9uZzogcmVzdWx0LmxvY2F0aW9uLmxvbmdpdHVkZSxcbiAgICAgICAgICAgICAgICAgICAga2V5OiBpZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZXtcbiAgICAgICAgXG4gICAgfVxufVxuXG5hcHAuZGV0ZXJtaW5lUmVzdWx0cyA9IChhZGRyZXNzRGF0YSwgcmVzdWx0cykgPT4ge1xuICAgIFxuICAgIGxldCByZXN1bHRTdHJpbmcgPSBcIlwiO1xuXG4gICAgbGV0IHJlc3VsdEJ1dHRvbnMgPSAkKGA8ZGl2IGNsYXNzPVwicmVzdWx0QnV0dG9uc1wiPjxidXR0b24gY2xhc3M9XCJmaW5kU2FmZVwiPkZpbmQgU2FmZXIgQXJlYTwvYnV0dG9uPjxidXR0b24gY2xhc3M9XCJhbm90aGVyUXVlcnlcIiBvbkNsaWNrPVwid2luZG93LmxvY2F0aW9uLmhyZWY9d2luZG93LmxvY2F0aW9uLmhyZWZcIj5UZXN0IEFub3RoZXIgQWRkcmVzczwvYnV0dG9uPjwvZGl2PmApXG5cbiAgICBsZXQgcmVzdWx0TW9udGggPSAocmVzdWx0cy8xMikudG9GaXhlZCgyKTtcblxuICAgIGlmIChyZXN1bHRzID4gNDUwKSB7XG4gICAgICAgIHJlc3VsdFN0cmluZyA9ICQoYDxoMyBpZD1cInJlc3VsdE51bWJlclwiPlNldmVyZTwvaDM+PHAgY2xhc3M9XCJyZXN1bHROdW1iZXJcIj4ke3Jlc3VsdHN9PC9wPiA8cD5yZXBvcnRlZCBiaWtlIHRoZWZ0cyB3aXRoaW4gYSAxa20gcmFkaXVzIG9mICR7YWRkcmVzc0RhdGEuYWRkcmVzcy5hZGRyZXNzTGluZX0gaW4gMjAxNy48L3A+IDxwPlRoYXQgaXMgYW4gYXZlcmFnZSBvZiBhcHByb3hpbWF0ZWx5IDxzcGFuIGNsYXNzPVwiaGlnaGxpZ2h0TW9udGhseVwiPiR7cmVzdWx0TW9udGh9IDwvc3Bhbj50aGVmdHMgYSBtb250aC48L3A+YCk7XG4gICAgICAgIGFwcC5maW5kU2FmZUFyZWEoYWRkcmVzc0RhdGEpO1xuICAgIH1cbiAgICBlbHNlIGlmKHJlc3VsdHMgPiAzNTApe1xuICAgICAgICByZXN1bHRTdHJpbmcgPSAkKGA8aDMgaWQ9XCJyZXN1bHROdW1iZXJcIj5FeHRyZW1lbHkgaGlnaDwvaDM+PHAgY2xhc3M9XCJyZXN1bHROdW1iZXJcIj4ke3Jlc3VsdHN9PC9wPiA8cD5yZXBvcnRlZCBiaWtlIHRoZWZ0cyB3aXRoaW4gYSAxa20gcmFkaXVzIG9mICR7YWRkcmVzc0RhdGEuYWRkcmVzcy5hZGRyZXNzTGluZX0gaW4gMjAxNy48L3A+IDxwPlRoYXQgaXMgYW4gYXZlcmFnZSBvZiBhcHByb3hpbWF0ZWx5IDxzcGFuIGNsYXNzPVwiaGlnaGxpZ2h0TW9udGhseVwiPiR7cmVzdWx0TW9udGh9IDwvc3Bhbj50aGVmdHMgYSBtb250aC48L3A+YCk7XG4gICAgICAgIGFwcC5maW5kU2FmZUFyZWEoYWRkcmVzc0RhdGEpO1xuICAgIH1cbiAgICBlbHNlIGlmKHJlc3VsdHMgPiAyNTApe1xuICAgICAgICByZXN1bHRTdHJpbmcgPSAkKGA8aDMgaWQ9XCJyZXN1bHROdW1iZXJcIj5IaWdoPC9oMz48cCBjbGFzcz1cInJlc3VsdE51bWJlclwiPiR7cmVzdWx0c308L3A+IDxwPnJlcG9ydGVkIGJpa2UgdGhlZnRzIHdpdGhpbiBhIDFrbSByYWRpdXMgb2YgJHthZGRyZXNzRGF0YS5hZGRyZXNzLmFkZHJlc3NMaW5lfSBpbiAyMDE3LjwvcD4gPHA+VGhhdCBpcyBhbiBhdmVyYWdlIG9mIGFwcHJveGltYXRlbHkgPHNwYW4gY2xhc3M9XCJoaWdobGlnaHRNb250aGx5XCI+JHtyZXN1bHRNb250aH0gPC9zcGFuPnRoZWZ0cyBhIG1vbnRoLjwvcD5gKTtcbiAgICAgICAgYXBwLmZpbmRTYWZlQXJlYShhZGRyZXNzRGF0YSk7XG4gICAgfVxuICAgIGVsc2UgaWYocmVzdWx0cyA+IDE1MCl7XG4gICAgICAgIHJlc3VsdFN0cmluZyA9ICQoYDxoMyBpZD1cInJlc3VsdE51bWJlclwiPk1vZGVyYXRlPC9oMz48cCBjbGFzcz1cInJlc3VsdE51bWJlclwiPiR7cmVzdWx0c308L3A+IDxwPnJlcG9ydGVkIGJpa2UgdGhlZnRzIHdpdGhpbiBhIDFrbSByYWRpdXMgb2YgJHthZGRyZXNzRGF0YS5hZGRyZXNzLmFkZHJlc3NMaW5lfSBpbiAyMDE3LjwvcD4gPHA+VGhhdCBpcyBhbiBhdmVyYWdlIG9mIGFwcHJveGltYXRlbHkgPHNwYW4gY2xhc3M9XCJoaWdobGlnaHRNb250aGx5XCI+JHtyZXN1bHRNb250aH0gPC9zcGFuPnRoZWZ0cyBhIG1vbnRoLjwvcD5gKTtcbiAgICAgICAgYXBwLmRiQ2hhbmdlcyhhZGRyZXNzRGF0YSk7XG4gICAgfVxuICAgIGVsc2UgaWYocmVzdWx0cyA+IDUwKXtcbiAgICAgICAgcmVzdWx0U3RyaW5nID0gJChgPGgzIGlkPVwicmVzdWx0TnVtYmVyXCI+TG93PC9oMz48cCBjbGFzcz1cInJlc3VsdE51bWJlclwiPiR7cmVzdWx0c308L3A+IDxwPnJlcG9ydGVkIGJpa2UgdGhlZnRzIHdpdGhpbiBhIDFrbSByYWRpdXMgb2YgJHthZGRyZXNzRGF0YS5hZGRyZXNzLmFkZHJlc3NMaW5lfSBpbiAyMDE3LjwvcD4gPHA+VGhhdCBpcyBhbiBhdmVyYWdlIG9mIGFwcHJveGltYXRlbHkgPHNwYW4gY2xhc3M9XCJoaWdobGlnaHRNb250aGx5XCI+JHtyZXN1bHRNb250aH0gPC9zcGFuPnRoZWZ0cyBhIG1vbnRoLjwvcD5gKTtcbiAgICAgICAgYXBwLmRiQ2hhbmdlcyhhZGRyZXNzRGF0YSk7XG4gICAgfVxuICAgIGVsc2UgaWYocmVzdWx0cyA+PSAwICl7XG4gICAgICAgIHJlc3VsdFN0cmluZyA9ICQoYDxoMyBpZD1cInJlc3VsdE51bWJlclwiPk5lZ2xpZ2libGU8L2gzPjxwIGNsYXNzPVwicmVzdWx0TnVtYmVyXCI+JHtyZXN1bHRzfTwvcD4gPHA+cmVwb3J0ZWQgYmlrZSB0aGVmdHMgd2l0aGluIGEgMWttIHJhZGl1cyBvZiAke2FkZHJlc3NEYXRhLmFkZHJlc3MuYWRkcmVzc0xpbmV9IGluIDIwMTcuPC9wPiA8cD5UaGF0IGlzIGFuIGF2ZXJhZ2Ugb2YgYXBwcm94aW1hdGVseSA8c3BhbiBjbGFzcz1cImhpZ2hsaWdodE1vbnRobHlcIj4ke3Jlc3VsdE1vbnRofSA8L3NwYW4+dGhlZnRzIGEgbW9udGguPC9wPmApO1xuICAgICAgICBhcHAuZGJDaGFuZ2VzKGFkZHJlc3NEYXRhKTtcbiAgICB9XG4gICAgZWxzZXtcbiAgICAgICAgcmVzdWx0U3RyaW5nID0gJChgTm8gcmVzdWx0cyBGb3VuZCwgVHJ5IEFnYWluYCk7XG4gICAgfVxuICAgIFxuICAgICQoXCIudGV4dFJlc3VsdHNcIikuZW1wdHkoKS5hcHBlbmQocmVzdWx0U3RyaW5nLCByZXN1bHRCdXR0b25zKTtcbiAgICBcbiAgICBpZiAocmVzdWx0cyA8PSAxNTApIHtcbiAgICAgICAgJChcIi5yZXN1bHRCdXR0b25zIC5maW5kU2FmZVwiKS5hZGRDbGFzcyhcIm5vTmVhcmJ5U2FmZVwiKTtcbiAgICB9XG4gICAgXG4gICAgJChcIi5hbm90aGVyUXVlcnlcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgJChcIi50ZXh0UmVzdWx0c1wiKS5lbXB0eSgpO1xuICAgICAgICAkKFwiI3Jlc3VsdE1hcFwiKS5yZW1vdmVDbGFzcyhcInJlc3VsdE1hcERpc3BsYXlcIikuYWRkQ2xhc3MoXCJyZXN1bHRNYXBIaWRkZW5cIik7XG4gICAgICAgICQoXCIucmVzdWx0QnV0dG9uc1wiKS5lbXB0eSgpO1xuICAgICAgICAkKFwiZm9vdGVyXCIpLnJlbW92ZUNsYXNzKFwiZm9vdGVyRGlzcGxheVwiKVxuXG4gICAgICAgICQoXCIubGluZVwiKS5yZW1vdmVDbGFzcyhcImxpbmVEaXNwbGF5XCIpO1xuICAgICAgICAkKFwiLnNlcGFyYXRpbmdMaW5lXCIpLnJlbW92ZUNsYXNzKFwic2VwYXJhdGluZ0xpbmVEaXNwbGF5XCIpXG4gICAgICAgICQoXCIudGV4dFJlc3VsdHNcIikucmVtb3ZlQ2xhc3MoXCJ0ZXh0UmVzdWx0c0hlaWdodFwiKVxuXG4gICAgICAgICQoXCIucmVzdWx0c1wiKS5yZW1vdmVDbGFzcyhcInJlc3VsdHNEaXNwbGF5XCIpXG4gICAgICAgICQoXCIjZGlyZWN0aW9uc1wiKS5lbXB0eSgpO1xuXG4gICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogNjUwXG4gICAgICAgIH0sIDEwMDApO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKGFwcC5tYXApXG5cbiAgICAgICAgLy8gbGV0IG5hdmlnYXRpb25CYXJNb2RlID0gTWljcm9zb2Z0Lk1hcHMuTmF2aWdhdGlvbkJhck1vZGU7XG5cbiAgICAgICAgLy8gYXBwLm1hcCA9IG5ldyBNaWNyb3NvZnQuTWFwcy5NYXAoXCIjcmVzdWx0TWFwXCIsIHtcbiAgICAgICAgLy8gICAgIGNyZWRlbnRpYWxzOiBhcHAuYXBpS2V5LFxuICAgICAgICAvLyAgICAgY2VudGVyOiBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNjQ4MiwgLTc5LjM5NzgyKSxcbiAgICAgICAgLy8gICAgIG1hcFR5cGVJZDogTWljcm9zb2Z0Lk1hcHMuTWFwVHlwZUlkLnJvYWQsXG4gICAgICAgIC8vICAgICBuYXZpZ2F0aW9uQmFyTW9kZTogbmF2aWdhdGlvbkJhck1vZGUubWluaWZpZWQsXG4gICAgICAgIC8vICAgICB6b29tOiAxMlxuICAgICAgICAvLyB9KTtcblxuICAgICAgICBhcHAubWFwLmVudGl0aWVzLnJlbW92ZShhcHAucGluKTtcbiAgICB9KTtcblxufVxuXG5hcHAuZmluZFNhZmVBcmVhID0gZnVuY3Rpb24odW5zYWZlQWRkcmVzcykge1xuICAgIC8vIGNvbnNvbGUubG9nKGFwcC5kYlJlZik7XG5cbiAgICBsZXQgY3VyTGF0ID0gdW5zYWZlQWRkcmVzcy5sb2NhdGlvbi5sYXRpdHVkZTtcbiAgICBsZXQgY3VyTG9uID0gdW5zYWZlQWRkcmVzcy5sb2NhdGlvbi5sb25naXR1ZGU7XG5cbiAgICAvLyBjb25zb2xlLmxvZyhjdXJMYXQsIGN1ckxvbik7XG4gICAgXG4gICAgbGV0IHJhbmdlVmFsID0gMC4wMjtcblxuICAgIGFwcC5kYlJlZi5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oc25hcHNob3Qpe1xuICAgICAgICBsZXQgaXNOZWFyID0gZmFsc2U7XG4gICAgICAgIGxldCBzYWZlTGlzdCA9IHNuYXBzaG90LnZhbCgpO1xuICAgICAgICBsZXQgY2xvc2VBcmVhcyA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IGFyZWEgaW4gc2FmZUxpc3Qpe1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICgoY3VyTGF0IC0gcmFuZ2VWYWwpIDwgc2FmZUxpc3RbYXJlYV0ubGF0ICYmIHNhZmVMaXN0W2FyZWFdLmxhdCA8IChjdXJMYXQgKyByYW5nZVZhbCkpXG4gICAgICAgICAgICAgICAgJiZcbiAgICAgICAgICAgICAgICAoKGN1ckxvbiAtIHJhbmdlVmFsKSA8IHNhZmVMaXN0W2FyZWFdLmxvbmcgJiYgc2FmZUxpc3RbYXJlYV0ubG9uZyA8IChjdXJMb24gKyByYW5nZVZhbCkpXG4gICAgICAgICAgICApe1xuICAgICAgICAgICAgICAgIGlzTmVhciA9IHRydWU7XG4gICAgICAgICAgICAgICAgY2xvc2VBcmVhcy5wdXNoKHNhZmVMaXN0W2FyZWFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZihpc05lYXIgPT09IHRydWUpe1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coY2xvc2VBcmVhcyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCByYW5TcG90ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2xvc2VBcmVhcy5sZW5ndGgpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coY2xvc2VBcmVhc1tyYW5TcG90XSk7XG5cbiAgICAgICAgICAgICQoXCIucmVzdWx0QnV0dG9ucyAuZmluZFNhZmVcIikucmVtb3ZlQ2xhc3MoXCJub05lYXJieVNhZmVcIik7XG4gICAgICAgICAgICAkKFwiLnRleHRSZXN1bHRzXCIpLm9uKFwiY2xpY2tcIiwgXCIuZmluZFNhZmVcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBhcHAuZ2V0RGlyZWN0aW9ucyh1bnNhZmVBZGRyZXNzLCBjbG9zZUFyZWFzW3JhblNwb3RdKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBlbHNleyAgICAgICAgICAgIFxuICAgICAgICAgICAgJChcIi5yZXN1bHRCdXR0b25zIC5maW5kU2FmZVwiKS5hZGRDbGFzcyhcIm5vTmVhcmJ5U2FmZVwiKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuYXBwLmdldERpcmVjdGlvbnMgPSBmdW5jdGlvbih1bnNhZmUsIHNhZmUpe1xuXG4gICAgbGV0IHVuc2FmZVN0cmluZyA9IHVuc2FmZS5hZGRyZXNzLmZvcm1hdHRlZEFkZHJlc3M7XG4gICAgbGV0IHNhZmVTdHJpbmcgPSBzYWZlLmFkZHJlc3M7XG4gICAgbGV0IHNhZmVMYXQgPSBzYWZlLmxhdDtcbiAgICBsZXQgc2FmZUxvbmcgPSBzYWZlLmxvbmdcbiAgICBcbiAgICBNaWNyb3NvZnQuTWFwcy5sb2FkTW9kdWxlKFwiTWljcm9zb2Z0Lk1hcHMuRGlyZWN0aW9uc1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAvL0NyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgZGlyZWN0aW9ucyBtYW5hZ2VyLlxuICAgICAgICBhcHAuZGlyZWN0aW9uc01hbmFnZXIgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuRGlyZWN0aW9ucy5EaXJlY3Rpb25zTWFuYWdlcihhcHAubWFwKTtcbiAgICAgICAgXG4gICAgICAgIC8vQ3JlYXRlIHdheXBvaW50cyB0byByb3V0ZSBiZXR3ZWVuLlxuICAgICAgICBsZXQgY3VycmVudFBvaW50ID0gbmV3IE1pY3Jvc29mdC5NYXBzLkRpcmVjdGlvbnMuV2F5cG9pbnQoeyBcbiAgICAgICAgICAgIGFkZHJlc3M6IHVuc2FmZVN0cmluZyBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXBwLmRpcmVjdGlvbnNNYW5hZ2VyLmFkZFdheXBvaW50KGN1cnJlbnRQb2ludCk7XG4gICAgICAgIFxuICAgICAgICBsZXQgc2FmZVBvaW50ID0gbmV3IE1pY3Jvc29mdC5NYXBzLkRpcmVjdGlvbnMuV2F5cG9pbnQoe1xuICAgICAgICAgICAgYWRkcmVzczogc2FmZVN0cmluZ1xuICAgICAgICB9KTtcblxuICAgICAgICBhcHAuZGlyZWN0aW9uc01hbmFnZXIuYWRkV2F5cG9pbnQoc2FmZVBvaW50KTtcblxuICAgICAgICAvL1NwZWNpZnkgdGhlIGVsZW1lbnQgaW4gd2hpY2ggdGhlIGl0aW5lcmFyeSB3aWxsIGJlIHJlbmRlcmVkLlxuICAgICAgICBhcHAuZGlyZWN0aW9uc01hbmFnZXIuc2V0UmVuZGVyT3B0aW9ucyh7IGl0aW5lcmFyeUNvbnRhaW5lcjogJyNkaXJlY3Rpb25zJyB9KTtcbiAgICAgICAgY29uc29sZS5sb2coYXBwLm1hcClcbiAgICAgICAgYXBwLm1hcC5lbnRpdGllcy5yZW1vdmUoYXBwLnBpbik7XG4gICAgICAgIC8vQ2FsY3VsYXRlIGRpcmVjdGlvbnMuXG4gICAgICAgIGFwcC5kaXJlY3Rpb25zTWFuYWdlci5jYWxjdWxhdGVEaXJlY3Rpb25zKCk7XG5cbiAgICAgICAgJChcIiNkaXJlY3Rpb25zXCIpLmFwcGVuZChcIjxkaXYgY2xhc3M9J2JhY2tUb1Jlc3VsdHMnPjxidXR0b24gY2xhc3M9J2JhY2tCdXR0b24nPkJhY2sgVG8gUmVzdWx0czwvYnV0dG9uPlwiKVxuICAgICAgICAkKFwiLmJhY2tCdXR0b25cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIHNjcm9sbFRvcDogNjUwXG4gICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgfSlcbiAgICB9KTtcbn1cblxuLy8gZnVuY3Rpb24gdG8gY2hlY2sgaWYgdGhlIHBvaW50IGlzIGFjdXRhbGx5IGluIHRoZSBwb2x5Z29uXG5hcHAucG9pbnRJblBvbHlnb24gPSBmdW5jdGlvbiAocGluKSB7XG4gICAgY29uc29sZS5sb2coXCJwb2x5Z29uXCIpXG4gICAgbGV0IGxvbiA9IHBpbi5nZW9tZXRyeS54O1xuICAgIGxldCBsYXQgPSBwaW4uZ2VvbWV0cnkueTtcblxuICAgIGxldCBqID0gYXBwLnBvaW50cy5sZW5ndGggLSAxO1xuICAgIGxldCBpblBvbHkgPSBmYWxzZTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXBwLnBvaW50cy5sZW5ndGg7IGkgPSBpICsgMSkge1xuICAgICAgICBpZiAoYXBwLnBvaW50c1tpXS5sb25naXR1ZGUgPCBsb24gJiYgYXBwLnBvaW50c1tqXS5sb25naXR1ZGUgPj0gbG9uIHx8IGFwcC5wb2ludHNbal0ubG9uZ2l0dWRlIDwgbG9uICYmIGFwcC5wb2ludHNbaV0ubG9uZ2l0dWRlID49IGxvbikge1xuICAgICAgICAgICAgaWYgKGFwcC5wb2ludHNbaV0ubGF0aXR1ZGUgKyAobG9uIC0gYXBwLnBvaW50c1tpXS5sb25naXR1ZGUpIC8gKGFwcC5wb2ludHNbal0ubG9uZ2l0dWRlIC0gYXBwLnBvaW50c1tpXS5sb25naXR1ZGUpICogKGFwcC5wb2ludHNbal0ubGF0aXR1ZGUgLSBhcHAucG9pbnRzW2ldLmxhdGl0dWRlKSA8IGxhdCkge1xuICAgICAgICAgICAgICAgIGluUG9seSA9ICFpblBvbHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaiA9IGk7XG4gICAgfVxuXG4gICAgaWYgKGluUG9seSkge1xuICAgICAgICBhcHAubWFwLmVudGl0aWVzLnB1c2gocGluKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhbGVydChcIlRoaXMgbG9jYXRpb24gaXMgb3V0c2lkZSB0aGUgYm91bmRhcmllcyBmb3IgdGhpcyBkYXRhIHNldFwiKVxuICAgIH1cbn1cblxuYXBwLmdlb2NvZGVRdWVyeSA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG4gICAgXG4gICAgcXVlcnkgPSBxdWVyeS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAuc3BsaXQoXCIgXCIpXG4gICAgICAgICAgICAubWFwKChzKSA9PiBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSkpXG4gICAgICAgICAgICAuam9pbihcIiBcIik7XG5cbiAgICAgICAgICAgIFxuICAgIC8vIGlmIHRoZSBzZWFyY2ggbWFuYWdlciBpc24ndCBkZWZpbmVkIHlldCwgY3JlYXRlIGFuIGluc3RhbmNlIG9mIHRoZSBzZWFyY2ggbWFuYWdlciBjbGFzc1xuICAgIGlmICghYXBwLnNlYXJjaE1hbmFnZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJpZlwiKVxuXG4gICAgICAgIGxldCBuYXZpZ2F0aW9uQmFyTW9kZSA9IE1pY3Jvc29mdC5NYXBzLk5hdmlnYXRpb25CYXJNb2RlO1xuXG4gICAgICAgIGFwcC5tYXAgPSBuZXcgTWljcm9zb2Z0Lk1hcHMuTWFwKFwiI3Jlc3VsdE1hcFwiLCB7XG4gICAgICAgICAgICBjcmVkZW50aWFsczogXCJBcHM5UnU0STJWRTE2U1ZULVVxYTFtMF9kbkVWM0FJMTV0cTZ5T0NNYmN0VTZta0pGdGNzNENRaWlldDJiSnZYXCIsXG4gICAgICAgICAgICBjZW50ZXI6IG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My42NDgyLCAtNzkuMzk3ODIpLFxuICAgICAgICAgICAgbWFwVHlwZUlkOiBNaWNyb3NvZnQuTWFwcy5NYXBUeXBlSWQucm9hZCxcbiAgICAgICAgICAgIG5hdmlnYXRpb25CYXJNb2RlOiBuYXZpZ2F0aW9uQmFyTW9kZS5taW5pZmllZCxcbiAgICAgICAgICAgIHpvb206IDEyXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFwcC5wb2ludHMgPSBbXG4gICAgICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNTg0NzIxLCAtNzkuNTQxMzY1KSxcbiAgICAgICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My42MTA2MjksIC03OS41NjcwMjkpLFxuICAgICAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjYyNzI3NiwgLTc5LjU2MzQzNiksXG4gICAgICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNjI1ODQ4LCAtNzkuNTc1MzYxKSxcbiAgICAgICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My42Mjk2MjYsIC03OS41ODU4MjUpLFxuXG4gICAgICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNjQ0NTk5LCAtNzkuNTkxNDIwKSxcbiAgICAgICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My42Njc1OTIsIC03OS41ODkwNDUpLFxuICAgICAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjc0Mzg1MSwgLTc5LjY0ODI5MiksXG4gICAgICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuODMyNTQ2LCAtNzkuMjY3ODQ4KSxcbiAgICAgICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My43OTg2MDIsIC03OS4xMzI5NTkpLFxuXG4gICAgICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNzg5OTgwLCAtNzkuMTIxNzExKSxcbiAgICAgICAgICAgIG5ldyBNaWNyb3NvZnQuTWFwcy5Mb2NhdGlvbig0My42NjczNjYsIC03OS4xMDM2NzUpLFxuICAgICAgICAgICAgbmV3IE1pY3Jvc29mdC5NYXBzLkxvY2F0aW9uKDQzLjU1MjQ5MywgLTc5LjUwMDQyNSksXG4gICAgICAgICAgICBuZXcgTWljcm9zb2Z0Lk1hcHMuTG9jYXRpb24oNDMuNTg0NzIxLCAtNzkuNTQxMzY1KVxuICAgICAgICBdXG5cblxuICAgICAgICBsZXQgcG9seWdvbiA9IG5ldyBNaWNyb3NvZnQuTWFwcy5Qb2x5Z29uKGFwcC5wb2ludHMpLnNldE9wdGlvbnMoeyBmaWxsQ29sb3I6ICd0cmFuc3BhcmVudCcgfSk7XG5cbiAgICAgICAgLy8gcHVzaGluZyB0aGUgcG9seWdvbiBpbnRvIHRoZSBtYXBcbiAgICAgICAgYXBwLm1hcC5lbnRpdGllcy5wdXNoKHBvbHlnb24pO1xuXG4gICAgICAgIE1pY3Jvc29mdC5NYXBzLmxvYWRNb2R1bGUoXCJNaWNyb3NvZnQuTWFwcy5TZWFyY2hcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhcHAuc2VhcmNoTWFuYWdlciA9IG5ldyBNaWNyb3NvZnQuTWFwcy5TZWFyY2guU2VhcmNoTWFuYWdlcihhcHAubWFwKTtcbiAgICAgICAgICAgIGFwcC5nZW9jb2RlUXVlcnkocXVlcnkpO1xuICAgICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZWxzZVwiKVxuICAgICAgICBsZXQgc2VhcmNoUmVxdWVzdCA9IHtcbiAgICAgICAgICAgIHdoZXJlOiBxdWVyeSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbihyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocilcbiAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIHJlc3VsdHMgZnJvbSB0aGUgZ2VvY29kaW5nIGZ1bmN0aW9uIFxuICAgICAgICAgICAgICAgIGlmIChyICYmIHIucmVzdWx0cyAmJiByLnJlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpcnN0UmVzdWx0ID0gci5yZXN1bHRzWzBdXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBhcHAucGluID0gbmV3IE1pY3Jvc29mdC5NYXBzLlB1c2hwaW4oZmlyc3RSZXN1bHQubG9jYXRpb24se1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IFwicmVkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogcXVlcnlcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIG1ha2UgdGhlIGRhdGFiYXNlIGNhbGwgaGVyZVxuICAgICAgICAgICAgICAgICAgICBhcHAuZ2V0Q3JpbWVEYXRhKGZpcnN0UmVzdWx0KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIHRoZSBjYWxsIHRvIGNoZWNrIGlmIHdpdGhpbiBwb2x5Z29uIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgYXBwLnBvaW50SW5Qb2x5Z29uKGFwcC5waW4pO1xuICAgICAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgICAgICBhcHAubWFwLnNldFZpZXcoe2NlbnRlcjpmaXJzdFJlc3VsdC5sb2NhdGlvbn0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvckNhbGxiYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBhbGVydChcIm5vIHJlc3VsdHMgZm91bmRcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgYXBwLnNlYXJjaE1hbmFnZXIuZ2VvY29kZShzZWFyY2hSZXF1ZXN0KTtcblxuICAgIH0gLy8gZWxzZSBzdGF0ZW1lbnQgZW5kc1xufSAvLyBnZW9jb2RlIHF1ZXJ5IGVuZHNcblxuXG5hcHAuZ2V0Q3JpbWVEYXRhID0gZnVuY3Rpb24oYWRkcmVzc0RhdGEpIHtcblxuICAgIGNvbnN0IHVybCA9IFwiaHR0cHM6Ly9zZXJ2aWNlcy5hcmNnaXMuY29tL1M5dGgwakFKN2JxZ0lSancvYXJjZ2lzL3Jlc3Qvc2VydmljZXMvQmljeWNsZV9UaGVmdHMvRmVhdHVyZVNlcnZlci8wL3F1ZXJ5P1wiO1xuXG4gICAgbGV0IGxvY2F0aW9uWCA9IGFkZHJlc3NEYXRhLmxvY2F0aW9uLmxvbmdpdHVkZTtcbiAgICBsZXQgbG9jYXRpb25ZID0gYWRkcmVzc0RhdGEubG9jYXRpb24ubGF0aXR1ZGU7XG5cbiAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgIGRhdGE6e1xuICAgICAgICAgICAgZ2VvbWV0cnk6IGAke2xvY2F0aW9uWH0sJHtsb2NhdGlvbll9YCxcbiAgICAgICAgICAgIGdlb21ldHJ5VHlwZTogXCJlc3JpR2VvbWV0cnlQb2ludFwiLFxuICAgICAgICAgICAgaW5TUjogNDMyNixcbiAgICAgICAgICAgIHNwYXRpYWxSZWw6IFwiZXNyaVNwYXRpYWxSZWxJbnRlcnNlY3RzXCIsXG4gICAgICAgICAgICBkaXN0YW5jZTogMTAwMCxcbiAgICAgICAgICAgIHVuaXRzOiBcImVzcmlTUlVuaXRfTWV0ZXJcIixcbiAgICAgICAgICAgIGY6IFwianNvblwiLFxuICAgICAgICAgICAgb3V0U1I6IDQzMjYsXG4gICAgICAgICAgICBvdXRGaWVsZHM6IFwiKlwiLFxuICAgICAgICAgICAgd2hlcmU6IFwiT2NjdXJyZW5jZV9ZZWFyID4gMjAxNlwiXG4gICAgICAgIH1cbiAgICB9KS50aGVuKChyZXMpPT57XG4gICAgICAgIFxuICAgICAgICBsZXQgcmVzdWx0cyA9IHJlcy5mZWF0dXJlcy5sZW5ndGg7XG4gICAgICAgIGFwcC5kZXRlcm1pbmVSZXN1bHRzKGFkZHJlc3NEYXRhLCByZXN1bHRzKTtcbiAgICB9KTtcblxufVxuXG5cbmFwcC5zdWJtaXRRdWVyeSA9IGZ1bmN0aW9uKCkge1xuICAgICQoXCIuYWRkcmVzc1F1ZXJ5XCIpLm9uKFwic3VibWl0XCIsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBsZXQgYWRkcmVzc1N0cmluZyA9ICQoXCIucXVlcnlUZXh0XCIpLnZhbCgpLnRyaW0oKTtcbiAgICAgICAgYXBwLmdlb2NvZGVRdWVyeShgJHthZGRyZXNzU3RyaW5nfSR7YXBwLmNpdHlBbmRDb3VudHJ5fWApO1xuXG4gICAgICAgICQoXCIucXVlcnlUZXh0XCIpLnZhbChcIlwiKTtcblxuICAgICAgICAkKFwiI3Jlc3VsdE1hcFwiKS5yZW1vdmVDbGFzcyhcInJlc3VsdE1hcEhpZGRlblwiKS5hZGRDbGFzcyhcInJlc3VsdE1hcERpc3BsYXlcIik7XG5cbiAgICAgICAgJChcImZvb3RlclwiKS5hZGRDbGFzcyhcImZvb3RlckRpc3BsYXlcIik7XG5cbiAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiA2NTBcbiAgICAgICAgfSwgMTAwMCk7XG5cbiAgICAgICAgJChcIi5saW5lXCIpLmFkZENsYXNzKFwibGluZURpc3BsYXlcIilcbiAgICAgICAgJChcIi5zZXBhcmF0aW5nTGluZVwiKS5hZGRDbGFzcyhcInNlcGFyYXRpbmdMaW5lRGlzcGxheVwiKVxuXG4gICAgICAgICQoXCIudGV4dFJlc3VsdHNcIikuYWRkQ2xhc3MoXCJ0ZXh0UmVzdWx0c0hlaWdodFwiKVxuXG4gICAgICAgICQoXCIucmVzdWx0c1wiKS5hZGRDbGFzcyhcInJlc3VsdHNEaXNwbGF5XCIpXG5cbiAgICB9KTtcbn1cblxuYXBwLmluZm9Cb3ggPSBmdW5jdGlvbigpIHtcbiAgICAkKFwiLmluZm9cIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJChcIi5pbmZvQm94XCIpLmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKVxuICAgICAgICAkKHRoaXMpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpXG4gICAgfSlcblxuICAgICQoXCIuY2xvc2VcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJChcIi5pbmZvQm94XCIpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpXG4gICAgICAgICQoXCIuaW5mb1wiKS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIilcbiAgICB9KVxufVxuXG5cbmFwcC5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gYXBwLmdldE1hcCgpO1xuICAgIGFwcC5zdWJtaXRRdWVyeSgpO1xuICAgIGFwcC5kYkNoYW5nZXMoKTtcbiAgICBhcHAuaW5mb0JveCgpO1xuICAgIFxufVxuXG4kKGZ1bmN0aW9uKCl7XG4gICAgYXBwLmluaXQoKTtcbn0pIl19
