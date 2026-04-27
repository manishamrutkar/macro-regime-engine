# 🚀 Complete Setup Guide — Macro Regime Engine

Follow these steps exactly and the project will run without any issues.

---

## Prerequisites

Install these before starting:

| Tool | Version | Download |
|---|---|---|
| Python | 3.10+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| PostgreSQL | 15+ | https://postgresql.org |
| Git | Any | https://git-scm.com |

---

## Step 1 — Get a Free FRED API Key

1. Go to: https://fred.stlouisfed.org/docs/api/api_key.html
2. Create a free account
3. Copy your API key (looks like: `abc123def456...`)

---

## Step 2 — Set Up PostgreSQL

```bash
# On Mac (using Homebrew)
brew install postgresql@15
brew services start postgresql@15

# On Ubuntu/Debian
sudo apt install postgresql-15
sudo systemctl start postgresql

# On Windows
# Download installer from https://postgresql.org/download/windows/
```

Create the database:
```sql
psql -U postgres
CREATE DATABASE macro_regime_db;
\q
```

---

## Step 3 — Clone and Configure

```bash
git clone <your-repo-url>
cd macro-regime-engine
```

### Configure Backend
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env`:
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=macro_regime_db
DB_USER=postgres
DB_PASSWORD=<your_postgres_password>

FRED_API_KEY=<your_fred_api_key>
```

### Configure Python Engine
```bash
cd ../python_engine
cp .env.example .env
```
Edit `python_engine/.env`:
```
FRED_API_KEY=<your_fred_api_key>
```

### Configure Frontend
```bash
cd ../frontend
cp .env.example .env
```
`frontend/.env` can stay as-is for local development.

---

## Step 4 — Install Python Dependencies

```bash
cd macro-regime-engine
pip install -r requirements.txt
```

> ⚠️ If you're on Python 3.12+, use: `pip install -r requirements.txt --ignore-requires-python`

---

## Step 5 — Run the Python Pipeline (First Time)

This fetches all data and trains the model. Takes ~5–10 minutes.

```bash
cd python_engine
python main.py --mode full
```

You should see logs like:
```
INFO  FRED | CPI → 180 rows saved
INFO  Yahoo | SP500 → 180 rows saved
INFO  Fitting K-Means with k=4 on 168 samples...
INFO  Silhouette score: 0.4231
INFO  Pipeline complete
```

---

## Step 6 — Set Up the Database

```bash
cd backend
psql -U postgres -d macro_regime_db -f db/schema.sql
psql -U postgres -d macro_regime_db -f db/seed.sql
```

---

## Step 7 — Start the Backend

```bash
cd backend
npm install
npm run dev
```

You should see:
```
🚀  Backend running on http://localhost:5000
```

Test it:
```bash
curl http://localhost:5000/health
# → {"status":"ok","timestamp":"..."}
```

---

## Step 8 — Start the Frontend

Open a new terminal:
```bash
cd frontend
npm install
npm start
```

You should see:
```
  VITE v5.x  ready in 300ms
  ➜  Local:   http://localhost:3000/
```

Open http://localhost:3000 in your browser. 🎉

---

## Step 9 — Verify Everything Works

Open the browser and check:
- ✅ Navbar shows "Liquidity Boom" badge (or current regime)
- ✅ Dashboard loads ticker bar (8 tickers)
- ✅ Regime panel shows Z-score bars
- ✅ Performance chart renders
- ✅ Portfolio page sliders work

---

## Step 10 — Run Tests

### Python Tests
```bash
cd python_engine
pytest ../tests/python/ -v
```

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## Docker (Alternative — Runs Everything at Once)

```bash
cd macro-regime-engine
docker-compose up --build
```

This starts PostgreSQL, Backend (port 5000), and Frontend (port 3000) together.

---

## Refresh Data (Daily/Weekly)

To fetch new data and retrain the model:
```bash
cd python_engine
python main.py --mode full
```

Or via the API:
```bash
curl -X POST http://localhost:5000/api/regime/refresh
```

---

## Common Issues

| Issue | Fix |
|---|---|
| `FRED_API_KEY not set` | Add key to `python_engine/.env` |
| `psycopg2 error` | Install: `pip install psycopg2-binary` |
| `Port 5000 in use` | Change `PORT=5001` in `backend/.env` |
| `yfinance timeout` | Run `python main.py --mode full` again (Yahoo rate limits) |
| `Module not found` | Run `npm install` in backend/ and frontend/ |
| `No cached results` | Run `python main.py --mode full` first |

---

## Project URLs (Local Dev)

| Service | URL |
|---|---|
| Frontend Dashboard | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/health |
| API Docs | See docs/api_docs.md |

---

## File You Will Edit Most

1. `python_engine/config.py` — change tickers, regime names, allocation weights
2. `backend/.env` — credentials
3. `frontend/src/utils/constants.js` — colors, labels
4. `python_engine/main.py` — add/remove pipeline steps

---

Happy building! 🚀
