document.addEventListener("DOMContentLoaded", function () {
  // Configuration
  const API_KEY = "51ec62d7c829a2af2bcabd204c07f8df";
  const VISUAL_CROSSING_API_KEY = "XPDWMFLLBP68RHYZXHG7CUXBQ"; // Free tier: 1000 requests/day
  const GEOLOCATION_TIMEOUT = 10000;

  // State
  let currentLocation = "";
  let currentWeatherData = null;
  let currentForecastData = null;
  let settings = {
    tempUnit: "metric",
    windUnit: "kmh",
    pressureUnit: "hpa",
    notifications: false,
    theme: "dark",
  };

  // Load settings from localStorage
  loadSettings();

  // DOM Elements
  const locationInput = document.getElementById("location-input");
  const searchBtn = document.getElementById("search-btn");
  const currentLocationBtn = document.getElementById("current-location-btn");
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");
  const closeSettingsBtn = document.getElementById("close-settings");

  const currentLocationEl = document.getElementById("current-location");
  const currentDateEl = document.getElementById("current-date");
  const currentWeatherIcon = document.getElementById("current-weather-icon");
  const currentWeatherDesc = document.getElementById("current-weather-desc");
  const currentTemp = document.getElementById("current-temp");
  const currentHigh = document.getElementById("current-high");
  const currentLow = document.getElementById("current-low");
  const currentFeelsLike = document.getElementById("current-feels-like");
  const currentWind = document.getElementById("current-wind");
  const currentHumidity = document.getElementById("current-humidity");
  const currentPressure = document.getElementById("current-pressure");
  const currentVisibility = document.getElementById("current-visibility");
  const currentClouds = document.getElementById("current-clouds");
  const windDirection = document.getElementById("wind-direction");
  const weatherAlerts = document.getElementById("weather-alerts");

  const forecastContainer = document.getElementById("forecast-container");
  const historicalContainer = document.getElementById("historical-container");
  const aiAnalysisContent = document.getElementById("ai-analysis-content");

  // Theme Management
  const themeButtons = document.querySelectorAll(".theme-btn");
  themeButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const theme = this.getAttribute("data-theme");
      setTheme(theme);
    });
  });

  function setTheme(theme) {
    settings.theme = theme;
    document.body.setAttribute("data-theme", theme);
    document.body.className = theme === "dark" ? "dark-mode" : "";

    themeButtons.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-theme") === theme) {
        btn.classList.add("active");
      }
    });

    saveSettings();
  }

  // Initialize theme
  setTheme(settings.theme);

  // Settings Modal
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      settingsModal.classList.add("show");
    });
  }

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener("click", () => {
      settingsModal.classList.remove("show");
    });
  }

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove("show");
    }
  });

  // Settings event listeners
  document.querySelectorAll('input[name="temp-unit"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      settings.tempUnit = this.value;
      saveSettings();
      if (currentWeatherData) {
        updateDisplayWithSettings();
      }
    });
  });

  document.querySelectorAll('input[name="wind-unit"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      settings.windUnit = this.value;
      saveSettings();
      if (currentWeatherData) {
        updateDisplayWithSettings();
      }
    });
  });

  document.querySelectorAll('input[name="pressure-unit"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      settings.pressureUnit = this.value;
      saveSettings();
      if (currentWeatherData) {
        updateDisplayWithSettings();
      }
    });
  });

  document
    .getElementById("enable-notifications")
    ?.addEventListener("change", function () {
      settings.notifications = this.checked;
      saveSettings();
      if (this.checked) {
        requestNotificationPermission();
      }
    });

  // Search functionality
  searchBtn.addEventListener("click", function () {
    fetchWeatherData();
  });

  locationInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      fetchWeatherData();
    }
  });

  if (currentLocationBtn) {
    currentLocationBtn.addEventListener("click", getUserLocation);
  }

  document
    .getElementById("capital-cities")
    .addEventListener("change", function () {
      if (this.value) {
        locationInput.value = this.value;
        fetchWeatherData(this.value);
      }
    });

  // Initialize
  setTimeout(() => {
    requestLocationPermission();
  }, 1000);

  function loadSettings() {
    const saved = localStorage.getItem("weatherAppSettings");
    if (saved) {
      settings = { ...settings, ...JSON.parse(saved) };

      // Apply saved settings to UI
      document
        .querySelector(`input[name="temp-unit"][value="${settings.tempUnit}"]`)
        ?.setAttribute("checked", "checked");
      document
        .querySelector(`input[name="wind-unit"][value="${settings.windUnit}"]`)
        ?.setAttribute("checked", "checked");
      document
        .querySelector(
          `input[name="pressure-unit"][value="${settings.pressureUnit}"]`
        )
        ?.setAttribute("checked", "checked");
      if (document.getElementById("enable-notifications")) {
        document.getElementById("enable-notifications").checked =
          settings.notifications;
      }
    }
  }

  function saveSettings() {
    localStorage.setItem("weatherAppSettings", JSON.stringify(settings));
  }

  function requestLocationPermission() {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.");
      showToast("Geolocation not supported. Using default location.");
      fetchWeatherData("Dhaka");
      return;
    }
    showLocationPermissionRequest();
  }

  function showLocationPermissionRequest() {
    const permissionHTML = `
            <div class="location-permission-overlay" id="location-permission-overlay">
                <div class="location-permission-card">
                    <div class="permission-icon">
                        <i class="fas fa-location-dot"></i>
                    </div>
                    <h3>Enable Location Access</h3>
                    <p>Get accurate weather information for your current location</p>
                    <div class="permission-buttons">
                        <button class="permission-btn allow-btn" id="allow-location">
                            <i class="fas fa-check"></i> Allow Location Access
                        </button>
                        <button class="permission-btn deny-btn" id="deny-location">
                            <i class="fas fa-times"></i> Not Now
                        </button>
                    </div>
                </div>
            </div>
        `;

    document.body.insertAdjacentHTML("beforeend", permissionHTML);

    document
      .getElementById("allow-location")
      .addEventListener("click", getUserLocation);
    document
      .getElementById("deny-location")
      .addEventListener("click", function () {
        hideLocationPermission();
        showToast("Using default location: Dhaka");
        fetchWeatherData("Dhaka");
      });
  }

  function getUserLocation() {
    hideLocationPermission();
    showLoading();
    currentLocationEl.textContent = "Detecting your location...";

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: GEOLOCATION_TIMEOUT,
      maximumAge: 5 * 60 * 1000,
    };

    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
  }

  function geoSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data && data.length > 0) {
          const cityName = data[0].name;
          fetchWeatherData(cityName);
        } else {
          throw new Error("Could not determine location name");
        }
      })
      .catch((error) => {
        console.error("Reverse geocoding error:", error);
        fetchWeatherByCoords(latitude, longitude);
      });
  }

  function fetchWeatherByCoords(lat, lon) {
    const units = settings.tempUnit;
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.cod === 200) {
          currentWeatherData = data;
          displayCurrentWeather(data);
          return fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
          );
        }
        throw new Error(data.message);
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.cod === "200") {
          currentForecastData = data;
          displayForecast(data);
          return fetchHistoricalData();
        }
        throw new Error(data.message);
      })
      .then((historicalData) => {
        displayHistoricalData(historicalData);
        generateAIAnalysis();
      })
      .catch((error) => {
        console.error("Error:", error);
        showToast("Location detection failed. Using default location.");
        fetchWeatherData("Dhaka");
      });
  }

  function geoError(error) {
    console.warn("Geolocation error:", error);

    switch (error.code) {
      case error.PERMISSION_DENIED:
        showToast("Location access denied. Using default location.");
        break;
      case error.POSITION_UNAVAILABLE:
        showToast("Location information unavailable. Using default location.");
        break;
      case error.TIMEOUT:
        showToast("Location request timed out. Using default location.");
        break;
      default:
        showToast("Could not get your location. Using default location.");
        break;
    }

    fetchWeatherData("Dhaka");
  }

  function hideLocationPermission() {
    const overlay = document.getElementById("location-permission-overlay");
    if (overlay) {
      overlay.remove();
    }
  }

  function showToast(message) {
    const existingToast = document.getElementById("location-toast");
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.id = "location-toast";
    toast.className = "location-toast";
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  function fetchWeatherData(location) {
    const loc = location || locationInput.value;
    if (!loc) return;

    currentLocation = loc;
    locationInput.value = loc;

    showLoading();

    const units = settings.tempUnit;
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${loc}&units=${units}&appid=${API_KEY}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.cod !== 200) {
          throw new Error(data.message);
        }
        currentWeatherData = data;
        displayCurrentWeather(data);
        return fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${loc}&units=${units}&appid=${API_KEY}`
        );
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.cod !== "200") {
          throw new Error(data.message);
        }
        currentForecastData = data;
        displayForecast(data);
        return fetchHistoricalData();
      })
      .then((historicalData) => {
        displayHistoricalData(historicalData);
        generateAIAnalysis();
      })
      .catch((error) => {
        console.error("Error:", error);
        showToast("Error: " + error.message);
      });
  }

  function fetchHistoricalData() {
    // Get dates for past 2 days
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const startDate = formatDate(twoDaysAgo);
    const endDate = formatDate(yesterday);

    // Use Visual Crossing Weather API for historical data
    const unitGroup = settings.tempUnit === "imperial" ? "us" : "metric";
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
      currentLocation
    )}/${startDate}/${endDate}?unitGroup=${unitGroup}&key=${VISUAL_CROSSING_API_KEY}&contentType=json`;

    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Historical data not available");
        }
        return response.json();
      })
      .then((data) => {
        const historicalData = data.days.map((day) => {
          return {
            date: new Date(day.datetime).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            temp: Math.round(day.temp),
            tempMax: Math.round(day.tempmax),
            tempMin: Math.round(day.tempmin),
            icon: getWeatherIconFromCondition(day.icon),
            description: day.conditions,
            humidity: day.humidity,
            windSpeed: day.windspeed,
          };
        });
        return historicalData;
      })
      .catch((error) => {
        console.error("Error fetching historical data:", error);
        // Fallback to showing message instead of fake data
        return [];
      });
  }

  function getWeatherIconFromCondition(condition) {
    // Map Visual Crossing icons to Font Awesome icons
    const iconMap = {
      snow: "fa-snowflake",
      rain: "fa-cloud-rain",
      fog: "fa-smog",
      wind: "fa-wind",
      cloudy: "fa-cloud",
      "partly-cloudy-day": "fa-cloud-sun",
      "partly-cloudy-night": "fa-cloud-moon",
      "clear-day": "fa-sun",
      "clear-night": "fa-moon",
    };
    return iconMap[condition] || "fa-cloud";
  }

  function showLoading() {
    currentLocationEl.textContent = "Loading...";
    currentDateEl.textContent = "-- -- ----";
    currentWeatherIcon.className = "fas fa-spinner fa-spin";
    currentWeatherDesc.textContent = "--";
    currentTemp.textContent = "--°";
    currentHigh.textContent = "H: --°";
    currentLow.textContent = "L: --°";
    if (currentFeelsLike) currentFeelsLike.textContent = "--°";
    currentWind.textContent = "-- km/h";
    currentHumidity.textContent = "--%";
    currentPressure.textContent = "-- hPa";
    if (currentVisibility) currentVisibility.textContent = "-- km";
    if (currentClouds) currentClouds.textContent = "--%";

    forecastContainer.innerHTML = "";
    historicalContainer.innerHTML = "";

    aiAnalysisContent.innerHTML = `
            <div class="ai-loading">
                <div class="ai-loader"></div>
                <p>Analyzing weather patterns...</p>
            </div>
        `;
  }

  function displayCurrentWeather(data) {
    currentLocationEl.textContent = `${data.name}, ${data.sys.country}`;
    currentDateEl.textContent = new Date(data.dt * 1000).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    const weather = data.weather[0];
    currentWeatherIcon.className = getWeatherIcon(weather.id);
    currentWeatherDesc.textContent = weather.description;

    // Temperature display
    currentTemp.textContent = formatTemperature(data.main.temp);
    currentHigh.textContent = `H: ${formatTemperature(data.main.temp_max)}`;
    currentLow.textContent = `L: ${formatTemperature(data.main.temp_min)}`;
    if (currentFeelsLike) {
      currentFeelsLike.textContent = formatTemperature(data.main.feels_like);
    }

    // Wind display
    currentWind.textContent = formatWindSpeed(data.wind.speed);
    if (windDirection && data.wind.deg !== undefined) {
      windDirection.style.transform = `rotate(${data.wind.deg}deg)`;
    }

    // Other metrics
    currentHumidity.textContent = `${data.main.humidity}%`;
    currentPressure.textContent = formatPressure(data.main.pressure);

    if (currentVisibility && data.visibility) {
      currentVisibility.textContent = `${(data.visibility / 1000).toFixed(
        1
      )} km`;
    }

    if (currentClouds && data.clouds) {
      currentClouds.textContent = `${data.clouds.all}%`;
    }

    // Check for weather alerts
    checkWeatherAlerts(data);
  }

  function formatTemperature(temp) {
    const rounded = Math.round(temp);
    if (settings.tempUnit === "kelvin") {
      return `${rounded} K`;
    } else if (settings.tempUnit === "imperial") {
      return `${rounded}°F`;
    } else {
      return `${rounded}°C`;
    }
  }

  function formatWindSpeed(speedMs) {
    let speed;
    let unit;

    if (settings.windUnit === "mph") {
      speed = (speedMs * 2.237).toFixed(1);
      unit = "mph";
    } else if (settings.windUnit === "ms") {
      speed = speedMs.toFixed(1);
      unit = "m/s";
    } else {
      speed = (speedMs * 3.6).toFixed(1);
      unit = "km/h";
    }

    return `${speed} ${unit}`;
  }

  function formatPressure(pressureHpa) {
    let pressure;
    let unit;

    if (settings.pressureUnit === "inhg") {
      pressure = (pressureHpa * 0.02953).toFixed(2);
      unit = "inHg";
    } else if (settings.pressureUnit === "mmhg") {
      pressure = (pressureHpa * 0.75006).toFixed(0);
      unit = "mmHg";
    } else {
      pressure = pressureHpa;
      unit = "hPa";
    }

    return `${pressure} ${unit}`;
  }

  function checkWeatherAlerts(data) {
    if (!weatherAlerts) return;

    weatherAlerts.innerHTML = "";
    const alerts = [];

    // Temperature alerts
    const temp = data.main.temp;
    const feelsLike = data.main.feels_like;

    if (settings.tempUnit === "metric") {
      if (temp > 35) {
        alerts.push({
          type: "danger",
          icon: "fa-temperature-high",
          title: "Extreme Heat Warning",
          message:
            "Temperature is dangerously high. Stay hydrated and avoid prolonged sun exposure.",
        });
      } else if (temp < 0) {
        alerts.push({
          type: "warning",
          icon: "fa-temperature-low",
          title: "Freezing Temperature",
          message:
            "Temperature is below freezing. Dress warmly and be cautious of ice.",
        });
      }

      if (Math.abs(temp - feelsLike) > 5) {
        alerts.push({
          type: "info",
          icon: "fa-temperature-half",
          title: "Feels Like Alert",
          message: `Feels like ${formatTemperature(feelsLike)} due to ${
            feelsLike > temp ? "humidity" : "wind chill"
          }.`,
        });
      }
    }

    // Weather condition alerts
    const weatherId = data.weather[0].id;
    if (weatherId >= 200 && weatherId < 300) {
      alerts.push({
        type: "danger",
        icon: "fa-bolt",
        title: "Thunderstorm Alert",
        message:
          "Thunderstorm conditions detected. Seek shelter and avoid outdoor activities.",
      });
    } else if (weatherId >= 500 && weatherId < 600) {
      alerts.push({
        type: "warning",
        icon: "fa-umbrella",
        title: "Rain Alert",
        message: "Rain expected. Don't forget your umbrella!",
      });
    } else if (weatherId >= 600 && weatherId < 700) {
      alerts.push({
        type: "warning",
        icon: "fa-snowflake",
        title: "Snow Alert",
        message: "Snow conditions. Drive carefully and dress warmly.",
      });
    }

    // Wind alerts
    const windSpeed = data.wind.speed * 3.6; // Convert to km/h
    if (windSpeed > 50) {
      alerts.push({
        type: "warning",
        icon: "fa-wind",
        title: "High Wind Warning",
        message:
          "Strong winds detected. Secure loose objects and be cautious outdoors.",
      });
    }

    // Display alerts
    alerts.forEach((alert) => {
      const alertEl = document.createElement("div");
      alertEl.className = `alert alert-${alert.type}`;
      alertEl.innerHTML = `
                <i class="fas ${alert.icon}"></i>
                <div class="alert-content">
                    <h4>${alert.title}</h4>
                    <p>${alert.message}</p>
                </div>
            `;
      weatherAlerts.appendChild(alertEl);
    });

    // Send notification if enabled
    if (settings.notifications && alerts.length > 0) {
      sendNotification(alerts[0]);
    }
  }

  function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  function sendNotification(alert) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(alert.title, {
        body: alert.message,
        icon: "/favicon-32x32.png",
      });
    }
  }

  function getWeatherIcon(weatherId) {
    if (weatherId >= 200 && weatherId < 300) {
      return "fas fa-bolt";
    } else if (weatherId >= 300 && weatherId < 400) {
      return "fas fa-cloud-rain";
    } else if (weatherId >= 500 && weatherId < 600) {
      return "fas fa-umbrella";
    } else if (weatherId >= 600 && weatherId < 700) {
      return "fas fa-snowflake";
    } else if (weatherId >= 700 && weatherId < 800) {
      return "fas fa-smog";
    } else if (weatherId === 800) {
      return "fas fa-sun";
    } else if (weatherId > 800 && weatherId < 900) {
      return "fas fa-cloud";
    } else {
      return "fas fa-question";
    }
  }

  function displayForecast(data) {
    forecastContainer.innerHTML = "";

    const dailyForecast = {};
    data.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyForecast[date]) {
        dailyForecast[date] = [];
      }
      dailyForecast[date].push(item);
    });

    let count = 0;
    for (const date in dailyForecast) {
      if (count >= 5) break;

      const dayData = dailyForecast[date];
      const dayTemp =
        dayData.reduce((sum, item) => sum + item.main.temp, 0) / dayData.length;
      const maxTemp = Math.max(...dayData.map((item) => item.main.temp_max));
      const minTemp = Math.min(...dayData.map((item) => item.main.temp_min));
      const weather = dayData[Math.floor(dayData.length / 2)].weather[0];

      const dayName = new Date(dayData[0].dt * 1000).toLocaleDateString(
        "en-US",
        { weekday: "short" }
      );
      const fullDate = new Date(dayData[0].dt * 1000).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" }
      );

      const forecastCard = document.createElement("div");
      forecastCard.className = "forecast-card";
      forecastCard.innerHTML = `
                <h3>${dayName}</h3>
                <p style="font-size: 0.8rem; color: var(--secondary-color);">${fullDate}</p>
                <i class="fas ${getWeatherIcon(weather.id)}"></i>
                <p>${weather.description}</p>
                <div class="forecast-temp">
                    <span>${formatTemperature(maxTemp)}</span>
                    <span>${formatTemperature(minTemp)}</span>
                </div>
            `;

      // Add tooltip
      forecastCard.title = `${weather.description} - High: ${formatTemperature(
        maxTemp
      )}, Low: ${formatTemperature(minTemp)}`;

      forecastContainer.appendChild(forecastCard);
      count++;
    }
  }

  function displayHistoricalData(data) {
    historicalContainer.innerHTML = "";

    if (!data || data.length === 0) {
      historicalContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--secondary-color);">
                    <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>Historical data not available</p>
                </div>
            `;
      return;
    }

    data.forEach((day) => {
      const historicalCard = document.createElement("div");
      historicalCard.className = "historical-card";
      historicalCard.innerHTML = `
                <h3>${day.date}</h3>
                <i class="fas ${day.icon}"></i>
                <p>${day.description}</p>
                <div class="historical-temp">
                    <span>${formatTemperature(day.temp)}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--secondary-color); margin-top: 5px;">
                    H: ${formatTemperature(
                      day.tempMax
                    )} / L: ${formatTemperature(day.tempMin)}
                </div>
            `;

      // Add tooltip with more details
      historicalCard.title = `${day.description}\nHumidity: ${
        day.humidity
      }%\nWind: ${formatWindSpeed(day.windSpeed)}`;

      historicalContainer.appendChild(historicalCard);
    });
  }

  function generateAIAnalysis() {
    setTimeout(() => {
      if (!currentWeatherData || !currentForecastData) return;

      const temp = currentWeatherData.main.temp;
      const humidity = currentWeatherData.main.humidity;
      const windSpeed = currentWeatherData.wind.speed * 3.6;
      const weatherId = currentWeatherData.weather[0].id;

      // AI-powered suggestions
      const suggestions = [];

      // Temperature-based suggestions
      if (settings.tempUnit === "metric") {
        if (temp > 30) {
          suggestions.push(
            "🌡️ It's hot outside! Stay hydrated and wear light, breathable clothing."
          );
        } else if (temp < 10) {
          suggestions.push(
            "🧥 Bundle up! Wear warm layers and don't forget your coat."
          );
        } else if (temp >= 15 && temp <= 25) {
          suggestions.push("👌 Perfect weather for outdoor activities!");
        }
      }

      // Weather condition suggestions
      if (weatherId >= 500 && weatherId < 600) {
        suggestions.push("☔ Bring an umbrella - rain is expected!");
      } else if (weatherId >= 600 && weatherId < 700) {
        suggestions.push(
          "❄️ Snow expected - drive carefully and wear appropriate footwear."
        );
      } else if (weatherId === 800) {
        suggestions.push("☀️ Clear skies ahead - great day for outdoor plans!");
      }

      // Humidity suggestions
      if (humidity > 80) {
        suggestions.push("💧 High humidity - it might feel muggy outside.");
      } else if (humidity < 30) {
        suggestions.push(
          "🏜️ Low humidity - stay moisturized and drink plenty of water."
        );
      }

      // Wind suggestions
      if (windSpeed > 40) {
        suggestions.push(
          "💨 Windy conditions - secure loose items and be cautious."
        );
      }

      // UV index suggestion (simulated)
      const hour = new Date().getHours();
      if (hour >= 10 && hour <= 16 && weatherId === 800) {
        suggestions.push(
          "🕶️ Peak sun hours - apply sunscreen and wear sunglasses."
        );
      }

      // Trend analysis
      const forecastTemps = currentForecastData.list
        .slice(0, 8)
        .map((item) => item.main.temp);
      const avgFutureTemp =
        forecastTemps.reduce((a, b) => a + b, 0) / forecastTemps.length;
      const tempTrend = avgFutureTemp > temp ? "warming up" : "cooling down";

      const analysisText = `
                <h3>🤖 AI Weather Insights for ${currentLocation}</h3>
                <p><strong>Current Conditions:</strong> ${
                  currentWeatherData.weather[0].description
                } with ${formatTemperature(temp)}.</p>
                <p><strong>Trend Analysis:</strong> Temperatures are ${tempTrend} over the next 24 hours.</p>
                <p><strong>Comfort Level:</strong> ${getComfortLevel(
                  temp,
                  humidity
                )}</p>
                
                <div class="ai-tip">
                    <i class="fas fa-lightbulb"></i>
                    <div>
                        <strong>Smart Suggestions:</strong>
                        <ul style="margin: 10px 0 0 20px; text-align: left;">
                            ${suggestions.map((s) => `<li>${s}</li>`).join("")}
                        </ul>
                    </div>
                </div>
            `;

      aiAnalysisContent.innerHTML = analysisText;
    }, 1500);
  }

  function getComfortLevel(temp, humidity) {
    if (settings.tempUnit === "metric") {
      if (temp >= 20 && temp <= 26 && humidity >= 30 && humidity <= 60) {
        return "😊 Comfortable - Ideal conditions!";
      } else if (temp > 30 || humidity > 80) {
        return "🥵 Uncomfortable - Hot and/or humid.";
      } else if (temp < 10) {
        return "🥶 Cold - Dress warmly.";
      } else {
        return "😐 Moderate - Adjust clothing as needed.";
      }
    }
    return "Moderate";
  }

  function updateDisplayWithSettings() {
    if (currentWeatherData) {
      displayCurrentWeather(currentWeatherData);
    }
    if (currentForecastData) {
      displayForecast(currentForecastData);
    }
  }
});
