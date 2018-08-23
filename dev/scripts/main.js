
const app = {};

app.apiKey = "Aps9Ru4I2VE16SVT-Uqa1m0_dnEV3AI15tq6yOCMbctU6mkJFtcs4CQiiet2bJvX";
app.cityAndCountry = ", Toronto, ON, Canada";
app.map;
app.searchManager;

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
                    
                    let pin = new Microsoft.Maps.Pushpin(firstResult.location);

                    // make the database call here
                    app.getCrimeData(firstResult.location);

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


app.getCrimeData = function() {
    console.log("getting crime data")
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