// api calls to openweather
const APIKey = "553d60d891527f3f60c3b1e4bb0f053b"

// DOM selectors
const searchFormEl = document.getElementById('search-city');
const searchInputEl = document.getElementById('search-input');
const currentCityEl = document.getElementById('city')

  // helper function to get current time
  function getTime() {
    var currentDay = dayjs().format('MM/DD/YYYY');
    return currentDay
  }

  // kelvin to fahrenheit 
  function cToF(degK) {
    return Math.round((degK-273.15) * (9/5) + 32);
  }

// search bar input 
var searchBarInput = function (event) {
    event.preventDefault();  
    const cityName = searchInputEl.value.trim();
    if (cityName) {
        getLatLong(cityName)
            .then(function (geoData) {
                const currentWeather = getCurrentWeather(geoData.geoLat, geoData.geoLon);
                console.log(currentWeather);
                //displayCurrentWeather(currentWeather);
                //localStorage.setItem("Current Weather" , JSON.stringify(geoData));
            })
            .catch(function (error) {
                console.log("Error fetching geolocation data:", error);
            });
    } else {
        console.log("Could not find city")
    }
  };

  // display current weather
function displayCurrentWeather(currentWeather) {
    console.log(currentWeather);
    currentCityEl.textContent(currentWeather.name)
}

// get city lat longs
function getLatLong(city) {
    const limit = 3;
    const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${limit}&appid=${APIKey}`;
    
    // return a promise
    return fetch(geocodingUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            const geoData = {
                name: data[0].name,
                state: data[0].state,
                country: data[0].country,
                geoLat: data[0].lat,
                geoLon: data[0].lon
            }
            return geoData
        })
}


// get current weather after city lat longs
function getCurrentWeather(lat, lon) {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}`;
    
    // return a promise
    return fetch(currentWeatherUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            const currentWeatherData = {
                name: data.name,
                date: getTime(),
                icon: data.weather[0].icon, 
                temp: cToF(data.main.temp),
                wind: data.wind.speed,
                humidity: data.main.humidity
            }
            return currentWeatherData;
        })
}

// search event Listeners
searchFormEl.addEventListener('submit', searchBarInput);

// construct API parameters for 5 day weather call
// const storedGeoData = JSON.parse(localStorage.getItem("Current Weather"));
// const lat = 29.7589; //storedGeoData.geoLat;
// const lon = -95.3677; //storedGeoData.geoLon;

// const forecast5dayURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}`

//console.log(forecast5dayURL);

// helper function to calculate averages
// function dailyAverage(obj) {
//     const dailyWeatherAvg = { }
//     for(let day in obj) {
//         const temp = obj[day].temperature
//         const wind = obj[day].wind
//         const humid = obj[day].humidity
//         // average temp, wind, humidity arrays and assign to return object
//         dailyWeatherAvg.tempAvg = temp.reduce((acc, temp) => acc + temp, 0) / temp.length;
//         dailyWeatherAvg.windAvg = wind.reduce((acc, wind) => acc + wind, 0) / wind.length;
//         dailyWeatherAvg.humidAvg = humid.reduce((acc, humid) => acc + humid, 0) / humid.length;
//    }
//    // TODO: Format units before returning object
//    return dailyWeatherAvg
// }

// fetch(forecast5dayURL)
//     .then(function(response) {
//         return response.json();
//     })
//     .then(function(data) {
//         const forecasts = data.list;
//         const dailyAverages = {};
//         //console.log(data);
//         forecasts.forEach(forecasts => {
//             const date = forecasts.dt_txt.split(' ')[0]; // Extract date
//             const temperature = forecasts.main.temp; // Daily temperature in Celsius
//             const wind = forecasts.wind.speed; // wind speed
//             const humidity = forecasts.main.humidity; // humidity
//             // cycle check if date not matching if so create new array if match store value
//             if(!dailyAverages[date]) {
//                 dailyAverages[date] = {
//                     temperature: [],
//                     wind: [],
//                     humidity: []
//                 }
//             };
//             // fill up object arrays
//             dailyAverages[date].temperature.push(temperature);
//             dailyAverages[date].wind.push(wind);
//             dailyAverages[date].humidity.push(humidity);
//         });
//         const averages = dailyAverage(dailyAverages);
//         console.log(averages);
//     })

