/* database helper functions */

class DBHelper {

  static get DATABASE_URL() {
    return `./data/restaurants.json`;
  }

  /* Fetch all restaurants */
    
  static fetchRestaurants(callback) {
    let xHR = new XMLHttpRequest();
    xHR.open('GET', DBHelper.DATABASE_URL);
    xHR.onload = () => {
      if (xHR.status === 200) { 
          // Got a success response from server!
        const json = JSON.parse(xHR.responseText);
        const restaurants = json.restaurants;
        callback(null, restaurants);
      } else { 
          // Got an error from server.
        const error = (`Request failed. Returned status of ${xHR.status}`);
        callback(error, null);
      }
    };
    xHR.send();
  }

  /* Fetch a restaurant by its ID */
    
  static fetchRestaurantById(id, callback) {
      
    // fetch all restaurants with proper error handling.
      
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { 
            // Got the restaurant
          callback(null, restaurant);
        } else { 
            // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /* Fetch restaurants by a cuisine type with proper error handling */
    
  static fetchRestaurantByCuisine(cuisine, callback) {
      
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const result = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, result);
      }
    });
  }

  /* Fetch restaurants by a neighborhood with proper error handling */
    
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /* Fetch restaurants by a cuisine and a neighborhood with proper error handling */
    
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { 
            // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { 
            // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /* Fetch all neighborhoods with proper error handling */
    
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((d, g) => restaurants[g].neighborhood),
              uniqueNeighborhoods = neighborhoods.filter((d, g) => neighborhoods.indexOf(d) == g);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /* Fetch all cuisines with proper error handling */
    
  static fetchCuisines(callback) {
      
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants and Remove duplicates from cuisines
        const cuisines = restaurants.map((d, g) => restaurants[g].cuisine_type),
              uniqueCuisines = cuisines.filter((d, g) => cuisines.indexOf(d) == g);
        callback(null, uniqueCuisines);
      }
    });
  }

  /* Restaurant page URL */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /* Restaurant image URL */
  static imageUrlForRestaurant(restaurant) {
    return (`./img/${restaurant.photograph}`);
  }

  /* Map marker for a restaurant */
   static mapMarkerForRestaurant(restaurant, map) {
       
    // Marker
    const markerMap = new L.markerMap([restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant),

      });
      markerMap.addTo(newMap);
    return markerMap;
  }
}
