# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.0.x   | :x:                |

## Reporting a Vulnerability

We take the security of Weatherify seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Publicly Disclose

Please **do not** create a public GitHub issue for security vulnerabilities. This could put users at risk.

### 2. Report Privately

Send a detailed report to: **montaquim.tbm@gmail.com**

Include the following information:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)
- Your contact information

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-3 days
  - High: 3-7 days
  - Medium: 7-14 days
  - Low: 14-30 days

### 4. Disclosure Policy

- We will acknowledge your report within 48 hours
- We will provide a detailed response within 7 days
- We will work with you to understand and resolve the issue
- We will credit you in the security advisory (unless you prefer to remain anonymous)
- We will publicly disclose the vulnerability after a fix is released

## Security Best Practices

### For Users

1. **API Key Security**
   - Never share your OpenWeatherMap API key
   - Restrict API key usage to your domain only
   - Regenerate API keys if compromised
   - Monitor API usage regularly

2. **Browser Security**
   - Keep your browser updated
   - Use HTTPS when accessing the application
   - Be cautious of browser extensions that may intercept data
   - Clear browser cache regularly

3. **Location Privacy**
   - Only grant location access when needed
   - Review browser location permissions regularly
   - Use VPN if concerned about location privacy

### For Developers

1. **API Key Management**
   ```javascript
   // ❌ BAD: Hardcoded API key
   const API_KEY = "abc123def456";
   
   // ✅ GOOD: Use environment variables (requires backend)
   const API_KEY = process.env.OPENWEATHER_API_KEY;
   ```

2. **Input Validation**
   ```javascript
   // ✅ Sanitize user input
   function sanitizeInput(input) {
       return input.trim().replace(/[<>]/g, '');
   }
   
   const userInput = sanitizeInput(locationInput.value);
   ```

3. **XSS Prevention**
   ```javascript
   // ❌ BAD: Direct HTML injection
   element.innerHTML = userInput;
   
   // ✅ GOOD: Use textContent or sanitize
   element.textContent = userInput;
   ```

4. **HTTPS Only**
   - Always serve the application over HTTPS
   - Geolocation API requires HTTPS
   - Prevents man-in-the-middle attacks

5. **Content Security Policy**
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; 
                  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com; 
                  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; 
                  img-src 'self' data: https:; 
                  font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
                  connect-src 'self' https://api.openweathermap.org https://tile.openweathermap.org;">
   ```

## Known Security Considerations

### 1. API Key Exposure

**Issue**: The OpenWeatherMap API key is visible in client-side JavaScript.

**Mitigation**:
- Use API key restrictions in OpenWeatherMap dashboard
- Limit API key to specific domains
- Monitor API usage for anomalies
- Consider implementing a backend proxy for production

**Long-term Solution**:
```
User → Your Backend → OpenWeatherMap API
```

### 2. Rate Limiting

**Issue**: Users could abuse the API by making excessive requests.

**Mitigation**:
- Implement client-side caching
- Debounce search requests
- Set request timeouts
- Monitor API usage

**Implementation**:
```javascript
// Cache responses for 10 minutes
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000;

function getCachedData(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}
```

### 3. Geolocation Privacy

**Issue**: User location data is sensitive.

**Mitigation**:
- Request location permission explicitly
- Never store location data without consent
- Use HTTPS to encrypt location data in transit
- Provide clear privacy information

### 4. Third-Party Dependencies

**Issue**: CDN-hosted libraries could be compromised.

**Current Dependencies**:
- Chart.js (cdn.jsdelivr.net)
- Leaflet.js (unpkg.com)
- Font Awesome (cdnjs.cloudflare.com)
- Google Fonts (fonts.googleapis.com)

**Mitigation**:
- Use Subresource Integrity (SRI) hashes
- Host libraries locally for critical applications
- Regularly update dependencies
- Monitor CDN status

**Example with SRI**:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js" 
        integrity="sha384-..." 
        crossorigin="anonymous"></script>
```

### 5. LocalStorage Security

**Issue**: LocalStorage data is accessible to JavaScript.

**Current Usage**:
- User settings
- Saved locations
- Theme preferences

**Mitigation**:
- Never store sensitive data in LocalStorage
- Validate data when reading from LocalStorage
- Clear LocalStorage on logout (if auth is added)

## Security Headers

### Recommended Headers

Add these headers to your server configuration:

```nginx
# Nginx configuration
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(self), camera=(), microphone=()" always;
```

```apache
# Apache configuration
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "geolocation=(self), camera=(), microphone=()"
```

## Vulnerability Disclosure History

### Version 2.0.0 (Current)

No vulnerabilities reported yet.

### Version 1.0.0

No vulnerabilities reported.

## Security Checklist

### Before Deployment

- [ ] API key is configured with domain restrictions
- [ ] HTTPS is enabled
- [ ] Security headers are configured
- [ ] Input validation is implemented
- [ ] XSS prevention measures are in place
- [ ] Rate limiting is implemented
- [ ] Error messages don't expose sensitive information
- [ ] Dependencies are up to date
- [ ] Content Security Policy is configured
- [ ] CORS is properly configured

### Regular Maintenance

- [ ] Monitor API usage weekly
- [ ] Review security logs monthly
- [ ] Update dependencies quarterly
- [ ] Audit code for vulnerabilities quarterly
- [ ] Review and rotate API keys annually
- [ ] Test security measures after updates

## Compliance

### GDPR Compliance

Weatherify respects user privacy:

1. **Data Collection**
   - We only collect location data with explicit user consent
   - Location data is not stored on servers
   - Settings are stored locally in browser

2. **User Rights**
   - Users can clear all data by clearing browser storage
   - No personal data is transmitted to our servers
   - Third-party API (OpenWeatherMap) has its own privacy policy

3. **Cookies**
   - We do not use cookies
   - LocalStorage is used for settings only

### CCPA Compliance

- No personal information is sold
- Users can delete their data at any time
- Transparent about data usage

## Security Tools

### Recommended Tools for Testing

1. **OWASP ZAP** - Web application security scanner
2. **Burp Suite** - Security testing platform
3. **Mozilla Observatory** - Security analysis tool
4. **Security Headers** - Header analysis tool
5. **Snyk** - Dependency vulnerability scanner

### Running Security Tests

```bash
# Check for dependency vulnerabilities
npm audit

# Scan with OWASP ZAP
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://your-site.com

# Check security headers
curl -I https://your-site.com
```

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [OpenWeatherMap Security](https://openweathermap.org/security)
- [Web.dev Security](https://web.dev/secure/)

## Contact

For security concerns:
- **Email**: montaquim.tbm@gmail.com
- **PGP Key**: Available upon request
- **Response Time**: Within 48 hours

## Acknowledgments

We appreciate security researchers who responsibly disclose vulnerabilities. Contributors will be acknowledged in:
- This security policy
- Release notes
- Project README (with permission)

---

**Last Updated**: September 30, 2025

**Next Review**: December 30, 2025
