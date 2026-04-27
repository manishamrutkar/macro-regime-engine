# System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      DATA SOURCES                           │
│  FRED API    Yahoo Finance    CoinGecko    RSS News Feeds   │
└──────────┬──────────┬──────────────┬───────────────┬────────┘
           │          │              │               │
           ▼          ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                   PYTHON ENGINE                             │
│                                                             │
│  data_fetcher.py  →  data_loader.py  →  feature_eng.py     │
│                              │                              │
│                              ▼                              │
│                    regime_model.py (K-Means)                │
│                              │                              │
│          ┌───────────────────┼───────────────────┐          │
│          ▼                   ▼                   ▼          │
│  transition_matrix    risk_engine.py     backtest_engine    │
│  var_engine.py        monte_carlo.py     forecast_model     │
│  sentiment_engine     sector_engine      yield_curve        │
│                              │                              │
│                         main.py  →  results.json            │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON via child_process
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   NODE.JS BACKEND                           │
│                                                             │
│  server.js  →  routes/  →  controllers/  →  pythonRunner   │
│                                  │                          │
│                          PostgreSQL DB                      │
│  Tables: regimes, risk_metrics, backtest_results,           │
│          sentiment_scores, market_data, forecast_log        │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (port 5000)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  REACT FRONTEND                             │
│                                                             │
│  App.jsx                                                    │
│  ├── Navbar (live regime status)                            │
│  ├── Sidebar (navigation)                                   │
│  └── Pages                                                  │
│      ├── Dashboard    (all panels + charts)                 │
│      ├── Portfolio    (simulator + monte carlo)             │
│      ├── Forecast     (AI predictions + transitions)        │
│      ├── Research     (methodology + interview prep)        │
│      └── Settings     (API keys + config)                   │
│                                                             │
│  Data Flow: hooks/ → services/ → api.js → backend          │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow (Full Pipeline)

```
1.  DataFetcher.fetch_all()
      ├── FRED: CPI, FED_RATE, M2, YIELDS → fred_*.csv
      ├── Yahoo: SP500, GOLD, BTC, ETH, OIL, FX → yahoo_*.csv
      └── CoinGecko: fallback for crypto → cg_*.csv

2.  DataLoader.load_and_clean()
      ├── Load all CSVs → pd.DataFrame
      ├── Resample to monthly (MS) frequency
      ├── Forward-fill missing values (max 3 months)
      └── Save → data/processed/master_data.csv

3.  FeatureEngineer.build_features()
      ├── inflation_yoy = CPI.pct_change(12)
      ├── real_rate = FED_RATE - inflation_yoy
      ├── liquidity_yoy = M2.pct_change(12)
      ├── log returns for each asset
      ├── rolling 12M volatility
      └── rolling 12M correlations

4.  RegimeModel.fit_predict()
      ├── Z-score: [inflation_yoy, real_rate, liquidity_yoy]
      ├── KMeans(k=4, n_init=50) → raw clusters
      ├── Interpret clusters by centroid values
      └── Save → regime_model.pkl + regimes.csv

5.  TransitionMatrix.compute()
      └── P(i→j) from consecutive regime pairs

6.  RiskEngine.compute()
      └── Sharpe, Sortino, MaxDD, Calmar per regime × asset

7.  BacktestEngine.run()
      ├── Walk-forward: regime(T) → weights(T+1)
      └── Compare vs 60/40, Gold, S&P benchmarks

8.  (Parallel modules)
      ├── SentimentEngine.analyze()
      ├── ForecastModel.predict()
      ├── MonteCarloSimulator.run()
      ├── VaREngine.compute()
      ├── SectorEngine.analyze()
      └── YieldCurveAnalyzer.analyze()

9.  main.py → results.json (all outputs merged)

10. Node backend reads results.json via child_process
    → serves via REST API → React frontend
```

## Port Map

| Service | Port |
|---|---|
| React Frontend | 3000 |
| Node Backend | 5000 |
| PostgreSQL | 5432 |

## Key Design Decisions

| Decision | Rationale |
|---|---|
| K-Means over GMM | Hard assignments are easier to interpret and act on |
| k=4 | Four economic quadrants from theory (not data-driven) |
| Z-score before clustering | Prevents scale dominance |
| 1-month lag in backtest | Eliminates look-ahead bias |
| Bootstrap Monte Carlo | Avoids normal distribution assumption |
| RandomForest forecast | Handles non-linear feature interactions, works without GPU |
| Node bridges Python | Allows Python ML + Node web server without rewriting engine |
| PostgreSQL | Stores historical regimes for timeline chart |
