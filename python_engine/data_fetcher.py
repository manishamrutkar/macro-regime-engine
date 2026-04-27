"""
data_fetcher.py
Fetches all raw data from FRED, Yahoo Finance, and CoinGecko.
Saves each series as CSV to data/raw/.
"""

import os
import time
import logging
import pandas as pd
import yfinance as yf
import requests
from fredapi import Fred
from config import (
    FRED_API_KEY, FRED_SERIES, YAHOO_TICKERS,
    SECTOR_TICKERS, START_DATE, DATA_RAW_PATH
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

os.makedirs(DATA_RAW_PATH, exist_ok=True)


class DataFetcher:
    """Fetches data from all sources and saves raw CSVs."""

    def __init__(self):
        if FRED_API_KEY:
            self.fred = Fred(api_key=FRED_API_KEY)
        else:
            self.fred = None
            log.warning("FRED_API_KEY not set. FRED data will be skipped.")

    # ──────────────────────────────────────────
    #  FRED
    # ──────────────────────────────────────────
    def fetch_fred(self) -> dict:
        """Fetch all FRED series. Returns {name: pd.Series}."""
        if not self.fred:
            return {}
        result = {}
        for name, series_id in FRED_SERIES.items():
            try:
                s = self.fred.get_series(series_id, observation_start=START_DATE)
                s.name = name
                result[name] = s
                path = os.path.join(DATA_RAW_PATH, f"fred_{name.lower()}.csv")
                s.to_csv(path, header=True)
                log.info(f"FRED | {name} ({series_id}) → {len(s)} rows saved")
            except Exception as e:
                log.error(f"FRED | {name} failed: {e}")
        return result

    # ──────────────────────────────────────────
    #  YAHOO FINANCE
    # ──────────────────────────────────────────
    def fetch_yahoo(self) -> dict:
        """Fetch Yahoo Finance price data. Returns {name: pd.DataFrame}."""
        result = {}
        all_tickers = {**YAHOO_TICKERS, **SECTOR_TICKERS}
        for name, ticker in all_tickers.items():
            try:
                df = yf.download(ticker, start=START_DATE, auto_adjust=True, progress=False)
                if df.empty:
                    log.warning(f"Yahoo | {name} ({ticker}) returned empty data")
                    continue
                close = df[["Close"]].rename(columns={"Close": name})
                path = os.path.join(DATA_RAW_PATH, f"yahoo_{name.lower()}.csv")
                close.to_csv(path)
                result[name] = close
                log.info(f"Yahoo | {name} ({ticker}) → {len(close)} rows saved")
                time.sleep(0.3)   # be polite to Yahoo
            except Exception as e:
                log.error(f"Yahoo | {name} ({ticker}) failed: {e}")
        return result

    # ──────────────────────────────────────────
    #  COINGECKO  (BTC / ETH / SOL / BNB fallback)
    # ──────────────────────────────────────────
    _CG_IDS = {
        "BTC": "bitcoin",
        "ETH": "ethereum",
        "SOL": "solana",
        "BNB": "binancecoin",
    }

    def fetch_coingecko(self, coin: str) -> pd.DataFrame:
        """
        Fetch daily OHLCV from CoinGecko public API (no key needed).
        Returns a DataFrame with a 'Close' column.
        """
        cg_id = self._CG_IDS.get(coin.upper())
        if not cg_id:
            raise ValueError(f"Unknown CoinGecko coin: {coin}")

        url = (
            f"https://api.coingecko.com/api/v3/coins/{cg_id}/market_chart"
            f"?vs_currency=usd&days=max&interval=daily"
        )
        try:
            resp = requests.get(url, timeout=15)
            resp.raise_for_status()
            prices = resp.json().get("prices", [])
            df = pd.DataFrame(prices, columns=["timestamp", coin])
            df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
            df = df.set_index("timestamp")
            df.index.name = "Date"
            path = os.path.join(DATA_RAW_PATH, f"cg_{coin.lower()}.csv")
            df.to_csv(path)
            log.info(f"CoinGecko | {coin} → {len(df)} rows saved")
            return df
        except Exception as e:
            log.error(f"CoinGecko | {coin} failed: {e}")
            return pd.DataFrame()

    # ──────────────────────────────────────────
    #  MASTER FETCH
    # ──────────────────────────────────────────
    def fetch_all(self) -> dict:
        """Run all fetchers and return combined raw dict."""
        log.info("=== Starting full data fetch ===")
        fred_data  = self.fetch_fred()
        yahoo_data = self.fetch_yahoo()

        # CoinGecko fallback for missing crypto
        cg_data = {}
        for coin in ["BTC", "ETH", "SOL", "BNB"]:
            if coin not in yahoo_data or yahoo_data[coin].empty:
                cg_data[coin] = self.fetch_coingecko(coin)

        log.info("=== Data fetch complete ===")
        return {"fred": fred_data, "yahoo": yahoo_data, "coingecko": cg_data}
