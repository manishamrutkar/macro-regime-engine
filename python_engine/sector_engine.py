"""
sector_engine.py
Analyzes S&P 500 sector performance per macro regime.
"""

import os
import logging
import numpy as np
import pandas as pd
from config import SECTOR_TICKERS, REGIME_NAMES, DATA_PROCESSED_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)


class SectorEngine:
    """Computes sector returns and rankings per regime."""

    def analyze(self, regimes: pd.Series, sector_data: pd.DataFrame | None = None) -> dict:
        """
        Returns per-regime sector performance ranking.
        sector_data: DataFrame with sector ETF prices (columns = sector names).
        If None, loads from raw CSVs.
        """
        if sector_data is None:
            sector_data = self._load_sectors()

        if sector_data.empty:
            log.warning("No sector data available.")
            return {}

        # Monthly returns
        returns = sector_data.pct_change().dropna()
        returns["regime"] = regimes.reindex(returns.index).ffill()
        returns = returns.dropna(subset=["regime"])
        returns["regime"] = returns["regime"].astype(int)

        result = {}
        sector_cols = [c for c in returns.columns if c != "regime"]

        for rid in range(len(REGIME_NAMES)):
            mask   = returns["regime"] == rid
            subset = returns.loc[mask, sector_cols]
            if subset.empty:
                continue

            metrics = {}
            for sector in sector_cols:
                col = subset[sector].dropna()
                if len(col) < 2:
                    continue
                metrics[sector] = {
                    "mean_monthly_return": round(float(col.mean()), 6),
                    "ann_return":          round(float(col.mean() * 12), 4),
                    "volatility":          round(float(col.std() * np.sqrt(12)), 4),
                    "sharpe":              round(
                        float(col.mean() / col.std() * np.sqrt(12)) if col.std() > 0 else 0, 4
                    ),
                    "win_rate":            round(float((col > 0).mean()), 4),
                    "n_months":            int(len(col)),
                }

            # Rank sectors by annualised return
            ranked = sorted(
                metrics.items(),
                key=lambda x: x[1]["ann_return"],
                reverse=True,
            )
            result[REGIME_NAMES[rid]] = {
                "metrics": metrics,
                "ranked_by_return": [{"sector": s, **m} for s, m in ranked],
                "best_sector":  ranked[0][0]  if ranked else None,
                "worst_sector": ranked[-1][0] if ranked else None,
            }
            log.info(
                f"  {REGIME_NAMES[rid]:15s} | "
                f"Best: {result[REGIME_NAMES[rid]]['best_sector']:15s} | "
                f"Worst: {result[REGIME_NAMES[rid]]['worst_sector']}"
            )

        self._save(result)
        return result

    def _load_sectors(self) -> pd.DataFrame:
        """Load sector price CSVs from data/raw/."""
        from config import DATA_RAW_PATH
        frames = []
        for sector, ticker in SECTOR_TICKERS.items():
            path = os.path.join(DATA_RAW_PATH, f"yahoo_{sector.lower().replace(' ', '_')}.csv")
            if os.path.exists(path):
                s = pd.read_csv(path, index_col=0, parse_dates=True).squeeze()
                s.name = sector
                frames.append(s)
        if not frames:
            return pd.DataFrame()
        df = pd.concat(frames, axis=1)
        df = df.resample("MS").last().ffill()
        return df

    def _save(self, result: dict):
        os.makedirs(DATA_PROCESSED_PATH, exist_ok=True)
        import json
        path = os.path.join(DATA_PROCESSED_PATH, "sector_analysis.json")
        with open(path, "w") as f:
            json.dump(result, f, indent=2)
        log.info(f"Sector analysis saved → {path}")

    def load(self) -> dict:
        import json
        path = os.path.join(DATA_PROCESSED_PATH, "sector_analysis.json")
        if not os.path.exists(path):
            return {}
        with open(path) as f:
            return json.load(f)
