var arrayLocations = [
    {name: "Dodger Stadium", wikiData: "", mapLoc: {lat: 34.074, lng: -118.240}},
    {name: "Walt Disney Concert Hall", wikiData: "", mapLoc: {lat: 34.055, lng: -118.250}},
    {name: "Staples Center", wikiData: "", mapLoc: {lat: 34.043, lng: -118.267}},
    {name: "La Brea Tar Pits", wikiData: "", mapLoc: {lat: 34.063, lng: -118.356}},
    {name: "Bradbury Building", wikiData: "", mapLoc: {lat: 34.051, lng: -118.248}},
    {name: "Hollywood Sign", wikiData: "", mapLoc: {lat: 34.134, lng: -118.321}}
];

//The infowindow is global so that there is only one instance of it and there are not multiple
//info windows that show up.
var infowindow;
var map;
var arrayMarkers = [];

//Credit to AnthonyS's stackoverflow answer for info on using the wiki API to retrieve an
//article extract:
//http://stackoverflow.com/a/18505342

//Takes value of index of arrayLocation as argument and adds wikiData at index.
function getWikiData(index, callback) {
    "use strict";

    var baseURL = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json" + "" +
        "&exintro=&titles=";

    //Added request error handling using method described by Husky
    //http://stackoverflow.com/a/5121811
    $.ajax({
        url: baseURL + arrayLocations[index].name,
        jsonp: "callback",
        dataType: "jsonp",
        timeout: 3000,
        success: function(res) {
            //Wikipedia returns a page number related to the article.
            //EX: res.query.pages.34234234
            //To get the value of this page number I use the method described by Grzegorz Kaczan
            //to obtain the name of the first property under pages.
            //http://stackoverflow.com/a/11509718
            var pageNum = Object.keys(res.query.pages)[0];

            arrayLocations[index].wikiData = res.query.pages[pageNum].extract;
            callback();
        },
        error: function() {
            arrayLocations[index].wikiData = "There was an error retrieving wiki data.";
            console.log("Error retrieving wiki data.");
            callback();
        }
    });
}

function initMarker(index) {
    "use strict";

    var marker = new google.maps.Marker({
        position: arrayLocations[index].mapLoc,
        map: map,
        title: arrayLocations[index].name,
        animation: google.maps.Animation.DROP,
    });

    arrayMarkers.push(marker);

    marker.addListener('click', function() {
        getWikiData(index, function() {
            infowindow.setContent(arrayLocations[index].wikiData);
            infowindow.maxWidth = Math.floor($(window).width() / 2);
            infowindow.open(map, marker);

            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){ marker.setAnimation(null); }, 750);
        });
    });
}

function initMap() {
    "use strict";

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 34.0914, lng: -118.293},
        zoom: 11,
        disableDefaultUI: true
    });

    infowindow = new google.maps.InfoWindow({
        content: "No data set yet."
    });

    for(var i = 0; i < arrayLocations.length; i++) {
        initMarker(i);
    }
}

//Function adds an index property to arrayLocations to remove the need for some search loops.
//The marker index will always equal the corresponding arrayLocations index.
//Without this function, this index data gets lost when I store locations into the view model's
//filteredLocations.
function initIndex() {
    "use strict";

    for(var i = 0; i < arrayLocations.length; i++) {
        arrayLocations[i].index = i;
    }
}

function AppViewModel() {
    "use strict";

    this.allLocations = ko.observableArray(arrayLocations);

    this.searchTerm = ko.observable('');

    //Creates a filtered array of locations that contain the search term.
    this.filteredLocations =  ko.computed(function() {
        return this.allLocations().filter(function(place) {
            return place.name.toLowerCase().indexOf(this.searchTerm().toLowerCase()) > -1;
        }, this);
    }, this);

    //Update marker visibility.
    this.filteredLocations.subscribe(function() {
        for(var i = 0; i < arrayMarkers.length; i++) {
            var found = false;
            for(var j = 0; j < this.filteredLocations().length; j++) {
                if(i === this.filteredLocations()[j].index) {
                    found = true;
                    break;
                }
            }

            if(found) {
                arrayMarkers[i].setVisible(true);
            }
            else {
                arrayMarkers[i].setVisible(false);
            }
        }
    }, this);

    //Displays marker info when clicked on from list of place names.
    this.displayInfo = function(placeObj) {
        getWikiData(placeObj.index, function() {
            infowindow.setContent(arrayLocations[placeObj.index].wikiData);
            infowindow.maxWidth = Math.floor($(window).width() / 2);
            infowindow.open(map, arrayMarkers[placeObj.index]);

            arrayMarkers[placeObj.index].setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){ arrayMarkers[placeObj.index].setAnimation(null); }, 750);
        });
    };
}

initIndex();
window.mvvm = new AppViewModel();
ko.applyBindings(mvvm);

window.addEventListener('load', initMap);