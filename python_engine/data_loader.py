"""
data_loader.py
Loads raw CSVs, aligns frequencies, merges into one master DataFrame,
handles missing values, and saves the clean dataset.
"""

import os
import logging
import pandas as pd
import numpy as np
from config import (
    START_DATE, FREQUENCY, DATA_RAW_PATH, DATA_PROCESSED_PATH
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

os.makedirs(DATA_PROCESSED_PATH, exist_ok=True)


class DataLoader:
    """Cleans, aligns, and merges all raw data into one master DataFrame."""

    # ── column groups ──────────────────────────────────────────────────
    FRED_COLS  = ["CPI", "FED_RATE", "M2", "YIELD_2Y", "YIELD_10Y", "YIELD_30Y", "UNRATE"]
    PRICE_COLS = ["SP500", "GOLD", "OIL", "SILVER", "COPPER", "BTC", "ETH", "SOL", "BNB",
                  "DXY", "EURUSD"]

    def load_and_clean(self, raw: dict | None = None) -> pd.DataFrame:
        """
        Main entry point. Accepts raw dict from DataFetcher OR loads from CSV files.
        Returns a clean, monthly-frequency master DataFrame.
        """
        log.info("Loading and cleaning data...")

        frames = []

        # ── FRED data ──────────────────────────────────────────────────
        for col in self.FRED_COLS:
            s = self._load_series(raw, "fred", col)
            if s is not None:
                frames.append(s.rename(col))

        # ── Price / market data ────────────────────────────────────────
        for col in self.PRICE_COLS:
            s = self._load_series(raw, "yahoo", col)
            if s is not None:
                frames.append(s.rename(col))

        if not frames:
            raise RuntimeError("No data loaded. Run DataFetcher first.")

        # ── Merge all into one DataFrame ───────────────────────────────
        df = pd.concat(frames, axis=1)

        # ── Convert index to DatetimeIndex ─────────────────────────────
        df.index = pd.to_datetime(df.index)
        df = df.sort_index()
        df = df[df.index >= START_DATE]

        # ── Resample to monthly frequency ─────────────────────────────
        df = self._resample_monthly(df)

        # ── Handle missing values ──────────────────────────────────────
        df = self._handle_missing(df)

        # ── Save clean data ────────────────────────────────────────────
        out_path = os.path.join(DATA_PROCESSED_PATH, "master_data.csv")
        df.to_csv(out_path)
        log.info(f"Master dataset saved → {out_path} | shape: {df.shape}")
        return df

    # ──────────────────────────────────────────────────────────────────
    #  HELPERS
    # ──────────────────────────────────────────────────────────────────
    def _load_series(self, raw: dict | None, source: str, col: str) -> pd.Series | None:
        """Try loading from raw dict, fall back to CSV file."""
        # 1. from in-memory raw dict
        if raw:
            src_data = raw.get(source, {})
            if col in src_data:
                obj = src_data[col]
                if isinstance(obj, pd.DataFrame):
                    return obj.squeeze()
                if isinstance(obj, pd.Series):
                    return obj
                if isinstance(obj, pd.DataFrame) and col in obj.columns:
                    return obj[col]

        # 2. from CSV
        prefix = "fred" if source == "fred" else "yahoo"
        path   = os.path.join(DATA_RAW_PATH, f"{prefix}_{col.lower()}.csv")
        if os.path.exists(path):
            s = pd.read_csv(path, index_col=0, parse_dates=True).squeeze()
            s.name = col
            return s

        log.warning(f"  {source}/{col}: not found in raw dict or CSV")
        return None

    def _resample_monthly(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Resample to month-start frequency.
        - Price columns → last value of month
        - Rate / level columns → last value of month
        """
        return df.resample(FREQUENCY).last()

    def _handle_missing(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Fill missing values:
        - Forward-fill up to 3 months (e.g. quarterly GDP)
        - Backward-fill for early rows
        - Drop rows where all macro columns are NaN
        """
        df = df.ffill(limit=3)
        df = df.bfill(limit=3)

        # Drop rows that are all NaN
        df = df.dropna(how="all")

        # Report remaining NaNs
        nan_counts = df.isna().sum()
        if nan_counts.any():
            log.warning(f"Remaining NaNs after fill:\n{nan_counts[nan_counts > 0]}")

        return df

    # ──────────────────────────────────────────────────────────────────
    #  LOAD FROM DISK (used by API layer)
    # ──────────────────────────────────────────────────────────────────
    def load_master(self) -> pd.DataFrame:
        """Load the pre-processed master CSV from disk."""
        path = os.path.join(DATA_PROCESSED_PATH, "master_data.csv")
        if not os.path.exists(path):
            raise FileNotFoundError(
                f"Master dataset not found at {path}. Run the pipeline first."
            )
        df = pd.read_csv(path, index_col=0, parse_dates=True)
        log.info(f"Loaded master dataset from disk | shape: {df.shape}")
        return df
