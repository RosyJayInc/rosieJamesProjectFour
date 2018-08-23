
const app = {};

app.apiKey = "Aps9Ru4I2VE16SVT-Uqa1m0_dnEV3AI15tq6yOCMbctU6mkJFtcs4CQiiet2bJvX";
app.cityAndCountry = ", Toronto, Canada";
app.map;
app.searchManager;

app.determineResults =(results) =>{

    let resultString = "";

    if (results > 450) {
        resultString = $(`<p>${results} : Severe </p>`);
    }
    else if(results > 350){
    }
    else if(results > 250){
        resultString = $(`<p>${results} : High </p>`);
    }
    else if(results > 150){
        resultString = $(`<p>${results} : Moderate</p>`);
    }
    else if(results > 50){
        resultString = $(`<p>${results} : Low </p>`);
    }
    else if(results >= 0 ){
        resultString = $(`<p>${results} : Negligible</p>`);
    }
    else{
        resultString = $(`No results Found, Try Again`);
    }
    
    $(".textResults").append(resultString);
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
        console.log("test")
        let searchRequest = {
            where: query,
            callback: function(r) {
                // get the results from the geocoding function 
                if (r && r.results && r.results.length > 0) {
                    console.log(r.results);
                    let firstResult = r.results[0]
                    
                    let pin = new Microsoft.Maps.Pushpin(firstResult.location,{
                        color: "red",
                        title: query
                    });

                    let locationX = firstResult.location.longitude;
                    let locationY = firstResult.location.latitude;

                    // make the database call here
                    app.getCrimeData(locationX, locationY);

                    app.map.entities.push(pin);

                    app.map.setView({bounds:firstResult.bestView});
                }
            },
            errorCallback: function(e) {
                alert("no results found")
            }
        }

        app.searchManager.geocode(searchRequest);

    } // else statement ends
} // geocode query ends


app.getCrimeData = function(locationX, locationY) {
    console.log("getting crime data");

    const url = "https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Bicycle_Thefts/FeatureServer/0/query?";

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

        app.determineResults(results);
    });

}




app.submitQuery = function() {
    $(".addressQuery").on("submit", function(e){
        e.preventDefault();
        let addressString = $(".queryText").val().trim();
        app.getMap(addressString);
    });
}


app.init = function() {
    app.submitQuery();
}

$(function(){
    app.init();
})