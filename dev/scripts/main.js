
const app = {};

app.apiKey = "Aps9Ru4I2VE16SVT-Uqa1m0_dnEV3AI15tq6yOCMbctU6mkJFtcs4CQiiet2bJvX";
app.cityAndCountry = ", Toronto, Canada";
app.map;
app.pin;
app.searchManager;
app.directionsManager;

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

app.dbChanges = function(result = "empty"){
    if(result != "empty"){
        app.dbRef.on("value", function(snapshot){
            let doesExist = false;
            let safeAreas = snapshot.val();
            // console.log(safeAreas);
            // console.log(result.formattedAddress);
            
            
            for(let area in safeAreas){
                if(safeAreas[area].address === result.address.formattedAddress){
                    doesExist = true;
                }
            }
            if(doesExist === false){
                const id = app.dbRef.push().key;
                const itemReference = firebase.database().ref(`project4SafeAreas/${id}`);

                itemReference.set({
                    address: result.address.formattedAddress,
                    safe: true,
                    lat: result.location.latitude,
                    long: result.location.longitude,
                    key: id
                });
            }
        });
    }
    else{
        
    }
}
app.determineResults = (addressData, results) =>{
    
    
    let resultString = "";

    if (results > 450) {
        resultString = $(`<p>${results} : Severe </p>`);
    }
    else if(results > 350){
        resultString = $(`<p>${results} : Extremely high </p>`);
        app.findSafeArea(addressData);
    }
    else if(results > 250){
        resultString = $(`<p>${results} : High </p>`);
    }
    else if(results > 150){
        resultString = $(`<p>${results} : Moderate</p>`);
        app.dbChanges(addressData);
    }
    else if(results > 50){
        resultString = $(`<p>${results} : Low </p>`);
        app.dbChanges(addressData);
    }
    else if(results >= 0 ){
        resultString = $(`<p>${results} : Negligible</p>`);
        app.dbChanges(addressData);
    }
    else{
        resultString = $(`No results Found, Try Again`);
    }
    
    $(".textResults").append(resultString);
    // console.log('getting results');
}

app.findSafeArea = function(unsafeAddress) {
    console.log(app.dbRef);

    let curLat = unsafeAddress.location.latitude;
    let curLon = unsafeAddress.location.longitude;

    console.log(curLat, curLon);
    
    let rangeVal = 0.02;

    app.dbRef.once("value", function(snapshot){
        let isNear = false;
        let safeList = snapshot.val();
        let closeAreas = [];

        for (let area in safeList){
            if (
                ((curLat - rangeVal) < safeList[area].lat && safeList[area].lat < (curLat + rangeVal))
                &&
                ((curLon - rangeVal) < safeList[area].long && safeList[area].long < (curLon + rangeVal))
            ){
                isNear = true;
                closeAreas.push(safeList[area]);
            }
        }
        if(isNear === true){
            console.log(closeAreas);
            
            let ranSpot = Math.floor(Math.random() * closeAreas.length);
            console.log(closeAreas[ranSpot]);
            $(".findSafe").on("click", function(){
                app.getDirections(unsafeAddress, closeAreas[ranSpot]);
            })
            
        }
    });
}
app.getDirections = function(unsafe, safe){
    console.log('test');
    console.log(unsafe.address.formattedAddress, safe.address);
    let unsafeString = unsafe.address.formattedAddress;
    let safeString = safe.address;
    let safeLat = safe.lat;
    let safeLong = safe.long
    
    Microsoft.Maps.loadModule("Microsoft.Maps.Directions", function(){
        //Create an instance of the directions manager.
        app.directionsManager = new Microsoft.Maps.Directions.DirectionsManager(app.map);
        
        //Create waypoints to route between.
        let currentPoint = new Microsoft.Maps.Directions.Waypoint({ 
            address: unsafeString 
        });
        app.directionsManager.addWaypoint(currentPoint);
        
        
        
        let safePoint = new Microsoft.Maps.Directions.Waypoint({
            address: safeString
        });
        app.directionsManager.addWaypoint(safePoint);

        //Specify the element in which the itinerary will be rendered.
        app.directionsManager.setRenderOptions({ itineraryContainer: '#directions' });
        console.log(app.pin.getLocation());
        app.map.entities.remove(app.pin);
        //Calculate directions.
        app.directionsManager.calculateDirections();
    });
}
app.getMap = function(query) {
    let navigationBarMode = Microsoft.Maps.NavigationBarMode;
    app.map = new Microsoft.Maps.Map("#resultMap", {
        credentials: app.apiKey,
        center: new Microsoft.Maps.Location(43.6482, -79.39782),
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        navigationBarMode: navigationBarMode.compact,
        zoom: 12
    });

    app.geocodeQuery (`${query}${app.cityAndCountry}`);
    //call geocode query here
}

app.geocodeQuery = function(query) {
    
    query = query.toLowerCase()
            .split(" ")
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(" ");

            
    // if the search manager isn't defined yet, create an instance of the search manager class
    if (!app.searchManager) {
        Microsoft.Maps.loadModule("Microsoft.Maps.Search", function() {
            app.searchManager = new Microsoft.Maps.Search.SearchManager(app.map);
            app.geocodeQuery(query);
        })
    } else {
        let searchRequest = {
            where: query,
            callback: function(r) {
                // get the results from the geocoding function 
                if (r && r.results && r.results.length > 0) {
                    console.log(r.results);
                    let firstResult = r.results[0]
                    
                    app.pin = new Microsoft.Maps.Pushpin(firstResult.location,{
                        color: "red",
                        title: query
                    });
                    // make the database call here
                    app.getCrimeData(firstResult);

                    app.map.entities.push(app.pin);

                    app.map.setView({bounds:firstResult.bestView});
                }
            },
            errorCallback: function() {
                alert("no results found")
            }
        }

        app.searchManager.geocode(searchRequest);

    } // else statement ends
} // geocode query ends


app.getCrimeData = function(addressData) {
    console.log("getting crime data");

    const url = "https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Bicycle_Thefts/FeatureServer/0/query?";

    let locationX = addressData.location.longitude;
    let locationY = addressData.location.latitude;

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        data:{
            geometry: `${locationX},${locationY}`,
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
    }).then((res)=>{
        
        let results = res.features.length;

        app.determineResults(addressData, results);
    });

}




app.submitQuery = function() {
    $(".addressQuery").on("submit", function(e){
        e.preventDefault();
        let addressString = $(".queryText").val().trim();
        //create node on firebase
        
        app.getMap(addressString);
    });
}


app.init = function() {
    app.submitQuery();
    // app.findSafeArea("test");
    app.dbChanges();
    
}

$(function(){
    app.init();
})