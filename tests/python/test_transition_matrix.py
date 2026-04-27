"""Tests for transition_matrix.py"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../python_engine'))

import pytest
import numpy as np
import pandas as pd
from transition_matrix import TransitionMatrix
from config import N_REGIMES

@pytest.fixture
def sample_regimes():
    dates = pd.date_range('2010-01-01', periods=120, freq='MS')
    np.random.seed(42)
    return pd.Series(np.random.choice(range(N_REGIMES), size=120), index=dates, name='regime')

def test_compute_returns_ndarray(sample_regimes):
    tm = TransitionMatrix()
    matrix = tm.compute(sample_regimes)
    assert matrix.shape == (N_REGIMES, N_REGIMES)

def test_rows_sum_to_one(sample_regimes):
    tm = TransitionMatrix()
    matrix = tm.compute(sample_regimes)
    for i in range(N_REGIMES):
        assert abs(matrix[i].sum() - 1.0) < 1e-6, f"Row {i} does not sum to 1"

def test_all_values_between_0_and_1(sample_regimes):
    tm = TransitionMatrix()
    matrix = tm.compute(sample_regimes)
    assert (matrix >= 0).all() and (matrix <= 1).all()

def test_persistence_returns_dict(sample_regimes):
    tm = TransitionMatrix()
    tm.compute(sample_regimes)
    p = tm.persistence()
    assert isinstance(p, dict)
    assert len(p) == N_REGIMES
    for v in p.values():
        assert 0 <= v <= 1

def test_to_dict_keys(sample_regimes):
    from config import REGIME_NAMES
    tm = TransitionMatrix()
    tm.compute(sample_regimes)
    d = tm.to_dict()
    assert set(d.keys()) == set(REGIME_NAMES.values())
