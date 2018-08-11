// object containing all variables used to store api necessary data
let TODAYSWEATHER = {
  // stores all the api keys and url endpoints
  api: {
    // google geocode api key and url endpoint
    google: {
      googleApiKey: 'AIzaSyAI0_jCUhdgUTq0jQrIhvz6CMFNhz4fC_w',
      geoLocateUrl: 'https://maps.googleapis.com/maps/api/geocode/json'
    },
    // weather api key, url endpoint, data to exclude, and the format for temperature readings
    darkSky: {
      weatherApiKey: '53e1e7843fc1d6369bac03c02fcac7b6',
      weatherUrl: 'https://api.darksky.net/forecast/',
      exclude: '?exclude=timezone,minutely,hourly,daily,alerts,flags',
      unit: '?units=us'
    },
    // youtube api key
    youtubeApiKey: 'AIzaSyC5x9nqIu0ewUIFXR3Fh-aWFRkqhXN5A54'
  },
  // variables to store user's geolocation
  userLocation: {
    lat: '',
    lng: '',
    city: ''
  },
  // variables to store current weather and clothing icons to match current weather
  current: {
    currentIcon: '',
    outfit: ''
  },
  // icons to match the weather
  weatherIcons: {
    'clear-day': 'src="images/icons/clear-day.png" alt="A shining sun"',
    'clear-night': 'src="images/icons/clear-night.png" alt="A visible moon"',
    rain: 'src="images/icons/rain.png" alt="Rain falling from a cloud"',
    snow: 'src="images/icons/snow.png" alt="A snowflake"',
    sleet: 'src="images/icons/sleet.png" alt="Icy rain falling from a cloud"',
    wind: 'src="images/icons/wind.png" alt="A gust of wind"',
    fog: 'src="images/icons/fog.png" alt="A cloud of fog"',
    cloudy: 'src="images/icons/cloudy.png" alt="A cloud"',
    'partly-cloudy-day':
      'src="images/icons/partly-cloudy-day.png" alt="A sun half-way behind a cloud"',
    'partly-cloudy-night':
      'src="images/icons/partly-cloudy-night.png" alt="A moon half-way behind a cloud"'
  },
  // icons of 'what to wear'
  closet: {
    jacket: 'src="images/clothes/jacket.png" alt="A light jacket"',
    snowcoat: 'src="images/clothes/snowcoat.png" alt="A snow coat"',
    raincoat: 'src="images/clothes/raincoat.png" alt="A rain coat"',
    summer:
      'src="images/clothes/summer.png" alt="A t-shirt and a pair of shorts"'
  }
};

// uses google's geocoding api to convert user's query into latitude and longitude coordinates
function geocode(location, fn) {
  const settings = {
    url: TODAYSWEATHER.api.google.geoLocateUrl,
    data: {
      key: TODAYSWEATHER.api.google.googleApiKey,
      address: location
    },
    crossDomain: true,
    type: 'GET',
    success: fn,
    error: function(jqXHR, status, err) {
      alert(`Geolocation not available.`);
    }
  };
  $.ajax(settings);
}

// uses darksky.net's api to return weather forcast information for user's coordinates
function getWeatherData(fn) {
  const settings = {
    url: `${TODAYSWEATHER.api.darkSky.weatherUrl}${
      TODAYSWEATHER.api.darkSky.weatherApiKey
    }/${TODAYSWEATHER.userLocation.lat},${TODAYSWEATHER.userLocation.lng}${
      TODAYSWEATHER.api.darkSky.exclude
    }${TODAYSWEATHER.api.darkSky.unit}`,
    dataType: 'jsonp',
    crossDomain: true,
    type: 'GET',
    success: fn,
    error: function(jqXHR, status, err) {
      alert(`Weather not available.`);
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
      key: TODAYSWEATHER.api.youtubeApiKey,
      q: `${weather} music instrumental in:name`
    },
    type: 'GET',
    success: fn,
    error: function(jqXHR, status, err) {
      alert(`YouTube not available.`);
    }
  };
  $.ajax(settings);
}

// gives 'lat' and 'long' variables the value of google's returned coordinates
function setUserLocation(position) {
  if (position.results.length === 0) {
    $('#results').html(
      '<p class="box">Sorry! No results were found for that location. Please search again!'
    );
  } else {
    TODAYSWEATHER.userLocation.lat = position.results[0].geometry.location.lat;
    TODAYSWEATHER.userLocation.lng = position.results[0].geometry.location.lng;
    TODAYSWEATHER.userLocation.city =
      position.results[0].address_components[0].long_name;
    getWeatherData(weatherResults);
  }
}

// appends weather data results to the page
function weatherResults(weather) {
  let icon = weather.currently.icon;
  let temp = Math.round(weather.currently.temperature);
  let summary = weather.currently.summary;
  if (TODAYSWEATHER.weatherIcons.hasOwnProperty(icon)) {
    TODAYSWEATHER.current.currentIcon = TODAYSWEATHER.weatherIcons[icon];
  } else {
    TODAYSWEATHER.current.currentIcon = weatherIcon.cloudy;
  }
  youtubeData(summary, youtubeLink);
  $('#results').append(
    `<section class="box">
    <h3 id="boxCityName" class="expanse">${TODAYSWEATHER.userLocation.city}</h3>
    <p class="boxText">${temp}˚F</p>
    <img ${TODAYSWEATHER.current.currentIcon} class="picture">
    <p class="boxText">${summary}</p>
    </section>`
  );
  chooseClothes(icon, temp);
}

// determines which clothing icon to append to the page
function chooseClothes(weather, temp) {
  if (weather === 'rain' || weather === 'fog') {
    TODAYSWEATHER.current.outfit = TODAYSWEATHER.closet.raincoat;
  } else if (weather === 'snow' || weather === 'sleet' || temp < 45) {
    TODAYSWEATHER.current.outfit = TODAYSWEATHER.closet.snowcoat;
  } else if (weather === 'wind' || temp < 55) {
    TODAYSWEATHER.current.outfit = TODAYSWEATHER.closet.jacket;
  } else {
    TODAYSWEATHER.current.outfit = TODAYSWEATHER.closet.summer;
  }
  $('#results').append(`
    <p id="boxItalic" class="boxText">You should wear:</p>
    <img ${TODAYSWEATHER.current.outfit} class="picture">
  `);
}

// appends youtube link to the page
function youtubeLink(data) {
  $('#youtubeResults').append(
    `<section class="box">
    <a class="boxText" href="https://www.youtube.com/watch?v=${
      data.items[0].id.videoId
    }" target="_blank">Mood music for your day</a>
    <div id="ytplayer">
      <iframe type="text/html" width="640" height="360"
      src="https://www.youtube.com/embed/${
        data.items[0].id.videoId
      }?autoplay=1&origin=http://example.com"
      frameborder="0"></iframe>
    </div>
    </section>`
  );
}

// sends search bar string to geocode function once clicked
function submitCity() {
  $('#cityForm').submit(function(event) {
    event.preventDefault();
    $('#results').empty();
    $('#youtubeResults').empty();
    city = $('#city').val();
    geocode(city, setUserLocation);
  });
}

$(submitCity);
