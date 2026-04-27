# 🏦 Macro Regime Engine

> AI-Powered Cross-Asset Risk & Regime Intelligence System

A full-stack quantitative finance project that detects macro economic regimes using K-Means clustering and dynamically allocates across assets based on regime-specific risk profiles.

---

## 🧠 Architecture

```
FRED + Yahoo Finance + CoinGecko
         ↓
  Python Engine (ML + Quant)
         ↓
  Node.js REST API
         ↓
  React Dashboard (Glassmorphism UI)
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 15+

### 2. Python Engine
```bash
cd python_engine
pip install -r ../requirements.txt
cp ../.env.example .env          # add your FRED_API_KEY
python main.py --mode full       # fetch data + train model
```

### 3. Backend
```bash
cd backend
cp .env.example .env             # configure DB credentials
npm install
npm run dev                      # starts on port 5000
```

### 4. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm start                        # starts on port 3000
```

### 5. With Docker
```bash
docker-compose up --build
```

---

## 📊 Features

| Feature | Description |
|---|---|
| **Regime Detection** | K-Means on Z-scored macro signals |
| **Transition Matrix** | Markov regime persistence probabilities |
| **AI Forecast** | Random Forest next-month regime prediction |
| **Dynamic Allocation** | Regime-specific portfolio weights |
| **Risk Engine** | Sharpe, Sortino, Max Drawdown, Calmar |
| **VaR / CVaR** | Historical + parametric risk metrics |
| **Monte Carlo** | 1,000-path bootstrap simulation |
| **News Sentiment** | RSS feed NLP scoring |
| **Fear & Greed** | Composite sentiment index |
| **Sector Rotation** | Per-regime sector performance |
| **Yield Curve** | Inversion detection + recession signal |

---

## 📁 Project Structure

```
macro-regime-engine/
├── python_engine/     # ML + quant engine (17 files)
├── backend/           # Node.js REST API
│   ├── routes/        # 7 route files
│   ├── controllers/   # 7 controllers + Python bridge
│   └── db/            # PostgreSQL schema
├── frontend/          # React + Vite dashboard
│   └── src/
│       ├── pages/     # 5 pages
│       ├── components/# charts, panels, layout, ui
│       ├── hooks/     # 6 custom hooks
│       ├── services/  # 7 API service files
│       └── utils/     # formatters, calculations, constants
├── data/              # raw + processed CSVs
└── docs/              # research report + API docs
```

---

## 🎯 Tech Stack

- **Python**: pandas, numpy, scikit-learn, yfinance, fredapi
- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: React 18, Vite, Recharts, Chart.js, Framer Motion
- **DevOps**: Docker Compose

---

## 📝 FRED API Key

Get a free key at: https://fred.stlouisfed.org/docs/api/api_key.html

---

## ⚠️ Disclaimer

This project is for educational and research purposes only. Not financial advice.
