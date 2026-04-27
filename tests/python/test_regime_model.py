"""Tests for regime_model.py"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../python_engine'))

import pytest
import numpy as np
import pandas as pd
from regime_model import RegimeModel
from feature_engineering import FeatureEngineer
from config import N_REGIMES, REGIME_NAMES

@pytest.fixture
def sample_features():
    dates = pd.date_range('2010-01-01', periods=120, freq='MS')
    np.random.seed(42)
    return pd.DataFrame({
        'inflation_yoy': np.random.normal(3, 2, 120),
        'real_rate':     np.random.normal(1, 2, 120),
        'liquidity_yoy': np.random.normal(5, 3, 120),
        'fed_rate':      np.abs(np.random.normal(2, 1.5, 120)),
        'yield_spread':  np.random.normal(0.5, 0.8, 120),
    }, index=dates)

def test_fit_predict_returns_series(sample_features):
    model = RegimeModel()
    regimes = model.fit_predict(sample_features)
    assert isinstance(regimes, pd.Series)
    assert regimes.name == 'regime'

def test_regime_count(sample_features):
    model = RegimeModel()
    regimes = model.fit_predict(sample_features)
    unique = set(regimes.unique())
    assert unique.issubset(set(range(N_REGIMES))), f"Unexpected regime IDs: {unique}"

def test_all_regimes_assigned(sample_features):
    model = RegimeModel()
    regimes = model.fit_predict(sample_features)
    assert len(regimes.unique()) == N_REGIMES, "Not all 4 regimes were assigned"

def test_regime_length_matches_input(sample_features):
    model = RegimeModel()
    regimes = model.fit_predict(sample_features)
    assert len(regimes) == len(sample_features)

def test_predict_latest(sample_features):
    model = RegimeModel()
    model.fit_predict(sample_features)
    result = model.predict_latest(sample_features)
    assert 'regime_id'   in result
    assert 'regime_name' in result
    assert 'confidence'  in result
    assert 0 <= result['confidence'] <= 1
    assert result['regime_id'] in range(N_REGIMES)
    assert result['regime_name'] in REGIME_NAMES.values()

def test_label_map_covers_all_clusters(sample_features):
    model = RegimeModel()
    model.fit_predict(sample_features)
    assert len(model.label_map) == N_REGIMES
    assert set(model.label_map.values()) == set(range(N_REGIMES))
