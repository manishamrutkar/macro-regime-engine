"""
risk_engine.py
Computes per-regime risk metrics: Sharpe, Sortino, Max Drawdown,
Calmar, CAGR, Volatility, Recovery Time for each asset.
"""

import os
import logging
import numpy as np
import pandas as pd
from config import RISK_FREE_RATE, REGIME_NAMES, DATA_PROCESSED_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

ASSETS = ["SP500", "GOLD", "BTC", "ETH", "OIL", "SILVER"]


class RiskEngine:
    """Computes risk/return metrics per regime per asset."""

    def compute(self, df: pd.DataFrame, regimes: pd.Series) -> dict:
        """
        Returns nested dict: {regime_name: {asset: {metric: value}}}
        """
        log.info("Computing risk metrics per regime...")
        aligned = df.copy()
        aligned["regime"] = regimes.reindex(aligned.index)
        aligned = aligned.dropna(subset=["regime"])
        aligned["regime"] = aligned["regime"].astype(int)

        result = {}
        for rid in range(len(REGIME_NAMES)):
            mask    = aligned["regime"] == rid
            subset  = aligned.loc[mask]
            metrics = {}
            for asset in ASSETS:
                if asset not in subset.columns:
                    continue
                prices  = subset[asset].dropna()
                if len(prices) < 3:
                    continue
                returns = np.log(prices / prices.shift(1)).dropna()
                metrics[asset] = self._compute_asset_metrics(returns, prices)
            result[REGIME_NAMES[rid]] = metrics
            log.info(f"  Regime {rid} ({REGIME_NAMES[rid]}): {len(subset)} months analysed")

        self._save(result)
        return result

    # ──────────────────────────────────────────────────────────────────
    def _compute_asset_metrics(self, returns: pd.Series, prices: pd.Series) -> dict:
        rf_monthly = RISK_FREE_RATE / 12

        mean_r   = returns.mean()
        std_r    = returns.std()
        n_months = len(returns)

        # CAGR
        total_ret = (prices.iloc[-1] / prices.iloc[0]) - 1
        years     = n_months / 12
        cagr      = (1 + total_ret) ** (1 / years) - 1 if years > 0 else 0

        # Annualised Volatility
        ann_vol = std_r * np.sqrt(12)

        # Sharpe Ratio
        excess  = returns - rf_monthly
        sharpe  = (excess.mean() / excess.std() * np.sqrt(12)
                   if excess.std() > 0 else 0)

        # Sortino Ratio (downside deviation)
        downside = returns[returns < rf_monthly]
        down_std = downside.std() * np.sqrt(12) if len(downside) > 1 else 1e-9
        sortino  = (cagr - RISK_FREE_RATE) / down_std if down_std > 0 else 0

        # Max Drawdown
        cum    = (1 + returns).cumprod()
        peak   = cum.cummax()
        dd     = (peak - cum) / peak
        max_dd = float(dd.max())

        # Calmar Ratio
        calmar = abs(cagr / max_dd) if max_dd > 0 else 0

        # Recovery Time (months from trough to previous peak)
        recovery = self._recovery_time(cum, peak)

        return {
            "cagr":           round(float(cagr),    4),
            "ann_volatility": round(float(ann_vol),  4),
            "sharpe":         round(float(sharpe),   4),
            "sortino":        round(float(sortino),  4),
            "max_drawdown":   round(-max_dd,         4),
            "calmar":         round(float(calmar),   4),
            "recovery_months":recovery,
            "n_months":       n_months,
        }

    def _recovery_time(self, cum: pd.Series, peak: pd.Series) -> int:
        """Average months to recover from drawdown trough back to peak."""
        in_drawdown = False
        trough_idx  = None
        recovery_times = []

        for i in range(len(cum)):
            if cum.iloc[i] < peak.iloc[i]:
                if not in_drawdown:
                    in_drawdown = True
                    trough_idx  = i
            else:
                if in_drawdown and trough_idx is not None:
                    recovery_times.append(i - trough_idx)
                in_drawdown = False
                trough_idx  = None

        return int(np.mean(recovery_times)) if recovery_times else 0

    def _save(self, result: dict):
        os.makedirs(DATA_PROCESSED_PATH, exist_ok=True)
        rows = []
        for regime, assets in result.items():
            for asset, metrics in assets.items():
                rows.append({"regime": regime, "asset": asset, **metrics})
        df = pd.DataFrame(rows)
        path = os.path.join(DATA_PROCESSED_PATH, "risk_metrics.csv")
        df.to_csv(path, index=False)
        log.info(f"Risk metrics saved → {path}")

    def load(self) -> dict:
        """Load pre-computed risk metrics from disk."""
        path = os.path.join(DATA_PROCESSED_PATH, "risk_metrics.csv")
        if not os.path.exists(path):
            raise FileNotFoundError(f"Risk metrics not found at {path}")
        df   = pd.read_csv(path)
        result = {}
        for regime, grp in df.groupby("regime"):
            result[regime] = grp.drop("regime", axis=1).set_index("asset").to_dict("index")
        return result
