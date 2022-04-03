// DOM element references
var searchInputEl=document.getElementById('city-name');
var submitBtnEl=document.getElementById('submitBtn');
var previousCityEl=document.getElementById('previous-city');
var clearPreviousBtn=document.getElementById('clear-previous');
var currentCityEl=document.getElementById('current-city');
var currentIconEl=document.getElementById('current-icon');
var currentTempEl=document.getElementById('current-temp');
var currentWindEl=document.getElementById('current-win');
var currentHumEl=document.getElementById('current-hum');
var currentUvEl=document.getElementById('current-uv');
var eachDayEl=document.getElementById('each-day');

//var dateEl=document.getElementById('date');
//var iconEl=document.getElementById('icon');
//var tempEl=document.getElementById('temp');
//var windEl=document.getElementById('win');
//var humEl=document.getElementById('hum');

// declaring glogal variables
var previousSearchesObj={};
var date = moment().format("dddd, DD MMMM YYYY");
var currentMonthAndYear = moment().format("MM/YYYY");
var currentDay = moment().format("DD");
var time = moment().format("hh:mm:ss");
var openWeatherAPIKey ='0870768a762b60884119df83a4d63126'

var geoData = {};
var city = '';

//display previous searches
if (localStorage.getItem('previousSearches')) {
    displayPrevious();}

function displayPrevious() {
    previousCityEl.innerHTML = '';
    if (JSON.parse(localStorage.getItem('previousSearches'))) {
        previousSearchesObj = JSON.parse(localStorage.getItem('previousSearches'));
    }
    for (var i in previousSearchesObj) {
        var previousCity = document.createElement('li');
        previousCity.textContent = i;
        previousCity.setAttribute('class', 'previous');
        previousCityEl.appendChild(previousCity)
    }
}

previousCityEl.addEventListener('click', getPreviousCity);
function getPreviousCity(event) {
    eachDayEl.innerHTML = '';
    city = event.target.textContent;
    getGeoCode(city);
}

// clear previous
clearPreviousBtn.addEventListener('click', clearFunc);
function clearFunc() {
    localStorage.clear();
    previousCityEl.innerHTML = '';
    location.reload();
}

// start new search
submitBtnEl.addEventListener('click', startSearch);
function startSearch(event) {
    event.preventDefault();
    if (searchInputEl.value) {
        eachDayEl.innerHTML = '';
        city = searchInputEl.value;
        getGeoCode(city);
        searchInputEl.value = '';
    } else {
        alert('Please enter a valid city');
    }
}

// Get geo code
// http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid={API key}

function getGeoCode(city) {
    
    var searchUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&appid=" + openWeatherAPIKey;
    fetch(searchUrl)
        .then(function (response) {
        if (response.status===200) {
        response.json()
        .then(function (data) {
            geoData.name = data[0].name;
            geoData.lat = data[0].lat;
            geoData.lon = data[0].lon;
            
            previousSearchesObj[city] = geoData;
            localStorage.setItem('previousSearches', JSON.stringify(previousSearchesObj));
                        
            getCurrentData(geoData)
            displayPreviousSearches()
            })} 

            else {
                alert("Error occurred, please enter valid city name");
            }
        })
       }

// Current Weather data
function getCurrentData(geoData) {
    // https://api.openweathermap.org/data/2.5/onecall?lat=33.44&lon=-94.04&exclude=hourly,daily&appid={API key}
    var searchUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + geoData.lat + "&lon=" + geoData.lon + "&appid=" + openWeatherAPIKey + "&exclude=hourly&exclude=minutely&exclude=alerts&units=metric";
    fetch(searchUrl)
    .then(function (response) {
    if (response.ok) {
        response.json()
        .then(function (data) {

        displayCurrentWeather(data);
        })}
                
    else {
            alert('Error occurred, please enter valid city name');
            }
    })
        
}

// Display current weather
function displayCurrentWeather(data) {
    
    currentCityEl.textContent = geoData.name + ' : ' + date;
    var currentIconId = data.current.weather[0].icon;
    var currentIconUrl = "https://openweathermap.org/img/wn/" + currentIconId + "@2x.png";
    currentIconEl.setAttribute("src", currentIconUrl);
    currentIconEl.setAttribute("style", "width: 50px; height:50px;");

    currentTempEl.textContent = "Temp : " + data.current.temp + " C";
    currentWindEl.textContent = "Wind : " + data.current.wind_speed + " m/s";
    currentHumEl.textContent = "Humidity : " + data.current.humidity + " %";
    currentUvEl.textContent = "UV Index : " + data.current.uvi;
    
    // UV level indicator
    var UvLevelClass = '';
    if (data.current.uvi <=2) {
        UvLevelClass = 'green';
    } else if (data.current.uvi <= 5) {
        UvLevelClass = 'yellow';
    } else if(data.current.uvi<=7) {
        UvLevelClass = 'orange';
    }
      else {
        UvLevelClass = 'red';
      }
    currentUvEl.setAttribute('class', UvLevelClass);
    
    // Next 5 days weather
    for (var i = 0; i < 5; i++) {
        var forecastDay = moment().add(i + 1, 'days').format('DD/MM/YYYY');
        var iconId = data.daily[i].weather[0].icon;
        var iconUrl = "https://openweathermap.org/img/wn/" + iconId + "@2x.png";

        var eachDayDiv = document.createElement('div');
        eachDayDiv.setAttribute('class', 'eachDayDisplay');
        var eachDate = document.createElement('h4');

        eachDate.textContent = forecastDay;
        var iconImg = document.createElement('img');
        iconImg.setAttribute('src', iconUrl);
        iconImg.setAttribute("class", "eachDayIcon");
        var weatherInfo = document.createElement('div');

        // display weather info
        weatherInfo.innerHTML = "<p> Temp : " + data.daily[i].temp.day
            + " C </p> <p> Wind : " + data.daily[i].wind_speed
            + " m/s </p> <p> Humidity : " + data.daily[i].humidity
            + " % </p>";

        eachDayDiv.appendChild(eachDate);
        eachDayDiv.appendChild(iconImg);
        eachDayDiv.appendChild(weatherInfo);
        eachDayEl.appendChild(eachDayDiv);
    }
}

