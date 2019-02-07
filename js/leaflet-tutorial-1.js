/* Example from Leaflet Quick Start Guide*/

// L.map is The central class of the API — it is used to create a map on a page and manipulate it.
// setView Sets the view of the map (geographical center and zoom) with the given animation options.
let map = L.map('mapid').setView([51.505, -0.09], 13);

// L.tileLayer is Used to load and display tile layers on the map.
// addTo Adds the layer to the given map or layer group.
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);

// L.marker Instantiates a Marker object given a geographical point and optionally an options object.
let marker = L.marker([51.5, -0.09]).addTo(map);

// L.circle Instantiates a circle object given a geographical point, and an options object which contains the circle radius.
let circle = L.circle([51.508, -0.11], 500, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(map);

// L.polygon is A class for drawing polygon overlays on a map.
let polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

// bindPopup Binds a popup to the layer with the passed content and sets up the necessary event listeners.
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

// setLatLng Changes the marker position to the given point.
// setContent Sets the HTML content of the popup.
// openOn Adds the popup to the map and closes the previous one
let popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);
