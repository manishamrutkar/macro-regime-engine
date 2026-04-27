"""
monte_carlo.py
Monte Carlo portfolio simulation over N years with N_SIMS paths.
Uses bootstrapped returns from historical data (no distributional assumption).
"""

import os
import logging
import numpy as np
import pandas as pd
from config import MONTE_CARLO_SIMS, MONTE_CARLO_YEARS, DATA_PROCESSED_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)


class MonteCarloSimulator:
    """Bootstrap Monte Carlo simulation on strategy returns."""

    def run(self, backtest_result: dict, initial_value: float = 100.0) -> dict:
        """
        Runs Monte Carlo simulation using bootstrap resampling of historical returns.
        Returns simulation paths + summary percentiles.
        """
        records = backtest_result.get("returns", [])
        if not records:
            log.warning("No backtest returns for Monte Carlo.")
            return {}

        df = pd.DataFrame(records)
        if "date" in df.columns:
            df = df.set_index("date")

        if "strategy" not in df.columns:
            log.warning("No 'strategy' column in backtest returns.")
            return {}

        returns = df["strategy"].dropna().values
        log.info(f"Running {MONTE_CARLO_SIMS} simulations × {MONTE_CARLO_YEARS} years...")

        steps = MONTE_CARLO_YEARS * 12   # monthly steps
        paths = np.zeros((MONTE_CARLO_SIMS, steps + 1))
        paths[:, 0] = initial_value

        rng = np.random.default_rng(seed=42)
        for t in range(1, steps + 1):
            sampled = rng.choice(returns, size=MONTE_CARLO_SIMS, replace=True)
            paths[:, t] = paths[:, t - 1] * (1 + sampled)

        final_values = paths[:, -1]

        # Percentile paths for visualization (store every 6 months to keep payload small)
        step_indices = list(range(0, steps + 1, 6))
        pctile_paths = {
            "p10":    [round(float(np.percentile(paths[:, t], 10)),  2) for t in step_indices],
            "p25":    [round(float(np.percentile(paths[:, t], 25)),  2) for t in step_indices],
            "p50":    [round(float(np.percentile(paths[:, t], 50)),  2) for t in step_indices],
            "p75":    [round(float(np.percentile(paths[:, t], 75)),  2) for t in step_indices],
            "p90":    [round(float(np.percentile(paths[:, t], 90)),  2) for t in step_indices],
            "labels": [f"Y{t // 12}" for t in step_indices],
        }

        # Sample individual paths for visualization (20 random paths)
        sample_idxs = rng.choice(MONTE_CARLO_SIMS, size=20, replace=False)
        sample_paths = [
            [round(float(v), 2) for v in paths[i, step_indices]]
            for i in sample_idxs
        ]

        summary = {
            "initial_value":     initial_value,
            "simulations":       MONTE_CARLO_SIMS,
            "years":             MONTE_CARLO_YEARS,
            "median_final":      round(float(np.median(final_values)),     2),
            "mean_final":        round(float(np.mean(final_values)),       2),
            "p10_final":         round(float(np.percentile(final_values, 10)), 2),
            "p25_final":         round(float(np.percentile(final_values, 25)), 2),
            "p75_final":         round(float(np.percentile(final_values, 75)), 2),
            "p90_final":         round(float(np.percentile(final_values, 90)), 2),
            "prob_profit":       round(float((final_values > initial_value).mean()), 4),
            "prob_double":       round(float((final_values > initial_value * 2).mean()), 4),
            "prob_loss_50pct":   round(float((final_values < initial_value * 0.5).mean()), 4),
            "percentile_paths":  pctile_paths,
            "sample_paths":      sample_paths,
        }

        log.info(f"MC | Median final: {summary['median_final']:.1f}  P(profit): {summary['prob_profit']*100:.1f}%")

        self._save(summary)
        return summary

    def _save(self, summary: dict):
        os.makedirs(DATA_PROCESSED_PATH, exist_ok=True)
        # Save just the scalar metrics (paths are too large for CSV)
        scalar_keys = [k for k, v in summary.items() if not isinstance(v, (list, dict))]
        pd.DataFrame([{k: summary[k] for k in scalar_keys}]).to_csv(
            os.path.join(DATA_PROCESSED_PATH, "monte_carlo_summary.csv"), index=False
        )
        log.info("Monte Carlo summary saved.")

    def load(self) -> dict:
        path = os.path.join(DATA_PROCESSED_PATH, "monte_carlo_summary.csv")
        if not os.path.exists(path):
            raise FileNotFoundError(f"Monte Carlo summary not found at {path}")
        return pd.read_csv(path).iloc[0].to_dict()
