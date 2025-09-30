# Architecture Documentation - Weatherify

This document provides a comprehensive overview of Weatherify's architecture, design patterns, and technical implementation.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Technology Stack](#technology-stack)
- [File Structure](#file-structure)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Design Patterns](#design-patterns)
- [Performance Considerations](#performance-considerations)
- [Security Architecture](#security-architecture)
- [Extensibility](#extensibility)

---

## System Overview

Weatherify is a client-side single-page application (SPA) that provides comprehensive weather information through integration with the OpenWeatherMap API. The application follows a modular architecture with clear separation of concerns.

### Key Characteristics

- **Type**: Client-side web application
- **Architecture**: Single Page Application (SPA)
- **Rendering**: Client-side rendering (CSR)
- **State Management**: LocalStorage + in-memory state
- **API Communication**: RESTful API calls
- **Deployment**: Static hosting (CDN-ready)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Search  │  │ Weather  │  │  Charts  │  │   Map    │   │
│  │Component │  │  Display │  │Component │  │Component │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Event Handlers│  │State Manager │  │Data Processor│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                       Service Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  API Client  │  │Cache Manager │  │Error Handler │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     External Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │OpenWeatherMap│  │  Leaflet.js  │  │  Chart.js    │     │
│  │     API      │  │   (Maps)     │  │  (Charts)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      Data Persistence                        │
│                    ┌──────────────┐                         │
│                    │ LocalStorage │                         │
│                    └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| HTML5 | - | Semantic markup structure |
| CSS3 | - | Styling and animations |
| JavaScript | ES6+ | Core application logic |
| Chart.js | 4.x | Data visualization |
| Leaflet.js | 1.9.4 | Interactive maps |
| Font Awesome | 6.4.0 | Icon library |

### External APIs

| API | Purpose | Rate Limit |
|-----|---------|------------|
| OpenWeatherMap Current Weather | Real-time weather data | 60/min |
| OpenWeatherMap 5-Day Forecast | Weather predictions | 60/min |
| OpenWeatherMap Geocoding | Location search | 60/min |
| OpenWeatherMap UV Index | UV radiation data | 60/min |
| OpenWeatherMap Air Pollution | Air quality data | 60/min |

### Development Tools

- Git - Version control
- VS Code - Code editor
- Chrome DevTools - Debugging
- Lighthouse - Performance auditing

---

## File Structure

```
weatherify/
├── index.html              # Main HTML file (entry point)
├── styles.css              # All styles and theme definitions
├── script.js               # Core JavaScript functionality
│
├── README.md               # Project documentation
├── CONTRIBUTING.md         # Contribution guidelines
├── LICENSE                 # MIT License
├── CHANGELOG.md            # Version history
├── API_DOCUMENTATION.md    # API integration guide
├── DEPLOYMENT.md           # Deployment instructions
├── SECURITY.md             # Security policy
├── CODE_OF_CONDUCT.md      # Community guidelines
└── ARCHITECTURE.md         # This file
```

### File Responsibilities

**index.html**
- DOM structure
- External library imports
- Semantic HTML elements
- Accessibility attributes

**styles.css**
- Theme definitions (CSS variables)
- Component styles
- Responsive design
- Animations and transitions

**script.js**
- Application initialization
- Event handling
- API integration
- State management
- Data processing
- UI updates

---

## Core Components

### 1. Search Component

**Purpose**: Handle user input for location search

**Features**:
- Text input with autocomplete
- Capital cities dropdown
- Current location detection
- Debounced search

**Code Location**: Lines 50-393 in `script.js`

**Key Functions**:
```javascript
fetchCitySuggestions(query)    // Autocomplete suggestions
displayAutocomplete(cities)     // Show dropdown
fetchWeatherData(location)      // Fetch weather for location
```

### 2. Weather Display Component

**Purpose**: Display current weather conditions

**Features**:
- Temperature display
- Weather icon
- Detailed metrics (humidity, wind, pressure, etc.)
- Sunrise/sunset times
- UV index
- Air quality

**Code Location**: Lines 630-804 in `script.js`

**Key Functions**:
```javascript
displayCurrentWeather(data)     // Render current weather
displayUVIndex(value)           // Show UV index
displayAirQuality(data)         // Show air quality
```

### 3. Forecast Component

**Purpose**: Display weather predictions

**Features**:
- 5-day forecast cards
- 24-hour hourly forecast
- Precipitation probability

**Code Location**: Lines 806-837 in `script.js`

**Key Functions**:
```javascript
displayForecast(data)           // Render 5-day forecast
displayHourlyForecast(data)     // Render hourly forecast
```

### 4. Chart Component

**Purpose**: Visualize weather trends

**Features**:
- Temperature trend chart
- Humidity chart
- Wind speed chart

**Code Location**: Lines 839-914 in `script.js`

**Key Functions**:
```javascript
createTemperatureChart(data)    // Temperature visualization
createHumidityChart(data)       // Humidity visualization
createWindChart(data)           // Wind speed visualization
```

### 5. Map Component

**Purpose**: Display location on interactive map

**Features**:
- Leaflet.js integration
- Weather overlay layers
- Location marker
- Area circle

**Code Location**: Lines 916-1100 in `script.js`

**Key Functions**:
```javascript
initializeMap(lat, lon, name)   // Initialize Leaflet map
addWeatherOverlay()             // Add weather layers
```

### 6. Insights Component

**Purpose**: Provide weather analysis and recommendations

**Features**:
- Feels like analysis
- Moon phase
- Best time recommendations
- Activity suggestions
- Weather statistics

**Code Location**: Lines 1200-1600 in `script.js`

**Key Functions**:
```javascript
displayWeatherInsights()        // Render all insights
calculateMoonPhase()            // Calculate moon phase
getActivityRecommendations()    // Activity suggestions
```

### 7. Settings Component

**Purpose**: Manage user preferences

**Features**:
- Unit selection (temperature, wind, pressure)
- Theme selection
- Notification preferences

**Code Location**: Lines 122-183 in `script.js`

**Key Functions**:
```javascript
loadSettings()                  // Load from LocalStorage
saveSettings()                  // Save to LocalStorage
updateDisplayWithSettings()     // Apply settings to UI
```

### 8. Saved Locations Component

**Purpose**: Manage favorite locations

**Features**:
- Save up to 10 locations
- Quick access to saved locations
- Remove locations

**Code Location**: Lines 185-281 in `script.js`

**Key Functions**:
```javascript
addSavedLocation(location)      // Add to favorites
removeSavedLocation(index)      // Remove from favorites
displaySavedLocations()         // Render saved locations
```

---

## Data Flow

### 1. User Initiates Search

```
User Input → Debounce → Validate → API Request → Process Response → Update UI
```

### 2. Location Detection Flow

```
User Permission → Geolocation API → Coordinates → Reverse Geocoding → City Name → Weather Data
```

### 3. Weather Data Flow

```
API Request → JSON Response → Data Validation → State Update → UI Rendering
```

### 4. Settings Update Flow

```
User Change → Validate → Update State → Save to LocalStorage → Re-render UI
```

### Detailed Example: Fetching Weather

```javascript
// 1. User searches for a city
searchBtn.addEventListener('click', () => {
    const location = locationInput.value.trim();
    fetchWeatherData(location);
});

// 2. Fetch weather data
async function fetchWeatherData(location) {
    // Show loading state
    showLoading();
    
    // Make API request
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}`
    );
    
    // Parse response
    const data = await response.json();
    
    // Update state
    currentWeatherData = data;
    currentLocation = location;
    
    // Update UI
    displayCurrentWeather(data);
    
    // Fetch additional data
    await Promise.all([
        fetchForecast(location),
        fetchUVIndex(data.coord.lat, data.coord.lon),
        fetchAirQuality(data.coord.lat, data.coord.lon)
    ]);
}

// 3. Display weather
function displayCurrentWeather(data) {
    // Update DOM elements
    currentTemp.textContent = formatTemperature(data.main.temp);
    currentLocation.textContent = data.name;
    // ... more updates
}
```

---

## API Integration

### Request Pattern

```javascript
async function apiRequest(endpoint, params) {
    try {
        // Build URL
        const url = new URL(endpoint);
        Object.keys(params).forEach(key => 
            url.searchParams.append(key, params[key])
        );
        
        // Make request
        const response = await fetch(url);
        
        // Handle errors
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        // Parse JSON
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
```

### Caching Strategy

```javascript
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

function getCachedData(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

function setCachedData(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
}
```

### Error Handling

```javascript
function handleAPIError(error, context) {
    console.error(`Error in ${context}:`, error);
    
    // User-friendly messages
    const messages = {
        404: 'Location not found',
        401: 'Invalid API key',
        429: 'Too many requests. Please wait.',
        500: 'Server error. Please try again later.'
    };
    
    const message = messages[error.status] || 'An error occurred';
    showToast(message);
}
```

---

## State Management

### Global State

```javascript
// Application state
let currentLocation = "";
let currentWeatherData = null;
let currentForecastData = null;
let currentCoords = null;
let savedLocations = [];

// Settings state
let settings = {
    tempUnit: "metric",
    windUnit: "kmh",
    pressureUnit: "hpa",
    notifications: false,
    theme: "dark"
};
```

### State Persistence

```javascript
// Save to LocalStorage
function saveSettings() {
    localStorage.setItem('weatherAppSettings', JSON.stringify(settings));
}

// Load from LocalStorage
function loadSettings() {
    const saved = localStorage.getItem('weatherAppSettings');
    if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };
    }
}
```

### State Updates

```javascript
// Reactive state updates
function updateSettings(key, value) {
    settings[key] = value;
    saveSettings();
    updateDisplayWithSettings();
}
```

---

## Design Patterns

### 1. Module Pattern

```javascript
const WeatherApp = (function() {
    // Private variables
    let apiKey = "...";
    let cache = new Map();
    
    // Private functions
    function fetchData() { ... }
    
    // Public API
    return {
        init: function() { ... },
        search: function(location) { ... }
    };
})();
```

### 2. Observer Pattern

```javascript
// Event-driven updates
document.addEventListener('weatherUpdate', (e) => {
    updateUI(e.detail.data);
});

// Trigger event
function notifyWeatherUpdate(data) {
    const event = new CustomEvent('weatherUpdate', { detail: { data } });
    document.dispatchEvent(event);
}
```

### 3. Factory Pattern

```javascript
function createWeatherCard(data) {
    const card = document.createElement('div');
    card.className = 'weather-card';
    card.innerHTML = `
        <h3>${data.name}</h3>
        <p>${data.temp}°</p>
    `;
    return card;
}
```

### 4. Singleton Pattern

```javascript
const MapManager = (function() {
    let instance;
    
    function createInstance() {
        return L.map('location-map');
    }
    
    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();
```

---

## Performance Considerations

### 1. Debouncing

```javascript
let searchTimeout;
function debounceSearch(query, delay = 300) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchCitySuggestions(query);
    }, delay);
}
```

### 2. Lazy Loading

```javascript
// Load map only when needed
function initializeMapOnDemand() {
    if (!map) {
        map = L.map('location-map');
    }
}
```

### 3. Request Batching

```javascript
async function fetchAllData(lat, lon) {
    const [weather, forecast, uv, aqi] = await Promise.all([
        fetchWeather(lat, lon),
        fetchForecast(lat, lon),
        fetchUV(lat, lon),
        fetchAQI(lat, lon)
    ]);
    return { weather, forecast, uv, aqi };
}
```

### 4. Caching

- API responses cached for 10 minutes
- Settings cached in LocalStorage
- Map tiles cached by browser

### 5. Optimization Techniques

- CSS animations use `transform` and `opacity` (GPU-accelerated)
- Event delegation for dynamic elements
- Minimal DOM manipulation
- Efficient selectors

---

## Security Architecture

### 1. Input Validation

```javascript
function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
}
```

### 2. XSS Prevention

```javascript
// Use textContent instead of innerHTML
element.textContent = userInput;

// Or sanitize HTML
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
```

### 3. API Key Protection

- Domain restrictions on OpenWeatherMap dashboard
- No sensitive data in client-side code
- Rate limiting implemented

### 4. HTTPS Enforcement

- Required for geolocation API
- Prevents man-in-the-middle attacks
- Encrypts data in transit

---

## Extensibility

### Adding New Features

1. **New Weather Metric**
```javascript
// Add to displayCurrentWeather()
function displayPollutionLevel(data) {
    const element = document.getElementById('pollution-level');
    element.textContent = data.pollution;
}
```

2. **New Chart Type**
```javascript
function createPressureChart(data) {
    const ctx = document.getElementById('pressure-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: { ... },
        options: { ... }
    });
}
```

3. **New Theme**
```css
body[data-theme="custom"] {
    --primary-color: #your-color;
    --secondary-color: #your-color;
    /* ... */
}
```

### Plugin Architecture

```javascript
const plugins = [];

function registerPlugin(plugin) {
    plugins.push(plugin);
    plugin.init();
}

function executePlugins(hook, data) {
    plugins.forEach(plugin => {
        if (plugin[hook]) {
            plugin[hook](data);
        }
    });
}
```

---

## Future Improvements

### Planned Enhancements

1. **Progressive Web App (PWA)**
   - Service worker for offline support
   - App manifest for installability
   - Push notifications

2. **Backend Integration**
   - Secure API key storage
   - User authentication
   - Data persistence

3. **Advanced Features**
   - Weather radar
   - Historical data
   - Multi-city comparison
   - Export functionality

4. **Performance**
   - Code splitting
   - Lazy loading
   - Image optimization
   - CDN integration

---

## Maintenance

### Code Quality

- Follow ESLint rules
- Use consistent naming conventions
- Write self-documenting code
- Add comments for complex logic

### Testing Strategy

- Manual testing across browsers
- Responsive design testing
- API integration testing
- Performance testing with Lighthouse

### Documentation

- Keep README updated
- Document API changes
- Update architecture diagrams
- Maintain changelog

---

## Contact

For architectural questions:
- **Email**: montaquim.tbm@gmail.com
- **GitHub**: [@AverageTaaf](https://github.com/AverageTaaf)

---

*Last Updated: September 30, 2025*
