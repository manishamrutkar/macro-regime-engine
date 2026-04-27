"""
yield_curve.py
Analyzes the US Treasury yield curve: spread, inversion detection,
and regime context.
"""

import os
import logging
import numpy as np
import pandas as pd
from config import DATA_PROCESSED_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

YIELD_COLS = {
    "2Y":  "YIELD_2Y",
    "5Y":  "YIELD_5Y",
    "10Y": "YIELD_10Y",
    "30Y": "YIELD_30Y",
}


class YieldCurveAnalyzer:
    """Yield curve shape analysis and inversion detection."""

    def analyze(self, df: pd.DataFrame) -> dict:
        available = {label: col for label, col in YIELD_COLS.items() if col in df.columns}
        if len(available) < 2:
            log.warning("Not enough yield data for curve analysis.")
            return {}

        yields = df[[col for col in available.values()]].dropna(how="all")
        yields.columns = list(available.keys())

        # Latest snapshot
        latest = yields.iloc[-1].to_dict()
        latest = {k: round(float(v), 4) for k, v in latest.items() if pd.notna(v)}

        # Spread calculations
        spreads = {}
        if "2Y" in latest and "10Y" in latest:
            spreads["2Y_10Y"] = round(latest["10Y"] - latest["2Y"], 4)
        if "2Y" in latest and "30Y" in latest:
            spreads["2Y_30Y"] = round(latest["30Y"] - latest["2Y"], 4)
        if "10Y" in latest and "30Y" in latest:
            spreads["10Y_30Y"] = round(latest["30Y"] - latest["10Y"], 4)

        # Inversion flags
        inverted_2y10y = spreads.get("2Y_10Y", 1) < 0

        # Historical spread for chart
        hist = {}
        if "YIELD_2Y" in df.columns and "YIELD_10Y" in df.columns:
            spread_series = (df["YIELD_10Y"] - df["YIELD_2Y"]).dropna()
            hist["2Y_10Y_spread"] = {
                "dates":  [str(d.date()) for d in spread_series.index[-60:]],   # last 5 years
                "values": [round(float(v), 4) for v in spread_series.values[-60:]],
            }

        # Curve shape
        shape = self._classify_shape(latest)

        # Inversion streak
        inversion_streak = 0
        if "YIELD_2Y" in df.columns and "YIELD_10Y" in df.columns:
            spread = (df["YIELD_10Y"] - df["YIELD_2Y"]).dropna()
            for v in reversed(spread.values):
                if v < 0:
                    inversion_streak += 1
                else:
                    break

        result = {
            "latest_yields":    latest,
            "spreads":          spreads,
            "inverted_2y10y":   inverted_2y10y,
            "curve_shape":      shape,
            "inversion_months": inversion_streak,
            "recession_signal": inverted_2y10y and inversion_streak >= 3,
            "history":          hist,
        }

        log.info(
            f"Yield curve | Shape: {shape} | 2Y-10Y: {spreads.get('2Y_10Y', 'N/A')}% | "
            f"Inverted: {inverted_2y10y} ({inversion_streak} months)"
        )
        self._save(result)
        return result

    def _classify_shape(self, yields: dict) -> str:
        """Classify curve shape from available yield points."""
        keys = [k for k in ["2Y", "5Y", "10Y", "30Y"] if k in yields]
        if len(keys) < 2:
            return "Unknown"
        values = [yields[k] for k in keys]
        diffs  = [values[i+1] - values[i] for i in range(len(values)-1)]

        if all(d > 0.1 for d in diffs):
            return "Normal (Upward Sloping)"
        if all(d < -0.1 for d in diffs):
            return "Inverted"
        if all(abs(d) < 0.1 for d in diffs):
            return "Flat"
        if diffs[0] > 0 and diffs[-1] < 0:
            return "Humped"
        return "Mixed"

    def _save(self, result: dict):
        os.makedirs(DATA_PROCESSED_PATH, exist_ok=True)
        import json
        path = os.path.join(DATA_PROCESSED_PATH, "yield_curve.json")
        with open(path, "w") as f:
            json.dump(result, f, indent=2)
        log.info(f"Yield curve data saved → {path}")

    def load(self) -> dict:
        import json
        path = os.path.join(DATA_PROCESSED_PATH, "yield_curve.json")
        if not os.path.exists(path):
            return {}
        with open(path) as f:
            return json.load(f)
