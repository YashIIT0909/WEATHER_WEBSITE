// // Replace these values with your actual URL and key
const geoApiUrl = "https://api.openweathermap.org/geo/1.0/direct";  // API to get latitude and longitude by city
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather";  // API to get weather by latitude and longitude
const apiKey = "e1eedaf26f67ab38837e46700964e56f";


const cities = ["New York", "London",  "Paris", "Mumbai", "Sydney"];
async function getCoordinates(city, cityId = null) {
    try {
        const url = `${geoApiUrl}?q=${city}&appid=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        const { lat, lon } = data[0];
        // Call getWeather with obtained coordinates
        getWeather(lat, lon, city, cityId);
        getForecast(lat, lon);

    } catch (error) {
        console.error("Error fetching coordinates:", error);
        displayError("Could not retrieve coordinates. Please try again.");
    }
}

// Function to fetch weather data based on latitude and longitude
async function getWeather(lat, lon, city, cityId = null) {
    try {
        const url = `${weatherApiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        displayWeather(data, city, cityId);

    } catch (error) {
        console.error("Error fetching weather data:", error);
        displayError("Could not retrieve weather data. Please try again.");
    }
}

function displayError(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.innerHTML = message;
    errorMessageElement.style.display = 'block';
}

function displayWeather(data, city, cityId = null) {


    const tempInCelsius = data.main.temp - 273.15
    const min_tempInCelsius = data.main.temp_min - 273.15;
    const max_tempInCelsius = data.main.temp_max - 273.15;
    const feels_like = data.main.feels_like - 273.15;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
    if (cityId) {
        // For predefined cities, update specific elements
        document.getElementById(`temp-${cityId}`).innerHTML = `${tempInCelsius.toFixed(2)}`;
        document.getElementById(`min_temp-${cityId}`).innerHTML = `${min_tempInCelsius.toFixed(2)}`;
        document.getElementById(`max_temp-${cityId}`).innerHTML = `${max_tempInCelsius.toFixed(2)}`;
        document.getElementById(`feels_like-${cityId}`).innerHTML = `${feels_like.toFixed(2)}`
        document.getElementById(`humidity-${cityId}`).innerHTML = `${data.main.humidity}`
        document.getElementById(`sunrise-${cityId}`).innerHTML = `${sunrise}`;
        document.getElementById(`sunset-${cityId}`).innerHTML = `${sunset}`;
        document.getElementById(`wind_degrees-${cityId}`).innerHTML = `${data.wind.deg}`;
        document.getElementById(`wind_speed-${cityId}`).innerHTML = `${data.wind.speed}`;

    }

    else {
        document.getElementById("weather_city").innerHTML = `${data.name}`
        document.getElementById("temp").innerHTML = `${tempInCelsius.toFixed(2)}`
        document.getElementById("min_temp").innerHTML = `${min_tempInCelsius.toFixed(2)}`
        document.getElementById("max_temp").innerHTML = `${max_tempInCelsius.toFixed(2)}`
        document.getElementById("feels_like").innerHTML = `${feels_like.toFixed(2)}`
        document.getElementById("wind_speed").innerHTML = `${data.wind.speed}`
        document.getElementById("humidity").innerHTML = `${data.main.humidity}`
        document.getElementById("weather-detail").innerHTML = `${data.weather[0].main}`
        document.getElementById("sunrise").innerHTML = ` ${sunrise}`;
        document.getElementById("sunset").innerHTML = `${sunset}`;

        const weatherIconElement = document.getElementById('weather-icon');
        weatherIconElement.src = iconUrl;


        const windDirection = getWindDirection(data.wind.deg);
        function getWindDirection(degree) {
            const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
            const index = Math.round(degree / 45) % 8;
            return directions[index];
        }
        document.getElementById("wind_direction").innerHTML = `${data.wind.deg}° (${windDirection})`

        document.getElementById('initial-msg').style.display = 'none';
        document.getElementById('final-msg').style.display = 'block';

    }


}


document.addEventListener('DOMContentLoaded', () => {


    document.getElementById('initial-msg').style.display = 'flex';
    document.getElementById('final-msg').style.display = 'none';

    const addToFavoritesButton = document.getElementById('add-to-favorites');
    const favoritesList = document.getElementById('favorites-list');
    const favoritesButton = document.getElementById('favorites-button');
    const favoritesDropdown = document.querySelector('.favorites-dropdown');

    let favorites = [];

    function updateDropdown() {
        const dropdownContent = document.getElementById('dropdown-content');
        const noCitiesMessage = document.getElementById('no-cities');
        const favoritesList = document.createElement('div'); // Container for favorites

        // Clear existing content
        dropdownContent.innerHTML = '';
        dropdownContent.appendChild(noCitiesMessage); // Add "No cities added" message

        if (favorites.length === 0) {
            // If no favorites, show the message
            const noCitiesMessage = document.createElement('div');
            noCitiesMessage.innerText = 'No cities added';
            noCitiesMessage.classList.add('no-cities');
            dropdownContent.appendChild(noCitiesMessage);
        } else {
            // If there are favorites, hide the message


            // Create and append favorite city items
            favorites.forEach(city => {
                const cityItem = document.createElement('div');
                cityItem.innerText = city; // Set city name
                favoritesList.appendChild(cityItem); // Add to favorites list
            });
            dropdownContent.appendChild(favoritesList); // Add the list to dropdown
        }

        // Show the dropdown
        dropdownContent.style.display = 'block';
    }

    loadFavorites();

    favoritesButton.addEventListener('click', () => {
        const dropdown = document.querySelector('.favorites-dropdown');
        dropdown.classList.toggle('active');
    });

    // Add current city to favorites when "Add to Favorites" is clicked
    addToFavoritesButton.addEventListener('click', () => {
        const city_fav = document.getElementById('city').value;

        if (city_fav && !isFavorite(city_fav)) {
            saveFavorite(city_fav);
            addFavoriteToDropdown(city_fav);
            updateDropdown();
        }

    });

    // Check if a city is already in favorites
    function isFavorite(city_fav) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        return favorites.includes(city_fav);
    }

    // Save favorite city to local storage
    function saveFavorite(city_fav) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites.push(city_fav);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    // Load favorites from local storage and populate dropdown
    function loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites.forEach(city_fav => addFavoriteToDropdown(city_fav));
    }

    // Add favorite city to dropdown list
    function addFavoriteToDropdown(city_fav) {
        const listItem = document.createElement('li');
        listItem.textContent = city_fav;
        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-button');
        removeButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the click event from firing on the list item
            removeFavorite(city);
            favoritesList.removeChild(listItem); // Remove the list item from the dropdown
        });
        const removeIcon = document.createElement('img');
        removeIcon.src = 'public/images/cross.png'; // Path to your remove icon image
        removeIcon.alt = 'Remove';
        removeIcon.classList.add('remove-icon');
        removeButton.appendChild(removeIcon);
        listItem.appendChild(removeButton);
        listItem.addEventListener('click', () => {
            // Trigger search for this city when clicked
            getCoordinates(city_fav);
        });
        favoritesList.appendChild(listItem);

        function removeFavorite(city) {
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const updatedFavorites = favorites.filter(favorite => favorite !== city);
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        }
    }

    window.addEventListener('click', (event) => {
        if (!favoritesDropdown.contains(event.target)) {
            favoritesDropdown.classList.remove('active');
        }
    });

    
    cities.forEach((city, index) => {
        const cityId = `city${index + 1}`;
        getCoordinates(city, cityId);
    });
    document.getElementById('search-button').addEventListener('click', async (event) => {
        event.preventDefault();
        const city = document.getElementById('city').value;
        const cityNameElement = document.getElementById('weather_city');
        const temperatureElement = document.getElementById('temp');
        const minTemperatureElement = document.getElementById('min_temp');
        const maxTemperatureElement = document.getElementById('max_temp');
        const feelsLikeElement = document.getElementById('feels_like');
        const windSpeedElement = document.getElementById('wind_speed');
        const windDirectionElement = document.getElementById('wind_direction');
        const errorMessageElement = document.getElementById('error-message');

        // Clear previous data
        cityNameElement.innerHTML = '';
        temperatureElement.innerHTML = '';
        minTemperatureElement.innerHTML = '';
        maxTemperatureElement.innerHTML = '';
        feelsLikeElement.innerHTML = '';
        windSpeedElement.innerHTML = '';
        windDirectionElement.innerHTML = '';
        errorMessageElement.innerHTML = '';

        if (!city) {
            errorMessageElement.innerHTML = 'Please enter a city name.';
            return;
        }

        try {
            getCoordinates(city)

        } catch (error) {
            errorMessageElement.innerHTML = error.message;
        }
    });
});

async function getForecast(lat, lon) {
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    try {
        const response = await fetch(forecastApiUrl);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        displayForecast(data); // Pass data to displayForecast function for rendering

    } catch (error) {
        console.error("Error fetching forecast data:", error);
        displayError("Could not retrieve forecast data. Please try again.");
    }
}

function displayForecast(data) {
    const forecastTableBody = document.getElementById("forecast-table-body");
    forecastTableBody.innerHTML = ''; // Clear previous data

    const dailyForecasts = {};

    data.list.forEach((entry) => {
        const dateObj = new Date(entry.dt * 1000);
        const dayName = dateObj.toLocaleDateString("en-US", { weekday: 'long' });
        const fullDate = dateObj.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
        const displayDate = `${dayName}, ${fullDate}`;

        if (!dailyForecasts[displayDate]) {
            dailyForecasts[displayDate] = [];
        }
        dailyForecasts[displayDate].push(entry);
    });

    for (const [displayDate, forecasts] of Object.entries(dailyForecasts)) {
        const avgTemp = forecasts.reduce((sum, forecast) => sum + forecast.main.temp, 0) / forecasts.length;
        const avgTempCelsius = (avgTemp - 273.15).toFixed(2);
        const { main } = forecasts[0].weather[0];

        // Create a new row for each day’s forecast
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${displayDate.split(',')[0]}</td>
            <td>${displayDate.split(',')[1].trim()}</td>
            <td>${avgTempCelsius} °C</td>
            <td>${main}</td>
        `;
        forecastTableBody.appendChild(row);
    }
}

