# Macro Regime Engine — API Documentation

Base URL: `http://localhost:5000/api`

---

## Regime Endpoints

### GET /regime/current
Returns the current detected macro regime.

**Response:**
```json
{
  "regime_id": 2,
  "regime_name": "Liquidity Boom",
  "confidence": 0.84,
  "probabilities": {
    "High Inflation": 0.08,
    "Tight Policy": 0.22,
    "Liquidity Boom": 0.58,
    "Recession": 0.12
  }
}
```

### GET /regime/history
Returns historical regime assignments from the database.

**Response:**
```json
[
  { "date": "2024-01-01", "regime_id": 2, "label": "Liquidity Boom", "confidence": 0.84 }
]
```

### GET /regime/transition-matrix
Returns the Markov transition probability matrix.

**Response:**
```json
{
  "High Inflation": { "High Inflation": 0.60, "Tight Policy": 0.20, "Liquidity Boom": 0.10, "Recession": 0.10 },
  "Tight Policy":   { "High Inflation": 0.15, "Tight Policy": 0.55, "Liquidity Boom": 0.20, "Recession": 0.10 },
  "Liquidity Boom": { "High Inflation": 0.10, "Tight Policy": 0.15, "Liquidity Boom": 0.65, "Recession": 0.10 },
  "Recession":      { "High Inflation": 0.20, "Tight Policy": 0.25, "Liquidity Boom": 0.15, "Recession": 0.40 }
}
```

### POST /regime/refresh
Triggers a full data fetch + model retrain. Long-running (~5min).

**Response:**
```json
{ "status": "ok", "current_regime": { "regime_id": 2, "regime_name": "Liquidity Boom" } }
```

---

## Risk Endpoints

### GET /risk/metrics?regime=Liquidity+Boom
Returns per-asset risk metrics for a given regime.

**Query Params:** `regime` (optional) — filter by regime name

**Response:**
```json
{
  "Liquidity Boom": {
    "SP500": { "cagr": 0.22, "sharpe": 1.42, "sortino": 1.89, "max_drawdown": -0.18, "calmar": 1.22 },
    "GOLD":  { "cagr": 0.10, "sharpe": 0.88, "sortino": 1.10, "max_drawdown": -0.14, "calmar": 0.71 }
  }
}
```

### GET /risk/var
Returns VaR and CVaR metrics for the strategy and benchmarks.

**Response:**
```json
{
  "strategy": {
    "hist_var_95": -0.042, "hist_cvar_95": -0.068,
    "para_var_95": -0.039, "para_cvar_95": -0.062,
    "hist_var_99": -0.068, "hist_cvar_99": -0.091
  }
}
```

---

## Backtest Endpoints

### GET /backtest/results
Returns backtest performance data.

**Response:**
```json
{
  "summary": {
    "strategy":  { "cagr": 0.22, "sharpe": 1.42, "max_drawdown": -0.18 },
    "bm_6040":   { "cagr": 0.08, "sharpe": 0.72, "max_drawdown": -0.24 }
  },
  "cumulative": [
    { "date": "2018-01-01", "strategy": 100, "bm_6040": 100, "bm_gold": 100, "bm_sp500": 100 }
  ]
}
```

---

## Forecast Endpoints

### GET /forecast/next-regime
Returns next-month regime probability forecast.

**Response:**
```json
{
  "predicted_regime": 2,
  "predicted_regime_name": "Liquidity Boom",
  "probabilities": {
    "High Inflation": 0.13,
    "Tight Policy":   0.22,
    "Liquidity Boom": 0.58,
    "Recession":      0.07
  },
  "model": "RandomForest"
}
```

---

## Sentiment Endpoints

### GET /sentiment/scores
Returns per-source sentiment scores.

**Response:**
```json
{
  "overall_score": 42.5,
  "overall_label": "Bullish",
  "sources": {
    "Reuters":   { "score": 58, "label": "Bullish", "article_count": 24 },
    "Bloomberg": { "score": -12, "label": "Bearish", "article_count": 18 }
  },
  "fear_greed": { "score": 62, "label": "Greed" }
}
```

### GET /sentiment/fear-greed
Returns Fear & Greed index only.

**Response:**
```json
{ "score": 62, "label": "Greed" }
```

---

## Portfolio Endpoints

### POST /portfolio/simulate
Simulates a custom portfolio given weights.

**Request Body:**
```json
{ "SP500": 0.40, "GOLD": 0.25, "BTC": 0.20, "BONDS": 0.15 }
```

**Response:**
```json
{
  "weights": { "SP500": 0.40, "GOLD": 0.25, "BTC": 0.20, "BONDS": 0.15 },
  "metrics": {
    "estimated_cagr": 0.184,
    "estimated_volatility": 0.162,
    "estimated_sharpe": 1.14
  }
}
```

### GET /portfolio/monte-carlo
Returns Monte Carlo simulation results (1,000 paths, 10 years).

---

## Market Endpoints

### GET /market/tickers
Returns latest macro indicator values.

### GET /market/yield-curve
Returns full yield curve data and inversion status.

**Response:**
```json
{
  "latest_yields":  { "2Y": 4.9, "5Y": 4.5, "10Y": 4.5, "30Y": 4.7 },
  "spreads":        { "2Y_10Y": -0.42 },
  "inverted_2y10y": true,
  "curve_shape":    "Inverted",
  "recession_signal": true
}
```

### GET /market/sectors
Returns sector rotation data per regime.

---

## Health Check

### GET /health
```json
{ "status": "ok", "timestamp": "2025-04-21T10:00:00.000Z" }
```

---

## Error Format

All errors return:
```json
{ "error": "Human-readable error message", "path": "/api/route", "method": "GET" }
```

| HTTP Code | Meaning |
|---|---|
| 400 | Bad request (e.g. weights don't sum to 1) |
| 404 | Route not found |
| 500 | Server/Python engine error |
