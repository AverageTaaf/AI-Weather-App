document.addEventListener("DOMContentLoaded", function () {
  // Log browser info for debugging
  console.log("Browser:", navigator.userAgent);
  console.log("Weatherify app initializing...");

  // Global error handler for uncaught errors
  window.addEventListener("error", function (e) {
    console.error("Global error caught:", e.error);
  });

  // Check for required browser features
  if (!window.fetch) {
    alert(
      "Your browser doesn't support required features. Please update your browser or use a modern browser like Chrome, Firefox, or Edge."
    );
    return;
  }

  // Opera GX specific check
  const isOperaGX =
    navigator.userAgent.includes("OPR") ||
    navigator.userAgent.includes("Opera");
  if (isOperaGX) {
    console.log("Opera GX detected - applying compatibility fixes");
  }

  // Configuration
  const API_KEY = "51ec62d7c829a2af2bcabd204c07f8df";
  const GEOLOCATION_TIMEOUT = 10000;

  // State
  let currentLocation = "";
  let currentWeatherData = null;
  let currentForecastData = null;
  let currentCoords = null;
  let savedLocations = [];

  let settings = {
    tempUnit: "metric",
    windUnit: "kmh",
    pressureUnit: "hpa",
    notifications: false,
    theme: "dark",
  };

  // Load settings and saved locations
  loadSettings();
  loadSavedLocations();

  // DOM Elements
  const locationInput = document.getElementById("location-input");
  const searchBtn = document.getElementById("search-btn");
  const currentLocationBtn = document.getElementById("current-location-btn");
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");
  const closeSettingsBtn = document.getElementById("close-settings");
  const addLocationBtn = document.getElementById("add-location-btn");
  const savedLocationsList = document.getElementById("saved-locations-list");

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
  const aiAnalysisContent = document.getElementById("ai-analysis-content");

  // New elements
  const sunriseTime = document.getElementById("sunrise-time");
  const sunsetTime = document.getElementById("sunset-time");
  const uvIndex = document.getElementById("uv-index");
  const aqiValue = document.getElementById("aqi-value");
  const hourlyForecastContainer = document.getElementById(
    "hourly-forecast-container"
  );
  const weatherComparisonContainer =
    document.getElementById("weather-comparison");

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

  settingsModal?.addEventListener("click", (e) => {
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
        showToast("Temperature unit updated!");
      }
    });
  });

  document.querySelectorAll('input[name="wind-unit"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      settings.windUnit = this.value;
      saveSettings();
      if (currentWeatherData) {
        updateDisplayWithSettings();
        showToast("Wind speed unit updated!");
      }
    });
  });

  document.querySelectorAll('input[name="pressure-unit"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      settings.pressureUnit = this.value;
      saveSettings();
      if (currentWeatherData) {
        updateDisplayWithSettings();
        showToast("Pressure unit updated!");
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

  // Saved Locations Management
  if (addLocationBtn) {
    addLocationBtn.addEventListener("click", () => {
      if (currentLocation && currentWeatherData) {
        addSavedLocation(currentLocation, currentWeatherData);
      } else {
        showToast("Please search for a location first");
      }
    });
  }

  function loadSavedLocations() {
    const saved = localStorage.getItem("savedLocations");
    if (saved) {
      savedLocations = JSON.parse(saved);
      displaySavedLocations();
    }
  }

  function addSavedLocation(location, weatherData) {
    // Check if already saved
    if (savedLocations.some((loc) => loc.name === location)) {
      showToast("Location already saved!");
      return;
    }

    // Limit to 10 locations
    if (savedLocations.length >= 10) {
      showToast("Maximum 10 locations allowed. Remove one first.");
      return;
    }

    savedLocations.push({
      name: location,
      temp: weatherData.main.temp, // Store raw temp value for proper unit conversion
      icon: weatherData.weather[0].id,
      timestamp: Date.now(),
    });

    localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
    displaySavedLocations();
    showToast(`${location} added to saved locations!`);
  }

  function removeSavedLocation(index) {
    savedLocations.splice(index, 1);
    localStorage.setItem("savedLocations", JSON.stringify(savedLocations));
    displaySavedLocations();
    showToast("Location removed");
  }

  function displaySavedLocations() {
    if (!savedLocationsList) return;

    if (savedLocations.length === 0) {
      savedLocationsList.innerHTML =
        '<p class="no-locations">No saved locations yet. Add your first location!</p>';
      return;
    }

    savedLocationsList.innerHTML = savedLocations
      .map(
        (loc, index) => `
      <div class="saved-location-card" data-location="${loc.name}">
        <div class="saved-location-info">
          <i class="fas ${getWeatherIconClass(loc.icon)}"></i>
          <div>
            <strong>${loc.name}</strong>
            <span>${formatTemperature(loc.temp)}</span>
          </div>
        </div>
        <button class="remove-location-btn" data-index="${index}" title="Remove">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `
      )
      .join("");

    // Add click handlers
    document.querySelectorAll(".saved-location-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (!e.target.closest(".remove-location-btn")) {
          const location = card.getAttribute("data-location");
          fetchWeatherData(location);
        }
      });
    });

    document.querySelectorAll(".remove-location-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute("data-index"));
        removeSavedLocation(index);
      });
    });
  }

  function getWeatherIconClass(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return "fa-bolt";
    if (weatherId >= 300 && weatherId < 400) return "fa-cloud-rain";
    if (weatherId >= 500 && weatherId < 600) return "fa-umbrella";
    if (weatherId >= 600 && weatherId < 700) return "fa-snowflake";
    if (weatherId >= 700 && weatherId < 800) return "fa-smog";
    if (weatherId === 800) return "fa-sun";
    if (weatherId > 800) return "fa-cloud";
    return "fa-question";
  }

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
    ?.addEventListener("change", function () {
      if (this.value) {
        locationInput.value = this.value;
        fetchWeatherData(this.value);
      }
    });

  // Initialize - with Opera GX compatibility
  // Opera GX sometimes needs more time to initialize
  const initDelay = isOperaGX ? 2000 : 1000;

  setTimeout(() => {
    requestLocationPermission();
  }, initDelay);

  function loadSettings() {
    const saved = localStorage.getItem("weatherAppSettings");
    if (saved) {
      settings = { ...settings, ...JSON.parse(saved) };

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

    // Opera GX sometimes has issues with the permission overlay
    // Try to show it, but if it fails, fall back to default location
    try {
      showLocationPermissionRequest();
    } catch (error) {
      console.error("Error showing location permission:", error);
      fetchWeatherData("Dhaka");
    }
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

    try {
      document.body.insertAdjacentHTML("beforeend", permissionHTML);

      const allowBtn = document.getElementById("allow-location");
      const denyBtn = document.getElementById("deny-location");

      if (allowBtn) {
        allowBtn.addEventListener("click", getUserLocation);
      }

      if (denyBtn) {
        denyBtn.addEventListener("click", function () {
          hideLocationPermission();
          showToast("Using default location: Dhaka");
          fetchWeatherData("Dhaka");
        });
      }
    } catch (error) {
      console.error("Error creating permission dialog:", error);
      // Fallback: just use default location
      fetchWeatherData("Dhaka");
    }
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
    currentCoords = { lat: latitude, lon: longitude };

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
    currentCoords = { lat, lon };
    const units = settings.tempUnit;
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.cod === 200) {
          currentWeatherData = data;
          currentLocation = data.name;
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
          displayHourlyForecast(data);
          return Promise.all([
            fetchUVIndex(lat, lon),
            fetchAirQuality(lat, lon),
          ]);
        }
        throw new Error(data.message);
      })
      .then(() => {
        displayWeatherInsights();
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
        currentCoords = { lat: data.coord.lat, lon: data.coord.lon };
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
        displayHourlyForecast(data);
        return Promise.all([
          fetchUVIndex(currentCoords.lat, currentCoords.lon),
          fetchAirQuality(currentCoords.lat, currentCoords.lon),
        ]);
      })
      .then(() => {
        displayWeatherInsights();
        generateAIAnalysis();
      })
      .catch((error) => {
        console.error("Error:", error);
        showToast("Error: " + error.message);
      });
  }

  // NEW: Fetch UV Index
  function fetchUVIndex(lat, lon) {
    if (!uvIndex) return Promise.resolve();

    return fetch(
      `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    )
      .then((response) => response.json())
      .then((data) => {
        displayUVIndex(data.value);
      })
      .catch((error) => {
        console.error("UV Index error:", error);
        if (uvIndex) uvIndex.textContent = "N/A";
      });
  }

  function displayUVIndex(value) {
    if (!uvIndex) return;

    const uv = Math.round(value);
    let level, color, recommendation;

    if (uv <= 2) {
      level = "Low";
      color = "#10b981";
      recommendation = "No protection needed";
    } else if (uv <= 5) {
      level = "Moderate";
      color = "#f59e0b";
      recommendation = "Wear sunscreen";
    } else if (uv <= 7) {
      level = "High";
      color = "#f97316";
      recommendation = "Protection essential";
    } else if (uv <= 10) {
      level = "Very High";
      color = "#ef4444";
      recommendation = "Extra protection required";
    } else {
      level = "Extreme";
      color = "#991b1b";
      recommendation = "Avoid sun exposure";
    }

    uvIndex.innerHTML = `
      <div class="uv-display" style="border-left-color: ${color}">
        <div class="uv-value" style="color: ${color}">${uv}</div>
        <div class="uv-level">${level}</div>
        <div class="uv-recommendation">${recommendation}</div>
      </div>
    `;
  }

  // NEW: Fetch Air Quality
  function fetchAirQuality(lat, lon) {
    if (!aqiValue) return Promise.resolve();

    return fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    )
      .then((response) => response.json())
      .then((data) => {
        displayAirQuality(data.list[0]);
      })
      .catch((error) => {
        console.error("Air Quality error:", error);
        if (aqiValue) aqiValue.textContent = "N/A";
      });
  }

  function displayAirQuality(data) {
    if (!aqiValue) return;

    const aqi = data.main.aqi;
    const components = data.components;

    let level, color, recommendation;

    switch (aqi) {
      case 1:
        level = "Good";
        color = "#10b981";
        recommendation = "Air quality is satisfactory";
        break;
      case 2:
        level = "Fair";
        color = "#84cc16";
        recommendation = "Acceptable air quality";
        break;
      case 3:
        level = "Moderate";
        color = "#f59e0b";
        recommendation = "Sensitive groups should limit outdoor activity";
        break;
      case 4:
        level = "Poor";
        color = "#ef4444";
        recommendation = "Everyone should limit outdoor activity";
        break;
      case 5:
        level = "Very Poor";
        color = "#991b1b";
        recommendation = "Avoid outdoor activity";
        break;
      default:
        level = "Unknown";
        color = "#6b7280";
        recommendation = "Data unavailable";
    }

    aqiValue.innerHTML = `
      <div class="aqi-display" style="border-left-color: ${color}">
        <div class="aqi-level" style="color: ${color}">${level}</div>
        <div class="aqi-recommendation">${recommendation}</div>
        <div class="aqi-components">
          <small>PM2.5: ${components.pm2_5.toFixed(
            1
          )} | PM10: ${components.pm10.toFixed(1)}</small>
        </div>
      </div>
    `;
  }

  // NEW: Display Hourly Forecast
  function displayHourlyForecast(data) {
    if (!hourlyForecastContainer) return;

    const next24Hours = data.list.slice(0, 8); // 8 * 3 hours = 24 hours

    hourlyForecastContainer.innerHTML = next24Hours
      .map((hour) => {
        const time = new Date(hour.dt * 1000);
        const timeStr = time.toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        });

        return `
        <div class="hourly-card">
          <div class="hourly-time">${timeStr}</div>
          <i class="fas ${getWeatherIcon(hour.weather[0].id)}"></i>
          <div class="hourly-temp">${formatTemperature(hour.main.temp)}</div>
          <div class="hourly-pop">${Math.round(hour.pop * 100)}%</div>
        </div>
      `;
      })
      .join("");

    // Create temperature chart with proper unit label
    createTemperatureChart(next24Hours);
  }

  function createTemperatureChart(hourlyData) {
    const canvas = document.getElementById("temp-chart");
    if (!canvas) return;

    // Check if Chart.js is loaded
    if (typeof Chart === "undefined") {
      console.warn(
        "Chart.js library not loaded. Temperature chart will be disabled."
      );
      return;
    }

    const ctx = canvas.getContext("2d");
    const labels = hourlyData.map((h) =>
      new Date(h.dt * 1000).toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      })
    );
    const temps = hourlyData.map((h) => h.main.temp);

    // Get unit label
    let unitLabel = "°C";
    if (settings.tempUnit === "imperial") {
      unitLabel = "°F";
    } else if (settings.tempUnit === "kelvin") {
      unitLabel = "K";
    }

    if (window.tempChart) {
      window.tempChart.destroy();
    }

    window.tempChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: `Temperature (${unitLabel})`,
            data: temps,
            borderColor: "rgb(249, 115, 22)",
            backgroundColor: "rgba(249, 115, 22, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.parsed.y.toFixed(1)}${unitLabel}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function (value) {
                return value.toFixed(0) + unitLabel;
              },
            },
          },
        },
      },
    });
  }

  // Weather Insights Features
  function displayWeatherInsights() {
    if (!currentWeatherData || !currentForecastData) return;

    displayFeelsLikeAnalysis();
    displayMoonPhase();
    displayBestTimes();
    displayWeatherStats();
  }

  function displayFeelsLikeAnalysis() {
    const feelsLikeContent = document.getElementById("feels-like-content");
    if (!feelsLikeContent || !currentWeatherData) return;

    const actualTemp = currentWeatherData.main.temp;
    const feelsLike = currentWeatherData.main.feels_like;
    const humidity = currentWeatherData.main.humidity;
    const windSpeed = currentWeatherData.wind.speed * 3.6;
    const difference = feelsLike - actualTemp;

    let explanation = "";
    let factor = "";

    if (Math.abs(difference) < 1) {
      explanation = "Temperature feels accurate";
      factor = "Comfortable conditions";
    } else if (difference > 0) {
      explanation = `Feels ${Math.abs(difference).toFixed(1)}° warmer`;
      if (humidity > 60) {
        factor = "High humidity makes it feel hotter";
      } else {
        factor = "Heat index effect";
      }
    } else {
      explanation = `Feels ${Math.abs(difference).toFixed(1)}° cooler`;
      if (windSpeed > 15) {
        factor = "Wind chill makes it feel colder";
      } else {
        factor = "Low humidity effect";
      }
    }

    feelsLikeContent.innerHTML = `
      <div class="feels-like-breakdown">
        <div class="feels-like-item">
          <span class="feels-like-label">Actual Temperature</span>
          <span class="feels-like-value">${formatTemperature(actualTemp)}</span>
        </div>
        <div class="feels-like-item">
          <span class="feels-like-label">Feels Like</span>
          <span class="feels-like-value">${formatTemperature(feelsLike)}</span>
        </div>
        <div class="feels-like-item">
          <span class="feels-like-label">Difference</span>
          <span class="feels-like-value" style="color: ${difference > 0 ? 'var(--danger-color)' : 'var(--primary-color)'}">
            ${explanation}
          </span>
        </div>
        <div style="padding: 10px; background: var(--bg-color); border-radius: 8px; margin-top: 5px;">
          <small style="color: var(--secondary-color);">
            <i class="fas fa-info-circle"></i> ${factor}
          </small>
        </div>
      </div>
    `;
  }

  function displayMoonPhase() {
    const moonPhaseContent = document.getElementById("moon-phase-content");
    if (!moonPhaseContent) return;

    // Calculate moon phase based on current date
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // Simplified moon phase calculation
    const c = (year - 1900) * 12.3685;
    const e = (c + month - 0.5 + day / 30) % 29.53059;
    const phase = e / 29.53059;

    let moonName, moonEmoji, illumination;

    if (phase < 0.0625 || phase >= 0.9375) {
      moonName = "New Moon";
      moonEmoji = "🌑";
      illumination = "0%";
    } else if (phase < 0.1875) {
      moonName = "Waxing Crescent";
      moonEmoji = "🌒";
      illumination = "25%";
    } else if (phase < 0.3125) {
      moonName = "First Quarter";
      moonEmoji = "🌓";
      illumination = "50%";
    } else if (phase < 0.4375) {
      moonName = "Waxing Gibbous";
      moonEmoji = "🌔";
      illumination = "75%";
    } else if (phase < 0.5625) {
      moonName = "Full Moon";
      moonEmoji = "🌕";
      illumination = "100%";
    } else if (phase < 0.6875) {
      moonName = "Waning Gibbous";
      moonEmoji = "🌖";
      illumination = "75%";
    } else if (phase < 0.8125) {
      moonName = "Last Quarter";
      moonEmoji = "🌗";
      illumination = "50%";
    } else {
      moonName = "Waning Crescent";
      moonEmoji = "🌘";
      illumination = "25%";
    }

    moonPhaseContent.innerHTML = `
      <div class="moon-phase-display">
        <div class="moon-icon">${moonEmoji}</div>
        <div class="moon-name">${moonName}</div>
        <div class="moon-illumination">Illumination: ${illumination}</div>
        <div style="margin-top: 15px; padding: 10px; background: var(--bg-color); border-radius: 8px;">
          <small style="color: var(--secondary-color);">
            ${getMoonPhaseInfo(moonName)}
          </small>
        </div>
      </div>
    `;
  }

  function getMoonPhaseInfo(phaseName) {
    const info = {
      "New Moon": "Perfect for stargazing - darkest night sky",
      "Waxing Crescent": "Good time to start new projects",
      "First Quarter": "Half moon visible in evening sky",
      "Waxing Gibbous": "Almost full - bright nights ahead",
      "Full Moon": "Brightest night - great for night photography",
      "Waning Gibbous": "Still bright - visible late at night",
      "Last Quarter": "Half moon visible in morning sky",
      "Waning Crescent": "Fading moon - darker nights coming"
    };
    return info[phaseName] || "Observe the moon tonight!";
  }

  function displayBestTimes() {
    const bestTimeContent = document.getElementById("best-time-content");
    if (!bestTimeContent || !currentWeatherData || !currentForecastData) return;

    const sunrise = new Date(currentWeatherData.sys.sunrise * 1000);
    const sunset = new Date(currentWeatherData.sys.sunset * 1000);
    
    // Find best times from hourly forecast
    const next24Hours = currentForecastData.list.slice(0, 8);
    const temps = next24Hours.map(h => h.main.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    
    const warmestHour = next24Hours[temps.indexOf(maxTemp)];
    const coolestHour = next24Hours[temps.indexOf(minTemp)];

    bestTimeContent.innerHTML = `
      <div class="best-time-list">
        <div class="time-recommendation">
          <i class="fas fa-sunrise"></i>
          <div class="time-info">
            <div class="time-label">Sunrise</div>
            <div class="time-value">${sunrise.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
          </div>
        </div>
        
        <div class="time-recommendation">
          <i class="fas fa-sunset"></i>
          <div class="time-info">
            <div class="time-label">Sunset</div>
            <div class="time-value">${sunset.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
          </div>
        </div>
        
        <div class="time-recommendation">
          <i class="fas fa-temperature-high"></i>
          <div class="time-info">
            <div class="time-label">Warmest Time</div>
            <div class="time-value">${new Date(warmestHour.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })} - ${formatTemperature(maxTemp)}</div>
          </div>
        </div>
        
        <div class="time-recommendation">
          <i class="fas fa-temperature-low"></i>
          <div class="time-info">
            <div class="time-label">Coolest Time</div>
            <div class="time-value">${new Date(coolestHour.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })} - ${formatTemperature(minTemp)}</div>
          </div>
        </div>
      </div>
    `;
  }

  function displayWeatherStats() {
    const statsContent = document.getElementById("weather-stats-content");
    if (!statsContent || !currentWeatherData || !currentForecastData) return;

    const daylight = currentWeatherData.sys.sunset - currentWeatherData.sys.sunrise;
    const daylightHours = Math.floor(daylight / 3600);
    const daylightMinutes = Math.floor((daylight % 3600) / 60);

    // Calculate average from forecast
    const next24Hours = currentForecastData.list.slice(0, 8);
    const avgTemp = next24Hours.reduce((sum, h) => sum + h.main.temp, 0) / next24Hours.length;
    const avgHumidity = next24Hours.reduce((sum, h) => sum + h.main.humidity, 0) / next24Hours.length;

    statsContent.innerHTML = `
      <div class="weather-stat-item">
        <span class="stat-label">
          <i class="fas fa-sun"></i> Daylight Duration
        </span>
        <span class="stat-value">${daylightHours}h ${daylightMinutes}m</span>
      </div>
      
      <div class="weather-stat-item">
        <span class="stat-label">
          <i class="fas fa-temperature-half"></i> 24h Avg Temp
        </span>
        <span class="stat-value">${formatTemperature(avgTemp)}</span>
      </div>
      
      <div class="weather-stat-item">
        <span class="stat-label">
          <i class="fas fa-tint"></i> 24h Avg Humidity
        </span>
        <span class="stat-value">${Math.round(avgHumidity)}%</span>
      </div>
      
      <div class="weather-stat-item">
        <span class="stat-label">
          <i class="fas fa-eye"></i> Visibility
        </span>
        <span class="stat-value">${(currentWeatherData.visibility / 1000).toFixed(1)} km</span>
      </div>
    `;
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

    currentTemp.textContent = formatTemperature(data.main.temp);
    currentHigh.textContent = `H: ${formatTemperature(data.main.temp_max)}`;
    currentLow.textContent = `L: ${formatTemperature(data.main.temp_min)}`;
    if (currentFeelsLike) {
      currentFeelsLike.textContent = formatTemperature(data.main.feels_like);
    }

    currentWind.textContent = formatWindSpeed(data.wind.speed);
    if (windDirection && data.wind.deg !== undefined) {
      windDirection.style.transform = `rotate(${data.wind.deg}deg)`;
    }

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

    // Display sunrise/sunset
    if (sunriseTime && data.sys.sunrise) {
      const sunrise = new Date(data.sys.sunrise * 1000);
      sunriseTime.textContent = sunrise.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    if (sunsetTime && data.sys.sunset) {
      const sunset = new Date(data.sys.sunset * 1000);
      sunsetTime.textContent = sunset.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

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

    const windSpeed = data.wind.speed * 3.6;
    if (windSpeed > 50) {
      alerts.push({
        type: "warning",
        icon: "fa-wind",
        title: "High Wind Warning",
        message:
          "Strong winds detected. Secure loose objects and be cautious outdoors.",
      });
    }

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

      forecastCard.title = `${weather.description} - High: ${formatTemperature(
        maxTemp
      )}, Low: ${formatTemperature(minTemp)}`;

      forecastContainer.appendChild(forecastCard);
      count++;
    }
  }

  function generateAIAnalysis() {
    setTimeout(() => {
      if (!currentWeatherData || !currentForecastData) return;

      const temp = currentWeatherData.main.temp;
      const humidity = currentWeatherData.main.humidity;
      const windSpeed = currentWeatherData.wind.speed * 3.6;
      const weatherId = currentWeatherData.weather[0].id;

      const suggestions = [];

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

      if (weatherId >= 500 && weatherId < 600) {
        suggestions.push("☔ Bring an umbrella - rain is expected!");
      } else if (weatherId >= 600 && weatherId < 700) {
        suggestions.push(
          "❄️ Snow expected - drive carefully and wear appropriate footwear."
        );
      } else if (weatherId === 800) {
        suggestions.push("☀️ Clear skies ahead - great day for outdoor plans!");
      }

      if (humidity > 80) {
        suggestions.push("💧 High humidity - it might feel muggy outside.");
      } else if (humidity < 30) {
        suggestions.push(
          "🏜️ Low humidity - stay moisturized and drink plenty of water."
        );
      }

      if (windSpeed > 40) {
        suggestions.push(
          "💨 Windy conditions - secure loose items and be cautious."
        );
      }

      const hour = new Date().getHours();
      if (hour >= 10 && hour <= 16 && weatherId === 800) {
        suggestions.push(
          "🕶️ Peak sun hours - apply sunscreen and wear sunglasses."
        );
      }

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
      displayHourlyForecast(currentForecastData);
    }
    // Update saved locations display with new temperature format
    displaySavedLocations();
    // Update weather insights with new units
    if (currentWeatherData && currentForecastData) {
      displayWeatherInsights();
      generateAIAnalysis();
    }
  }
});
