# Deployment Guide

This guide covers various deployment options for SchedulePro Task Management System.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Static Hosting](#static-hosting)
- [Firebase Hosting](#firebase-hosting)
- [GitHub Pages](#github-pages)
- [Netlify](#netlify)
- [Vercel](#vercel)
- [Custom Server](#custom-server)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment](#post-deployment)

---

## Prerequisites

Before deploying, ensure you have:
- A Firebase project set up (for authentication and database)
- Git installed (for version control)
- Node.js and npm (for some deployment methods)
- A code editor (VS Code recommended)

---

## Local Development

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/AverageTaaf/schedulepro.git
   cd schedulepro
   ```

2. **Open in browser**
   - Simply open `index.html` in your browser
   - Or use a local server:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Python 2
     python -m SimpleHTTPServer 8000
     
     # Node.js
     npx http-server -p 8000
     
     # PHP
     php -S localhost:8000
     ```

3. **Access the application**
   - Navigate to `http://localhost:8000`

---

## Static Hosting

SchedulePro is a static web application and can be hosted on any static hosting service.

### Basic Requirements
- Web server capable of serving HTML, CSS, and JavaScript
- HTTPS support (recommended for Firebase)
- No server-side processing required

---

## Firebase Hosting

Firebase Hosting is recommended as it integrates seamlessly with Firebase services.

### Setup

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```
   
   Configuration:
   - Public directory: `.` (current directory)
   - Single-page app: `No`
   - Automatic builds: `No`
   - Overwrite index.html: `No`

4. **Update firebase.json**
   ```json
   {
     "hosting": {
       "public": ".",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "headers": [
         {
           "source": "**/*.@(js|css)",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "max-age=31536000"
             }
           ]
         }
       ]
     }
   }
   ```

5. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

6. **Access your app**
   - Your app will be available at: `https://YOUR-PROJECT-ID.web.app`

### Custom Domain

1. **Add custom domain in Firebase Console**
   - Go to Hosting section
   - Click "Add custom domain"
   - Follow the verification steps

2. **Update DNS records**
   - Add the provided DNS records to your domain registrar

---

## GitHub Pages

### Setup

1. **Create a GitHub repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/AverageTaaf/schedulepro.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to Pages section
   - Source: Deploy from branch
   - Branch: `main` / `root`
   - Click Save

3. **Access your app**
   - Available at: `https://AverageTaaf.github.io/schedulepro/`

### Custom Domain

1. **Add CNAME file**
   ```bash
   echo "yourdomain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. **Configure DNS**
   - Add CNAME record pointing to `AverageTaaf.github.io`

---

## Netlify

### Method 1: Drag and Drop

1. Go to [Netlify](https://www.netlify.com/)
2. Drag your project folder to the deployment area
3. Your site is live!

### Method 2: Git Integration

1. **Create netlify.toml**
   ```toml
   [build]
     publish = "."
     
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-XSS-Protection = "1; mode=block"
       X-Content-Type-Options = "nosniff"
   ```

2. **Connect repository**
   - Sign in to Netlify
   - Click "New site from Git"
   - Choose your repository
   - Deploy settings:
     - Build command: (leave empty)
     - Publish directory: `.`
   - Click "Deploy site"

3. **Custom domain**
   - Go to Domain settings
   - Add custom domain
   - Update DNS records

---

## Vercel

### Setup

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy: `Y`
   - Which scope: (select your account)
   - Link to existing project: `N`
   - Project name: `schedulepro`
   - Directory: `./`
   - Override settings: `N`

3. **Production deployment**
   ```bash
   vercel --prod
   ```

### Alternative: Git Integration

1. Go to [Vercel](https://vercel.com/)
2. Click "Import Project"
3. Select your Git repository
4. Configure:
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: `.`
5. Click "Deploy"

---

## Custom Server

### Apache

1. **Upload files**
   - Upload all files to your web server

2. **Create .htaccess**
   ```apache
   # Enable HTTPS
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   
   # Security headers
   Header set X-Frame-Options "DENY"
   Header set X-XSS-Protection "1; mode=block"
   Header set X-Content-Type-Options "nosniff"
   
   # Cache control
   <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
     Header set Cache-Control "max-age=31536000, public"
   </FilesMatch>
   ```

### Nginx

1. **Upload files**
   - Upload to `/var/www/schedulepro`

2. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       root /var/www/schedulepro;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Security headers
       add_header X-Frame-Options "DENY";
       add_header X-XSS-Protection "1; mode=block";
       add_header X-Content-Type-Options "nosniff";
       
       # Cache control
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Restart Nginx**
   ```bash
   sudo systemctl restart nginx
   ```

---

## Environment Configuration

### Firebase Configuration

Update `script.js` with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### Firebase Security Rules

Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /tasks/{taskId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## Post-Deployment

### Testing Checklist

- [ ] All pages load correctly
- [ ] Firebase authentication works
- [ ] Task creation/editing/deletion works
- [ ] All view layouts display properly
- [ ] Search and filtering functions correctly
- [ ] Export/import features work
- [ ] Charts render properly
- [ ] Responsive design works on mobile
- [ ] All themes apply correctly
- [ ] No console errors

### Performance Optimization

1. **Enable Compression**
   - Gzip/Brotli compression on server
   - Reduces file sizes significantly

2. **CDN Configuration**
   - Use CDN for static assets
   - Improves load times globally

3. **Caching Strategy**
   - Set appropriate cache headers
   - Use service workers for offline support

4. **Monitoring**
   - Set up Firebase Analytics
   - Monitor error logs
   - Track user engagement

### Security

1. **HTTPS**
   - Ensure HTTPS is enabled
   - Redirect HTTP to HTTPS

2. **Security Headers**
   - X-Frame-Options
   - X-XSS-Protection
   - Content-Security-Policy

3. **Firebase Security**
   - Review Firestore rules
   - Enable App Check
   - Monitor authentication logs

---

## Troubleshooting

### Common Issues

**Firebase Connection Errors**
- Verify Firebase configuration
- Check Firebase project status
- Ensure API keys are correct

**CORS Issues**
- Ensure proper server configuration
- Check Firebase CORS settings

**Authentication Not Working**
- Verify authorized domains in Firebase Console
- Check authentication methods are enabled

**Tasks Not Saving**
- Check Firestore security rules
- Verify user is authenticated
- Check browser console for errors

---

## Support

For deployment issues:
- **Email**: montaquim.tbm@gmail.com
- **GitHub Issues**: https://github.com/AverageTaaf/schedulepro/issues

---

**Maintained by:** Taafeef Bin Montaquim
- Email: montaquim.tbm@gmail.com
- GitHub: [@AverageTaaf](https://github.com/AverageTaaf)

**Last Updated:** 2025-09-30
