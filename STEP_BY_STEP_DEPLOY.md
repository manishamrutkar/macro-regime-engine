# 🚀 Step-by-Step Deployment Guide
# From ZIP file to Live URL on Railway (FREE)
# Total time: ~45 minutes

═══════════════════════════════════════════════════════
  PHASE 0 — BEFORE YOU START (One time setup)
═══════════════════════════════════════════════════════

Things you need to get BEFORE starting:

┌─────────────────────────────────────────────────────┐
│  1. FRED API Key (FREE - 2 minutes)                 │
│     → Go to: https://fred.stlouisfed.org            │
│     → Click "My Account" → "API Keys"               │
│     → Request API Key → Copy it                     │
│     → Looks like: abc123def456abc123def456          │
├─────────────────────────────────────────────────────┤
│  2. Groq API Key (FREE - 2 minutes)                 │
│     → Go to: https://console.groq.com               │
│     → Sign up with Google                           │
│     → Click "API Keys" → "Create API Key"           │
│     → Looks like: gsk_abc123...                     │
├─────────────────────────────────────────────────────┤
│  3. GitHub Account (FREE)                           │
│     → https://github.com → Sign up                  │
├─────────────────────────────────────────────────────┤
│  4. Railway Account (FREE)                          │
│     → https://railway.app → Sign up with GitHub     │
└─────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════
  PHASE 1 — EXTRACT AND SETUP ON YOUR PC
═══════════════════════════════════════════════════════

STEP 1: Extract the ZIP
─────────────────────────────────────────────────────
  Windows: Right click ZIP → "Extract All" → Extract
  Mac:     Double click the ZIP file
  Linux:   unzip macro-regime-engine-v2-COMPLETE.zip

  You will get a folder called: macro-regime-engine

STEP 2: Install Required Software
─────────────────────────────────────────────────────
  Check if you have these (open terminal/cmd and type):

  python --version    → Need 3.10 or higher
  node --version      → Need 18 or higher
  git --version       → Need any version

  If missing, download:
  Python → https://python.org/downloads
  Node   → https://nodejs.org (download LTS version)
  Git    → https://git-scm.com/downloads

STEP 3: Open Terminal in Project Folder
─────────────────────────────────────────────────────
  Windows:
    → Open the extracted folder
    → Click address bar → type "cmd" → press Enter

  Mac:
    → Right click folder → "New Terminal at Folder"

  Linux:
    → cd macro-regime-engine

STEP 4: Create Environment Files
─────────────────────────────────────────────────────
  Run these commands ONE BY ONE:

  # For backend
  cd backend
  copy .env.example .env        ← Windows
  cp .env.example .env          ← Mac/Linux

  # Now open backend/.env in Notepad/VS Code and fill in:
  FRED_API_KEY=paste_your_fred_key_here
  GROQ_API_KEY=paste_your_groq_key_here
  DB_PASSWORD=choose_any_password_eg_MyPass123
  PORT=5000
  NODE_ENV=development

  # Go back to root
  cd ..

  # For python engine
  cd python_engine
  copy .env.example .env        ← Windows
  cp .env.example .env          ← Mac/Linux

  # Open python_engine/.env and fill in:
  FRED_API_KEY=paste_your_fred_key_here
  GROQ_API_KEY=paste_your_groq_key_here

  cd ..

  # For frontend
  cd frontend
  copy .env.example .env        ← Windows
  cp .env.example .env          ← Mac/Linux

  # Open frontend/.env - keep as is for now:
  VITE_API_BASE_URL=http://localhost:5000/api

  cd ..

STEP 5: Install Python Dependencies
─────────────────────────────────────────────────────
  # In the root macro-regime-engine folder:

  pip install pandas numpy scikit-learn scipy requests python-dotenv yfinance fredapi

  # For RAG features (optional but recommended):
  pip install sentence-transformers faiss-cpu PyPDF2

  # If pip doesn't work, try:
  pip3 install pandas numpy scikit-learn ...

STEP 6: Install Node Dependencies
─────────────────────────────────────────────────────
  # Backend:
  cd backend
  npm install
  cd ..

  # Frontend:
  cd frontend
  npm install
  cd ..

STEP 7: Run the Python Pipeline (IMPORTANT - Do this first)
─────────────────────────────────────────────────────
  cd python_engine
  python main.py --mode full
  # OR
  python3 main.py --mode full

  This will:
  ✓ Fetch data from FRED and Yahoo Finance
  ✓ Train the K-Means model
  ✓ Run backtest
  ✓ Save results.json

  Takes about 5-10 minutes. You will see logs like:
  INFO FRED | CPI → 180 rows saved
  INFO Yahoo | SP500 → 180 rows saved
  INFO Fitting K-Means...
  INFO Pipeline complete ✅

  cd ..

STEP 8: Test Locally (Optional but recommended)
─────────────────────────────────────────────────────
  Terminal 1 (Backend):
    cd backend
    npm run dev
    → Should see: 🚀 Backend running on port 5000

  Terminal 2 (Frontend):
    cd frontend
    npm start
    → Should see: Local: http://localhost:3000

  Open browser → http://localhost:3000
  → You should see the glassmorphism dashboard!

  If it works locally → ready to deploy to cloud ✅

═══════════════════════════════════════════════════════
  PHASE 2 — PUSH TO GITHUB
═══════════════════════════════════════════════════════

STEP 9: Create GitHub Repository
─────────────────────────────────────────────────────
  1. Go to https://github.com
  2. Click the "+" button (top right) → "New repository"
  3. Repository name: macro-regime-engine
  4. Set to PUBLIC (required for Railway free tier)
  5. DO NOT check "Add README" (we have one already)
  6. Click "Create repository"
  7. Copy the repo URL shown:
     https://github.com/YOUR_USERNAME/macro-regime-engine.git

STEP 10: Initialize Git and Push
─────────────────────────────────────────────────────
  # In the root macro-regime-engine folder:
  # Run these commands ONE BY ONE:

  git init

  # Create .gitignore to exclude secrets
  echo "backend/.env" >> .gitignore
  echo "python_engine/.env" >> .gitignore
  echo "frontend/.env" >> .gitignore
  echo "data/raw/" >> .gitignore
  echo "data/processed/" >> .gitignore
  echo "node_modules/" >> .gitignore
  echo "__pycache__/" >> .gitignore
  echo "*.pkl" >> .gitignore

  git add .
  git commit -m "Macro Regime Engine v2.0 - AI Powered"

  git branch -M main

  git remote add origin https://github.com/YOUR_USERNAME/macro-regime-engine.git
  # REPLACE YOUR_USERNAME with your actual GitHub username!

  git push -u origin main

  # It will ask for GitHub username and password
  # For password: use a Personal Access Token from:
  # GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
  # → Generate new token → check "repo" → copy token → use as password

  ✅ Your code is now on GitHub!

═══════════════════════════════════════════════════════
  PHASE 3 — DEPLOY BACKEND ON RAILWAY
═══════════════════════════════════════════════════════

STEP 11: Create Railway Account
─────────────────────────────────────────────────────
  1. Go to https://railway.app
  2. Click "Login" → "Login with GitHub"
  3. Authorize Railway
  4. You're in! ✅

STEP 12: Create New Railway Project
─────────────────────────────────────────────────────
  1. Click "New Project" (big button)
  2. Click "Deploy from GitHub repo"
  3. Click "Configure GitHub App" if asked
  4. Select your "macro-regime-engine" repo
  5. Railway will start scanning... click "Deploy Now"

STEP 13: Configure Backend Service
─────────────────────────────────────────────────────
  1. Railway creates a service → click on it
  2. Click "Settings" tab
  3. Under "Root Directory" → type: backend
  4. Under "Start Command" → type: node server.js
  5. Click "Deploy" to apply

STEP 14: Add Environment Variables to Backend
─────────────────────────────────────────────────────
  1. Click "Variables" tab in your backend service
  2. Click "New Variable" and add these ONE BY ONE:

  Variable Name          Value
  ─────────────────────  ─────────────────────────────
  FRED_API_KEY           your_fred_api_key_here
  GROQ_API_KEY           your_groq_api_key_here
  NODE_ENV               production
  PORT                   5000
  PYTHON_CMD             python3

  3. After adding all → click "Deploy" to restart

STEP 15: Add PostgreSQL Database
─────────────────────────────────────────────────────
  1. In your Railway project → click "New" button (top)
  2. Click "Database" → "Add PostgreSQL"
  3. Railway creates a PostgreSQL database automatically
  4. Click on the PostgreSQL service → "Variables" tab
  5. Copy these values:
     PGHOST     → copy value
     PGPORT     → copy value (usually 5432)
     PGDATABASE → copy value
     PGUSER     → copy value
     PGPASSWORD → copy value

  6. Go back to your backend service → "Variables"
  7. Add these variables:
     DB_HOST     = (paste PGHOST value)
     DB_PORT     = (paste PGPORT value)
     DB_NAME     = (paste PGDATABASE value)
     DB_USER     = (paste PGUSER value)
     DB_PASSWORD = (paste PGPASSWORD value)

  8. Click Deploy again

STEP 16: Get Your Backend URL
─────────────────────────────────────────────────────
  1. Click on your backend service
  2. Click "Settings" tab
  3. Under "Networking" → click "Generate Domain"
  4. You get a URL like:
     https://macro-regime-engine-production.up.railway.app

  5. Test it: open browser → paste URL + /health
     https://macro-regime-engine-production.up.railway.app/health
     → Should show: {"status":"ok","version":"2.0"}

  SAVE THIS URL — you need it for the frontend!

═══════════════════════════════════════════════════════
  PHASE 4 — RUN PYTHON PIPELINE ON RAILWAY
═══════════════════════════════════════════════════════

STEP 17: Run the Data Pipeline (One Time)
─────────────────────────────────────────────────────
  Option A: Install Railway CLI (recommended)
    # On Mac:
    brew install railway

    # On Windows (PowerShell as Admin):
    iwr https://railway.app/install.ps1 -useb | iex

    # Login:
    railway login

    # Link to your project:
    railway link

    # Run the pipeline:
    railway run python3 python_engine/main.py --mode full

  Option B: Without CLI (copy results.json)
    # Run locally first (Step 7 above)
    # Then commit the results file:
    git add data/processed/results.json
    git add data/processed/regimes.csv
    git commit -m "Add pre-computed pipeline results"
    git push
    # Railway will auto-redeploy with the data

═══════════════════════════════════════════════════════
  PHASE 5 — DEPLOY FRONTEND ON RAILWAY
═══════════════════════════════════════════════════════

STEP 18: Add Frontend Service to Railway
─────────────────────────────────────────────────────
  1. In your Railway project → click "New" (top)
  2. Click "GitHub Repo" → select same repo again
  3. A new service appears → click on it
  4. Click "Settings":
     Root Directory: frontend
     Build Command:  npm install && npm run build
     Start Command:  (leave empty - it's a static site)

STEP 19: Add Frontend Environment Variables
─────────────────────────────────────────────────────
  1. Click "Variables" tab in frontend service
  2. Add this variable:

  Variable Name          Value
  ─────────────────────  ──────────────────────────────────────────────
  VITE_API_BASE_URL      https://YOUR-BACKEND-URL.up.railway.app/api
  VITE_APP_NAME          Macro Regime Engine

  REPLACE the backend URL with your actual Railway backend URL from Step 16!

  3. Click "Deploy"

STEP 20: Get Your Frontend URL
─────────────────────────────────────────────────────
  1. Click "Settings" → "Generate Domain"
  2. You get:
     https://macro-regime-frontend.up.railway.app

  3. Open it in browser → your dashboard is LIVE! 🎉

STEP 21: Add Frontend URL to Backend (CORS fix)
─────────────────────────────────────────────────────
  1. Go to backend service → Variables
  2. Add:
     FRONTEND_URL = https://macro-regime-frontend.up.railway.app

  3. Deploy backend again

═══════════════════════════════════════════════════════
  PHASE 6 — VERIFY EVERYTHING WORKS
═══════════════════════════════════════════════════════

STEP 22: Test All Endpoints
─────────────────────────────────────────────────────
  Open browser and visit these URLs
  (replace YOUR-BACKEND with your actual Railway backend URL):

  ✅ Health Check:
     https://YOUR-BACKEND.up.railway.app/health
     → {"status":"ok","version":"2.0"}

  ✅ Current Regime:
     https://YOUR-BACKEND.up.railway.app/api/regime/current
     → {"regime_id":2,"regime_name":"Liquidity Boom",...}

  ✅ Frontend Dashboard:
     https://YOUR-FRONTEND.up.railway.app
     → Glassmorphism dashboard loads

  ✅ AI Chat (test in browser console or Postman):
     POST https://YOUR-BACKEND.up.railway.app/api/ai/chat
     Body: {"message":"What is the current macro regime?"}
     → {"role":"assistant","content":"..."}

STEP 23: Test AI Chat in Dashboard
─────────────────────────────────────────────────────
  1. Open your frontend URL
  2. Click "AI Chat" in the sidebar
  3. Type: "What is the current macro regime?"
  4. If GROQ_API_KEY is set → LLM response
  5. If no key → rule-based response (still works!)

═══════════════════════════════════════════════════════
  PHASE 7 — ADD TO RESUME
═══════════════════════════════════════════════════════

STEP 24: Create GitHub README with Live Links
─────────────────────────────────────────────────────
  Edit README.md and add at the top:

  ## 🔴 Live Demo
  - **Dashboard:** https://YOUR-FRONTEND.up.railway.app
  - **API:** https://YOUR-BACKEND.up.railway.app/health

  Push to GitHub:
  git add README.md
  git commit -m "Add live demo links"
  git push

STEP 25: What to put on your resume
─────────────────────────────────────────────────────
  Project Name:  Macro Regime & Cross-Asset Risk Intelligence System
  GitHub:        https://github.com/YOUR_USERNAME/macro-regime-engine
  Live Demo:     https://YOUR-FRONTEND.up.railway.app

═══════════════════════════════════════════════════════
  TROUBLESHOOTING COMMON ISSUES
═══════════════════════════════════════════════════════

❌ Problem: "python not found" on Railway
   Fix: Add variable PYTHON_CMD=python3 in Railway backend

❌ Problem: Frontend shows blank page
   Fix: Check VITE_API_BASE_URL has /api at the end
   Fix: Check backend URL has https:// not http://

❌ Problem: "FRED_API_KEY not set" error
   Fix: Add FRED_API_KEY in Railway backend Variables

❌ Problem: Database connection failed
   Fix: Make sure DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
        are all set in backend Variables from Step 15

❌ Problem: AI Chat says "offline mode"
   Fix: Check GROQ_API_KEY is set correctly in backend Variables
   Fix: Verify backend is running (visit /health URL)

❌ Problem: git push asks for password
   Fix: Use Personal Access Token as password
        GitHub → Settings → Developer Settings →
        Personal Access Tokens → Generate new token →
        Check "repo" scope → Copy → Use as password

❌ Problem: npm install fails on Railway
   Fix: Make sure Root Directory is set to "backend" in Settings

═══════════════════════════════════════════════════════
  QUICK REFERENCE — ALL YOUR URLS
═══════════════════════════════════════════════════════

  Write these down after deployment:

  GitHub:         https://github.com/___/macro-regime-engine
  Backend URL:    https://_____.up.railway.app
  Frontend URL:   https://_____.up.railway.app
  Health Check:   https://_____.up.railway.app/health
  API Regime:     https://_____.up.railway.app/api/regime/current

═══════════════════════════════════════════════════════
  TOTAL TIME ESTIMATE
═══════════════════════════════════════════════════════

  Phase 0 — Get API keys:      5 minutes
  Phase 1 — Local setup:      15 minutes
  Phase 2 — Push to GitHub:    5 minutes
  Phase 3 — Deploy backend:   10 minutes
  Phase 4 — Run pipeline:      5 minutes
  Phase 5 — Deploy frontend:   5 minutes
  Phase 6 — Test & verify:     5 minutes
  ─────────────────────────────────────────
  TOTAL:                      ~50 minutes

  Your project will be LIVE with a public URL! 🚀
