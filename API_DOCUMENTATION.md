# API Documentation - Weatherify

This document provides detailed information about the APIs used in Weatherify and how to work with them.

## Table of Contents

- [OpenWeatherMap API Overview](#openweathermap-api-overview)
- [API Key Setup](#api-key-setup)
- [Current Weather API](#current-weather-api)
- [5-Day Forecast API](#5-day-forecast-api)
- [Geocoding API](#geocoding-api)
- [UV Index API](#uv-index-api)
- [Air Pollution API](#air-pollution-api)
- [Weather Map Tiles](#weather-map-tiles)
- [Rate Limits](#rate-limits)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

---

## OpenWeatherMap API Overview

Weatherify uses the OpenWeatherMap API to fetch weather data. This is a comprehensive weather data service that provides:

- Current weather conditions
- Weather forecasts
- Historical data
- Weather maps
- Air quality data
- UV index information

**Official Documentation**: [https://openweathermap.org/api](https://openweathermap.org/api)

---

## API Key Setup

### Getting Your API Key

1. **Sign Up**
   - Visit [OpenWeatherMap Sign Up](https://home.openweathermap.org/users/sign_up)
   - Create a free account
   - Verify your email address

2. **Generate API Key**
   - Log in to your account
   - Navigate to [API Keys](https://home.openweathermap.org/api_keys)
   - Copy your default API key or create a new one
   - **Note**: New API keys may take up to 2 hours to activate

3. **Configure in Weatherify**
   - Open `script.js`
   - Find line 28: `const API_KEY = "your_api_key_here";`
   - Replace with your actual API key
   - Save the file

### Free Tier Limits

- **60 calls/minute**
- **1,000,000 calls/month**
- Access to current weather, forecasts, and basic features
- Sufficient for personal projects and small applications

---

## Current Weather API

### Endpoint

```
GET https://api.openweathermap.org/data/2.5/weather
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes* | City name (e.g., "London" or "London,UK") |
| `lat` | number | Yes* | Latitude coordinate |
| `lon` | number | Yes* | Longitude coordinate |
| `appid` | string | Yes | Your API key |
| `units` | string | No | Units of measurement (`metric`, `imperial`, `standard`) |
| `lang` | string | No | Language for weather description |

*Either `q` or (`lat` and `lon`) is required

### Example Request

```javascript
// By city name
const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=London&units=metric&appid=${API_KEY}`
);

// By coordinates
const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=51.5074&lon=-0.1278&units=metric&appid=${API_KEY}`
);
```

### Example Response

```json
{
    "coord": {
        "lon": -0.1278,
        "lat": 51.5074
    },
    "weather": [
        {
            "id": 800,
            "main": "Clear",
            "description": "clear sky",
            "icon": "01d"
        }
    ],
    "base": "stations",
    "main": {
        "temp": 15.5,
        "feels_like": 14.8,
        "temp_min": 13.2,
        "temp_max": 17.1,
        "pressure": 1013,
        "humidity": 72
    },
    "visibility": 10000,
    "wind": {
        "speed": 3.6,
        "deg": 240
    },
    "clouds": {
        "all": 0
    },
    "dt": 1633024800,
    "sys": {
        "type": 2,
        "id": 2019646,
        "country": "GB",
        "sunrise": 1632982800,
        "sunset": 1633025400
    },
    "timezone": 3600,
    "id": 2643743,
    "name": "London",
    "cod": 200
}
```

### Key Response Fields

- `main.temp` - Current temperature
- `main.feels_like` - Perceived temperature
- `main.temp_min` - Minimum temperature
- `main.temp_max` - Maximum temperature
- `main.humidity` - Humidity percentage
- `main.pressure` - Atmospheric pressure (hPa)
- `wind.speed` - Wind speed
- `wind.deg` - Wind direction (degrees)
- `weather[0].id` - Weather condition ID
- `weather[0].description` - Weather description
- `visibility` - Visibility in meters
- `sys.sunrise` - Sunrise time (Unix timestamp)
- `sys.sunset` - Sunset time (Unix timestamp)

---

## 5-Day Forecast API

### Endpoint

```
GET https://api.openweathermap.org/data/2.5/forecast
```

### Parameters

Same as Current Weather API

### Example Request

```javascript
const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=London&units=metric&appid=${API_KEY}`
);
```

### Example Response

```json
{
    "cod": "200",
    "message": 0,
    "cnt": 40,
    "list": [
        {
            "dt": 1633024800,
            "main": {
                "temp": 15.5,
                "feels_like": 14.8,
                "temp_min": 13.2,
                "temp_max": 17.1,
                "pressure": 1013,
                "humidity": 72
            },
            "weather": [
                {
                    "id": 800,
                    "main": "Clear",
                    "description": "clear sky",
                    "icon": "01d"
                }
            ],
            "clouds": {
                "all": 0
            },
            "wind": {
                "speed": 3.6,
                "deg": 240
            },
            "visibility": 10000,
            "pop": 0.15,
            "dt_txt": "2021-10-01 12:00:00"
        }
        // ... 39 more entries (3-hour intervals)
    ],
    "city": {
        "id": 2643743,
        "name": "London",
        "coord": {
            "lat": 51.5074,
            "lon": -0.1278
        },
        "country": "GB",
        "timezone": 3600,
        "sunrise": 1632982800,
        "sunset": 1633025400
    }
}
```

### Key Features

- Provides weather data in 3-hour intervals
- Covers 5 days (40 data points)
- `pop` field indicates probability of precipitation (0-1)
- Use `dt_txt` for human-readable timestamp

---

## Geocoding API

### Direct Geocoding (City Name to Coordinates)

#### Endpoint

```
GET https://api.openweathermap.org/geo/1.0/direct
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | City name, state code, country code (e.g., "London,GB") |
| `limit` | number | No | Number of results (default: 5) |
| `appid` | string | Yes | Your API key |

#### Example Request

```javascript
const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid=${API_KEY}`
);
```

#### Example Response

```json
[
    {
        "name": "London",
        "local_names": {
            "en": "London",
            "fr": "Londres"
        },
        "lat": 51.5074,
        "lon": -0.1278,
        "country": "GB",
        "state": "England"
    }
]
```

### Reverse Geocoding (Coordinates to City Name)

#### Endpoint

```
GET https://api.openweathermap.org/geo/1.0/reverse
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | Yes | Latitude |
| `lon` | number | Yes | Longitude |
| `limit` | number | No | Number of results (default: 5) |
| `appid` | string | Yes | Your API key |

#### Example Request

```javascript
const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/reverse?lat=51.5074&lon=-0.1278&limit=1&appid=${API_KEY}`
);
```

---

## UV Index API

### Endpoint

```
GET https://api.openweathermap.org/data/2.5/uvi
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | Yes | Latitude |
| `lon` | number | Yes | Longitude |
| `appid` | string | Yes | Your API key |

### Example Request

```javascript
const response = await fetch(
    `https://api.openweathermap.org/data/2.5/uvi?lat=51.5074&lon=-0.1278&appid=${API_KEY}`
);
```

### Example Response

```json
{
    "lat": 51.5074,
    "lon": -0.1278,
    "date_iso": "2021-10-01T12:00:00Z",
    "date": 1633024800,
    "value": 5.8
}
```

### UV Index Scale

| Value | Level | Recommendation |
|-------|-------|----------------|
| 0-2 | Low | No protection needed |
| 3-5 | Moderate | Wear sunscreen |
| 6-7 | High | Protection essential |
| 8-10 | Very High | Extra protection required |
| 11+ | Extreme | Avoid sun exposure |

---

## Air Pollution API

### Endpoint

```
GET https://api.openweathermap.org/data/2.5/air_pollution
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | Yes | Latitude |
| `lon` | number | Yes | Longitude |
| `appid` | string | Yes | Your API key |

### Example Request

```javascript
const response = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=51.5074&lon=-0.1278&appid=${API_KEY}`
);
```

### Example Response

```json
{
    "coord": {
        "lon": -0.1278,
        "lat": 51.5074
    },
    "list": [
        {
            "main": {
                "aqi": 2
            },
            "components": {
                "co": 230.31,
                "no": 0.21,
                "no2": 14.93,
                "o3": 68.66,
                "so2": 1.73,
                "pm2_5": 5.83,
                "pm10": 7.54,
                "nh3": 0.92
            },
            "dt": 1633024800
        }
    ]
}
```

### Air Quality Index (AQI) Scale

| Value | Level | Description |
|-------|-------|-------------|
| 1 | Good | Air quality is satisfactory |
| 2 | Fair | Acceptable air quality |
| 3 | Moderate | Sensitive groups should limit outdoor activity |
| 4 | Poor | Everyone should limit outdoor activity |
| 5 | Very Poor | Avoid outdoor activity |

### Components

- `co` - Carbon monoxide (μg/m³)
- `no` - Nitrogen monoxide (μg/m³)
- `no2` - Nitrogen dioxide (μg/m³)
- `o3` - Ozone (μg/m³)
- `so2` - Sulphur dioxide (μg/m³)
- `pm2_5` - Fine particulate matter (μg/m³)
- `pm10` - Coarse particulate matter (μg/m³)
- `nh3` - Ammonia (μg/m³)

---

## Weather Map Tiles

### Cloud Coverage Layer

```
https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid={API_KEY}
```

### Precipitation Layer

```
https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid={API_KEY}
```

### Temperature Layer

```
https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid={API_KEY}
```

### Wind Speed Layer

```
https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid={API_KEY}
```

### Usage with Leaflet.js

```javascript
L.tileLayer(
    `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
    {
        attribution: 'Weather data © OpenWeatherMap',
        opacity: 0.5,
        maxZoom: 18
    }
).addTo(map);
```

---

## Rate Limits

### Free Tier

- **60 calls per minute**
- **1,000,000 calls per month**
- No credit card required

### Handling Rate Limits

```javascript
async function fetchWithRetry(url, retries = 3) {
    try {
        const response = await fetch(url);
        
        if (response.status === 429) {
            // Rate limit exceeded
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                return fetchWithRetry(url, retries - 1);
            }
            throw new Error('Rate limit exceeded');
        }
        
        return response;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
```

---

## Error Handling

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Invalid API key |
| 404 | Not Found | City not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Handling Example

```javascript
async function fetchWeatherData(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
        );
        
        const data = await response.json();
        
        if (data.cod !== 200) {
            switch (data.cod) {
                case '404':
                    throw new Error('City not found');
                case '401':
                    throw new Error('Invalid API key');
                case '429':
                    throw new Error('Rate limit exceeded. Please try again later.');
                default:
                    throw new Error(data.message || 'Unknown error occurred');
            }
        }
        
        return data;
    } catch (error) {
        console.error('Weather API Error:', error);
        showErrorMessage(error.message);
        throw error;
    }
}
```

---

## Best Practices

### 1. Cache API Responses

```javascript
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

async function getCachedWeather(city) {
    const cacheKey = `weather_${city}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    
    const data = await fetchWeatherData(city);
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
}
```

### 2. Debounce Search Requests

```javascript
let searchTimeout;

function debounceSearch(query, delay = 300) {
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
        fetchCitySuggestions(query);
    }, delay);
}
```

### 3. Use Appropriate Units

```javascript
const units = {
    metric: { temp: '°C', speed: 'km/h' },
    imperial: { temp: '°F', speed: 'mph' },
    standard: { temp: 'K', speed: 'm/s' }
};

const selectedUnit = 'metric';
```

### 4. Handle Network Errors

```javascript
async function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
}
```

### 5. Batch Requests When Possible

```javascript
async function fetchAllWeatherData(lat, lon) {
    const [weather, forecast, uv, airQuality] = await Promise.all([
        fetchCurrentWeather(lat, lon),
        fetchForecast(lat, lon),
        fetchUVIndex(lat, lon),
        fetchAirQuality(lat, lon)
    ]);
    
    return { weather, forecast, uv, airQuality };
}
```

---

## Additional Resources

- **Official API Documentation**: [https://openweathermap.org/api](https://openweathermap.org/api)
- **API Status**: [https://status.openweathermap.org/](https://status.openweathermap.org/)
- **Support**: [https://home.openweathermap.org/questions](https://home.openweathermap.org/questions)
- **Pricing Plans**: [https://openweathermap.org/price](https://openweathermap.org/price)

---

## Contact

For questions about API integration in Weatherify:
- **Email**: montaquim.tbm@gmail.com
- **GitHub**: [@AverageTaaf](https://github.com/AverageTaaf)

---

*Last Updated: September 30, 2025*
