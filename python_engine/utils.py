"""
utils.py
Shared utility functions used across the Python engine.
"""

import os
import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime

log = logging.getLogger(__name__)


# ─────────────────────────────────────────────
#  JSON HELPERS
# ─────────────────────────────────────────────
class NpEncoder(json.JSONEncoder):
    """Custom JSON encoder that handles numpy types."""
    def default(self, obj):
        if isinstance(obj, (np.integer,)):   return int(obj)
        if isinstance(obj, (np.floating,)):  return float(obj)
        if isinstance(obj, (np.ndarray,)):   return obj.tolist()
        if isinstance(obj, pd.Timestamp):    return obj.isoformat()
        if isinstance(obj, datetime):        return obj.isoformat()
        return super().default(obj)


def save_json(data: dict, path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, cls=NpEncoder, indent=2)
    log.info(f"Saved JSON → {path}")


def load_json(path: str) -> dict:
    if not os.path.exists(path):
        raise FileNotFoundError(f"File not found: {path}")
    with open(path) as f:
        return json.load(f)


# ─────────────────────────────────────────────
#  FINANCIAL CALCULATIONS
# ─────────────────────────────────────────────
def annualized_return(returns: pd.Series) -> float:
    n = len(returns)
    total = (1 + returns).prod()
    return float(total ** (12 / n) - 1) if n > 0 else 0.0


def annualized_volatility(returns: pd.Series) -> float:
    return float(returns.std() * np.sqrt(12))


def sharpe_ratio(returns: pd.Series, rf_annual: float = 0.05) -> float:
    rf_monthly = rf_annual / 12
    excess = returns - rf_monthly
    if excess.std() == 0:
        return 0.0
    return float(excess.mean() / excess.std() * np.sqrt(12))


def sortino_ratio(returns: pd.Series, rf_annual: float = 0.05) -> float:
    rf_monthly = rf_annual / 12
    cagr = annualized_return(returns)
    downside = returns[returns < rf_monthly]
    down_std = downside.std() * np.sqrt(12) if len(downside) > 1 else 1e-9
    return float((cagr - rf_annual) / down_std)


def max_drawdown(prices_or_cum: pd.Series) -> float:
    peak = prices_or_cum.cummax()
    dd   = (peak - prices_or_cum) / peak
    return float(-dd.max())


def calmar_ratio(returns: pd.Series) -> float:
    cagr = annualized_return(returns)
    cum  = (1 + returns).cumprod()
    mdd  = abs(max_drawdown(cum))
    return float(cagr / mdd) if mdd > 0 else 0.0


def zscore(series: pd.Series) -> pd.Series:
    """Z = (X - mean) / std"""
    return (series - series.mean()) / series.std()


# ─────────────────────────────────────────────
#  DATA HELPERS
# ─────────────────────────────────────────────
def align_series(*series: pd.Series, freq: str = "MS") -> pd.DataFrame:
    """Align multiple series to a common monthly index."""
    df = pd.concat(list(series), axis=1)
    df = df.resample(freq).last()
    df = df.ffill(limit=3).bfill(limit=3)
    return df


def rolling_correlation(s1: pd.Series, s2: pd.Series, window: int = 12) -> pd.Series:
    """Rolling correlation between two return series."""
    r1 = np.log(s1 / s1.shift(1))
    r2 = np.log(s2 / s2.shift(1))
    return r1.rolling(window).corr(r2)


def log_returns(prices: pd.Series) -> pd.Series:
    return np.log(prices / prices.shift(1))


# ─────────────────────────────────────────────
#  FORMATTING
# ─────────────────────────────────────────────
def fmt_pct(value: float, decimals: int = 2) -> str:
    sign = "+" if value >= 0 else ""
    return f"{sign}{value * 100:.{decimals}f}%"


def fmt_num(value: float, decimals: int = 4) -> str:
    return f"{value:.{decimals}f}"


def today_str() -> str:
    return datetime.utcnow().strftime("%Y-%m-%d")
