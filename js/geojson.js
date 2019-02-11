function createMap() {
  // create the map
  let map = L.map('mapid').setView([20, 0], 2);

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
    $.ajax("data/megacities.geojson", {
        dataType: "json",
        success: function(response){
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response).addTo(map);
        }
}); };
$(document).ready(createMap);
