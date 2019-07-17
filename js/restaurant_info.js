let restaurant;
var map;

/**
* Initialize Google map, called from HTML.
*/
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      let mapListener = self.map.addListener('tilesloaded', () => {
        document
        .querySelectorAll('map a')
        .forEach(t => t.setAttribute('tabindex', -1));
        document
        .querySelectorAll('map div')
        .forEach(t => t.setAttribute('tabindex', -1));
        google.maps.event.removeListener(mapListener);
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
* Get current restaurant from page URL.
*/
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
* Create restaurant HTML and add it to the webpage
*/
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.tabIndex = 0;
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.tabIndex =0;
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.tabIndex = 0;
  image.className = 'restaurant-img'
  image.alt = `Photo of ${restaurant.name}`;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
* Create restaurant operating hours HTML table and add it to the webpage.
*/
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
* Create all reviews HTML and add them to the webpage.
*/
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

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
}

/**
* Create review HTML and add it to the webpage.
*/
createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.classList.add('review');
  const div1 = document.createElement('div');
  div1.classList.add('review-header');
  li.appendChild(div1);

  const name = document.createElement("p");
  name.innerHTML = review.name;
  name.classList.add("reviewer");
  div1.appendChild(name);

  const date = document.createElement('time');
  date.innerHTML = review.date;
  date.classList.add('review-date');
  div1.appendChild(date);

  const div2 = document.createElement('div');
  div2.classList.add('review-body');
  li.appendChild(div2);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.classList.add('review-rating');
  div2.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.classList.add('review-text');
  div2.appendChild(comments);

  return li;
}

/**
* Add restaurant name to the breadcrumb navigation menu
*/
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
* Get a parameter by name from page URL.
*/
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
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/serviceWorker.js', { scope: '' })
    .then(function(reg) {
      console.log('Works!');
    })
    .catch(function(error) {
      console.log(error);
    });
}
