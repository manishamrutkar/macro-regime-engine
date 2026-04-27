"""Tests for var_engine.py"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../python_engine'))

import pytest
import numpy as np
from var_engine import VaREngine

@pytest.fixture
def sample_backtest():
    np.random.seed(42)
    returns = np.random.normal(0.008, 0.04, 120).tolist()
    records = [{'date': f'2015-{i%12+1:02d}-01', 'strategy': r, 'bm_6040': r*0.7} for i, r in enumerate(returns)]
    return {'returns': records}

def test_compute_returns_dict(sample_backtest):
    engine = VaREngine()
    result = engine.compute(sample_backtest)
    assert isinstance(result, dict)

def test_var_keys_present(sample_backtest):
    engine = VaREngine()
    result = engine.compute(sample_backtest)
    assert 'strategy' in result
    keys = result['strategy'].keys()
    assert 'hist_var_95' in keys
    assert 'hist_cvar_95' in keys
    assert 'hist_var_99' in keys

def test_var_is_negative(sample_backtest):
    engine = VaREngine()
    result = engine.compute(sample_backtest)
    assert result['strategy']['hist_var_95'] < 0
    assert result['strategy']['hist_var_99'] < 0

def test_cvar_less_than_var(sample_backtest):
    """CVaR (expected shortfall) must be worse than VaR."""
    engine = VaREngine()
    result = engine.compute(sample_backtest)
    assert result['strategy']['hist_cvar_95'] <= result['strategy']['hist_var_95']

def test_compute_from_returns():
    engine = VaREngine()
    np.random.seed(0)
    returns = np.random.normal(0.005, 0.03, 100)
    result = engine.compute_from_returns(returns, 'test')
    assert 'test' in result
    assert result['test']['hist_var_95'] < 0
