# Contributing to Weatherify

First off, thank you for considering contributing to Weatherify! It's people like you that make Weatherify such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Style Guidelines](#style-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Development Setup](#development-setup)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to montaquim.tbm@gmail.com.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
   ```bash
   git clone https://github.com/your-username/weatherify.git
   cd weatherify
   ```
3. **Create a branch** for your changes
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and test thoroughly
5. **Commit your changes** following our commit guidelines
6. **Push to your fork** and submit a pull request

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 11, macOS 13, Ubuntu 22.04]
 - Browser: [e.g. Chrome 120, Firefox 121, Safari 17]
 - Version: [e.g. 2.0]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

**Enhancement Template:**
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request.
```

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - Simple issues perfect for beginners
- `help wanted` - Issues that need assistance
- `documentation` - Documentation improvements

### Pull Requests

1. Ensure your code follows the style guidelines
2. Update documentation for any changed functionality
3. Add tests if applicable
4. Ensure all tests pass
5. Update the CHANGELOG.md with your changes

## Style Guidelines

### JavaScript Style Guide

- Use ES6+ features (const/let, arrow functions, template literals)
- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code formatting

**Example:**
```javascript
// Good
const fetchWeatherData = async (location) => {
    try {
        const response = await fetch(`${API_URL}?q=${location}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
};

// Avoid
function getWeather(loc) {
    fetch(url + loc).then(r => r.json()).then(d => console.log(d));
}
```

### CSS Style Guide

- Use CSS variables for colors and common values
- Follow BEM naming convention where applicable
- Keep selectors specific but not overly complex
- Group related properties together

**Example:**
```css
/* Good */
.weather-card {
    background-color: var(--card-bg);
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 4px 15px var(--shadow-color);
}

.weather-card__title {
    font-size: 1.5rem;
    color: var(--primary-color);
}

/* Avoid */
.card {
    background: white;
    padding: 25px;
}
```

### HTML Style Guide

- Use semantic HTML5 elements
- Include proper ARIA labels for accessibility
- Keep nesting levels reasonable
- Use meaningful class names

**Example:**
```html
<!-- Good -->
<section class="weather-section" aria-label="Current Weather">
    <h2 id="weather-heading">Current Weather</h2>
    <article class="weather-card">
        <!-- Content -->
    </article>
</section>

<!-- Avoid -->
<div class="section">
    <div class="heading">Current Weather</div>
    <div class="card">
        <!-- Content -->
    </div>
</div>
```

### Documentation Style Guide

- Use clear, concise language
- Include code examples where helpful
- Keep line length under 100 characters
- Use proper Markdown formatting

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without changing functionality
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes

### Examples

```bash
feat(search): add autocomplete for city search

Implemented autocomplete dropdown that shows city suggestions
as the user types. Uses OpenWeatherMap geocoding API.

Closes #123

---

fix(map): resolve map not loading on Safari

Fixed issue where Leaflet map would not initialize properly
on Safari browser due to timing issue.

Fixes #456

---

docs(readme): update installation instructions

Added detailed steps for API key configuration and
local server setup options.
```

## Pull Request Process

1. **Update Documentation**
   - Update README.md if you've added features
   - Update CHANGELOG.md with your changes
   - Add JSDoc comments for new functions

2. **Test Your Changes**
   - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
   - Test on different screen sizes
   - Verify all existing features still work

3. **Create Pull Request**
   - Use a clear, descriptive title
   - Reference related issues
   - Describe what changes you made and why
   - Include screenshots for UI changes

4. **Pull Request Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Tested on Chrome
   - [ ] Tested on Firefox
   - [ ] Tested on Safari/Edge
   - [ ] Tested on mobile devices
   
   ## Screenshots (if applicable)
   Add screenshots here
   
   ## Related Issues
   Closes #issue_number
   ```

5. **Review Process**
   - Wait for maintainer review
   - Address any requested changes
   - Once approved, your PR will be merged

## Development Setup

### Prerequisites

- Text editor (VS Code, Sublime Text, etc.)
- Modern web browser with DevTools
- Git for version control
- Basic knowledge of HTML, CSS, and JavaScript

### Local Development

1. **Clone and setup**
   ```bash
   git clone https://github.com/AverageTaaf/weatherify.git
   cd weatherify
   ```

2. **Configure API key**
   - Get a free API key from OpenWeatherMap
   - Add to `script.js` (line 28)

3. **Run local server**
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx http-server
   
   # PHP
   php -S localhost:8000
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

### Testing Checklist

Before submitting a PR, verify:

- [ ] Code follows style guidelines
- [ ] No console errors in browser DevTools
- [ ] All features work as expected
- [ ] Responsive design works on mobile
- [ ] Works in Chrome, Firefox, and Safari/Edge
- [ ] No broken links or images
- [ ] API calls handle errors gracefully
- [ ] Loading states display properly
- [ ] Theme switching works correctly
- [ ] Settings persist after page reload

## Project Structure

```
weatherify/
├── index.html          # Main HTML file
├── styles.css          # All styles and themes
├── script.js           # Core JavaScript functionality
├── README.md           # Project documentation
├── CONTRIBUTING.md     # This file
├── LICENSE             # MIT License
└── CHANGELOG.md        # Version history
```

## Questions?

Feel free to reach out:
- **Email**: montaquim.tbm@gmail.com
- **GitHub**: [@AverageTaaf](https://github.com/AverageTaaf)
- **Issues**: [GitHub Issues](https://github.com/AverageTaaf/weatherify/issues)

## Recognition

Contributors will be recognized in:
- README.md contributors section
- CHANGELOG.md for their contributions
- GitHub contributors page

Thank you for contributing to Weatherify! 🌤️

---

*Happy Coding!*
