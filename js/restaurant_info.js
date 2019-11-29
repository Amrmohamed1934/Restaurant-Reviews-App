let restaurant;
var newMap;

/* Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});

/* Initialize leaflet map */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
            center: [restaurant.latlng.lat, restaurant.latlng.lng],
            zoom: 16,
            scrollWheelZoom: true  //false
          });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiZG9taW5pY29tIiwiYSI6ImNqaWJ1djgxZjFtMXMzcGxndjVtY2kwNTcifQ.mSBj4uB0ilknv9tWABt8fQ',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
};

fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // already fetched!
    callback(null, self.restaurant);
    return;
  }
  const idu = getParameterByName('id');
  if (!idu) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(idu, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/* Create restaurant HTML and add it to the webpage */

fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name'),
        rating = document.querySelector('.rating'),
        image = document.getElementById('restaurant-img'),
        location = document.getElementById('restaurant-location'),
        address = document.getElementById('restaurant-address'),
        cuisine = document.getElementById('restaurant-cuisine');

  name.innerHTML = restaurant.name;
  name.classList.add(restaurant.cuisine_type.toLowerCase() + '-color');
    
/* rating */
    
  rating.innerHTML = 'Rating: ' + restaurantRating(restaurant); 
  rating.classList.add(restaurant.cuisine_type.toLowerCase());
    
/* image */
    
  image.className = 'restaurant-img';
  image.style.backgroundImage = `url('${DBHelper.imageUrlForRestaurant(restaurant)}')`;
  image.setAttribute('aria-label', 'Image ' + restaurant.name + ' restaurant, ');
    
//location
  location.innerHTML = restaurant.neighborhood;

/* address */
  address.innerHTML = restaurant.address;
  address.setAttribute('aria-label', 'Address: ' + restaurant.address + ', ' + restaurant.neighborhood);


/* cuisine */
  cuisine.innerHTML = restaurant.cuisine_type;
  cuisine.classList.add(restaurant.cuisine_type.toLowerCase());
  cuisine.setAttribute('aria-label', 'Cuisine type: ' + restaurant.cuisine_type);

  // Fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // Fill reviews
  fillReviewsHTML();
};

restaurantRating = (restaurant) => {
  let reviews = restaurant.reviews.map( (r) => r.rating),
      rating = reviews.reduce((a, b) => a + b, 0) / reviews.length;
  rating = rating.toFixed(1);

  return rating;
};

/* Create restaurant operating hours HTML table and add it to the webpage */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr'),
          day = document.createElement('td'),
          time = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);
    time.innerHTML = operatingHours[key];
    row.appendChild(time);
    hours.appendChild(row);
  }
};

/* Create all reviews HTML and add them to the webpage */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.querySelector('#reviews-container div');

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li'),
        heading = document.createElement('div'),
        name = document.createElement('p'),
        date = document.createElement('p'),
        rating = document.createElement('p'),
        comments = document.createElement('p');


  heading.className = 'review-heading';
  li.appendChild(heading);
  name.innerHTML = review.name;
  name.className = 'name';
  heading.appendChild(name);
  date.innerHTML = review.date;
  date.className = 'date';
  heading.appendChild(date);
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className = 'rating';
  li.appendChild(rating);
  comments.innerHTML = review.comments;
  comments.className = 'comment';
  li.appendChild(comments);

  return li;
};

/* Add restaurant name to the breadcrumb navigation menu */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb'),
        li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/* Get a parameter by name from page URL */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};
