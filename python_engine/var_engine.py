"""
var_engine.py
Computes Value at Risk (VaR) and Conditional VaR (CVaR / Expected Shortfall)
using both historical simulation and parametric (normal) methods.
"""

import os
import logging
import numpy as np
import pandas as pd
from scipy import stats
from config import VAR_CONFIDENCE, DATA_PROCESSED_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)


class VaREngine:
    """Historical and parametric VaR/CVaR computation."""

    def compute(self, backtest_result: dict) -> dict:
        """
        Accepts the backtest result dict (with 'returns' key).
        Returns VaR/CVaR metrics for the strategy and each benchmark.
        """
        records = backtest_result.get("returns", [])
        if not records:
            log.warning("No backtest returns found for VaR computation.")
            return {}

        df = pd.DataFrame(records)
        if "date" in df.columns:
            df = df.set_index("date")

        result = {}
        for col in df.columns:
            returns = df[col].dropna().values
            if len(returns) < 10:
                continue
            result[col] = self._compute_var_cvar(returns)
            log.info(f"  {col}: VaR95={result[col]['hist_var_95']*100:.2f}%  CVaR95={result[col]['hist_cvar_95']*100:.2f}%")

        self._save(result)
        return result

    def compute_from_returns(self, returns: np.ndarray, label: str = "portfolio") -> dict:
        """Direct computation from a numpy array of returns."""
        metrics = self._compute_var_cvar(returns)
        log.info(f"VaR/CVaR for {label}: {metrics}")
        return {label: metrics}

    # ──────────────────────────────────────────────────────────────────
    def _compute_var_cvar(self, returns: np.ndarray) -> dict:
        result = {}
        for conf in VAR_CONFIDENCE:
            alpha = 1 - conf
            conf_label = str(int(conf * 100))

            # ── Historical Simulation ──────────────────────────────────
            hist_var  = float(np.percentile(returns, alpha * 100))
            hist_cvar = float(returns[returns <= hist_var].mean())

            # ── Parametric (Normal) ────────────────────────────────────
            mu, sigma = returns.mean(), returns.std()
            para_var  = float(stats.norm.ppf(alpha, mu, sigma))
            para_cvar = float(mu - sigma * stats.norm.pdf(stats.norm.ppf(alpha)) / alpha)

            result[f"hist_var_{conf_label}"]  = round(hist_var,  6)
            result[f"hist_cvar_{conf_label}"] = round(hist_cvar, 6)
            result[f"para_var_{conf_label}"]  = round(para_var,  6)
            result[f"para_cvar_{conf_label}"] = round(para_cvar, 6)

        # Additional summary statistics
        result["mean_return"]   = round(float(returns.mean()),  6)
        result["std_return"]    = round(float(returns.std()),   6)
        result["skewness"]      = round(float(stats.skew(returns)), 4)
        result["kurtosis"]      = round(float(stats.kurtosis(returns)), 4)

        return result

    def _save(self, result: dict):
        os.makedirs(DATA_PROCESSED_PATH, exist_ok=True)
        rows = []
        for series, metrics in result.items():
            rows.append({"series": series, **metrics})
        pd.DataFrame(rows).to_csv(
            os.path.join(DATA_PROCESSED_PATH, "var_metrics.csv"), index=False
        )
        log.info("VaR metrics saved.")

    def load(self) -> dict:
        path = os.path.join(DATA_PROCESSED_PATH, "var_metrics.csv")
        if not os.path.exists(path):
            raise FileNotFoundError(f"VaR metrics not found at {path}")
        df = pd.read_csv(path)
        return df.set_index("series").to_dict("index")
