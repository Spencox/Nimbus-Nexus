// api calls to openweather
const APIKey = "553d60d891527f3f60c3b1e4bb0f053b"

// DOM selectors
const searchFormEl = $('#search-city');
const searchInputEl = $('#search-input');
const currentWeatherChildren = $('#current-weather [id]');
const backgroundBodyEl = $('body');

// load day or night background image
window.onload = nightOrDayBackground;

// array of elements for setting weather
const currentWeatherElArr = [];
const searchHistoryArr = [];

// helper function to get current time
function getTime() {
var currentDay = dayjs().format('MM/DD/YYYY');
return currentDay
}

// kelvin to fahrenheit 
function cToF(degK) {
    return Math.round((degK-273.15) * (9/5) + 32);
}   

// convert wind speed from meters per second to miles per hour
function mpsToMph(metersPerSecond) {
    return Math.round(metersPerSecond * 2.23694);
}

// icon url builder
function buildIconUrl(iconRef) {
    return `https://openweathermap.org/img/wn/${iconRef}@2x.png`
}

// check to make sure that current search has not been searched before
function checkArr(searchHistoryArr, cityName) {
    return searchHistoryArr.some(city => city.name === cityName);
}

// populates pervious searches drop down if in localstorage
function init() {
    const previousSearches = JSON.parse(localStorage.getItem("Weather Searches"));
    if(previousSearches){
        previousSearches.forEach(search => {
            searchHistoryArr.push(search);
        })
    updateSearchHistory();
    }
}

// adds up to 7 cities in the previous searches
function updateSearchHistory() {
    $("#search-list").empty();
    if(searchHistoryArr) {
        searchHistoryArr.forEach(function(citySearched) {
            const listItem = $("<li>");
            const button = $("<button>");
            button.text(citySearched.name)
            .addClass("dropdown-item")
            .attr("type", "button");
            listItem.append(button)
            $("#search-list").append(listItem);
        });
    }    
}

// set weather search in local storage to be used when logging back in
function setStoredWeather (currentCitySearch) {
    let inSearchHistory = checkArr(searchHistoryArr, currentCitySearch.name);
    if(!inSearchHistory){
        if(searchHistoryArr.length < 7) {
            searchHistoryArr.push(currentCitySearch);
            localStorage.setItem("Weather Searches" , JSON.stringify(searchHistoryArr));
        } else {
            searchHistoryArr.pop();
            searchHistoryArr.shift(currentCitySearch); 
            localStorage.setItem("Weather Searches" , JSON.stringify(searchHistoryArr));
        }
    }
    updateSearchHistory();
}

// change background night and day
function nightOrDayBackground() {
    let currentTime = dayjs().format('HH');
    let dayOrNight = (currentTime >= 6 && currentTime <= 18) ? "day" : "night";
    if(dayOrNight === "day") {
        backgroundBodyEl.css('background-image', 'url(./assets/images/day.jpg)')
        $('p').css({
            'color': 'black',
            'font-size': '20px',
            'font-weight' : '600px'
        });
        $('.card').css('background-color','#6acafd'
        );
    } else {
        // clear css function
        backgroundBodyEl.css('background-image', 'url(./assets/images/night.jpg)')
        $('#current-weather p').css('color' , 'white')
        $('h2').css('color', 'white');
        $('.card').css({
            'background-color': 'Midnightblue',
            'color': 'white'
        });
    }
};

// performs the calls to the API's and waits for responses before next call
function search(cityName) {
    $('#intro-text').addClass('hidden');
    if (cityName) {
        getLatLong(cityName)
            .then(function (geoData) {
                setStoredWeather(geoData);
                get5DayForecast();
                getCurrentWeather(geoData.geoLat, geoData.geoLon)
                    .then(function(currentWeatherData){
                        displayWeather(currentWeatherData, currentWeatherChildren);
                    });
            })
            .catch(function (error) {
                console.log("Error fetching geolocation data:", error);
            });
    } else {
        console.log("Could not find city")
    }
}

// search bar input 
var searchBarInput = function (event) {
    event.preventDefault();  
    const cityName = searchInputEl.val().trim();
    search(cityName);
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

// get city lat longs API Call
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

// get current weather after city lat longs API call
function getCurrentWeather(lat, lon) {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}`;
    // return a promise
    return fetch(currentWeatherUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            const currentWeatherData = {
                date: getTime(),
                name: data.name,
                icon: buildIconUrl(data.weather[0].icon), 
                "Temp(F)": cToF(data.main.temp),
                "Wind Speed(MPH)": data.wind.speed,
                Humidity: data.main.humidity
            }
            return currentWeatherData;
        })
}

// take the 3 hour data and average for the day
function dailyAverage(fiveDayForecasts) {
    const dailyWeatherArr = [];
    for(const date in fiveDayForecasts) {        
        const dailyWeatherAvg = { };
        const temp = fiveDayForecasts[date]["Temp(F)"]
        const wind = fiveDayForecasts[date]["Wind Speed(MPH)"]
        const humid = fiveDayForecasts[date]["Humidity(%)"]
        // average temp, wind, humidity arrays and assign to return object
        dailyWeatherAvg.date = fiveDayForecasts[date].date;
        // set icon to daily value if exists
        const iconIndex = fiveDayForecasts[date].icon.length > 5 ? 5 : Math.floor((fiveDayForecasts[date].icon.length / 2));
        dailyWeatherAvg.icon = fiveDayForecasts[date].icon[iconIndex];
        dailyWeatherAvg["Temp(F)"] = Math.round(temp.reduce((acc, temp) => acc + temp, 0) / temp.length);
        dailyWeatherAvg["Wind Speed(MPH)"] = Math.round(wind.reduce((acc, wind) => acc + wind, 0) / wind.length);
        dailyWeatherAvg["Humidity(%)"] = Math.round(humid.reduce((acc, humid) => acc + humid, 0) / humid.length);
        // push averaged new weather object 
        dailyWeatherArr.push(dailyWeatherAvg)
    }
    return dailyWeatherArr
}

// 5 day forecast API call
function get5DayForecast() {
    $('#five-day').removeClass('hidden')
    const storedGeoData = JSON.parse(localStorage.getItem("Weather Searches"));
    const lat = storedGeoData[storedGeoData.length - 1].geoLat;
    const lon = storedGeoData[storedGeoData.length - 1].geoLon;
    
    const forecast5dayURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}`
    
    fetch(forecast5dayURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            const forecasts = data.list;
            const dailyAverages = {};
            forecasts.forEach(forecast => {
                const date = forecast.dt_txt.split(' ')[0]; // Extract date
                // get icon for 12 noon for display purposes
                const hour = dayjs(forecast.dt_txt).format("HH");
                const temperature = cToF(forecast.main.temp); // Daily temperature in Celsius
                const wind = mpsToMph(forecast.wind.speed); // wind speed
                const humidity = forecast.main.humidity; // humidity
                // cycle check if date not matching if so create new array if match store value
                if(!dailyAverages[date]) {
                    dailyAverages[date] = {
                        date: dayjs(date).format('MM/DD/YYYY'),
                        icon: [],
                        "Temp(F)": [],
                        "Wind Speed(MPH)": [],
                        "Humidity(%)": []
                    }
                };
                // fill up object arrays
                const iconImgUrl = buildIconUrl(forecast.weather[0].icon)
                dailyAverages[date].icon.push(iconImgUrl);
                dailyAverages[date]["Temp(F)"].push(temperature);
                dailyAverages[date]["Wind Speed(MPH)"].push(wind);
                dailyAverages[date]["Humidity(%)"].push(humidity);
            });
            const averages = dailyAverage(dailyAverages) 
            display5DayForecast(averages);
        })
}

// send the cards to be assigned
function display5DayForecast(fiveDayForecasts) {
    fiveDayForecasts.forEach((forecastCard, index) => {
        const cardId = "#day-" + index + " [id]";
        displayWeather(forecastCard, $(cardId));
    });
}

// search event Listeners
searchFormEl.on('submit', searchBarInput);

// search from previous 
$(".dropdown").on('click', '.dropdown-item', function() {
    search($(this).text());
  });

// initialize previous stored searches
init();