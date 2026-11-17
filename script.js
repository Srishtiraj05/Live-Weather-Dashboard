const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const status = document.getElementById("status");

const currentWeather = document.getElementById("currentWeather");
const forecastSection = document.getElementById("forecastSection");

const weatherDescriptions = {
    0: ["Clear Sky", "☀️"],
    1: ["Mainly Clear", "🌤️"],
    2: ["Partly Cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Foggy", "🌫️"],
    48: ["Foggy", "🌫️"],
    51: ["Light Drizzle", "🌦️"],
    53: ["Drizzle", "🌧️"],
    55: ["Heavy Drizzle", "🌧️"],
    61: ["Light Rain", "🌦️"],
    63: ["Rain", "🌧️"],
    65: ["Heavy Rain", "🌧️"],
    71: ["Light Snow", "🌨️"],
    73: ["Snow", "❄️"],
    75: ["Heavy Snow", "❄️"],
    80: ["Rain Showers", "🌦️"],
    81: ["Rain Showers", "🌧️"],
    82: ["Heavy Rain Showers", "🌧️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm", "⛈️"],
    99: ["Heavy Thunderstorm", "⛈️"]
};

// Find city using Geocoding API
async function findCity(name) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Search service is not responding.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Please try another city.");
    }

    return data.results[0];
}


// Fetch weather information
async function getWeather(lat, lon) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&forecast_days=5&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Could not load weather data.");
    }

    return await response.json();
}


// Display current weather
function displayCurrentWeather(city, weather) {

    const current = weather.current;

    const code = current.weather_code;

    const description =
        weatherDescriptions[code] || ["Unknown", "🌡️"];

    document.getElementById("cityName").textContent =
        `${city.name}, ${city.country}`;

    document.getElementById("temperature").textContent =
        `${Math.round(current.temperature_2m)}°C`;

    document.getElementById("weatherIcon").textContent =
        description[1];

    document.getElementById("weatherDescription").textContent =
        description[0];

    document.getElementById("date").textContent =
        new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });

    currentWeather.classList.remove("hidden");
}


// Display five-day forecast
function displayForecast(weather) {

    const forecast = document.getElementById("forecast");

    forecast.innerHTML = "";

    const daily = weather.daily;

    daily.time.forEach((date, index) => {

        const code = daily.weather_code[index];

        const description =
            weatherDescriptions[code] || ["Unknown", "🌡️"];

        const card = document.createElement("div");

        card.className = "forecast-card";

        const day = new Date(date + "T12:00:00")
            .toLocaleDateString("en-IN", {
                weekday: "short"
            });

        const dayName = document.createElement("h3");
        dayName.textContent = day;

        const icon = document.createElement("div");
        icon.className = "forecast-icon";
        icon.textContent = description[1];

        const condition = document.createElement("p");
        condition.textContent = description[0];

        const max = document.createElement("p");
        max.textContent =
            `Max: ${Math.round(daily.temperature_2m_max[index])}°C`;

        const min = document.createElement("p");
        min.textContent =
            `Min: ${Math.round(daily.temperature_2m_min[index])}°C`;

        card.append(dayName, icon, condition, max, min);

        forecast.appendChild(card);

    });

    forecastSection.classList.remove("hidden");
}


// Handle search form
form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const cityName = cityInput.value.trim();

    if (!cityName) {
        status.textContent = "Please enter a city name.";
        return;
    }

    searchBtn.disabled = true;
    status.textContent = "Loading weather data...";

    currentWeather.classList.add("hidden");
    forecastSection.classList.add("hidden");

    try {

        const city = await findCity(cityName);

        const weather = await getWeather(
            city.latitude,
            city.longitude
        );

        displayCurrentWeather(city, weather);

        displayForecast(weather);

        status.textContent = "Weather updated successfully!";

        localStorage.setItem("lastCity", city.name);

    }

    catch(error) {

        status.textContent = error.message;

    }

    finally {

        searchBtn.disabled = false;

    }

});


// Load last searched city
window.addEventListener("load", function() {

    const lastCity = localStorage.getItem("lastCity");

    if (lastCity) {

        cityInput.value = lastCity;

        form.dispatchEvent(
            new Event("submit", { cancelable: true })
        );

    }

});