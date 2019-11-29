let restaurants,
    neighborhoods,
    cuisines;
var newMap, markers = [];

/* Fetch neighborhoods and cuisines as soon as the page is loaded. */
document.addEventListener('DOMContentLoaded', (event) => {

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./sw.js')
      .then( (registration) => {
        // Registration was successful
        console.log('ServiceWorker registered, scope: ', registration.scope);
      })
      .catch( (error) => {
        // registration failed
        console.log('ServiceWorker registration failed: ', error);
      });

  }

  initMap(); // added
  fetchNeighborhoods();
  fetchCuisines();
});

/* Fetch all neighborhoods and set their HTML*/
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { 
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/* Set neighborhoods HTML*/

fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/* Fetch all cuisines and set their HTML */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { 
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/* Set cuisines HTML */

fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/* Initialize leaflet map, called from HTML */

initMap = () => {
  self.newMap = Fo.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  Fo.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoiZG9taW5pY29tIiwiYSI6ImNqaWJ1djgxZjFtMXMzcGxndjVtY2kwNTcifQ.mSBj4uB0ilknv9tWABt8fQ',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
  document.getElementById('map').tabIndex = '-1';
};

/* Update page and map for current restaurants */

updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select'),
        nSelect = document.getElementById('neighborhoods-select'), 
        cIndex = cSelect.selectedIndex,
        nIndex = nSelect.selectedIndex,
        cuisine = cSelect[cIndex].value,
        neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { 
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};

/* Clear current restaurants, their HTML and remove their map markers */
resetRestaurants = (restaurants) => {
    
  // Remove all restaurants
    
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
    
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/* Create all restaurants HTML and add them to the webpage */

fillRestaurantsHTML = (restaurants = self.restaurants) => {
  let uL = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    uL.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/* Create restaurant HTML */

createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li'),
        linka = document.createElement('a'),
        img = document.createElement('img'),
        label = document.createElement('div'),
        name = document.createElement('h1'),
        neighborhood = document.createElement('p'),
        ads = document.createElement('p'),
        hr = document.createElement('hr'),
        rate = document.createElement('span'),
        type = document.createElement('span');


  linka.href = DBHelper.urlForRestaurant(restaurant);
  linka.className = restaurant.cuisine_type.toLowerCase();
  linka.setAttribute('aria-label', 'Details of ' + restaurant.name + ' restaurant, ' + restaurant.neighborhood);
  linka.tabIndex = '0';
  li.append(linka);
    
/* image */
    
  img.className = 'restaurant-img';
  img.src = DBHelper.imageUrlForRestaurant(restaurant);
  img.alt = 'Image of ' + restaurant.name + ' restaurant';
  link.append(img);
    
/* label */
    
  label.className = 'restaurant-label';
  link.append(label);
    
/* name */
    
  name.className = 'restaurant-name';
  name.innerHTML = restaurant.name;
  label.append(name);
    
/* Neighborhood */
    
  neighborhood.innerHTML = restaurant.neighborhood;
  label.append(neighborhood);
    
/* address */
    
  ads.className = 'restaurant-address';
  ads.innerHTML = restaurant.address;
  label.append(ads);
    
/* HR */
    
  label.append(hr);
    
/* rating */
    
  rate.className = 'rating';
  rate.innerHTML = 'Rating: ' + restaurantRating(restaurant); //'rating';
  label.append(rate);
    
/* type */
    
  type.className = 'cuisine-type';
  type.innerHTML = restaurant.cuisine_type;
  label.append(type);

  return li;
};

restaurantRating = (restaurant) => {
  let reviews = restaurant.reviews.map( (r) => r.rating);
  let rating = reviews.reduce((a, b) => a + b, 0) / reviews.length;
  rating = rating.toFixed(1);

  return rating;
};



/* Add markers for current restaurants to the map */

addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {

    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
  });
};
