# ☁️ Cloud Deployment Guide — Macro Regime Engine

Three options from easiest to most control:

---

## Option 1 — Railway.app (RECOMMENDED — Easiest, Free Tier)

Railway deploys directly from GitHub. No server management needed.

### Step 1: Push to GitHub
```bash
cd macro-regime-engine
git init
git add .
git commit -m "Initial commit - Macro Regime Engine v2.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/macro-regime-engine.git
git push -u origin main
```

### Step 2: Deploy Backend on Railway
1. Go to https://railway.app → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `macro-regime-engine` repo
4. Railway auto-detects the Dockerfile in `/backend`
5. Add these **Environment Variables** in Railway dashboard:
   ```
   FRED_API_KEY      = your_fred_api_key
   DB_PASSWORD       = any_secure_password
   GROQ_API_KEY      = your_groq_key (optional, free at console.groq.com)
   NODE_ENV          = production
   PORT              = 5000
   ```
6. Railway gives you a URL like: `https://macro-regime-engine.up.railway.app`

### Step 3: Add PostgreSQL on Railway
1. In your Railway project → **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway auto-injects `DATABASE_URL` into your backend
3. Copy the `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` from Railway PostgreSQL service
4. Add them to your backend service environment variables

### Step 4: Deploy Frontend on Railway
1. In same Railway project → **"New Service"** → **"GitHub Repo"** again
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   VITE_API_BASE_URL = https://your-backend.up.railway.app/api
   ```
4. Railway builds with `npm run build` and serves the `dist` folder

### Step 5: Run Python Pipeline
```bash
# SSH into Railway backend service (or run via Railway CLI)
railway run python python_engine/main.py --mode full
```

**Total cost: FREE** (Railway free tier: 500 hours/month)

---

## Option 2 — Render.com (Also Free, Good for Always-On)

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy Backend
1. Go to https://render.com → New → **Web Service**
2. Connect GitHub repo
3. Set:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Add environment variables (same as Railway)
5. Render gives you: `https://macro-regime-backend.onrender.com`

### Step 3: Add PostgreSQL on Render
1. Render dashboard → **New** → **PostgreSQL**
2. Free tier: 1GB storage
3. Copy the **Internal Database URL** to your backend env vars

### Step 4: Deploy Frontend on Render
1. New → **Static Site**
2. Root Directory: `frontend`
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Add: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`

**Note:** Render free tier sleeps after 15 min of inactivity (cold start ~30s)

---

## Option 3 — AWS EC2 (Full Control, ~$10/month)

### Step 1: Launch EC2 Instance
```bash
# In AWS Console:
# Launch t3.small (2GB RAM) with Ubuntu 22.04
# Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (Backend), 3000 (Frontend)
```

### Step 2: SSH and Setup
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm python3 python3-pip nginx postgresql postgresql-contrib git

# Clone your repo
git clone https://github.com/YOUR_USERNAME/macro-regime-engine.git
cd macro-regime-engine
```

### Step 3: Setup PostgreSQL
```bash
sudo -u postgres psql
CREATE DATABASE macro_regime_db;
CREATE USER macrouser WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE macro_regime_db TO macrouser;
\q

# Run schema
psql -U macrouser -d macro_regime_db -f backend/db/schema.sql
```

### Step 4: Install Dependencies
```bash
# Python
pip3 install -r requirements.txt

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install && npm run build
```

### Step 5: Configure Environment
```bash
# Create .env in backend/
cp .env.example .env
nano .env   # Fill in your values
```

### Step 6: Run Python Pipeline
```bash
cd python_engine
python3 main.py --mode full
```

### Step 7: Setup PM2 (Process Manager)
```bash
sudo npm install -g pm2

# Start backend
cd /home/ubuntu/macro-regime-engine/backend
pm2 start server.js --name "macro-backend"

# Save PM2 config
pm2 save
pm2 startup
```

### Step 8: Setup Nginx (Reverse Proxy)
```bash
sudo nano /etc/nginx/sites-available/macro-regime

# Paste this config:
server {
    listen 80;
    server_name your-ec2-ip;

    # Frontend
    location / {
        root /home/ubuntu/macro-regime-engine/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /health {
        proxy_pass http://localhost:5000/health;
    }
}

sudo ln -s /etc/nginx/sites-available/macro-regime /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 9: (Optional) Free SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

**Your app is now live at http://your-ec2-ip** 🚀

---

## Option 4 — Docker Compose on Any VPS (DigitalOcean, Linode)

```bash
# On your VPS (Ubuntu):
sudo apt install docker.io docker-compose -y

# Clone repo
git clone https://github.com/YOUR_USERNAME/macro-regime-engine.git
cd macro-regime-engine

# Create .env
cp .env.example .env
nano .env   # Fill FRED_API_KEY, DB_PASSWORD, etc.

# Build and run everything
docker-compose up --build -d

# Run pipeline inside container
docker-compose exec backend python3 python_engine/main.py --mode full

# Check logs
docker-compose logs -f backend
```

**App runs on:** `http://your-vps-ip:3000`

---

## Getting a Free Groq API Key (for AI Chat features)

1. Go to https://console.groq.com
2. Sign up free (no credit card)
3. Create API key
4. Add to your environment: `GROQ_API_KEY=gsk_...`
5. Free tier: 30 requests/min with Llama3-8B — more than enough

---

## Environment Variables Cheatsheet

| Variable | Where to get | Required? |
|---|---|---|
| `FRED_API_KEY` | https://fred.stlouisfed.org | ✅ Yes |
| `DB_PASSWORD` | You choose | ✅ Yes |
| `GROQ_API_KEY` | https://console.groq.com | ⭐ Recommended (free) |
| `OPENAI_API_KEY` | https://platform.openai.com | Optional |
| `VITE_API_BASE_URL` | Your backend URL + /api | ✅ Frontend |
| `FRONTEND_URL` | Your frontend URL | Optional |

---

## Verify Deployment

After deploying, test these URLs:

```bash
# Backend health
curl https://your-backend-url/health
# → {"status":"ok","timestamp":"...","version":"2.0"}

# Regime endpoint
curl https://your-backend-url/api/regime/current
# → {"regime_id":2,"regime_name":"Liquidity Boom",...}

# AI chat
curl -X POST https://your-backend-url/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the current macro regime?"}'
# → {"role":"assistant","content":"..."}
```

---

## Cost Summary

| Platform | Cost | Best For |
|---|---|---|
| Railway | Free (500h/month) | Demo, interviews |
| Render | Free (with sleep) | Personal projects |
| AWS EC2 t3.small | ~$15/month | Production |
| DigitalOcean Droplet | ~$6/month | Production |
| Docker on VPS | $4-10/month | Full control |

**For interview demos → Use Railway (free, instant, shareable URL)**
