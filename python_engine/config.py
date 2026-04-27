"""
config.py
Central configuration for the Macro Regime Engine.
All constants, API keys, tickers, and model parameters live here.
"""

import os
import pathlib
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────
#  API KEYS
# ─────────────────────────────────────────────
FRED_API_KEY = os.getenv("FRED_API_KEY", "")

# ─────────────────────────────────────────────
#  FRED SERIES IDs
# ─────────────────────────────────────────────
FRED_SERIES = {
    "CPI":       "CPIAUCSL",
    "FED_RATE":  "FEDFUNDS",
    "M2":        "M2SL",
    "YIELD_2Y":  "DGS2",
    "YIELD_5Y":  "DGS5",
    "YIELD_10Y": "DGS10",
    "YIELD_30Y": "DGS30",
    "UNRATE":    "UNRATE",
    "GDP":       "GDP",
}

# ─────────────────────────────────────────────
#  YAHOO FINANCE TICKERS
# ─────────────────────────────────────────────
YAHOO_TICKERS = {
    "SP500":  "^GSPC",
    "GOLD":   "GC=F",
    "OIL":    "CL=F",
    "SILVER": "SI=F",
    "COPPER": "HG=F",
    "DXY":    "DX-Y.NYB",
    "EURUSD": "EURUSD=X",
    "BTC":    "BTC-USD",
    "ETH":    "ETH-USD",
    "SOL":    "SOL-USD",
    "BNB":    "BNB-USD",
}

# ─────────────────────────────────────────────
#  DATA CONFIG
# ─────────────────────────────────────────────
START_DATE     = "2010-01-01"
END_DATE       = None
FREQUENCY      = "MS"
ROLLING_WINDOW = 12

# ─────────────────────────────────────────────
#  REGIME MODEL CONFIG
# ─────────────────────────────────────────────
N_REGIMES    = 4
RANDOM_STATE = 42
N_INIT       = 50
MAX_ITER     = 500

REGIME_NAMES = {
    0: "High Inflation",
    1: "Tight Policy",
    2: "Liquidity Boom",
    3: "Recession",
}

REGIME_COLORS = {
    0: "#f59e0b",
    1: "#3b82f6",
    2: "#10b981",
    3: "#ef4444",
}

# ─────────────────────────────────────────────
#  DYNAMIC ALLOCATION PER REGIME
# ─────────────────────────────────────────────
REGIME_ALLOCATION = {
    0: {"SP500": 0.20, "GOLD": 0.40, "BTC": 0.10, "BONDS": 0.20, "OIL": 0.10},
    1: {"SP500": 0.20, "GOLD": 0.30, "BTC": 0.05, "BONDS": 0.40, "OIL": 0.05},
    2: {"SP500": 0.50, "GOLD": 0.15, "BTC": 0.25, "BONDS": 0.07, "OIL": 0.03},
    3: {"SP500": 0.10, "GOLD": 0.40, "BTC": 0.05, "BONDS": 0.40, "OIL": 0.05},
}

# ─────────────────────────────────────────────
#  RISK CONFIG
# ─────────────────────────────────────────────
RISK_FREE_RATE    = 0.05
VAR_CONFIDENCE    = [0.95, 0.99]
MONTE_CARLO_SIMS  = 1000
MONTE_CARLO_YEARS = 10

# ─────────────────────────────────────────────
#  SECTOR TICKERS
# ─────────────────────────────────────────────
SECTOR_TICKERS = {
    "Technology":    "XLK",
    "Financials":    "XLF",
    "Energy":        "XLE",
    "Healthcare":    "XLV",
    "Utilities":     "XLU",
    "Consumer":      "XLY",
    "Industrials":   "XLI",
    "Real Estate":   "XLRE",
    "Materials":     "XLB",
    "Comm Services": "XLC",
    "Staples":       "XLP",
}

# ─────────────────────────────────────────────
#  FILE PATHS
# ─────────────────────────────────────────────
BASE_DIR            = pathlib.Path(__file__).parent.parent
DATA_RAW_PATH       = str(BASE_DIR / "data" / "raw")
DATA_PROCESSED_PATH = str(BASE_DIR / "data" / "processed")
MODEL_PATH          = str(BASE_DIR / "data" / "processed" / "regime_model.pkl")
RESULTS_PATH        = str(BASE_DIR / "data" / "processed" / "results.json")
