// weather api key, url endpoint, data to exclude, and the format for temperature readings
const weatherApiKey = '53e1e7843fc1d6369bac03c02fcac7b6';
const weatherUrl = 'https://api.darksky.net/forecast/';
const exclude = '?exclude=timezone,minutely,hourly,daily,alerts,flags';
const unit = '?units=us';
// google geocode api key and url endpoint
const googleApiKey = 'AIzaSyAI0_jCUhdgUTq0jQrIhvz6CMFNhz4fC_w';
const geoLocateUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
// youtube api key
const youtubeApiKey = 'AIzaSyC5x9nqIu0ewUIFXR3Fh-aWFRkqhXN5A54';
// variables to store user's geolocation
let lat;
let lng;
let city;
// variable to store current weather icon to match current weather
let currentIcon;
// variable to store current clothing icon to match current weather
let outfit;
// icons to match the weather
const weatherIcons = {
  'clear-day': 'src="images/icons/clear-day.png"',
  'clear-night': 'src="images/icons/clear-night.png"',
  rain: 'src="images/icons/rain.png"',
  snow: 'src="images/icons/snow.png"',
  sleet: 'src="images/icons/sleet.png"',
  wind: 'src="images/icons/wind.png"',
  fog: 'src="images/icons/fog.png"',
  cloudy: 'src="images/icons/cloudy.png"',
  'partly-cloudy-day': 'src="images/icons/partly-cloudy-day.png"',
  'partly-cloudy-night': 'src="images/icons/partly-cloudy-night.png"'
};
// icons of 'what to wear'
const closet = {
  jacket: 'src="images/clothes/jacket.png"',
  snowcoat: 'src="images/clothes/snowcoat.png"',
  raincoat: 'src="images/clothes/raincoat.png"',
  summer: 'src="images/clothes/summer.png"'
};

// uses google's geocoding api to convert user's query into latitude and longitude coordinates
function geocode(location, fn) {
  const settings = {
    url: geoLocateUrl,
    data: {
      key: googleApiKey,
      address: location
    },
    crossDomain: true,
    type: 'GET',
    success: fn
  };
  $.ajax(settings);
}

// uses darksky.net's api to return weather forcast information for user's coordinates
function getWeatherData(fn) {
  const settings = {
    url: `${weatherUrl}${weatherApiKey}/${lat},${lng}${exclude}${unit}`,
    dataType: 'jsonp',
    crossDomain: true,
    type: 'GET',
    success: fn,
    error: function() {
      $('#weatherResults').html('Sorry! No results found for that location.');
    }
  };
  $.ajax(settings);
}

// uses youtube api to return videos with titles that relate to current weather summary
function youtubeData(weather, fn) {
  const settings = {
    url: 'https://www.googleapis.com/youtube/v3/search',
    dataType: 'json',
    data: {
      part: 'snippet',
      key: youtubeApiKey,
      q: `${weather} music instrumental in:name`
    },
    type: 'GET',
    success: fn
  };
  $.ajax(settings);
}

// gives 'lat' and 'long' variables the value of google's returned coordinates
function setUserLocation(position) {
  lat = position.results[0].geometry.location.lat;
  lng = position.results[0].geometry.location.lng;
  city = position.results[0].address_components[0].long_name;
  getWeatherData(weatherResults);
}

// appends weather data results to the page
function weatherResults(weather) {
  let icon = weather.currently.icon;
  let temp = Math.round(weather.currently.temperature);
  let summary = weather.currently.summary;
  if (weatherIcons.hasOwnProperty(icon)) {
    currentIcon = weatherIcons[icon];
  }
  youtubeData(summary, youtubeLink);
  $('#results').append(
    `<h3 class="fugaz">${city}</h3>
    <h4>${temp}˚F</h4>
    <img ${currentIcon} class="picture">
    <p>${summary}</p>`
  );
  chooseClothes(icon, temp);
}

// determines which clothing icon to append to the page
function chooseClothes(weather, temp) {
  if (weather === 'rain' || weather === 'fog') {
    outfit = closet.raincoat;
  } else if (weather === 'snow' || weather === 'sleet' || temp < 45) {
    outfit = closet.snowcoat;
  } else if (weather === 'wind' || temp < 55) {
    outfit = closet.jacket;
  } else {
    outfit = closet.summer;
  }
  $('#results').append(`<img ${outfit} class="picture">`);
}

// appends youtube link to the page
function youtubeLink(data) {
  $('#results').append(
    `<a href="https://www.youtube.com/watch?v=${
      data.items[0].id.videoId
    }" target="_blank">${data.items[0].snippet.title}</a>
    <div id="ytplayer">
      <iframe type="text/html" width="640" height="360"
      src="https://www.youtube.com/embed/${
        data.items[0].id.videoId
      }?autoplay=1&origin=http://example.com"
      frameborder="0"></iframe>
    </div>`
  );
}

// sends search bar string to geocode function once clicked
function submitCity() {
  $('#cityForm').submit(function(event) {
    event.preventDefault();
    $('#results').empty();
    let city = $('#city').val();
    geocode(city, setUserLocation);
  });
}

$(submitCity);
