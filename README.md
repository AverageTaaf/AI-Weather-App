# Weatherify - Smart Weather Forecasting
![Weatherify](https://img.shields.io/badge/version-2.00-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)

A modern, feature-rich weather forecasting web application that provides comprehensive weather information with an intuitive and beautiful user interface.

## 🌟 Features
### Core Weather Features

- **Real-time Weather Data** - Current weather conditions for any location worldwide
- **5-Day Forecast** - Detailed weather predictions for the next 5 days
- **24-Hour Forecast** - Hourly weather breakdown with precipitation probability
- **Location Detection** - Automatic geolocation with permission request
- **City Search** - Smart autocomplete search for cities worldwide
- **Capital Cities Dropdown** - Quick access to all world capital cities

### Advanced Features

- **UV Index Monitoring** - Real-time UV index with safety recommendations
- **Air Quality Index (AQI)** - Air pollution levels with health advisories
- **Interactive Map** - Leaflet.js powered location map with weather overlay
- **Weather Insights** - AI-powered analysis and recommendations
- **Moon Phase Tracker** - Current moon phase information
- **Sunrise/Sunset Times** - Daily solar event times
- **Weather Alerts** - Extreme weather warnings and notifications
- **Activity Recommendations** - Suggested activities based on weather conditions

### Data Visualization

- **Temperature Trend Chart** - 24-hour temperature visualization
- **Humidity Chart** - Humidity levels over time
- **Wind Speed Chart** - Wind patterns and trends
- **Precipitation Bars** - Rain probability visualization
- **Wind Compass** - Visual wind direction indicator
- **Pressure Trend** - Atmospheric pressure monitoring

### User Experience

- **5 Theme Options** - Light, Dark, Blue, Pink, and Orange themes
- **Saved Locations** - Save up to 10 favorite locations
- **Unit Customization** - Toggle between Celsius/Fahrenheit/Kelvin, km/h/mph/m/s, and pressure units
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Smooth Animations** - Polished transitions and loading states
- **Browser Compatibility** - Works on all modern browsers including Opera GX

## 🚀 Live Demo

[View Live Demo](#) _(Add your deployment URL here)_

## 📸 Screenshots

### Main Dashboard

![Main Dashboard](screenshots/dashboard.png)

### Weather Insights

![Weather Insights](screenshots/insights.png)

### Interactive Map

![Interactive Map](screenshots/map.png)

## 🛠️ Technologies Used

- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with CSS variables and animations
- **JavaScript (ES6+)** - Core functionality and API integration
- **Firebase** - Backend services and data storage
- **OpenWeatherMap API** - Weather data provider
- **Chart.js** - Data visualization library
- **Leaflet.js** - Interactive mapping library
- **Font Awesome** - Icon library
- **Google Fonts (Poppins)** - Typography

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge, Opera GX)
- Internet connection for API calls
- OpenWeatherMap API key (free tier available)

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AverageTaaf/weatherify.git
   cd weatherify
   ```

2. **Get your API key**

   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key

3. **Configure the API key**

   - Open `script.js`
   - Replace the API key on line 28:
     ```javascript
     const API_KEY = "your_api_key_here";
     ```

4. **Launch the application**

   - Open `index.html` in your web browser
   - Or use a local server:

     ```bash
     # Using Python
     python -m http.server 8000

     # Using Node.js
     npx http-server
     ```

5. **Access the app**
   - Navigate to `http://localhost:8000` in your browser

## 📖 Usage Guide

### Searching for Weather

1. **By City Name**: Type a city name in the search bar
2. **Autocomplete**: Select from suggested cities as you type
3. **Capital Cities**: Use the dropdown to select any world capital
4. **Current Location**: Click the location icon to use your GPS coordinates

### Saving Locations

1. Search for a location
2. Click the "+" button in the Saved Locations bar
3. Access saved locations by clicking on them
4. Remove locations using the "×" button

### Customizing Settings

1. Click the settings icon (⚙️)
2. Choose your preferred units:
   - Temperature: Celsius, Fahrenheit, or Kelvin
   - Wind Speed: km/h, mph, or m/s
   - Pressure: hPa, inHg, or mmHg
3. Enable weather alerts (requires browser notification permission)

### Changing Themes

- Click any theme icon in the header:
  - ☀️ Light Theme
  - 🌙 Dark Theme
  - 💧 Blue Theme
  - ❤️ Pink Theme
  - 🔥 Orange Theme

## 🌐 API Reference

### OpenWeatherMap APIs Used

- **Current Weather API** - Real-time weather data
- **5-Day Forecast API** - Weather predictions
- **Geocoding API** - Location search and coordinates
- **UV Index API** - UV radiation levels
- **Air Pollution API** - Air quality data

### API Endpoints

```javascript
// Current Weather
https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}

// 5-Day Forecast
https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}

// UV Index
https://api.openweathermap.org/data/2.5/uvi?lat={lat}&lon={lon}&appid={API_KEY}

// Air Quality
https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}
```

## 🎨 Customization

### Adding New Themes

Edit the CSS variables in `styles.css`:

```css
body[data-theme="your-theme"] {
  --primary-color: #your-color;
  --secondary-color: #your-color;
  --accent-color: #your-color;
  --text-color: #your-color;
  --bg-color: #your-color;
  --card-bg: #your-color;
}
```

### Modifying Weather Insights

Edit the `displayWeatherInsights()` function in `script.js` to add custom insights.

## 🐛 Known Issues

- Map may take a few seconds to load on slower connections
- Some browsers may block geolocation on non-HTTPS sites
- API rate limits apply (60 calls/minute for free tier)

## 🔮 Future Enhancements

- [ ] Weather radar overlay
- [ ] Historical weather data
- [ ] Weather comparison between cities
- [ ] Export weather reports as PDF
- [ ] Multi-language support
- [ ] Weather widgets for embedding
- [ ] Progressive Web App (PWA) support
- [ ] Offline mode with cached data

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Taafeef Bin Montaquim**

- Email: montaquim.tbm@gmail.com
- GitHub: [@AverageTaaf](https://github.com/AverageTaaf)
- Portfolio: [Your Portfolio URL]

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data API
- [Chart.js](https://www.chartjs.org/) for beautiful charts
- [Leaflet.js](https://leafletjs.com/) for interactive maps
- [Font Awesome](https://fontawesome.com/) for icons
- [Google Fonts](https://fonts.google.com/) for Poppins font

## 📞 Support

If you encounter any issues or have questions:

- Open an issue on [GitHub Issues](https://github.com/AverageTaaf/weatherify/issues)
- Email: montaquim.tbm@gmail.com

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Other Projects by Taafeef Bin Montaquim:**

- [Type Master Pro](https://typemaster-ai.netlify.app/) - Advanced typing practice application
- [Task Schedule Pro](https://taskschedulepro.netlify.app/) - Professional task management tool

---

_Made with ❤️ by Taafeef Bin Montaquim_
