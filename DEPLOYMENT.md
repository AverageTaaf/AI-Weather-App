# Deployment Guide - Weatherify

This guide covers various methods to deploy Weatherify to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Deployment Options](#quick-deployment-options)
- [Netlify Deployment](#netlify-deployment)
- [Vercel Deployment](#vercel-deployment)
- [GitHub Pages Deployment](#github-pages-deployment)
- [AWS S3 + CloudFront](#aws-s3--cloudfront)
- [Custom Server Deployment](#custom-server-deployment)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment Checklist](#post-deployment-checklist)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [x] A valid OpenWeatherMap API key
- [x] Git installed on your machine
- [x] GitHub account (for most deployment methods)
- [x] All files tested locally
- [x] API key configured in `script.js`

---

## Quick Deployment Options

### Recommended Platforms

| Platform | Difficulty | Cost | Build Time | Best For |
|----------|-----------|------|------------|----------|
| **Netlify** | Easy | Free | ~1 min | Beginners, quick deployment |
| **Vercel** | Easy | Free | ~1 min | Modern workflow, CI/CD |
| **GitHub Pages** | Medium | Free | ~2 min | GitHub integration |
| **AWS S3** | Medium | Low cost | ~5 min | Scalability, custom domain |
| **Custom Server** | Hard | Varies | ~10 min | Full control |

---

## Netlify Deployment

### Method 1: Drag & Drop (Easiest)

1. **Prepare Files**
   ```bash
   # Create a deployment folder
   mkdir weatherify-deploy
   cp index.html styles.css script.js weatherify-deploy/
   ```

2. **Deploy**
   - Visit [Netlify Drop](https://app.netlify.com/drop)
   - Drag your `weatherify-deploy` folder onto the page
   - Wait for deployment to complete
   - Your site is live!

### Method 2: Git Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/AverageTaaf/weatherify.git
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Log in to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize
   - Select your repository
   - Configure build settings:
     - **Build command**: (leave empty)
     - **Publish directory**: `/`
   - Click "Deploy site"

3. **Configure Custom Domain** (Optional)
   - Go to Site settings → Domain management
   - Add custom domain
   - Update DNS records as instructed

### Method 3: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login and Deploy**
   ```bash
   netlify login
   netlify init
   netlify deploy --prod
   ```

---

## Vercel Deployment

### Method 1: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel login
   vercel
   ```

3. **Follow Prompts**
   - Set up and deploy: Yes
   - Which scope: Your account
   - Link to existing project: No
   - Project name: weatherify
   - Directory: ./
   - Override settings: No

### Method 2: GitHub Integration

1. **Push to GitHub** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Other
     - **Root Directory**: ./
     - **Build Command**: (leave empty)
     - **Output Directory**: ./
   - Click "Deploy"

3. **Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS as instructed

---

## GitHub Pages Deployment

### Prerequisites
- GitHub account
- Repository created

### Steps

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/AverageTaaf/weatherify.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Source: Deploy from a branch
   - Branch: `main` / `root`
   - Click "Save"

3. **Access Your Site**
   - URL: `https://AverageTaaf.github.io/weatherify/`
   - Wait 2-3 minutes for deployment

4. **Custom Domain** (Optional)
   - Add `CNAME` file to root:
     ```
     weatherify.yourdomain.com
     ```
   - Configure DNS:
     ```
     Type: CNAME
     Name: weatherify
     Value: AverageTaaf.github.io
     ```

### GitHub Actions (Automated Deployment)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

---

## AWS S3 + CloudFront

### Prerequisites
- AWS account
- AWS CLI installed

### Steps

1. **Install AWS CLI**
   ```bash
   # macOS
   brew install awscli
   
   # Windows
   choco install awscli
   
   # Linux
   sudo apt install awscli
   ```

2. **Configure AWS CLI**
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Default region: us-east-1
   # Default output format: json
   ```

3. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://weatherify-app
   ```

4. **Configure Bucket for Static Hosting**
   ```bash
   aws s3 website s3://weatherify-app \
     --index-document index.html \
     --error-document index.html
   ```

5. **Upload Files**
   ```bash
   aws s3 sync . s3://weatherify-app \
     --exclude ".git/*" \
     --exclude "*.md" \
     --acl public-read
   ```

6. **Set Bucket Policy**
   
   Create `bucket-policy.json`:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::weatherify-app/*"
       }
     ]
   }
   ```
   
   Apply policy:
   ```bash
   aws s3api put-bucket-policy \
     --bucket weatherify-app \
     --policy file://bucket-policy.json
   ```

7. **Create CloudFront Distribution** (Optional, for HTTPS)
   - Go to AWS CloudFront Console
   - Create distribution
   - Origin domain: `weatherify-app.s3-website-us-east-1.amazonaws.com`
   - Enable HTTPS
   - Create distribution

8. **Access Your Site**
   - S3 URL: `http://weatherify-app.s3-website-us-east-1.amazonaws.com`
   - CloudFront URL: `https://d123456789.cloudfront.net`

---

## Custom Server Deployment

### Using Apache

1. **Upload Files**
   ```bash
   scp -r * user@yourserver.com:/var/www/html/weatherify/
   ```

2. **Configure Apache**
   
   Create `/etc/apache2/sites-available/weatherify.conf`:
   ```apache
   <VirtualHost *:80>
       ServerName weatherify.yourdomain.com
       DocumentRoot /var/www/html/weatherify
       
       <Directory /var/www/html/weatherify>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
       
       ErrorLog ${APACHE_LOG_DIR}/weatherify-error.log
       CustomLog ${APACHE_LOG_DIR}/weatherify-access.log combined
   </VirtualHost>
   ```

3. **Enable Site**
   ```bash
   sudo a2ensite weatherify
   sudo systemctl reload apache2
   ```

### Using Nginx

1. **Upload Files**
   ```bash
   scp -r * user@yourserver.com:/var/www/weatherify/
   ```

2. **Configure Nginx**
   
   Create `/etc/nginx/sites-available/weatherify`:
   ```nginx
   server {
       listen 80;
       server_name weatherify.yourdomain.com;
       root /var/www/weatherify;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Cache static assets
       location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
       
       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
   }
   ```

3. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/weatherify /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d weatherify.yourdomain.com

# Auto-renewal is configured automatically
```

---

## Environment Configuration

### Securing API Keys

**Option 1: Environment Variables (Backend Required)**

Create `.env` file:
```
OPENWEATHER_API_KEY=your_api_key_here
```

**Option 2: Netlify Environment Variables**

1. Go to Site settings → Build & deploy → Environment
2. Add variable:
   - Key: `OPENWEATHER_API_KEY`
   - Value: Your API key

**Option 3: Vercel Environment Variables**

1. Go to Project Settings → Environment Variables
2. Add variable:
   - Name: `OPENWEATHER_API_KEY`
   - Value: Your API key

### Security Best Practices

1. **Never commit API keys to Git**
   
   Add to `.gitignore`:
   ```
   .env
   .env.local
   config.js
   ```

2. **Use API key restrictions**
   - Go to OpenWeatherMap API Keys
   - Add HTTP referrer restrictions
   - Limit to your domain: `*.yourdomain.com/*`

3. **Implement rate limiting**
   - Cache API responses
   - Debounce search requests
   - Set request timeouts

---

## Post-Deployment Checklist

After deployment, verify:

- [ ] Site loads correctly
- [ ] All assets (CSS, JS) load properly
- [ ] Weather data fetches successfully
- [ ] Location search works
- [ ] Current location detection works (HTTPS required)
- [ ] All themes work correctly
- [ ] Saved locations persist
- [ ] Settings save properly
- [ ] Map displays correctly
- [ ] Charts render properly
- [ ] Mobile responsiveness works
- [ ] All links work
- [ ] No console errors
- [ ] HTTPS is enabled (for geolocation)
- [ ] Custom domain configured (if applicable)
- [ ] Analytics configured (if desired)

---

## Troubleshooting

### Issue: API Key Not Working

**Solution:**
- Verify API key is correct
- Wait 2 hours for new keys to activate
- Check API key restrictions
- Verify domain is whitelisted

### Issue: Geolocation Not Working

**Solution:**
- Ensure site is served over HTTPS
- Check browser permissions
- Test on different browsers
- Verify location services are enabled

### Issue: Map Not Loading

**Solution:**
- Check Leaflet.js CDN is accessible
- Verify map container has height set
- Check browser console for errors
- Ensure coordinates are valid

### Issue: Charts Not Displaying

**Solution:**
- Verify Chart.js CDN is loaded
- Check canvas elements exist
- Ensure data is properly formatted
- Check browser console for errors

### Issue: 404 Errors on Refresh

**Solution:**
- Configure server for SPA routing
- Add `.htaccess` for Apache:
  ```apache
  <IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
  </IfModule>
  ```

### Issue: CORS Errors

**Solution:**
- Verify API endpoints support CORS
- Check API key is included in requests
- Ensure proper headers are set
- Test API calls in Postman first

---

## Performance Optimization

### 1. Enable Caching

Add cache headers:
```nginx
# Nginx
location ~* \.(css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. Minify Assets

```bash
# Install minification tools
npm install -g clean-css-cli uglify-js html-minifier

# Minify CSS
cleancss -o styles.min.css styles.css

# Minify JS
uglifyjs script.js -o script.min.js -c -m

# Minify HTML
html-minifier --collapse-whitespace --remove-comments index.html -o index.min.html
```

### 3. Enable Gzip Compression

```nginx
# Nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;
```

### 4. Use CDN

- CloudFlare (Free tier available)
- AWS CloudFront
- Fastly

---

## Monitoring & Analytics

### Google Analytics

Add to `index.html` before `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Uptime Monitoring

- [UptimeRobot](https://uptimerobot.com/) - Free
- [Pingdom](https://www.pingdom.com/)
- [StatusCake](https://www.statuscake.com/)

---

## Support

For deployment issues:
- **Email**: montaquim.tbm@gmail.com
- **GitHub Issues**: [https://github.com/AverageTaaf/weatherify/issues](https://github.com/AverageTaaf/weatherify/issues)

---

*Last Updated: September 30, 2025*
