window.addEventListener('DOMContentLoaded', (event) => {
  const mapEl = document.getElementById('map');
  const locations = JSON.parse(mapEl.dataset.locations);
  const center = mapEl.dataset.center.split(' ');
  mapboxgl.accessToken = 'pk.eyJ1IjoiYXJpYW1hbiIsImEiOiJjazliaWdrNjkwNGM4M2lueTYybjVxN3dzIn0.WUAsHh_IiVgAqgM8vjBzIA';
  let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ariaman/ck9bjab7x036y1inwanyhoq8i',
    center,
    zoom: 4
  });
  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach(loc => {
    const markerEl = document.createElement('div');
    markerEl.className = 'marker';
    new mapboxgl.Marker({
      element: markerEl,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    new mapboxgl.Popup({
      offset: 10
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
    bounds.extend(loc.coordinates);
  });
  map.fitBounds(bounds, {
    padding: {
      top: 100,
      bottom: 200,
      left: 100,
      right: 100
    }
  });
});