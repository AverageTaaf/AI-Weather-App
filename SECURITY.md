# Security Policy

## Supported Versions

Currently supported versions of SchedulePro with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The security of SchedulePro is taken seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Publicly Disclose

Please **do not** create a public GitHub issue for security vulnerabilities. This helps protect users while the issue is being resolved.

### 2. Contact Information

Report security vulnerabilities via email to:
- **Email**: montaquim.tbm@gmail.com
- **Subject Line**: [SECURITY] Brief description of the issue

### 3. Information to Include

Please provide as much information as possible:

- **Type of vulnerability** (e.g., XSS, SQL injection, authentication bypass)
- **Affected component(s)** (e.g., authentication system, task storage)
- **Steps to reproduce** the vulnerability
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up questions

**Example Report:**
```
Subject: [SECURITY] XSS vulnerability in task description

Description:
The task description field does not properly sanitize HTML input, 
allowing for potential XSS attacks.

Steps to Reproduce:
1. Create a new task
2. In the description field, enter: <script>alert('XSS')</script>
3. Save the task
4. View the task details

Impact:
An attacker could inject malicious scripts that execute when 
other users view the task.

Affected Version: 1.0.0
Browser: Chrome 96

Suggested Fix:
Implement HTML sanitization using DOMPurify or similar library 
before rendering task descriptions.
```

### 4. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-90 days

### 5. Disclosure Policy

- Security vulnerabilities will be disclosed publicly only after a fix is released
- Credit will be given to the reporter (unless they prefer to remain anonymous)
- A security advisory will be published on GitHub

## Security Best Practices for Users

### Authentication
- Use strong, unique passwords
- Enable two-factor authentication when available
- Don't share your account credentials
- Log out when using shared computers

### Data Protection
- Regularly export your tasks as backup
- Be cautious about sensitive information in task descriptions
- Review Firebase security rules if self-hosting

### Browser Security
- Keep your browser updated
- Use reputable browser extensions only
- Clear browser cache/cookies periodically
- Be cautious of phishing attempts

### Network Security
- Use HTTPS connections only
- Avoid using public Wi-Fi for sensitive tasks
- Consider using a VPN for additional security

## Security Features

### Current Implementation

1. **Firebase Authentication**
   - Secure password hashing
   - OAuth 2.0 for Google Sign-In
   - Session management
   - CSRF protection

2. **Data Security**
   - Firestore security rules
   - User data isolation
   - Encrypted data transmission (HTTPS)
   - No third-party data sharing

3. **Input Validation**
   - Client-side validation
   - XSS prevention measures
   - SQL injection protection (via Firebase)

4. **Privacy**
   - No tracking or analytics
   - Minimal data collection
   - User data deletion on account removal
   - Local storage encryption (browser-dependent)

### Planned Security Enhancements

- [ ] Content Security Policy (CSP) headers
- [ ] Rate limiting for API calls
- [ ] Two-factor authentication (2FA)
- [ ] Session timeout configuration
- [ ] Audit logging for sensitive actions
- [ ] Data encryption at rest
- [ ] Regular security audits
- [ ] Penetration testing

## Known Security Considerations

### Local Storage
- Data stored in browser's local storage is not encrypted
- Local storage can be accessed by browser extensions
- Clear local storage when using shared computers

### Firebase Configuration
- Firebase API keys are exposed in client-side code (this is normal)
- Security is enforced through Firebase Security Rules
- Ensure proper security rules are configured in Firebase Console

### Third-Party Dependencies
- Font Awesome (CDN)
- Chart.js (CDN)
- Firebase SDK (CDN)

All CDN resources use Subresource Integrity (SRI) where available.

## Compliance

### GDPR Compliance
- Users can export their data
- Users can delete their account and data
- Minimal data collection
- Clear privacy policy

### Data Retention
- User data is retained as long as the account is active
- Deleted tasks are permanently removed after 30 days
- Archived tasks are retained indefinitely unless deleted

## Security Updates

Security updates will be released as patch versions (e.g., 1.0.1) and will be clearly marked in the [CHANGELOG.md](CHANGELOG.md).

### Notification Channels
- GitHub Security Advisories
- Release notes
- Email notification to registered users (if applicable)

## Questions?

For security-related questions that are not vulnerabilities, you can:
- Open a GitHub Discussion
- Email: montaquim.tbm@gmail.com

---

**Security Contact:** Taafeef Bin Montaquim
- Email: montaquim.tbm@gmail.com
- GitHub: [@AverageTaaf](https://github.com/AverageTaaf)

**Last Updated:** 2025-09-30
