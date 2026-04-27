"""
backtest_engine.py
Walk-forward backtesting of the regime-based dynamic allocation strategy.
Compares vs 60/40, Gold-Only, S&P-Only benchmarks.
Zero look-ahead bias: allocation for month T uses regime detected at T-1.
"""

import os
import logging
import numpy as np
import pandas as pd
from config import REGIME_ALLOCATION, RISK_FREE_RATE, DATA_PROCESSED_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

PRICE_COLS = ["SP500", "GOLD", "BTC", "BONDS_PROXY"]
BM_6040    = {"SP500": 0.60, "BONDS_PROXY": 0.40}
BM_GOLD    = {"GOLD":  1.00}
BM_SP      = {"SP500": 1.00}


class BacktestEngine:
    """
    Walk-forward regime-based strategy backtest.
    
    Key design decision (look-ahead bias prevention):
    - Regime detected at month T → applied to portfolio at month T+1
    """

    def run(self, df: pd.DataFrame, regimes: pd.Series) -> dict:
        log.info("Running backtest...")

        # Compute monthly returns for each asset
        prices = self._prepare_prices(df)
        returns = prices.pct_change().fillna(0)

        # Align regimes with returns (shift by 1 to prevent look-ahead bias)
        regimes_lagged = regimes.shift(1).reindex(returns.index).ffill()

        # Strategy returns
        strat_returns = self._apply_strategy(returns, regimes_lagged)

        # Benchmark returns
        bm_6040 = self._apply_benchmark(returns, BM_6040)
        bm_gold = self._apply_benchmark(returns, BM_GOLD)
        bm_sp   = self._apply_benchmark(returns, BM_SP)

        # Combine into one DataFrame
        backtest_df = pd.DataFrame({
            "strategy":   strat_returns,
            "bm_6040":    bm_6040,
            "bm_gold":    bm_gold,
            "bm_sp500":   bm_sp,
        }).dropna()

        # Cumulative performance (base 100)
        cum_df = (1 + backtest_df).cumprod() * 100

        # Summary metrics for each series
        summary = {}
        for col in backtest_df.columns:
            summary[col] = self._performance_summary(backtest_df[col], cum_df[col])

        log.info("Backtest complete")
        for name, m in summary.items():
            log.info(f"  {name:12s} | CAGR: {m['cagr']*100:.1f}%  Sharpe: {m['sharpe']:.2f}  MaxDD: {m['max_drawdown']*100:.1f}%")

        result = {
            "returns":     backtest_df.reset_index().rename(columns={"index": "date"})
                                      .assign(date=lambda x: x["date"].astype(str))
                                      .to_dict("records"),
            "cumulative":  cum_df.reset_index().rename(columns={"index": "date"})
                                 .assign(date=lambda x: x["date"].astype(str))
                                 .to_dict("records"),
            "summary":     summary,
        }
        self._save(backtest_df, cum_df)
        return result

    # ──────────────────────────────────────────────────────────────────
    def _prepare_prices(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Build a price DataFrame for the assets we trade.
        BONDS_PROXY = inverse of 10Y yield as a simple proxy.
        """
        prices = pd.DataFrame(index=df.index)
        for col in ["SP500", "GOLD", "BTC"]:
            if col in df.columns:
                prices[col] = df[col].ffill()

        # Bond proxy: use 1 / (1 + YIELD_10Y/100) compounded
        if "YIELD_10Y" in df.columns:
            prices["BONDS_PROXY"] = (1 - df["YIELD_10Y"].diff() / 100).ffill().cumprod()
        else:
            prices["BONDS_PROXY"] = 1.0

        # Fill remaining assets with last known value
        prices = prices.ffill().dropna(thresh=2)
        return prices

    def _apply_strategy(self, returns: pd.DataFrame, regimes: pd.Series) -> pd.Series:
        """Apply dynamic allocation based on lagged regime."""
        port_returns = []
        for date in returns.index:
            regime_id = int(regimes.get(date, 2))   # default = Liquidity Boom
            weights   = REGIME_ALLOCATION.get(regime_id, REGIME_ALLOCATION[2])
            r = 0.0
            for asset, w in weights.items():
                if asset in returns.columns:
                    r += w * returns.loc[date, asset]
            port_returns.append(r)
        return pd.Series(port_returns, index=returns.index, name="strategy")

    def _apply_benchmark(self, returns: pd.DataFrame, weights: dict) -> pd.Series:
        """Apply fixed-weight benchmark."""
        r_series = pd.Series(0.0, index=returns.index)
        for asset, w in weights.items():
            if asset in returns.columns:
                r_series += w * returns[asset]
        return r_series

    def _performance_summary(self, ret: pd.Series, cum: pd.Series) -> dict:
        rf_monthly = RISK_FREE_RATE / 12
        n = len(ret)
        years = n / 12

        cagr = float((cum.iloc[-1] / 100) ** (1 / years) - 1) if years > 0 else 0
        ann_vol = float(ret.std() * np.sqrt(12))
        excess = ret - rf_monthly
        sharpe = float(excess.mean() / excess.std() * np.sqrt(12)) if excess.std() > 0 else 0

        downside = ret[ret < rf_monthly]
        down_std = float(downside.std() * np.sqrt(12)) if len(downside) > 1 else 1e-9
        sortino = (cagr - RISK_FREE_RATE) / down_std if down_std > 0 else 0

        peak = cum.cummax()
        dd = (peak - cum) / peak
        max_dd = float(dd.max())
        calmar = abs(cagr / max_dd) if max_dd > 0 else 0

        total_return = float(cum.iloc[-1] / 100 - 1)

        return {
            "cagr":           round(cagr,          4),
            "ann_volatility": round(ann_vol,        4),
            "sharpe":         round(sharpe,         4),
            "sortino":        round(sortino,        4),
            "max_drawdown":   round(-max_dd,        4),
            "calmar":         round(calmar,         4),
            "total_return":   round(total_return,   4),
            "n_months":       n,
        }

    def _save(self, returns_df: pd.DataFrame, cum_df: pd.DataFrame):
        os.makedirs(DATA_PROCESSED_PATH, exist_ok=True)
        returns_df.to_csv(os.path.join(DATA_PROCESSED_PATH, "backtest_returns.csv"))
        cum_df.to_csv(os.path.join(DATA_PROCESSED_PATH, "backtest_cumulative.csv"))
        log.info("Backtest results saved.")
