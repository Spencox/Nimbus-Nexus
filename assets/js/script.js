// api calls to openweather
const APIKey = "553d60d891527f3f60c3b1e4bb0f053b"

// DOM selectors
const searchFormEl = $('#search-city');
const searchInputEl = $('#search-input');
// current weather DOM selectors
const currentWeatherChildren = $('#current-weather [id]');
const backgroundMainEl = $('body');


// array of elements
const currentWeatherElArr = []

// helper function to get current time
function getTime() {
var currentDay = dayjs().format('MM/DD/YYYY');
return currentDay
}

// kelvin to fahrenheit 
function cToF(degK) {
return Math.round((degK-273.15) * (9/5) + 32);
}

// icon url builder
function buildIconUrl(iconRef) {
return `https://openweathermap.org/img/wn/${iconRef}@2x.png`
}

// change background night and day
function nightOrDayBackground() {
    let currentTime = dayjs().format('HH');
    let dayOrNight = (currentTime >= 6 && currentTime <= 18) ? "day" : "night"
    console.log('Current Time: ' + currentTime);
    console.log("Day or night: " + dayOrNight);
    if(dayOrNight === "day") {
        backgroundMainEl.css('background-image', 'url(./assets/images/day.jpg)')
        $('#current-weather').css('background-color' , 'white')
        $('p').css({
            'color': 'black',
            'font-size': '20px',
            'font-weight' : '600px'
        });
    } else {
        // clear css function
        backgroundMainEl.css('background-image', 'url(./assets/images/night.jpg)')
        $('p').css({
            'color': 'white',
            'font-size': '20px'
        });
        $('h2').css('color', 'white');
    }
};

// load day or night background image
window.onload = nightOrDayBackground;

// search bar input 
var searchBarInput = function (event) {
    event.preventDefault();  
    const cityName = searchInputEl.val().trim();
    if (cityName) {
        getLatLong(cityName)
            .then(function (geoData) {
                getCurrentWeather(geoData.geoLat, geoData.geoLon)
                    .then(function(currentWeatherData){
                        displayWeather(currentWeatherData, currentWeatherChildren);
                        //localStorage.setItem("Current Weather" , JSON.stringify(geoData));
                    });
            })
            .catch(function (error) {
                console.log("Error fetching geolocation data:", error);
            });
    } else {
        console.log("Could not find city")
    }
  };

  // display current weather
function displayWeather(currentWeather, elements) {
    elements.each(function(index) {
        const weatherEl = $(this);
        const weatherKeys = Object.keys(currentWeather);
        const weatherKey = weatherKeys[index];
        const weatherVal = currentWeather[weatherKey];
        if(weatherKey === "name" || weatherKey === "date") {
            weatherEl.text(weatherVal);
        } else if (weatherKey === "icon") {
            // clear previous img
            weatherEl.empty();
            //put in new image
            const iconImage = $('<img>', {
                src: weatherVal,
                alt: 'weather status icon',
                class: 'img-fluid'
            });
            weatherEl.append(iconImage);
        } else {
            weatherEl.text(weatherKeys[index] + ": " + weatherVal);
        }
    });
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
            console.log(data);
            const currentWeatherData = {
                date: getTime(),
                name: data.name,
                icon: buildIconUrl(data.weather[0].icon), 
                "Temp(F)": cToF(data.main.temp),
                "Wind Speed": data.wind.speed,
                Humidity: data.main.humidity
            }
            return currentWeatherData;
        })
}

// search event Listeners
searchFormEl.on('submit', searchBarInput);

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

