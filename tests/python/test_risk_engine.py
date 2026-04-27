"""Tests for risk_engine.py"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../python_engine'))

import pytest
import numpy as np
import pandas as pd
from risk_engine import RiskEngine
from config import REGIME_NAMES

@pytest.fixture
def sample_data_regimes():
    dates = pd.date_range('2010-01-01', periods=120, freq='MS')
    np.random.seed(42)
    df = pd.DataFrame({
        'SP500': 3000 * np.cumprod(1 + np.random.normal(0.008, 0.04, 120)),
        'GOLD':  1800 * np.cumprod(1 + np.random.normal(0.004, 0.015, 120)),
        'BTC':   1000 * np.cumprod(1 + np.random.normal(0.02, 0.15, 120)),
    }, index=dates)
    regimes = pd.Series(
        np.random.choice([0, 1, 2, 3], size=120),
        index=dates, name='regime'
    )
    return df, regimes

def test_compute_returns_dict(sample_data_regimes):
    df, regimes = sample_data_regimes
    engine = RiskEngine()
    result = engine.compute(df, regimes)
    assert isinstance(result, dict)
    assert len(result) > 0

def test_all_regimes_in_result(sample_data_regimes):
    df, regimes = sample_data_regimes
    engine = RiskEngine()
    result = engine.compute(df, regimes)
    for name in REGIME_NAMES.values():
        assert name in result

def test_metrics_keys_present(sample_data_regimes):
    df, regimes = sample_data_regimes
    engine = RiskEngine()
    result = engine.compute(df, regimes)
    expected_keys = {'cagr', 'ann_volatility', 'sharpe', 'sortino', 'max_drawdown', 'calmar'}
    for regime_data in result.values():
        for asset_metrics in regime_data.values():
            assert expected_keys.issubset(set(asset_metrics.keys()))

def test_max_drawdown_negative(sample_data_regimes):
    df, regimes = sample_data_regimes
    engine = RiskEngine()
    result = engine.compute(df, regimes)
    for regime_data in result.values():
        for asset, metrics in regime_data.items():
            assert metrics['max_drawdown'] <= 0, f"{asset}: drawdown should be <= 0"

def test_volatility_positive(sample_data_regimes):
    df, regimes = sample_data_regimes
    engine = RiskEngine()
    result = engine.compute(df, regimes)
    for regime_data in result.values():
        for asset, metrics in regime_data.items():
            assert metrics['ann_volatility'] >= 0
