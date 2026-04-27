-- ── Macro Regime Engine — PostgreSQL Schema ──────────────────────────

CREATE TABLE IF NOT EXISTS regimes (
  id          SERIAL PRIMARY KEY,
  date        DATE NOT NULL UNIQUE,
  regime_id   INT NOT NULL CHECK (regime_id BETWEEN 0 AND 3),
  label       VARCHAR(50) NOT NULL,
  confidence  FLOAT,
  inflation_z FLOAT,
  real_rate_z FLOAT,
  liquidity_z FLOAT,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS risk_metrics (
  id           SERIAL PRIMARY KEY,
  regime_id    INT NOT NULL,
  regime_name  VARCHAR(50),
  asset        VARCHAR(20) NOT NULL,
  sharpe       FLOAT,
  sortino      FLOAT,
  max_drawdown FLOAT,
  cagr         FLOAT,
  volatility   FLOAT,
  calmar       FLOAT,
  n_months     INT,
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS backtest_results (
  id             SERIAL PRIMARY KEY,
  date           DATE NOT NULL UNIQUE,
  strategy       FLOAT,
  bm_6040        FLOAT,
  bm_gold        FLOAT,
  bm_sp500       FLOAT,
  cum_strategy   FLOAT,
  cum_6040       FLOAT,
  cum_gold       FLOAT,
  cum_sp500      FLOAT,
  created_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sentiment_scores (
  id          SERIAL PRIMARY KEY,
  source      VARCHAR(50) NOT NULL,
  score       FLOAT NOT NULL,
  label       VARCHAR(20),
  article_count INT,
  fetched_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_data (
  id         SERIAL PRIMARY KEY,
  date       DATE NOT NULL,
  ticker     VARCHAR(20) NOT NULL,
  close      FLOAT,
  UNIQUE(date, ticker),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forecast_log (
  id               SERIAL PRIMARY KEY,
  predicted_regime INT,
  regime_name      VARCHAR(50),
  confidence       FLOAT,
  probabilities    JSONB,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_regimes_date         ON regimes(date);
CREATE INDEX IF NOT EXISTS idx_backtest_date        ON backtest_results(date);
CREATE INDEX IF NOT EXISTS idx_market_data_date     ON market_data(date);
CREATE INDEX IF NOT EXISTS idx_market_data_ticker   ON market_data(ticker);
CREATE INDEX IF NOT EXISTS idx_sentiment_fetched_at ON sentiment_scores(fetched_at);
