let datasource = "data/power.geojson";

function createMap() {
  // create the map
  let map = L.map('mapid').setView([39, -98], 4);

  // add base mapid
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);

  // get the data
  getData(map);
};

// popups
function onEachFeature(feature, layer) {
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties
        }
        layer.bindPopup(popupContent);
    };
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = (1.0 / 1000000);
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

// proportion circle markers
function createPropSymbols(data, map){
    let attribute = "Total";
    let year = 2017;

    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        filter: function(feature, layer) {
            if (feature.properties.Year == year) {
              return true;
            }
        },
        pointToLayer: function (feature, latlng) {
            var attValue = Number(feature.properties[attribute]);
            // console.log(feature.properties);
            geojsonMarkerOptions.radius = calcPropRadius(attValue);
            return L.circleMarker(latlng, geojsonMarkerOptions);
        },
        onEachFeature: onEachFeature
    }).addTo(map);
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax(datasource, {
        dataType: "json",
        success: function(response){

        createPropSymbols(response, map);
      }
  });
};
$(document).ready(createMap);
