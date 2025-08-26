document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (prefersDarkScheme.matches) {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }
    
    themeToggle.addEventListener('change', function() {
        document.body.classList.toggle('dark-mode');
    });
    
    const API_KEY = '51ec62d7c829a2af2bcabd204c07f8df';
    const GEOLOCATION_TIMEOUT = 10000;
    let currentLocation = '';
    
    const locationInput = document.getElementById('location-input');
    const searchBtn = document.getElementById('search-btn');
    
    const currentLocationEl = document.getElementById('current-location');
    const currentDateEl = document.getElementById('current-date');
    const currentWeatherIcon = document.getElementById('current-weather-icon');
    const currentWeatherDesc = document.getElementById('current-weather-desc');
    const currentTemp = document.getElementById('current-temp');
    const currentHigh = document.getElementById('current-high');
    const currentLow = document.getElementById('current-low');
    const currentWind = document.getElementById('current-wind');
    const currentHumidity = document.getElementById('current-humidity');
    const currentPressure = document.getElementById('current-pressure');
    
    const forecastContainer = document.getElementById('forecast-container');
    const historicalContainer = document.getElementById('historical-container');
    const aiAnalysisContent = document.getElementById('ai-analysis-content');
    
    searchBtn.addEventListener('click', function() {
        fetchWeatherData();
    });
    
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            fetchWeatherData();
        }
    });
    
    document.getElementById('capital-cities').addEventListener('change', function() {
        if (this.value) {
            locationInput.value = this.value;
            fetchWeatherData(this.value);
        }
    });
    
    setTimeout(() => {
        requestLocationPermission();
    }, 1000);
    
    function requestLocationPermission() {
        if (!navigator.geolocation) {
            console.log("Geolocation is not supported by this browser.");
            showToast("Geolocation not supported. Using default location.");
            fetchWeatherData('Dhaka');
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
        
        document.body.insertAdjacentHTML('beforeend', permissionHTML);
        
        document.getElementById('allow-location').addEventListener('click', getUserLocation);
        document.getElementById('deny-location').addEventListener('click', function() {
            hideLocationPermission();
            showToast("Using default location: Dhaka");
            fetchWeatherData('Dhaka');
        });
    }
    
    function getUserLocation() {
        hideLocationPermission();
        
        showLoading();
        currentLocationEl.textContent = "Detecting your location...";
        
        const geoOptions = {
            enableHighAccuracy: true,
            timeout: GEOLOCATION_TIMEOUT,
            maximumAge: 5 * 60 * 1000 // 5 minutes
        };

        navigator.geolocation.getCurrentPosition(
            geoSuccess,
            geoError,
            geoOptions
        );
    }
    
    function geoSuccess(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const cityName = data[0].name;
                    fetchWeatherData(cityName);
                } else {
                    throw new Error("Could not determine location name");
                }
            })
            .catch(error => {
                console.error("Reverse geocoding error:", error);
                fetchWeatherByCoords(latitude, longitude);
            });
    }
    
    function fetchWeatherByCoords(lat, lon) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    displayCurrentWeather(data);
                    return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
                }
                throw new Error(data.message);
            })
            .then(response => response.json())
            .then(data => {
                if (data.cod === '200') {
                    displayForecast(data);
                    return fetchHistoricalData();
                }
                throw new Error(data.message);
            })
            .then(historicalData => {
                displayHistoricalData(historicalData);
                generateAIAnalysis();
            })
            .catch(error => {
                console.error('Error:', error);
                showToast("Location detection failed. Using default location.");
                fetchWeatherData('Dhaka');
            });
    }
    
    function geoError(error) {
        console.warn('Geolocation error:', error);
        
        switch(error.code) {
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
        
        fetchWeatherData('Dhaka');
    }
    
    function hideLocationPermission() {
        const overlay = document.getElementById('location-permission-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    function showToast(message) {
        const existingToast = document.getElementById('location-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.id = 'location-toast';
        toast.className = 'location-toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
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
        
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${loc}&units=metric&appid=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (data.cod !== 200) {
                    throw new Error(data.message);
                }
                displayCurrentWeather(data);
                return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${loc}&units=metric&appid=${API_KEY}`);
            })
            .then(response => response.json())
            .then(data => {
                if (data.cod !== '200') {
                    throw new Error(data.message);
                }
                displayForecast(data);
                return fetchHistoricalData();
            })
            .then(historicalData => {
                displayHistoricalData(historicalData);
                generateAIAnalysis();
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Error: ' + error.message);
            });
    }
    
    function fetchHistoricalData() {
        return new Promise(resolve => {
            setTimeout(() => {
                const now = new Date();
                const historicalData = [
                    {
                        date: new Date(now.setDate(now.getDate() - 2)).toLocaleDateString(),
                        temp: (Math.random() * 10 + 15).toFixed(1),
                        icon: getRandomWeatherIcon(),
                        description: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)]
                    },
                    {
                        date: new Date(now.setDate(now.getDate() + 1)).toLocaleDateString(),
                        temp: (Math.random() * 10 + 15).toFixed(1),
                        icon: getRandomWeatherIcon(),
                        description: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)]
                    }
                ];
                resolve(historicalData);
            }, 500);
        });
    }
    
    function getRandomWeatherIcon() {
        const icons = [
            'fa-sun', 'fa-cloud', 'fa-cloud-rain', 'fa-cloud-sun', 
            'fa-bolt', 'fa-snowflake', 'fa-smog'
        ];
        return icons[Math.floor(Math.random() * icons.length)];
    }
    
    function showLoading() {
        currentLocationEl.textContent = 'Loading...';
        currentDateEl.textContent = '-- -- ----';
        currentWeatherIcon.className = 'fas fa-spinner fa-spin';
        currentWeatherDesc.textContent = '--';
        currentTemp.textContent = '--°';
        currentHigh.textContent = 'H: --°';
        currentLow.textContent = 'L: --°';
        currentWind.textContent = '-- km/h';
        currentHumidity.textContent = '--%';
        currentPressure.textContent = '-- hPa';
        
        forecastContainer.innerHTML = '';
        historicalContainer.innerHTML = '';
        
        aiAnalysisContent.innerHTML = `
            <div class="ai-loading">
                <div class="ai-loader"></div>
                <p>Analyzing weather patterns...</p>
            </div>
        `;
    }
    
    function displayCurrentWeather(data) {
        currentLocationEl.textContent = `${data.name}, ${data.sys.country}`;
        currentDateEl.textContent = new Date(data.dt * 1000).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const weather = data.weather[0];
        currentWeatherIcon.className = getWeatherIcon(weather.id);
        currentWeatherDesc.textContent = weather.description;
        currentTemp.textContent = `${Math.round(data.main.temp)}°`;
        currentHigh.textContent = `H: ${Math.round(data.main.temp_max)}°`;
        currentLow.textContent = `L: ${Math.round(data.main.temp_min)}°`;
        currentWind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
        currentHumidity.textContent = `${data.main.humidity}%`;
        currentPressure.textContent = `${data.main.pressure} hPa`;
    }
    
    function getWeatherIcon(weatherId) {
        if (weatherId >= 200 && weatherId < 300) {
            return 'fas fa-bolt'; // Thunderstorm
        } else if (weatherId >= 300 && weatherId < 400) {
            return 'fas fa-cloud-rain'; // Drizzle
        } else if (weatherId >= 500 && weatherId < 600) {
            return 'fas fa-umbrella'; // Rain
        } else if (weatherId >= 600 && weatherId < 700) {
            return 'fas fa-snowflake'; // Snow
        } else if (weatherId >= 700 && weatherId < 800) {
            return 'fas fa-smog'; // Atmosphere
        } else if (weatherId === 800) {
            return 'fas fa-sun'; // Clear
        } else if (weatherId > 800 && weatherId < 900) {
            return 'fas fa-cloud'; // Clouds
        } else {
            return 'fas fa-question'; // Unknown
        }
    }
    
    function displayForecast(data) {
        forecastContainer.innerHTML = '';
        
        const dailyForecast = {};
        data.list.forEach(item => {
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
            const dayTemp = dayData.reduce((sum, item) => sum + item.main.temp, 0) / dayData.length;
            const weather = dayData[Math.floor(dayData.length / 2)].weather[0];
            
            const dayName = new Date(dayData[0].dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
            
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-card';
            forecastCard.innerHTML = `
                <h3>${dayName}</h3>
                <i class="fas ${getWeatherIcon(weather.id)}"></i>
                <p>${weather.description}</p>
                <div class="forecast-temp">
                    <span>${Math.round(dayTemp)}°</span>
                </div>
            `;
            
            forecastContainer.appendChild(forecastCard);
            count++;
        }
    }
    
    function displayHistoricalData(data) {
        historicalContainer.innerHTML = '';
        
        data.forEach(day => {
            const historicalCard = document.createElement('div');
            historicalCard.className = 'historical-card';
            historicalCard.innerHTML = `
                <h3>${day.date}</h3>
                <i class="fas ${day.icon}"></i>
                <p>${day.description}</p>
                <div class="historical-temp">
                    <span>${day.temp}°</span>
                </div>
            `;
            
            historicalContainer.appendChild(historicalCard);
        });
    }
    
    function generateAIAnalysis() {
        setTimeout(() => {
            const analysisText = `
                <h3>AI Weather Insights for ${currentLocation}</h3>
                <p>Based on current patterns, expect ${Math.random() > 0.5 ? 'mild' : 'variable'} conditions over the next few days.</p>
                <p>${Math.random() > 0.5 ? 'Temperatures are trending slightly above' : 'Temperatures are trending slightly below'} seasonal averages.</p>
                <p>${Math.random() > 0.5 ? 'Low chance of precipitation' : 'Higher chance of precipitation'} in the coming days.</p>
                <div class="ai-tip">
                    <i class="fas fa-lightbulb"></i>
                    <strong>Tip:</strong> ${Math.random() > 0.5 ? 'Perfect weather for outdoor activities!' : 'Consider carrying an umbrella just in case.'}
                </div>
            `;
            
            aiAnalysisContent.innerHTML = analysisText;
        }, 1500);
    }
});
