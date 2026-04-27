"""
transition_matrix.py
Computes Markov transition probabilities between regimes.
P(Ri → Rj) = count(i→j) / count(i→any)
"""

import os
import logging
import numpy as np
import pandas as pd
from config import N_REGIMES, REGIME_NAMES, DATA_PROCESSED_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)


class TransitionMatrix:
    """Computes and stores the Markov regime transition matrix."""

    def __init__(self):
        self.matrix = None   # shape (N_REGIMES, N_REGIMES)
        self.counts = None

    def compute(self, regimes: pd.Series) -> np.ndarray:
        """
        Build transition matrix from regime time series.
        Returns normalized probability matrix of shape (N, N).
        """
        n = N_REGIMES
        counts = np.zeros((n, n), dtype=float)

        regime_vals = regimes.values
        for t in range(len(regime_vals) - 1):
            i = int(regime_vals[t])
            j = int(regime_vals[t + 1])
            if 0 <= i < n and 0 <= j < n:
                counts[i, j] += 1

        self.counts = counts

        # Normalize rows → probabilities
        row_sums = counts.sum(axis=1, keepdims=True)
        row_sums[row_sums == 0] = 1   # avoid divide-by-zero
        matrix = counts / row_sums
        self.matrix = matrix

        self._log_matrix()
        self._save(regimes)
        return matrix

    def persistence(self) -> dict:
        """Return diagonal: probability of staying in the same regime."""
        if self.matrix is None:
            raise RuntimeError("Run compute() first.")
        return {
            REGIME_NAMES[i]: round(float(self.matrix[i, i]), 4)
            for i in range(N_REGIMES)
        }

    def most_likely_next(self, regime_id: int) -> dict:
        """Given current regime, return ranked next-regime probabilities."""
        if self.matrix is None:
            raise RuntimeError("Run compute() first.")
        row = self.matrix[regime_id]
        ranked = sorted(
            [(REGIME_NAMES[j], round(float(row[j]), 4)) for j in range(N_REGIMES)],
            key=lambda x: x[1], reverse=True,
        )
        return {"from": REGIME_NAMES[regime_id], "next_probs": ranked}

    def to_dict(self) -> dict:
        """Serializable dict for API response."""
        if self.matrix is None:
            raise RuntimeError("Run compute() first.")
        return {
            REGIME_NAMES[i]: {
                REGIME_NAMES[j]: round(float(self.matrix[i, j]), 4)
                for j in range(N_REGIMES)
            }
            for i in range(N_REGIMES)
        }

    def _log_matrix(self):
        log.info("Transition Matrix:")
        header = "       " + "  ".join(f"{REGIME_NAMES[j][:6]:>6}" for j in range(N_REGIMES))
        log.info(header)
        for i in range(N_REGIMES):
            row_str = "  ".join(f"{self.matrix[i,j]:.3f}" for j in range(N_REGIMES))
            log.info(f"  {REGIME_NAMES[i][:6]:>6}  {row_str}")

    def _save(self, regimes: pd.Series):
        os.makedirs(DATA_PROCESSED_PATH, exist_ok=True)
        path = os.path.join(DATA_PROCESSED_PATH, "transition_matrix.csv")
        df = pd.DataFrame(
            self.matrix,
            index=[REGIME_NAMES[i] for i in range(N_REGIMES)],
            columns=[REGIME_NAMES[i] for i in range(N_REGIMES)],
        )
        df.to_csv(path)
        log.info(f"Transition matrix saved → {path}")

    def load(self) -> np.ndarray:
        """Load previously saved matrix from disk."""
        path = os.path.join(DATA_PROCESSED_PATH, "transition_matrix.csv")
        if not os.path.exists(path):
            raise FileNotFoundError(f"Transition matrix not found at {path}")
        df = pd.read_csv(path, index_col=0)
        self.matrix = df.values.astype(float)
        return self.matrix
