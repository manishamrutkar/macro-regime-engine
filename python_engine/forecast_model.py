"""
forecast_model.py
Predicts the next month's regime probabilities using a Random Forest classifier
(sklearn-based, no GPU needed). LSTM is included as an optional upgrade.
Features: Z-scored macro signals + regime history + rolling stats.
"""

import os
import pickle
import logging
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import classification_report
from sklearn.preprocessing import LabelEncoder
from config import N_REGIMES, REGIME_NAMES, RANDOM_STATE, DATA_PROCESSED_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

MODEL_PATH = os.path.join(DATA_PROCESSED_PATH, "forecast_model.pkl")


class ForecastModel:
    """
    Regime transition forecaster.
    Input: macro feature history + current regime
    Output: probability distribution over next month's regimes
    """

    FEATURE_COLS = [
        "inflation_yoy", "real_rate", "liquidity_yoy",
        "fed_rate", "fed_rate_change",
        "yield_spread", "ret_sp500", "ret_gold", "ret_btc",
        "vol_sp500", "vol_gold", "vol_btc",
    ]
    LAG_PERIODS  = [1, 2, 3]     # months of lag features to include

    def __init__(self):
        self.model   = None
        self.encoder = LabelEncoder()

    def predict(self, features: pd.DataFrame, regimes: pd.Series) -> dict:
        """
        Train (if needed) and return next-regime forecast.
        """
        X, y = self._build_dataset(features, regimes)
        if X is None or len(X) < 20:
            log.warning("Insufficient data for forecast model.")
            return self._uniform_forecast()

        # Walk-forward training on all available data
        self._train(X, y)
        return self._predict_next(features, regimes)

    def _build_dataset(self, features: pd.DataFrame, regimes: pd.Series):
        """Build supervised dataset with lagged features."""
        available = [c for c in self.FEATURE_COLS if c in features.columns]
        df = features[available].copy()
        df["regime"] = regimes.reindex(df.index)
        df = df.dropna(subset=["regime"])
        df["regime"] = df["regime"].astype(int)

        # Add lag features
        for col in available:
            for lag in self.LAG_PERIODS:
                df[f"{col}_lag{lag}"] = df[col].shift(lag)

        # Target: next month's regime
        df["target"] = df["regime"].shift(-1)
        df = df.dropna()

        feature_cols = [c for c in df.columns if c not in ["regime", "target"]]
        X = df[feature_cols]
        y = df["target"].astype(int)
        return X, y

    def _train(self, X: pd.DataFrame, y: pd.Series):
        """Train Random Forest with time-series cross-validation."""
        log.info(f"Training forecast model on {len(X)} samples...")

        tscv   = TimeSeriesSplit(n_splits=5)
        scores = []
        for fold, (train_idx, val_idx) in enumerate(tscv.split(X)):
            clf = RandomForestClassifier(
                n_estimators=200,
                max_depth=6,
                min_samples_leaf=5,
                random_state=RANDOM_STATE,
                n_jobs=-1,
            )
            clf.fit(X.iloc[train_idx], y.iloc[train_idx])
            acc = clf.score(X.iloc[val_idx], y.iloc[val_idx])
            scores.append(acc)
            log.info(f"  Fold {fold+1} accuracy: {acc:.3f}")

        log.info(f"Mean CV accuracy: {np.mean(scores):.3f}")

        # Final model trained on all data
        self.model = RandomForestClassifier(
            n_estimators=200,
            max_depth=6,
            min_samples_leaf=5,
            random_state=RANDOM_STATE,
            n_jobs=-1,
        )
        self.model.fit(X, y)
        self._save_model(X.columns.tolist())

    def _predict_next(self, features: pd.DataFrame, regimes: pd.Series) -> dict:
        """Predict next month's regime from latest data row."""
        X, _ = self._build_dataset(features, regimes)
        if X is None or len(X) == 0:
            return self._uniform_forecast()

        X_latest = X.iloc[[-1]]
        probs    = self.model.predict_proba(X_latest)[0]
        classes  = self.model.classes_

        prob_map = {int(c): 0.0 for c in range(N_REGIMES)}
        for cls, p in zip(classes, probs):
            prob_map[int(cls)] = round(float(p), 4)

        top_regime = max(prob_map, key=prob_map.get)

        result = {
            "predicted_regime":      top_regime,
            "predicted_regime_name": REGIME_NAMES[top_regime],
            "probabilities": {
                REGIME_NAMES[rid]: prob_map[rid]
                for rid in range(N_REGIMES)
            },
            "model": "RandomForest",
        }
        log.info(f"Forecast: {result['predicted_regime_name']} ({prob_map[top_regime]*100:.1f}%)")
        return result

    def _uniform_forecast(self) -> dict:
        p = round(1 / N_REGIMES, 4)
        return {
            "predicted_regime":      2,
            "predicted_regime_name": REGIME_NAMES[2],
            "probabilities": {REGIME_NAMES[i]: p for i in range(N_REGIMES)},
            "model": "uniform_fallback",
        }

    def _save_model(self, feature_cols: list):
        os.makedirs(DATA_PROCESSED_PATH, exist_ok=True)
        with open(MODEL_PATH, "wb") as f:
            pickle.dump({"model": self.model, "feature_cols": feature_cols}, f)
        log.info(f"Forecast model saved → {MODEL_PATH}")

    def load_model(self):
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Forecast model not found at {MODEL_PATH}")
        with open(MODEL_PATH, "rb") as f:
            data = pickle.load(f)
        self.model = data["model"]
        return data["feature_cols"]
