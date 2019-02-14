let datasource = "data/power.geojson";

// create the map
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

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax(datasource, {
        dataType: "json",
        success: function(response){

        let attributes = processData(response);
        let year = 2017;
        createSequenceControls(map, year);
        createPropSymbols(response, map, attributes, year);
      }
  });
};

// build an array of data attributes
// function processData(data){
//     let attributes = [];
//     let properties = data.features[0].properties;
//
//     for (var attribute in properties) {
//             attributes.push(attribute);
//     };
//
//     console.log(attributes);
//     return attributes;
// };

function processData(data){
    let dataset = {};
    let state = {};

    for (var i in data.features) {
        let feature = data.features[i];
        let state_name = feature.properties.state;
        let year = feature.properties.Year;

        let state_year_values = {
            state: feature.properties.state,
            year: feature.properties.Year,
            coal: feature.properties.Coal,
            geothermal: feature.properties.Geothermal,
            hydroelectric: feature.properties.Hydroelectric,
            natutralgas: feature.properties.NaturalGas,
            nuclear: feature.properties.Nuclear,
            other: feature.properties.Other,
            otherbiomass: feature.properties.OtherBiomass,
            othergases: feature.properties.OtherGases,
            petroleum: feature.properties.Petroleum,
            pumpedstorage: feature.properties.PumpedStorage,
            solar: feature.properties.Solar,
            total: feature.properties.Total,
            wind: feature.properties.Wind,
            wood: feature.properties.Wood,
            price: feature.properties.Price_Residential
        };

        let year_values = {year: state_year_values};
        if ( state_name in dataset == false ) {
          dataset[state_name] = {};

        };
        dataset[state_name][year] = state_year_values;

    };
    // console.log(dataset);
    return dataset;
}


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
        "<b>" + feature.properties.state + " " + feature.properties.Year + ":</b> " +
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
function createPropSymbols(data, map, attributes, year){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        filter: function(feature, layer) {
            console.log("filter year: " + year);
            if (feature.properties.Year == year) {
              return true;
            }
        },
        pointToLayer: function(feature, latlng) {
            return pointToLayer(feature, latlng, attributes)
        }
    }).addTo(map);
};

// Sequence create
function createSequenceControls(map, year) {
    // range input slider
    $("#panel").append('<input class="range-slider" type="range">');

    $('.range-slider').attr({
        max: 2017,
        min: 1990,
        value: 2017,
        step: 1
    });

    // add skip buttons
    $('#panel').append(
        '<button class="skip" id="reverse">&#8592;</button>'
    );

    $("#panel").append(
      '<button class="skip" id="forward">&#8594;</button>'
    );

    // skip slider value
    $('.range-slider').on('input', function(){
        var index = $(this).val();
        year = index;
    });

    // skip buttons value
    $('.skip').click(function(){
        var index = $('.range-slider').val();

        if ($(this).attr('id') == 'forward') {
            index ++;
            index = index > 2017 ? 1990 : index;
            year = index;
        } else if ($(this).attr('id') == 'reverse'){
            index --;
            index = index < 1990 ? 2017 : index;
            year = index;
        };
        $('.range-slider').val(index);
    });
};


$(document).ready(createMap);
