"""
regime_model.py
K-Means regime detection on Z-scored macro features.
Interprets clusters into human-readable regime labels.
"""

import os
import pickle
import logging
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
from config import (
    N_REGIMES, RANDOM_STATE, N_INIT, MAX_ITER,
    REGIME_NAMES, MODEL_PATH, DATA_PROCESSED_PATH
)
from feature_engineering import FeatureEngineer

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

os.makedirs(DATA_PROCESSED_PATH, exist_ok=True)


class RegimeModel:
    """
    K-Means clustering on [inflation_z, real_rate_z, liquidity_z].
    Maps clusters → regime labels by centroid interpretation.
    """

    CLUSTER_FEATURES = ["inflation_yoy", "real_rate", "liquidity_yoy"]

    def __init__(self):
        self.kmeans   = None
        self.scaler   = StandardScaler()
        self.label_map = {}   # cluster_id → regime_id

    # ──────────────────────────────────────────────────────────────────
    #  FIT & PREDICT
    # ──────────────────────────────────────────────────────────────────
    def fit_predict(self, features: pd.DataFrame) -> pd.Series:
        """
        Fit KMeans on feature matrix, return regime labels as pd.Series.
        Also saves the model and regime series to disk.
        """
        # Get valid rows only
        X_raw = features[self.CLUSTER_FEATURES].dropna()

        # Normalize
        X_scaled = self.scaler.fit_transform(X_raw)

        # Fit KMeans
        log.info(f"Fitting K-Means with k={N_REGIMES} on {len(X_raw)} samples...")
        self.kmeans = KMeans(
            n_clusters=N_REGIMES,
            n_init=N_INIT,
            max_iter=MAX_ITER,
            random_state=RANDOM_STATE,
        )
        raw_clusters = self.kmeans.fit_predict(X_scaled)

        # Silhouette score
        sil = silhouette_score(X_scaled, raw_clusters)
        log.info(f"Silhouette score: {sil:.4f}")

        # Map cluster IDs → semantic regime IDs
        self.label_map = self._interpret_clusters(X_raw, raw_clusters)
        log.info(f"Cluster → Regime mapping: {self.label_map}")

        regimes = pd.Series(
            [self.label_map[c] for c in raw_clusters],
            index=X_raw.index,
            name="regime",
        )

        # Save
        self._save_model()
        out_path = os.path.join(DATA_PROCESSED_PATH, "regimes.csv")
        regimes.to_csv(out_path)
        log.info(f"Regimes saved → {out_path}")

        # Distribution
        dist = regimes.value_counts().sort_index()
        for rid, count in dist.items():
            pct = count / len(regimes) * 100
            log.info(f"  Regime {rid} ({REGIME_NAMES[rid]}): {count} months ({pct:.1f}%)")

        return regimes

    def predict(self, features: pd.DataFrame) -> pd.Series:
        """Predict regimes on new data using fitted model."""
        if self.kmeans is None:
            self._load_model()
        X_raw    = features[self.CLUSTER_FEATURES].dropna()
        X_scaled = self.scaler.transform(X_raw)
        raw      = self.kmeans.predict(X_scaled)
        return pd.Series(
            [self.label_map.get(c, c) for c in raw],
            index=X_raw.index,
            name="regime",
        )

    def predict_latest(self, features: pd.DataFrame) -> dict:
        """Returns the current regime with confidence estimate."""
        if self.kmeans is None:
            self._load_model()
        X_raw    = features[self.CLUSTER_FEATURES].dropna().iloc[[-1]]
        X_scaled = self.scaler.transform(X_raw)

        # Distance-based confidence
        distances  = self.kmeans.transform(X_scaled)[0]
        inv_dist   = 1.0 / (distances + 1e-9)
        probs      = inv_dist / inv_dist.sum()

        raw_cluster = self.kmeans.predict(X_scaled)[0]
        regime_id   = self.label_map.get(raw_cluster, raw_cluster)
        confidence  = float(probs[raw_cluster])

        return {
            "regime_id":   regime_id,
            "regime_name": REGIME_NAMES[regime_id],
            "confidence":  round(confidence, 4),
            "probabilities": {
                REGIME_NAMES[self.label_map.get(i, i)]: round(float(p), 4)
                for i, p in enumerate(probs)
            },
        }

    # ──────────────────────────────────────────────────────────────────
    #  CLUSTER INTERPRETATION
    # ──────────────────────────────────────────────────────────────────
    def _interpret_clusters(self, X_raw: pd.DataFrame, raw_clusters: np.ndarray) -> dict:
        """
        Map cluster IDs to semantic regime IDs by centroid values.
        
        Logic:
          - High Inflation (0)  → high inflation_yoy centroid
          - Tight Policy  (1)   → high real_rate centroid
          - Liquidity Boom(2)   → high liquidity_yoy centroid
          - Recession     (3)   → low inflation + low liquidity + negative real_rate
        """
        X_with_cluster = X_raw.copy()
        X_with_cluster["_cluster"] = raw_clusters
        centroids = X_with_cluster.groupby("_cluster")[self.CLUSTER_FEATURES].mean()

        label_map = {}
        assigned  = set()

        # Regime 0 — High Inflation: highest inflation_yoy
        r0 = centroids["inflation_yoy"].idxmax()
        label_map[r0] = 0
        assigned.add(r0)

        # Regime 1 — Tight Policy: highest real_rate among remaining
        remaining = centroids.drop(index=list(assigned))
        r1 = remaining["real_rate"].idxmax()
        label_map[r1] = 1
        assigned.add(r1)

        # Regime 2 — Liquidity Boom: highest liquidity_yoy among remaining
        remaining = centroids.drop(index=list(assigned))
        r2 = remaining["liquidity_yoy"].idxmax()
        label_map[r2] = 2
        assigned.add(r2)

        # Regime 3 — Recession: the leftover cluster
        r3 = [c for c in centroids.index if c not in assigned][0]
        label_map[r3] = 3

        return label_map

    # ──────────────────────────────────────────────────────────────────
    #  PERSISTENCE
    # ──────────────────────────────────────────────────────────────────
    def _save_model(self):
        with open(MODEL_PATH, "wb") as f:
            pickle.dump({"kmeans": self.kmeans, "scaler": self.scaler,
                         "label_map": self.label_map}, f)
        log.info(f"Model saved → {MODEL_PATH}")

    def _load_model(self):
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run pipeline first.")
        with open(MODEL_PATH, "rb") as f:
            data = pickle.load(f)
        self.kmeans    = data["kmeans"]
        self.scaler    = data["scaler"]
        self.label_map = data["label_map"]
        log.info(f"Model loaded from {MODEL_PATH}")
