"""Tests for feature_engineering.py"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../python_engine'))

import pytest
import numpy as np
import pandas as pd
from feature_engineering import FeatureEngineer

@pytest.fixture
def sample_df():
    """Create a realistic monthly DataFrame for testing."""
    dates = pd.date_range('2015-01-01', periods=60, freq='MS')
    np.random.seed(42)
    df = pd.DataFrame({
        'CPI':       250 + np.cumsum(np.random.normal(0.3, 0.1, 60)),
        'FED_RATE':  np.clip(np.cumsum(np.random.normal(0, 0.05, 60)) + 2, 0, 8),
        'M2':        15000 + np.cumsum(np.random.normal(50, 10, 60)),
        'SP500':     3000 * np.cumprod(1 + np.random.normal(0.008, 0.04, 60)),
        'GOLD':      1800 * np.cumprod(1 + np.random.normal(0.004, 0.015, 60)),
        'BTC':       30000 * np.cumprod(1 + np.random.normal(0.02, 0.15, 60)),
        'YIELD_2Y':  np.clip(np.random.normal(2.5, 0.5, 60), 0.1, 6),
        'YIELD_10Y': np.clip(np.random.normal(3.0, 0.5, 60), 0.5, 6),
    }, index=dates)
    return df

def test_build_features_returns_dataframe(sample_df):
    fe = FeatureEngineer()
    features = fe.build_features(sample_df)
    assert isinstance(features, pd.DataFrame)
    assert len(features) > 0

def test_regime_features_present(sample_df):
    fe = FeatureEngineer()
    features = fe.build_features(sample_df)
    for col in FeatureEngineer.REGIME_FEATURES:
        assert col in features.columns, f"Missing regime feature: {col}"

def test_inflation_yoy_calculation(sample_df):
    fe = FeatureEngineer()
    features = fe.build_features(sample_df)
    # inflation_yoy should be a percentage, typically between -5% and 20%
    valid = features['inflation_yoy'].dropna()
    assert valid.between(-10, 30).all(), "Inflation YoY values out of expected range"

def test_real_rate_calculation(sample_df):
    fe = FeatureEngineer()
    features = fe.build_features(sample_df)
    valid = features['real_rate'].dropna()
    # real_rate = fed_rate - inflation; should be in reasonable range
    assert valid.between(-15, 15).all()

def test_log_returns_present(sample_df):
    fe = FeatureEngineer()
    features = fe.build_features(sample_df)
    assert 'ret_sp500' in features.columns
    assert 'ret_gold'  in features.columns

def test_no_nan_in_regime_features(sample_df):
    fe = FeatureEngineer()
    features = fe.build_features(sample_df)
    for col in FeatureEngineer.REGIME_FEATURES:
        assert features[col].isna().sum() == 0

def test_zscore_normalization(sample_df):
    fe = FeatureEngineer()
    features = fe.build_features(sample_df)
    cols = FeatureEngineer.REGIME_FEATURES
    normalized = fe.normalize(features, cols)
    # Z-scored columns should have mean ≈ 0 and std ≈ 1
    for col in normalized.columns:
        assert abs(normalized[col].mean()) < 0.01
        assert abs(normalized[col].std() - 1.0) < 0.01

def test_rolling_volatility(sample_df):
    fe = FeatureEngineer()
    features = fe.build_features(sample_df)
    assert 'vol_sp500' in features.columns
    valid_vol = features['vol_sp500'].dropna()
    assert (valid_vol > 0).all(), "Volatility must be positive"

def test_yield_spread(sample_df):
    fe = FeatureEngineer()
    features = fe.build_features(sample_df)
    assert 'yield_spread' in features.columns
    assert 'yield_inverted' in features.columns
    # yield_inverted must be 0 or 1
    vals = features['yield_inverted'].dropna().unique()
    assert set(vals).issubset({0, 1})
