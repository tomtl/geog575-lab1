/* Example from Leaflet GeoJSON tutorial*/

// L.map is The central class of the API — it is used to create a map on a page and manipulate it.
// setView Sets the view of the map (geographical center and zoom) with the given animation options.
let map = L.map('mapid').setView([39.756, -104.994], 13);

// L.tileLayer is Used to load and display tile layers on the map.
// addTo Adds the layer to the given map or layer group.
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);

// bindPopup Binds a popup to the layer with the passed content and sets up the necessary event listeners.
function onEachFeature(feature, layer) {
  if (feature.properties && feature.properties.popupContent) {
    layer.bindPopup(feature.properties.popupContent);
  }
}

// points
let geojsonFeature = [{
    "type": "Feature",
    "properties": {
      "name": "Coors Field",
      "amenity": "Baseball stadium",
      "popupContent": "This is where the Rockies play!",
      "show_on_map": true
    },
    "geometry": {
      "type": "Point",
      "coordinates": [-104.99404, 39.75621]
    }
  }, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

let geojsonMarkerOptions = {
  radius: 8,
  fillColor: "#ff7800",
  color: "#000",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.8
};

// L.geoJSON Creates a GeoJSON layer. Optionally accepts an object in GeoJSON format to display on the map
// L.circleMarker Instantiates a circle marker object given a geographical point, and an optional options object.
L.geoJSON(geojsonFeature, {
  pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng, geojsonMarkerOptions);
  },
  filter: function(feature, layer) {
    return feature.properties.show_on_map;
  },
  onEachFeature: onEachFeature
}).addTo(map);

// lines
let myLines = [{
  "type": "LineString",
  "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
  "type": "LineString",
  "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

let myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);

// polygons
let states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);
