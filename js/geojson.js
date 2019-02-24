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
        createSequenceControls(map, attributes, year);
        createPropSymbols(response, map, attributes, year);
        createLegend(map, attributes, year);
      }
  });
};

function processData(data){
    let dataset = {};

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

        // load the values to the dictionary with all states and years
        if ( state_name in dataset == false ) {
          dataset[state_name] = {};
        };
        dataset[state_name][year] = state_year_values;
    };

    // console.log(dataset);
    return dataset;
};

// proportion circle markers
function createPropSymbols(data, map, attributes, year){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        filter: function(feature, layer) {
            // console.log("filter year: " + year);
            if (feature.properties.Year == year) {
              return true;
            }
        },
        pointToLayer: function(feature, latlng) {
            return pointToLayer(feature, latlng, attributes, year)
        }
    }).addTo(map);
};

// convert markets to circle markets
function pointToLayer(feature, latlng, attributes, year) {
    let attribute = "total";

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
    let state = feature.properties.state;
    let attValue = Number(attributes[state][year][attribute]);
    // let attValue = Number(feature.properties[attribute]);
    options.radius = calcPropRadius(attValue);
    let layer = L.circleMarker(latlng, options);

    var popup = new Popup(feature, attributes, year, layer);
    popup.bindToLayer();
    // createPopups(feature, attributes, year, layer);

    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
          $("#panel").html(popup.panelContent);
        }
    })
    return layer;
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

// Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attributes, year){
    map.eachLayer(function(layer){
        if (layer.feature) {
          let attribute = 'total'
          let state = layer.feature.properties.state
          let value = Number(attributes[state][year][attribute]);

          let radius = calcPropRadius(value);

          layer.setRadius(radius);

          var popup = new Popup(layer.feature, attributes, year, layer);
          popup.bindToLayer();
        };
    });
};

function Popup(feature, attributes, year, layer){
    this.feature = feature;
    this.attributes = attributes;
    this.year = year;
    this.layer = layer;
    this.attribute = "total";
    this.state = feature.properties.state;
    this.value = Number(attributes[this.state][this.year][this.attribute]);
    this.radius = calcPropRadius(this.value);

    this.popupContent =
        "<p>" +
        "<b>" + this.state + " " + this.year + ":</b> " +
        numberWithCommas(this.value / 1000.0) + " GWh"
        "</p>"

    this.panelContent =
        "<p>" +
        "<b>State: " + this.state + "</b></br>" +
        "<b>Year:</b> " + this.year + "</br>" +
        "<b>Total:</b> " + numberWithCommas(this.value / 1000.0) + " GWh"
        "</p>"

    this.bindToLayer = function(){
        this.layer.bindPopup(this.popupContent, {
            offset: new L.Point(0, -this.radius)
        });
    };
};

// thousand comma separators
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Sequence controls
function createSequenceControls(map, attributes, year) {
    let SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        onAdd: function(map) {
          // create control container div
            let container = L.DomUtil.create('div', 'sequence-control-container');

            // sequence title
            $(container).append('<h3 class="sequence-title">' + year + '</h3>')

            // create range input slider
            $(container).append('<input class="range-slider" type="range">');

            // add skip buttons
            $(container).append('<button class="skip" id="reverse" title="Reverse">&#8592;</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">&#8594;</button>');

            // stop any event listeners on the map
            $(container).on('mousedown mouseover dblclick', function(e){
                L.DomEvent.stopPropagation(e);
                L.DomEvent.disableClickPropagation(container);
            });

            return container;
        }
    });
    map.addControl(new SequenceControl());

    $('.range-slider').attr({
        max: 2017,
        min: 1990,
        value: 2017,
        step: 1
    });

    function updateSequenceControlsTitle(year){
        $('.sequence-title').text(year);
    };

    // change year using slider value
    $('.range-slider').on('input', function(){
        var index = $(this).val();
        year = index;
        updatePropSymbols(map, attributes, year)
        updateSequenceControlsTitle(year);
        updateLegend(map, attributes, year);
    });

    // change year using skip buttons value
    $('.skip').click(function(){
        var index = $('.range-slider').val();

        if ($(this).attr('id') == 'forward') {
            index ++;
            index = index > 2017 ? 1990 : index;
            updatePropSymbols(map, attributes, year)
            updateSequenceControlsTitle(year);
            updateLegend(map, attributes, year);
        } else if ($(this).attr('id') == 'reverse'){
            index --;
            index = index < 1990 ? 2017 : index;
            year = index;
            updatePropSymbols(map, attributes, year)
            updateSequenceControlsTitle(year);
            updateLegend(map, attributes, year);
        };
        $('.range-slider').val(index);
    });
};


// Legend
function createLegend(map, attributes, year){
    let LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function(map) {
            // legend container
            let container = L.DomUtil.create('div', 'legend-control-container');

            // create legend
            $(container).append('<h3 class="legend-title">Total power generation (GWh)</h3>')

            // add temporal legend div
            $(container).append('<div id="temporal-legend">')

            let svg = '<svg id="attribute-legend" width="160px" height="60px">';

            // let circles = ["max", "mean", "min"];
            let circles = {
                max: 20,
                mean: 40,
                min: 60
            };

            // loop to add each circle and text to svg string
            // for (var i=0; i<circles.length; i++){
            //     let circleString = '<circle class="legend-circle" id="' + circles[i] +
            //     '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="30"/>';
            //
            //     svg += circleString;
            //
            //     let textString = '<text id="' + circles[i] + '-text" x="65" y="60"></text>';
            //
            //     svg += textString;
            // };

            for (var circle in circles){
                let circleString = '<circle class="legend-circle" id="' + circle + '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="30"/>';
                svg += circleString;

                let textString = '<text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';
                svg += textString;
            }

            // close the svg string
            svg += "</svg>";

            $(container).append(svg);



            return container;
        }
    });

    map.addControl(new LegendControl());
    updateLegend(map, attributes, year);
};

function getCircleValues(map, attributes, year) {
    let min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        if (layer.feature){
            let state = layer.feature.properties.state;
            let attribute = 'total';
            let attributeValue = Number(attributes[state][year][attribute]);

            // test for min and max
            if (0 < attributeValue < min){
                min = attributeValue;
            };

            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    let mean = (max + min) / 2;

    return {
        max: max,
        mean: mean,
        min: min
    };
};

function updateLegend(map, attributes, year) {
    let content = "Total power generation (GWh)";

    $('#temporal-legend').html(content);

    let circleValues = getCircleValues(map, attributes, year);

    for (var key in circleValues){
        let radius = calcPropRadius(circleValues[key]);

        // assign the cy and r attributes
        $('#'+key).attr({
            cy: 59 - radius,
            r: radius
        });

        // add legend text
        let legendText = numberWithCommas(Math.round(circleValues[key]/1000000)*1000) + " GWh";
        $('#'+key+'-text').text(legendText);
    };
};

$(document).ready(createMap);
