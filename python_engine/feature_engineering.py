"""
feature_engineering.py
Builds all financial features from the master DataFrame.
Output is a feature matrix ready for Z-score normalization + K-Means.
"""

import logging
import numpy as np
import pandas as pd
from config import ROLLING_WINDOW

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)


class FeatureEngineer:
    """Transforms raw price/macro data into ML-ready features."""

    # Core features used in regime clustering
    REGIME_FEATURES = ["inflation_yoy", "real_rate", "liquidity_yoy"]

    def build_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Full feature engineering pipeline.
        Returns a DataFrame with all engineered features, NaN rows dropped.
        """
        log.info("Building features...")
        out = pd.DataFrame(index=df.index)

        # ── Macro Features ─────────────────────────────────────────────
        out = self._macro_features(df, out)

        # ── Log Returns ────────────────────────────────────────────────
        out = self._log_returns(df, out)

        # ── Rolling Volatility ─────────────────────────────────────────
        out = self._rolling_volatility(out)

        # ── Rolling Correlations ───────────────────────────────────────
        out = self._rolling_correlations(df, out)

        # ── Yield Curve Features ───────────────────────────────────────
        out = self._yield_features(df, out)

        # ── Drop rows with NaN in regime features ─────────────────────
        before = len(out)
        out = out.dropna(subset=self.REGIME_FEATURES)
        log.info(f"Features built | shape: {out.shape} (dropped {before - len(out)} NaN rows)")

        return out

    # ──────────────────────────────────────────────────────────────────
    #  MACRO
    # ──────────────────────────────────────────────────────────────────
    def _macro_features(self, df: pd.DataFrame, out: pd.DataFrame) -> pd.DataFrame:
        # Inflation YoY (%)
        if "CPI" in df.columns:
            out["inflation_yoy"] = df["CPI"].pct_change(12) * 100

        # M2 Liquidity YoY (%)
        if "M2" in df.columns:
            out["liquidity_yoy"] = df["M2"].pct_change(12) * 100

        # Real Interest Rate = Fed Rate - Inflation YoY
        if "FED_RATE" in df.columns and "inflation_yoy" in out.columns:
            out["real_rate"] = df["FED_RATE"] - out["inflation_yoy"]

        # Fed Rate Level & Change
        if "FED_RATE" in df.columns:
            out["fed_rate"]        = df["FED_RATE"]
            out["fed_rate_change"] = df["FED_RATE"].diff(3)   # 3-month change

        # Unemployment
        if "UNRATE" in df.columns:
            out["unemployment"]        = df["UNRATE"]
            out["unemployment_change"] = df["UNRATE"].diff(3)

        return out

    # ──────────────────────────────────────────────────────────────────
    #  LOG RETURNS
    # ──────────────────────────────────────────────────────────────────
    def _log_returns(self, df: pd.DataFrame, out: pd.DataFrame) -> pd.DataFrame:
        assets = ["SP500", "GOLD", "BTC", "ETH", "SOL", "OIL", "SILVER"]
        for asset in assets:
            if asset in df.columns:
                prices = df[asset].replace(0, np.nan).ffill()
                out[f"ret_{asset.lower()}"] = np.log(prices / prices.shift(1))
        return out

    # ──────────────────────────────────────────────────────────────────
    #  ROLLING VOLATILITY
    # ──────────────────────────────────────────────────────────────────
    def _rolling_volatility(self, out: pd.DataFrame) -> pd.DataFrame:
        ret_cols = [c for c in out.columns if c.startswith("ret_")]
        for col in ret_cols:
            asset = col.replace("ret_", "")
            out[f"vol_{asset}"] = (
                out[col].rolling(ROLLING_WINDOW).std() * np.sqrt(12)
            )
        return out

    # ──────────────────────────────────────────────────────────────────
    #  ROLLING CORRELATIONS
    # ──────────────────────────────────────────────────────────────────
    def _rolling_correlations(self, df: pd.DataFrame, out: pd.DataFrame) -> pd.DataFrame:
        pairs = [
            ("SP500", "GOLD"),
            ("SP500", "BTC"),
            ("GOLD",  "BTC"),
        ]
        for a, b in pairs:
            if a in df.columns and b in df.columns:
                ra = np.log(df[a].replace(0, np.nan).ffill() / df[a].replace(0, np.nan).ffill().shift(1))
                rb = np.log(df[b].replace(0, np.nan).ffill() / df[b].replace(0, np.nan).ffill().shift(1))
                out[f"corr_{a.lower()}_{b.lower()}"] = ra.rolling(ROLLING_WINDOW).corr(rb)
        return out

    # ──────────────────────────────────────────────────────────────────
    #  YIELD CURVE
    # ──────────────────────────────────────────────────────────────────
    def _yield_features(self, df: pd.DataFrame, out: pd.DataFrame) -> pd.DataFrame:
        if "YIELD_2Y" in df.columns and "YIELD_10Y" in df.columns:
            out["yield_spread"] = df["YIELD_10Y"] - df["YIELD_2Y"]
            out["yield_inverted"] = (out["yield_spread"] < 0).astype(int)
        if "YIELD_10Y" in df.columns:
            out["yield_10y"] = df["YIELD_10Y"]
        return out

    # ──────────────────────────────────────────────────────────────────
    #  Z-SCORE NORMALIZATION (used before clustering)
    # ──────────────────────────────────────────────────────────────────
    def normalize(self, features: pd.DataFrame, cols: list) -> pd.DataFrame:
        """
        Apply Z-score normalization: Z = (X - mean) / std
        Returns DataFrame with only the normalized columns.
        """
        subset = features[cols].copy()
        normalized = (subset - subset.mean()) / subset.std()
        normalized.columns = [f"{c}_z" for c in cols]
        log.info(f"Z-score normalized: {cols}")
        return normalized
