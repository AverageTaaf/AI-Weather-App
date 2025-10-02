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

  // ConfigurationA
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
  const autocompleteDropdown = document.getElementById("autocomplete-dropdown");

  // Map variables
  let map = null;
  let marker = null;
  let areaCircle = null;

  // Weather layers map variables
  let weatherLayersMap = null;
  let currentWeatherLayer = null;
  let activeLayerType = "clouds";
  let activeLayers = [];
  let layerOpacity = 0.6;
  let animationInterval = null;
  let isAnimating = false;
  let multiLayerMode = false;

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

  // Weather Layers Map Controls
  const layerButtons = document.querySelectorAll(".layer-btn");
  const mobileLayerItems = document.querySelectorAll(".mobile-layer-item");
  const mobileLayerBtn = document.getElementById("mobile-layer-btn");
  const mobileLayerMenu = document.getElementById("mobile-layer-menu");
  const opacitySlider = document.getElementById("layer-opacity");
  const opacityValue = document.getElementById("opacity-value");
  const toggleAnimationBtn = document.getElementById("toggle-animation");
  const combineLayersBtn = document.getElementById("combine-layers");
  const layerLoading = document.getElementById("layer-loading");

  // Desktop layer buttons
  layerButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const layerType = this.getAttribute("data-layer");
      handleLayerSelection(layerType);

      if (!multiLayerMode) {
        layerButtons.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
      } else {
        this.classList.toggle("active");
      }
    });
  });

  // Mobile dropdown controls
  if (mobileLayerBtn && mobileLayerMenu) {
    mobileLayerBtn.addEventListener("click", () => {
      mobileLayerMenu.classList.toggle("show");
    });

    mobileLayerItems.forEach((item) => {
      item.addEventListener("click", function () {
        const layerType = this.getAttribute("data-layer");
        const layerName = this.textContent.trim();
        const layerIcon = this.querySelector("i").className;

        handleLayerSelection(layerType);

        // Update mobile button display
        mobileLayerBtn.querySelector("i").className = layerIcon;
        mobileLayerBtn.querySelector("span").textContent = layerName;

        // Update active state
        mobileLayerItems.forEach((i) => i.classList.remove("active"));
        this.classList.add("active");

        // Close dropdown
        mobileLayerMenu.classList.remove("show");
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".mobile-layer-selector")) {
        mobileLayerMenu.classList.remove("show");
      }
    });
  }

  // Opacity control
  if (opacitySlider && opacityValue) {
    opacitySlider.addEventListener("input", function () {
      layerOpacity = parseFloat(this.value);
      opacityValue.textContent = Math.round(layerOpacity * 100) + "%";
      updateLayerOpacity();
    });
  }

  // Animation control
  if (toggleAnimationBtn) {
    toggleAnimationBtn.addEventListener("click", toggleAnimation);
  }

  // Multi-layer control
  if (combineLayersBtn) {
    combineLayersBtn.addEventListener("click", toggleMultiLayer);
  }

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
  }

  // Search Autocomplete
  let autocompleteTimeout;
  locationInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    clearTimeout(autocompleteTimeout);

    if (query.length < 2) {
      autocompleteDropdown.classList.remove("active");
      return;
    }

    autocompleteTimeout = setTimeout(() => {
      fetchCitySuggestions(query);
    }, 300);
  });

  // Close autocomplete when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-autocomplete-wrapper")) {
      autocompleteDropdown.classList.remove("active");
    }
  });

  async function fetchCitySuggestions(query) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          query
        )}&limit=5&appid=${API_KEY}`
      );
      const cities = await response.json();

      if (cities.length > 0) {
        displayAutocomplete(cities);
      } else {
        autocompleteDropdown.classList.remove("active");
      }
    } catch (error) {
      console.error("Autocomplete error:", error);
    }
  }

  function displayAutocomplete(cities) {
    autocompleteDropdown.innerHTML = cities
      .map(
        (city) => `
        <div class="autocomplete-item" data-city="${city.name}" data-lat="${
          city.lat
        }" data-lon="${city.lon}">
          <i class="fas fa-map-marker-alt"></i>
          <div>
            <span class="autocomplete-city">${city.name}</span>
            <span class="autocomplete-country">${city.country}${
          city.state ? ", " + city.state : ""
        }</span>
          </div>
        </div>
      `
      )
      .join("");

    autocompleteDropdown.classList.add("active");

    // Add click handlers
    document.querySelectorAll(".autocomplete-item").forEach((item) => {
      item.addEventListener("click", () => {
        const cityName = item.dataset.city;
        locationInput.value = cityName;
        autocompleteDropdown.classList.remove("active");
        fetchWeatherData(cityName);
      });
    });
  }

  // Search functionality
  searchBtn.addEventListener("click", () => {
    const location = locationInput.value.trim();
    if (location) {
      autocompleteDropdown.classList.remove("active");
      fetchWeatherData(location);
    }
  });

  locationInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const location = locationInput.value.trim();
      if (location) {
        autocompleteDropdown.classList.remove("active");
        fetchWeatherData(location);
      }
    }
  });

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
        // Initialize maps with current location
        if (currentCoords) {
          initializeMap(currentCoords.lat, currentCoords.lon, currentLocation);
          initializeWeatherLayersMap(currentCoords.lat, currentCoords.lon);
        }
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
        // Initialize maps with current location
        if (currentCoords) {
          initializeMap(currentCoords.lat, currentCoords.lon, currentLocation);
          initializeWeatherLayersMap(currentCoords.lat, currentCoords.lon);
        }
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

    hourlyForecastContainer.innerHTML = "";
    const hourlyData = data.list.slice(0, 8);

    // Create additional charts
    createHumidityChart(hourlyData);
    createWindChart(hourlyData);

    hourlyData.forEach((hour) => {
      const hourlyCard = document.createElement("div");
      hourlyCard.className = "hourly-card";

      const timeStr = new Date(hour.dt * 1000).toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      });

      hourlyCard.innerHTML = `
        <div class="hourly-time">${timeStr}</div>
        <i class="fas ${getWeatherIcon(hour.weather[0].id)}"></i>
        <div class="hourly-temp">${formatTemperature(hour.main.temp)}</div>
        <div class="hourly-pop">${Math.round(hour.pop * 100)}%</div>
      `;

      hourlyForecastContainer.appendChild(hourlyCard);
    });

    // Create temperature chart with proper unit label
    createTemperatureChart(data.list.slice(0, 24));
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

  // Initialize Map with Weather Overlay
  function initializeMap(lat, lon, locationName) {
    console.log("🗺️ Initializing map for:", locationName, "at", lat, lon);

    const mapContainer = document.getElementById("location-map");
    if (!mapContainer) {
      console.error("❌ Map container #location-map not found in DOM!");
      return;
    }

    console.log("✅ Map container found:", mapContainer);
    console.log(
      "📏 Container dimensions:",
      mapContainer.offsetWidth,
      "x",
      mapContainer.offsetHeight
    );

    // Wait for Leaflet to be loaded
    if (typeof L === "undefined") {
      console.warn("⏳ Leaflet library not loaded yet. Retrying in 500ms...");

      // Show loading state only if Leaflet isn't loaded
      mapContainer.style.display = "block";
      mapContainer.style.height = "450px";
      mapContainer.style.background = "var(--card-bg)";
      mapContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; width: 100%; background: var(--card-bg); border-radius: 12px; border: 2px solid var(--primary-color);">
          <div style="text-align: center; color: var(--text-color); padding: 40px;">
            <i class="fas fa-map-marked-alt" style="font-size: 3rem; margin-bottom: 10px; color: var(--primary-color);"></i>
            <p style="font-size: 1.1rem; margin: 10px 0; font-weight: 600;">Initializing map...</p>
            <div style="width: 40px; height: 40px; border: 4px solid var(--primary-color); border-top-color: transparent; border-radius: 50%; margin: 20px auto; animation: spin 1s linear infinite;"></div>
            <p style="font-size: 0.9rem; color: var(--secondary-color); margin-top: 10px;">Loading Leaflet.js...</p>
          </div>
        </div>
      `;

      setTimeout(() => initializeMap(lat, lon, locationName), 500);
      return;
    }

    console.log("✅ Leaflet.js loaded successfully");

    // Initialize map if not already done
    if (!map) {
      // Clear loading state only when creating new map
      mapContainer.innerHTML = "";
      mapContainer.style.border = "none";

      try {
        map = L.map("location-map", {
          center: [lat, lon],
          zoom: 11,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        // Add base tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(map);

        // Add weather overlay (clouds)
        L.tileLayer(
          `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
          {
            attribution: "Weather data &copy; OpenWeatherMap",
            opacity: 0.5,
            maxZoom: 18,
          }
        ).addTo(map);

        // Add precipitation overlay
        L.tileLayer(
          `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
          {
            attribution: "Weather data &copy; OpenWeatherMap",
            opacity: 0.6,
            maxZoom: 18,
          }
        ).addTo(map);
      } catch (error) {
        console.error("Error initializing map:", error);
        mapContainer.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--danger-color);">
            <div style="text-align: center;">
              <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 10px;"></i>
              <p>Map failed to load</p>
            </div>
          </div>
        `;
        return;
      }
    } else {
      // Update existing map
      console.log("📍 Updating map to new location:", lat, lon);
      map.setView([lat, lon], 11);
    }

    // Remove old marker if exists
    if (marker) {
      console.log("🗑️ Removing old marker");
      map.removeLayer(marker);
    }

    // Remove old circle if exists
    if (areaCircle) {
      console.log("🗑️ Removing old circle");
      map.removeLayer(areaCircle);
    }

    // Create custom icon
    const weatherIcon = L.divIcon({
      className: "custom-map-marker",
      html: `
        <div style="
          background: var(--primary-color);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          border: 3px solid white;
        ">
          <i class="fas fa-map-marker-alt" style="transform: rotate(45deg); font-size: 20px;"></i>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    // Add new marker with custom icon
    marker = L.marker([lat, lon], { icon: weatherIcon }).addTo(map);

    // Create detailed popup
    const popupContent = `
      <div style="min-width: 200px; font-family: 'Poppins', sans-serif;">
        <h3 style="margin: 0 0 10px 0; color: var(--primary-color); font-size: 1.1rem;">
          <i class="fas fa-location-dot"></i> ${locationName}
        </h3>
        ${
          currentWeatherData
            ? `
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <i class="fas ${getWeatherIcon(
              currentWeatherData.weather[0].id
            )}" style="font-size: 2rem; color: var(--accent-color);"></i>
            <div>
              <div style="font-size: 1.5rem; font-weight: bold;">${formatTemperature(
                currentWeatherData.main.temp
              )}</div>
              <div style="font-size: 0.85rem; color: var(--secondary-color); text-transform: capitalize;">${
                currentWeatherData.weather[0].description
              }</div>
            </div>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-color); margin-top: 8px;">
            <div style="display: flex; justify-content: space-between; margin: 4px 0;">
              <span><i class="fas fa-wind"></i> Wind:</span>
              <span>${formatWindSpeed(currentWeatherData.wind.speed)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 4px 0;">
              <span><i class="fas fa-tint"></i> Humidity:</span>
              <span>${currentWeatherData.main.humidity}%</span>
            </div>
          </div>
        `
            : '<p style="color: var(--secondary-color);">Loading weather data...</p>'
        }
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-color); font-size: 0.75rem; color: var(--secondary-color);">
          Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}
        </div>
      </div>
    `;

    marker
      .bindPopup(popupContent, {
        maxWidth: 300,
        className: "custom-popup",
      })
      .openPopup();

    // Add circle to show area
    areaCircle = L.circle([lat, lon], {
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.1,
      radius: 5000, // 5km radius
    }).addTo(map);

    console.log("✅ Map updated successfully for:", locationName);

    // Invalidate size to fix rendering issues
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 100);
  }

  // Create Humidity Chart
  function createHumidityChart(hourlyData) {
    const canvas = document.getElementById("humidity-chart");
    if (!canvas || typeof Chart === "undefined") return;

    const ctx = canvas.getContext("2d");
    const labels = hourlyData.map((h) =>
      new Date(h.dt * 1000).toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      })
    );
    const humidity = hourlyData.map((h) => h.main.humidity);

    if (window.humidityChart) {
      window.humidityChart.destroy();
    }

    window.humidityChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Humidity (%)",
            data: humidity,
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
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
                return `${context.parsed.y}%`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + "%";
              },
            },
          },
        },
      },
    });
  }

  // Create Wind Chart
  function createWindChart(hourlyData) {
    const canvas = document.getElementById("wind-chart");
    if (!canvas || typeof Chart === "undefined") return;

    const ctx = canvas.getContext("2d");
    const labels = hourlyData.map((h) =>
      new Date(h.dt * 1000).toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true,
      })
    );
    const windSpeeds = hourlyData.map((h) => h.wind.speed * 3.6); // Convert to km/h

    if (window.windChart) {
      window.windChart.destroy();
    }

    window.windChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Wind Speed (km/h)",
            data: windSpeeds,
            borderColor: "rgb(16, 185, 129)",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
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
                return `${context.parsed.y.toFixed(1)} km/h`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return value.toFixed(0) + " km/h";
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
    displayWindCompass();
    displayPrecipitation();
    displayPressureTrend();
    displayActivityRecommendations();
    displayWeatherExtremes();
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
          <span class="feels-like-value" style="color: ${
            difference > 0 ? "var(--danger-color)" : "var(--primary-color)"
          }">
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
      "Waning Crescent": "Fading moon - darker nights coming",
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
    const temps = next24Hours.map((h) => h.main.temp);
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
            <div class="time-value">${sunrise.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}</div>
          </div>
        </div>
        
        <div class="time-recommendation">
          <i class="fas fa-sunset"></i>
          <div class="time-info">
            <div class="time-label">Sunset</div>
            <div class="time-value">${sunset.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}</div>
          </div>
        </div>
        
        <div class="time-recommendation">
          <i class="fas fa-temperature-high"></i>
          <div class="time-info">
            <div class="time-label">Warmest Time</div>
            <div class="time-value">${new Date(
              warmestHour.dt * 1000
            ).toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            })} - ${formatTemperature(maxTemp)}</div>
          </div>
        </div>
        
        <div class="time-recommendation">
          <i class="fas fa-temperature-low"></i>
          <div class="time-info">
            <div class="time-label">Coolest Time</div>
            <div class="time-value">${new Date(
              coolestHour.dt * 1000
            ).toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            })} - ${formatTemperature(minTemp)}</div>
          </div>
        </div>
      </div>
    `;
  }

  function displayWeatherStats() {
    const statsContent = document.getElementById("weather-stats-content");
    if (!statsContent || !currentWeatherData || !currentForecastData) return;

    const daylight =
      currentWeatherData.sys.sunset - currentWeatherData.sys.sunrise;
    const daylightHours = Math.floor(daylight / 3600);
    const daylightMinutes = Math.floor((daylight % 3600) / 60);

    // Calculate average from forecast
    const next24Hours = currentForecastData.list.slice(0, 8);
    const avgTemp =
      next24Hours.reduce((sum, h) => sum + h.main.temp, 0) / next24Hours.length;
    const avgHumidity =
      next24Hours.reduce((sum, h) => sum + h.main.humidity, 0) /
      next24Hours.length;

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
        <span class="stat-value">${(
          currentWeatherData.visibility / 1000
        ).toFixed(1)} km</span>
      </div>
    `;
  }

  function displayWindCompass() {
    const windCompassContent = document.getElementById("wind-compass-content");
    if (!windCompassContent || !currentWeatherData) return;

    const windDeg = currentWeatherData.wind.deg || 0;
    const windSpeed = currentWeatherData.wind.speed * 3.6;

    // Get cardinal direction
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    const index = Math.round(windDeg / 22.5) % 16;
    const direction = directions[index];

    // Wind description
    let description = "";
    if (windSpeed < 5) description = "Calm";
    else if (windSpeed < 20) description = "Light breeze";
    else if (windSpeed < 40) description = "Moderate wind";
    else if (windSpeed < 60) description = "Strong wind";
    else description = "Very strong wind";

    windCompassContent.innerHTML = `
      <div class="wind-compass">
        <div class="compass-circle">
          <div class="compass-directions">
            <span class="compass-direction north">N</span>
            <span class="compass-direction east">E</span>
            <span class="compass-direction south">S</span>
            <span class="compass-direction west">W</span>
          </div>
          <div class="compass-arrow" style="transform: translate(-50%, -50%) rotate(${windDeg}deg);">
            ↑
          </div>
        </div>
        <div class="wind-speed-display">${formatWindSpeed(
          currentWeatherData.wind.speed
        )}</div>
        <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-color); margin-top: 5px;">
          ${direction} (${windDeg}°)
        </div>
        <div class="wind-description">${description}</div>
      </div>
    `;
  }

  function displayPrecipitation() {
    const precipContent = document.getElementById("precipitation-content");
    if (!precipContent || !currentForecastData) return;

    const next8Hours = currentForecastData.list.slice(0, 8);

    precipContent.innerHTML = `
      <div class="precipitation-bars">
        ${next8Hours
          .map((hour, index) => {
            const pop = (hour.pop * 100).toFixed(0);
            const time = new Date(hour.dt * 1000).toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            });
            const height = Math.max(pop, 5); // Minimum 5% for visibility

            return `
            <div class="precip-bar" style="height: ${height}%;" title="${pop}% chance at ${time}">
              <span class="precip-value">${pop}%</span>
              <span class="precip-label">${time}</span>
            </div>
          `;
          })
          .join("")}
      </div>
      <div style="margin-top: 40px; padding: 10px; background: var(--bg-color); border-radius: 8px; text-align: center;">
        <small style="color: var(--secondary-color);">
          <i class="fas fa-info-circle"></i> Probability of precipitation over next 24 hours
        </small>
      </div>
    `;
  }

  function displayPressureTrend() {
    const pressureContent = document.getElementById("pressure-trend-content");
    if (!pressureContent || !currentWeatherData || !currentForecastData) return;

    const currentPressure = currentWeatherData.main.pressure;
    const futurePressure = currentForecastData.list[2].main.pressure; // 6 hours ahead
    const pressureDiff = futurePressure - currentPressure;

    let trend, trendClass, forecast;
    if (pressureDiff > 2) {
      trend = "Rising";
      trendClass = "rising";
      forecast = "Improving weather expected";
    } else if (pressureDiff < -2) {
      trend = "Falling";
      trendClass = "falling";
      forecast = "Weather may deteriorate";
    } else {
      trend = "Steady";
      trendClass = "steady";
      forecast = "Stable weather conditions";
    }

    const icon =
      trend === "Rising"
        ? "fa-arrow-up"
        : trend === "Falling"
        ? "fa-arrow-down"
        : "fa-equals";

    pressureContent.innerHTML = `
      <div class="pressure-display">
        <div class="pressure-value">${formatPressure(currentPressure)}</div>
        <div class="pressure-trend-indicator ${trendClass}">
          <i class="fas ${icon}"></i>
          <span>${trend}</span>
        </div>
        <div class="pressure-forecast">
          <i class="fas fa-info-circle"></i> ${forecast}
        </div>
        <div style="margin-top: 15px; font-size: 0.85rem; color: var(--secondary-color);">
          ${pressureDiff > 0 ? "+" : ""}${pressureDiff.toFixed(
      1
    )} hPa in next 6 hours
        </div>
      </div>
    `;
  }

  function displayActivityRecommendations() {
    const activityContent = document.getElementById("activity-content");
    if (!activityContent || !currentWeatherData) return;

    const temp = currentWeatherData.main.temp;
    const windSpeed = currentWeatherData.wind.speed * 3.6;
    const humidity = currentWeatherData.main.humidity;
    const weatherId = currentWeatherData.weather[0].id;
    const isRaining = weatherId >= 500 && weatherId < 600;
    const isClear = weatherId === 800;

    const activities = [
      {
        name: "Running",
        icon: "fa-running",
        score: calculateActivityScore(
          temp,
          15,
          25,
          windSpeed,
          30,
          humidity,
          70,
          !isRaining
        ),
      },
      {
        name: "Cycling",
        icon: "fa-bicycle",
        score: calculateActivityScore(
          temp,
          10,
          28,
          windSpeed,
          25,
          humidity,
          75,
          !isRaining
        ),
      },
      {
        name: "Hiking",
        icon: "fa-hiking",
        score: calculateActivityScore(
          temp,
          12,
          26,
          windSpeed,
          35,
          humidity,
          80,
          !isRaining
        ),
      },
      {
        name: "Photography",
        icon: "fa-camera",
        score: calculateActivityScore(
          temp,
          5,
          30,
          windSpeed,
          40,
          humidity,
          90,
          isClear
        ),
      },
    ];

    activityContent.innerHTML = `
      <div class="activity-list">
        ${activities
          .map((activity) => {
            const { status, statusClass } = getActivityStatus(activity.score);
            return `
            <div class="activity-item">
              <div class="activity-icon">
                <i class="fas ${activity.icon}"></i>
              </div>
              <div class="activity-info">
                <div class="activity-name">${activity.name}</div>
                <div class="activity-rating">${activity.score}% ideal</div>
              </div>
              <span class="activity-status ${statusClass}">${status}</span>
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  }

  function calculateActivityScore(
    temp,
    minTemp,
    maxTemp,
    windSpeed,
    maxWind,
    humidity,
    maxHumidity,
    weatherGood
  ) {
    let score = 100;

    // Temperature penalty
    if (temp < minTemp) score -= (minTemp - temp) * 3;
    if (temp > maxTemp) score -= (temp - maxTemp) * 3;

    // Wind penalty
    if (windSpeed > maxWind) score -= (windSpeed - maxWind) * 2;

    // Humidity penalty
    if (humidity > maxHumidity) score -= (humidity - maxHumidity) * 0.5;

    // Weather penalty
    if (!weatherGood) score -= 30;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function getActivityStatus(score) {
    if (score >= 80) return { status: "Excellent", statusClass: "excellent" };
    if (score >= 60) return { status: "Good", statusClass: "good" };
    if (score >= 40) return { status: "Fair", statusClass: "fair" };
    return { status: "Poor", statusClass: "poor" };
  }

  function displayWeatherExtremes() {
    const extremesContainer = document.getElementById("extremes-container");
    if (!extremesContainer || !currentWeatherData || !currentForecastData)
      return;

    const temp = currentWeatherData.main.temp;
    const windSpeed = currentWeatherData.wind.speed * 3.6;
    const humidity = currentWeatherData.main.humidity;
    const pressure = currentWeatherData.main.pressure;

    // Get forecast extremes
    const next24Hours = currentForecastData.list.slice(0, 8);
    const temps = next24Hours.map((h) => h.main.temp);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);

    const extremes = [];

    // Temperature extremes
    if (settings.tempUnit === "metric") {
      if (temp > 35) {
        extremes.push({
          type: "hot",
          icon: "fa-temperature-high",
          title: "Extreme Heat",
          value: formatTemperature(temp),
          description:
            "Dangerously hot! Stay hydrated and avoid prolonged sun exposure.",
        });
      } else if (temp < 0) {
        extremes.push({
          type: "cold",
          icon: "fa-temperature-low",
          title: "Freezing Cold",
          value: formatTemperature(temp),
          description: "Below freezing! Dress warmly and watch for ice.",
        });
      }
    }

    // Wind extremes
    if (windSpeed > 50) {
      extremes.push({
        type: "windy",
        icon: "fa-wind",
        title: "Strong Winds",
        value: formatWindSpeed(currentWeatherData.wind.speed),
        description:
          "High wind warning! Secure loose objects and be cautious outdoors.",
      });
    }

    // Humidity extremes
    if (humidity > 85) {
      extremes.push({
        type: "humid",
        icon: "fa-droplet",
        title: "High Humidity",
        value: `${humidity}%`,
        description:
          "Very humid conditions. It may feel much hotter than actual temperature.",
      });
    } else if (humidity < 20) {
      extremes.push({
        type: "humid",
        icon: "fa-droplet-slash",
        title: "Low Humidity",
        value: `${humidity}%`,
        description:
          "Very dry air. Stay moisturized and drink plenty of water.",
      });
    }

    // Temperature range
    const tempRange = maxTemp - minTemp;
    if (tempRange > 15) {
      extremes.push({
        type: "hot",
        icon: "fa-arrows-up-down",
        title: "Large Temperature Swing",
        value: `${tempRange.toFixed(1)}°`,
        description:
          "Significant temperature variation expected today. Dress in layers.",
      });
    }

    if (extremes.length === 0) {
      extremesContainer.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--success-color);">
          <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 15px;"></i>
          <h3>No Extreme Weather</h3>
          <p style="color: var(--secondary-color); margin-top: 10px;">
            Weather conditions are within normal ranges. Enjoy your day!
          </p>
        </div>
      `;
    } else {
      extremesContainer.innerHTML = `
        <div class="extremes-grid">
          ${extremes
            .map(
              (extreme) => `
            <div class="extreme-card ${extreme.type}">
              <div class="extreme-header">
                <i class="fas ${extreme.icon} extreme-icon"></i>
                <span class="extreme-title">${extreme.title}</span>
              </div>
              <div class="extreme-value">${extreme.value}</div>
              <div class="extreme-description">${extreme.description}</div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }
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

  // ========== Weather Layers Map Functions ==========

  function initializeWeatherLayersMap(lat, lon) {
    console.log("🗺️ Initializing weather layers map at:", lat, lon);

    const mapContainer = document.getElementById("weather-layers-map");
    if (!mapContainer) {
      console.error("❌ Weather layers map container not found!");
      return;
    }

    // Wait for Leaflet to be loaded
    if (typeof L === "undefined") {
      console.warn("⏳ Leaflet not loaded yet. Retrying in 500ms...");
      setTimeout(() => initializeWeatherLayersMap(lat, lon), 500);
      return;
    }

    // Initialize map if not already done
    if (!weatherLayersMap) {
      mapContainer.innerHTML = "";

      try {
        weatherLayersMap = L.map("weather-layers-map", {
          center: [lat, lon],
          zoom: 6,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        // Add base tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(weatherLayersMap);

        // Add initial weather layer (clouds)
        addWeatherLayer("clouds");

        console.log("✅ Weather layers map initialized successfully");
      } catch (error) {
        console.error("Error initializing weather layers map:", error);
        mapContainer.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--danger-color);">
            <div style="text-align: center;">
              <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 10px;"></i>
              <p>Weather layers map failed to load</p>
            </div>
          </div>
        `;
        return;
      }
    } else {
      // Update existing map
      console.log("📍 Updating weather layers map to new location:", lat, lon);
      weatherLayersMap.setView([lat, lon], 6);
    }

    // Invalidate size to fix rendering issues
    setTimeout(() => {
      if (weatherLayersMap) {
        weatherLayersMap.invalidateSize();
      }
    }, 100);
  }

  function addWeatherLayer(layerType) {
    if (!weatherLayersMap) return;

    // Remove existing weather layer
    if (currentWeatherLayer) {
      weatherLayersMap.removeLayer(currentWeatherLayer);
    }

    // Layer configurations
    const layerConfigs = {
      clouds: {
        url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
        opacity: 0.6,
      },
      precipitation: {
        url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
        opacity: 0.7,
      },
      rain: {
        url: `https://tile.openweathermap.org/map/rain_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
        opacity: 0.7,
      },
      snow: {
        url: `https://tile.openweathermap.org/map/snow_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
        opacity: 0.7,
      },
      temp: {
        url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
        opacity: 0.6,
      },
      wind: {
        url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
        opacity: 0.6,
      },
      pressure: {
        url: `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
        opacity: 0.6,
      },
      storm: {
        url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
        opacity: 0.8,
      },
      cyclone: {
        url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
        opacity: 0.7,
      },
      uv: {
        url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
        opacity: 0.6,
      },
      "air-quality": {
        url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
        opacity: 0.5,
      },
      "sea-pressure": {
        url: `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
        opacity: 0.7,
      },
      satellite: {
        url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
        opacity: 0.8,
      },
    };

    const config = layerConfigs[layerType];
    if (config) {
      currentWeatherLayer = L.tileLayer(config.url, {
        attribution: "Weather data &copy; OpenWeatherMap",
        opacity: config.opacity,
        maxZoom: 18,
      }).addTo(weatherLayersMap);

      activeLayerType = layerType;
      updateLegend(layerType);
    }
  }

  function switchWeatherLayer(layerType) {
    if (layerType === activeLayerType) return;

    console.log("🔄 Switching to layer:", layerType);
    addWeatherLayer(layerType);
  }

  function updateLegend(layerType) {
    const legendContent = document.getElementById("legend-content");
    if (!legendContent) return;

    const legends = {
      clouds: {
        title: "Cloud Coverage",
        description:
          "Shows cloud coverage across the region. Darker areas indicate heavier cloud cover.",
        info: "<strong>Light areas:</strong> Clear skies<br><strong>Dark areas:</strong> Heavy cloud cover",
      },
      precipitation: {
        title: "Precipitation",
        description:
          "Displays all forms of precipitation including rain, snow, and mixed precipitation.",
        info: "<strong>Blue/Green:</strong> Light precipitation<br><strong>Yellow/Red:</strong> Heavy precipitation",
      },
      rain: {
        title: "Rainfall",
        description:
          "Shows current and forecasted rainfall intensity across the region.",
        info: "<strong>Light blue:</strong> Light rain<br><strong>Dark blue/Purple:</strong> Heavy rain",
      },
      snow: {
        title: "Snowfall",
        description:
          "Displays snow coverage and intensity. Useful for winter weather tracking.",
        info: "<strong>Light areas:</strong> Light snow<br><strong>Dark areas:</strong> Heavy snow",
      },
      temp: {
        title: "Temperature",
        description:
          "Shows temperature distribution across the region in real-time.",
        info: "<strong>Blue:</strong> Cold<br><strong>Green/Yellow:</strong> Moderate<br><strong>Red:</strong> Hot",
      },
      wind: {
        title: "Wind Speed",
        description:
          "Displays wind speed patterns and intensity across the area.",
        info: "<strong>Light colors:</strong> Calm winds<br><strong>Dark colors:</strong> Strong winds",
      },
      pressure: {
        title: "Atmospheric Pressure",
        description:
          "Shows atmospheric pressure systems. Helps identify weather patterns.",
        info: "<strong>High pressure:</strong> Generally clear weather<br><strong>Low pressure:</strong> Potential for storms",
      },
      storm: {
        title: "Storm Systems",
        description:
          "Displays active storm systems, thunderstorms, and severe weather events.",
        info: "<strong>Light colors:</strong> Light storms<br><strong>Dark/Intense colors:</strong> Severe storms and thunderstorms<br><strong>Red areas:</strong> Dangerous storm activity",
      },
      cyclone: {
        title: "Cyclonic Activity",
        description:
          "Shows cyclonic wind patterns, hurricanes, typhoons, and tropical storms.",
        info: "<strong>Spiral patterns:</strong> Cyclonic rotation<br><strong>Dense areas:</strong> Strong cyclonic activity<br><strong>Eye patterns:</strong> Hurricane/typhoon centers",
      },
      uv: {
        title: "UV Index",
        description:
          "Displays ultraviolet radiation levels across different regions.",
        info: "<strong>Green/Blue:</strong> Low UV (0-2)<br><strong>Yellow:</strong> Moderate UV (3-5)<br><strong>Orange:</strong> High UV (6-7)<br><strong>Red:</strong> Very High UV (8-10)<br><strong>Purple:</strong> Extreme UV (11+)",
      },
      "air-quality": {
        title: "Air Quality Index",
        description:
          "Shows air pollution levels and air quality across regions.",
        info: "<strong>Green:</strong> Good air quality<br><strong>Yellow:</strong> Moderate pollution<br><strong>Orange:</strong> Unhealthy for sensitive groups<br><strong>Red:</strong> Unhealthy air quality<br><strong>Purple:</strong> Very unhealthy",
      },
      "sea-pressure": {
        title: "Sea Level Pressure",
        description:
          "Displays atmospheric pressure at sea level, useful for marine weather.",
        info: "<strong>High pressure:</strong> Stable weather conditions<br><strong>Low pressure:</strong> Storm development potential<br><strong>Gradient lines:</strong> Pressure changes and wind patterns",
      },
      satellite: {
        title: "Satellite Imagery",
        description:
          "Real-time satellite view showing cloud formations and weather systems.",
        info: "<strong>White areas:</strong> Dense cloud cover<br><strong>Gray areas:</strong> Thin clouds<br><strong>Clear areas:</strong> No cloud cover<br><strong>Swirl patterns:</strong> Storm systems and weather fronts",
      },
    };

    const legend = legends[layerType];
    if (legend) {
      legendContent.innerHTML = `
        <p><strong>${legend.title}:</strong> ${legend.description}</p>
        <p style="margin-top: 10px;">${legend.info}</p>
        <p style="margin-top: 10px; font-size: 0.85rem; color: var(--secondary-color);">
          <i class="fas fa-info-circle"></i> Data updates in real-time from OpenWeatherMap
        </p>
      `;
    }
  }

  // ========== Advanced Weather Layer Functions ==========

  function handleLayerSelection(layerType) {
    if (multiLayerMode) {
      toggleLayerInMultiMode(layerType);
    } else {
      switchWeatherLayer(layerType);
    }
  }

  function toggleLayerInMultiMode(layerType) {
    const index = activeLayers.findIndex((layer) => layer.type === layerType);

    if (index > -1) {
      // Remove layer
      if (activeLayers[index].layer) {
        weatherLayersMap.removeLayer(activeLayers[index].layer);
      }
      activeLayers.splice(index, 1);
    } else {
      // Add layer
      const layerConfig = getLayerConfig(layerType);
      if (layerConfig) {
        const layer = L.tileLayer(layerConfig.url, {
          attribution: "Weather data &copy; OpenWeatherMap",
          opacity: layerOpacity,
          maxZoom: 18,
        }).addTo(weatherLayersMap);

        activeLayers.push({ type: layerType, layer: layer });
      }
    }

    updateLegend(
      activeLayers.length > 0
        ? activeLayers[activeLayers.length - 1].type
        : "clouds"
    );
  }

  function getLayerConfig(layerType) {
    const layerConfigs = {
      clouds: {
        url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
      },
      precipitation: {
        url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
      },
      rain: {
        url: `https://tile.openweathermap.org/map/rain_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
      },
      snow: {
        url: `https://tile.openweathermap.org/map/snow_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
      },
      temp: {
        url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
      },
      wind: {
        url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
      },
      pressure: {
        url: `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
      },
      storm: {
        url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
      },
      cyclone: {
        url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
      },
      uv: {
        url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
      },
      "air-quality": {
        url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
      },
      "sea-pressure": {
        url: `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
      },
      satellite: {
        url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
      },
    };
    return layerConfigs[layerType];
  }

  function updateLayerOpacity() {
    if (multiLayerMode) {
      activeLayers.forEach((layerObj) => {
        if (layerObj.layer) {
          layerObj.layer.setOpacity(layerOpacity);
        }
      });
    } else if (currentWeatherLayer) {
      currentWeatherLayer.setOpacity(layerOpacity);
    }
  }

  function toggleMultiLayer() {
    multiLayerMode = !multiLayerMode;
    const btn = document.getElementById("combine-layers");

    if (multiLayerMode) {
      btn.classList.add("active");
      btn.querySelector("span")
        ? (btn.querySelector("span").textContent = "Single Layer")
        : null;
      showToast(
        "Multi-layer mode enabled. Click multiple layer buttons to combine them."
      );
    } else {
      btn.classList.remove("active");
      btn.querySelector("span")
        ? (btn.querySelector("span").textContent = "Multi-Layer")
        : null;

      // Clear all layers and show only the active one
      activeLayers.forEach((layerObj) => {
        if (layerObj.layer) {
          weatherLayersMap.removeLayer(layerObj.layer);
        }
      });
      activeLayers = [];

      // Reset to single layer mode
      addWeatherLayer(activeLayerType);
      showToast("Single layer mode enabled.");
    }
  }

  function toggleAnimation() {
    const btn = document.getElementById("toggle-animation");
    const icon = btn.querySelector("i");
    const text = btn.querySelector("span");

    if (isAnimating) {
      clearInterval(animationInterval);
      isAnimating = false;
      icon.className = "fas fa-play";
      text.textContent = "Play Animation";
      btn.classList.remove("active");
      showToast("Animation stopped");
    } else {
      startLayerAnimation();
      isAnimating = true;
      icon.className = "fas fa-pause";
      text.textContent = "Stop Animation";
      btn.classList.add("active");
      showToast("Animation started - cycling through weather layers");
    }
  }

  function startLayerAnimation() {
    const layers = [
      "clouds",
      "precipitation",
      "rain",
      "snow",
      "temp",
      "wind",
      "pressure",
      "storm",
    ];
    let currentIndex = 0;

    animationInterval = setInterval(() => {
      const layerType = layers[currentIndex];
      switchWeatherLayer(layerType);

      // Update UI to show current layer
      updateActiveLayerUI(layerType);

      currentIndex = (currentIndex + 1) % layers.length;
    }, 7000); // Change layer every 7 seconds
  }

  function updateActiveLayerUI(layerType) {
    // Update desktop buttons
    document.querySelectorAll(".layer-btn").forEach((btn) => {
      if (btn.getAttribute("data-layer") === layerType) {
        btn.classList.add("active");
      }
    });

    // Update mobile dropdown
    const mobileBtn = document.getElementById("mobile-layer-btn");
    const mobileItems = document.querySelectorAll(".mobile-layer-item");

    mobileItems.forEach((item) => {
      item.classList.remove("active");
      if (item.getAttribute("data-layer") === layerType) {
        item.classList.add("active");
        if (mobileBtn) {
          const layerName = item.textContent.trim();
          const layerIcon = item.querySelector("i").className;
          mobileBtn.querySelector("i").className = layerIcon;
          mobileBtn.querySelector("span").textContent = layerName;
        }
      }
    });
  }

  function showLoadingIndicator() {
    if (layerLoading) {
      layerLoading.classList.remove("hidden");
    }
  }

  function hideLoadingIndicator() {
    if (layerLoading) {
      setTimeout(() => {
        layerLoading.classList.add("hidden");
      }, 500);
    }
  }

  // Override the original switchWeatherLayer function to include loading states
  function switchWeatherLayer(layerType) {
    if (layerType === activeLayerType && !multiLayerMode) return;

    showLoadingIndicator();
    console.log("🔄 Switching to layer:", layerType);

    setTimeout(() => {
      addWeatherLayer(layerType);
      hideLoadingIndicator();
    }, 300);
  }

  // Initialize weather layers map when page loads with default location
  setTimeout(() => {
    if (currentCoords) {
      initializeWeatherLayersMap(currentCoords.lat, currentCoords.lon);
    }
  }, 2000);
});
