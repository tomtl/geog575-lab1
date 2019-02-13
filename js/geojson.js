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

// thousand comma separators
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// convert markets to circle markets
function pointToLayer(feature, latlng) {
    let attribute = "Total";

    // marker options
    let options = {
        radius: 8,
        fillColor: "#0000ff",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    // circle size
    let attValue = Number(feature.properties[attribute]);
    options.radius = calcPropRadius(attValue);
    let layer = L.circleMarker(latlng, options);

    // popup
    let popupContent =
        "<p>" +
        "<b>" + feature.properties.state + ":</b> " +
        numberWithCommas(feature.properties.Total / 1000.0) + " GWh"
        "</p>"

    let panelContent =
        "<p>" +
        "<b>State: " + feature.properties.state + "</b></br>" +
        "<b>Year:</b> " + feature.properties.Year + "</br>" +
        "<b>Total:</b> " + numberWithCommas(feature.properties.Total / 1000.0) + " GWh"
        "</p>"

    layer.bindPopup(popupContent, {
        offset: new L.Point(0, -options.radius),
        closeButton: false
    });

    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
          $("#panel").html(panelContent);
        }
    })

    return layer;
};

// proportion circle markers
function createPropSymbols(data, map){
    let year = 2017;

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        filter: function(feature, layer) {
            if (feature.properties.Year == year) {
              return true;
            }
        },
        pointToLayer: pointToLayer
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
