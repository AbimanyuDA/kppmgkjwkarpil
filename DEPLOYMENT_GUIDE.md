# 🚀 Deployment Guide - GKJW Finance System

Panduan lengkap untuk deploy aplikasi GKJW Finance System ke production.

## 📋 Table of Contents

1. [Persiapan](#persiapan)
2. [Deploy Database](#deploy-database)
3. [Deploy Backend](#deploy-backend)
4. [Deploy Frontend](#deploy-frontend)
5. [Setup Domain & SSL](#setup-domain--ssl)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🔧 Persiapan

### Checklist Sebelum Deploy

- [ ] Code sudah final dan tested
- [ ] Environment variables sudah diset
- [ ] Database migration sudah siap
- [ ] API endpoints sudah tested
- [ ] Frontend build berhasil
- [ ] Security review completed

---

## 🗄️ Deploy Database

### Option 1: Supabase (Recommended - FREE tier available)

1. **Buat Account di [Supabase](https://supabase.com)**

2. **Create New Project**

   ```
   Project Name: GKJW Finance
   Database Password: [generate strong password]
   Region: Southeast Asia (Singapore)
   ```

3. **Get Connection String**

   ```
   Settings → Database → Connection String
   ```

4. **Run Migration**

   ```bash
   psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f backend/migrations/001_init.sql
   ```

5. **Connection Details untuk Backend**
   ```
   DB_HOST=db.[project-ref].supabase.co
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=[your-password]
   DB_NAME=postgres
   ```

### Option 2: Railway (Alternative)

1. Visit [Railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy connection details
4. Run migration using provided URL

### Option 3: Self-hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE gkjw_finance;
CREATE USER gkjw_user WITH ENCRYPTED PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE gkjw_finance TO gkjw_user;

# Run migration
psql -U gkjw_user -d gkjw_finance -f migrations/001_init.sql
```

---

## 🖥️ Deploy Backend (Golang)

### Option 1: Railway (Recommended - Easiest)

1. **Push Code ke GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin [your-repo-url]
   git push -u origin main
   ```

2. **Deploy ke Railway**

   - Visit [Railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Select your repository
   - Select `backend` folder as root

3. **Set Environment Variables**

   ```
   DB_HOST=[from supabase]
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=[your-password]
   DB_NAME=postgres
   JWT_SECRET=[generate-random-string]
   PORT=8080
   ```

4. **Generate Domain**
   - Settings → Generate Domain
   - Copy domain: `https://your-app.railway.app`

### Option 2: Render

1. **Create Web Service**

   - Visit [Render.com](https://render.com)
   - New → Web Service
   - Connect GitHub repo

2. **Configure Service**

   ```
   Name: gkjw-finance-backend
   Environment: Go
   Build Command: go build -o main main.go
   Start Command: ./main
   ```

3. **Add Environment Variables**
   - Same as Railway above

### Option 3: Docker + DigitalOcean

1. **Create Dockerfile** (already provided in project)

2. **Build & Push to Registry**

   ```bash
   docker build -t gkjw-backend .
   docker tag gkjw-backend your-registry/gkjw-backend
   docker push your-registry/gkjw-backend
   ```

3. **Deploy to DigitalOcean**
   - Create Droplet
   - Pull image
   - Run container with env vars

### Testing Backend

```bash
# Test if backend is running
curl https://your-backend-url.com/api/auth/login

# Should return 400 (Bad Request) - means API is working
```

---

## 🌐 Deploy Frontend (Next.js)

### Option 1: Vercel (Recommended - Best for Next.js)

1. **Push Code ke GitHub** (if not already)

2. **Deploy to Vercel**

   - Visit [Vercel.com](https://vercel.com)
   - New Project → Import from GitHub
   - Select `frontend` folder as root

3. **Configure Build Settings**

   ```
   Framework Preset: Next.js
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Set Environment Variables**

   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
   NEXT_PUBLIC_APP_NAME=GKJW Finance System
   ```

5. **Deploy**
   - Click Deploy
   - Wait for build to complete
   - Get URL: `https://your-app.vercel.app`

### Option 2: Netlify

1. **Connect Repository**

   - Visit [Netlify.com](https://netlify.com)
   - New site from Git

2. **Build Settings**

   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Environment Variables**
   - Same as Vercel

### Option 3: Self-hosted with PM2

```bash
# Install dependencies
cd frontend
npm install

# Build
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "gkjw-frontend" -- start

# Save PM2 config
pm2 save
pm2 startup
```

---

## 🌍 Setup Domain & SSL

### Custom Domain Setup

1. **Buy Domain** (e.g., from Niagahoster, Namecheap)

2. **Configure DNS**

   ```
   Type: A Record
   Name: @
   Value: [your-server-ip or CNAME to vercel]

   Type: CNAME
   Name: api
   Value: [your-backend-domain]
   ```

3. **SSL Certificate**

   **For Vercel/Netlify (Automatic):**

   - Add custom domain in settings
   - SSL automatically configured

   **For Self-hosted:**

   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx

   # Get certificate
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## 📊 Monitoring & Maintenance

### 1. Setup Monitoring

#### Backend Monitoring (Railway/Render)

- Use built-in metrics dashboard
- Set up email alerts for downtime

#### Custom Monitoring

```bash
# Install Uptime Kuma (Self-hosted monitoring)
docker run -d --restart=always -p 3001:3001 -v uptime-kuma:/app/data --name uptime-kuma louislam/uptime-kuma:1
```

### 2. Database Backup

#### Supabase (Automatic daily backups)

#### Manual Backup

```bash
# Backup database
pg_dump -U postgres -h [host] -d gkjw_finance > backup_$(date +%Y%m%d).sql

# Setup cron for daily backup
0 2 * * * /usr/bin/pg_dump -U postgres -d gkjw_finance > /backups/backup_$(date +\%Y\%m\%d).sql
```

### 3. Log Monitoring

```bash
# Railway/Render: Check logs in dashboard

# Self-hosted with PM2
pm2 logs gkjw-frontend
pm2 logs gkjw-backend
```

### 4. Security Checklist

- [ ] Change default passwords
- [ ] Enable HTTPS/SSL
- [ ] Setup firewall rules
- [ ] Regular security updates
- [ ] Implement rate limiting
- [ ] Setup CORS properly
- [ ] Use strong JWT secret

### 5. Performance Optimization

#### Frontend

```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

#### Backend

- Use connection pooling
- Add Redis caching (optional)
- Implement pagination
- Optimize database queries

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          # Railway auto-deploys on push

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          # Vercel auto-deploys on push
```

---

## 📞 Troubleshooting

### Common Issues

1. **CORS Error**

   ```go
   // backend/main.go - check CORS settings
   router.Use(func(c *gin.Context) {
       c.Writer.Header().Set("Access-Control-Allow-Origin", "https://your-frontend.com")
       // ...
   })
   ```

2. **Database Connection Failed**

   - Check connection string
   - Verify firewall rules
   - Test connection: `psql "postgres://..."`

3. **JWT Token Invalid**

   - Ensure JWT_SECRET matches on backend
   - Check token expiration time

4. **Build Failed**
   - Check Node/Go version
   - Clear cache: `npm clean-install`
   - Check environment variables

---

## 📋 Post-Deployment Checklist

- [ ] Test all user flows (login, create transaction, approve, etc.)
- [ ] Verify database connection
- [ ] Test file upload functionality
- [ ] Check API response times
- [ ] Verify email notifications (if implemented)
- [ ] Test on mobile devices
- [ ] Setup monitoring alerts
- [ ] Configure automatic backups
- [ ] Document production URLs
- [ ] Train end users

---

## 💰 Cost Estimation (Monthly)

### Free Tier Setup

- **Database**: Supabase (Free - 500MB)
- **Backend**: Railway (Free - 500 hours)
- **Frontend**: Vercel (Free - unlimited)
- **Total**: FREE

### Production Setup

- **Database**: Supabase Pro ($25)
- **Backend**: Railway Pro ($5-20)
- **Frontend**: Vercel Pro ($20)
- **Domain**: $10-15/year
- **Total**: ~$50-70/month

---

## 🎯 Success Metrics

Monitor these metrics post-deployment:

- ✅ Uptime > 99.9%
- ✅ API response time < 200ms
- ✅ Page load time < 2s
- ✅ Zero security vulnerabilities
- ✅ Regular backups running
- ✅ User satisfaction > 90%

---

**Congratulations! Your GKJW Finance System is now live! 🎉**

For support: [your-email@gkjw.com]
