import numpy as np
"""
sentiment_engine.py
Fetches macro financial news from RSS feeds and scores sentiment
using a keyword-weighted lexicon approach (no API key needed).
FinBERT integration is provided as an optional upgrade path.
"""

import os
import logging
import hashlib
import datetime
import xml.etree.ElementTree as ET
import requests
import pandas as pd
from config import DATA_PROCESSED_PATH

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

# ── Financial sentiment lexicon ───────────────────────────────────────
BULLISH_WORDS = {
    "surge", "soar", "rally", "gain", "growth", "rise", "strong",
    "robust", "optimistic", "recovery", "bull", "upside", "positive",
    "beat", "exceed", "record", "high", "expand", "boost", "support",
    "green", "advance", "momentum", "outperform", "upgrade",
}
BEARISH_WORDS = {
    "fall", "drop", "decline", "crash", "recession", "risk", "weak",
    "concern", "fear", "loss", "down", "sell", "panic", "crisis",
    "miss", "disappoint", "cut", "low", "contract", "downgrade",
    "bear", "slump", "tumble", "plunge", "warn", "pressure",
}

# ── News Sources (public RSS) ─────────────────────────────────────────
RSS_SOURCES = {
    "Reuters":    "https://feeds.reuters.com/reuters/businessNews",
    "CNBC":       "https://www.cnbc.com/id/20910258/device/rss/rss.html",
    "Bloomberg":  "https://feeds.bloomberg.com/markets/news.rss",
    "FT":         "https://www.ft.com/markets?format=rss",
    "Yahoo Fin":  "https://finance.yahoo.com/news/rssindex",
}

HEADERS = {"User-Agent": "MacroRegimeEngine/1.0 (educational project)"}


class SentimentEngine:
    """Fetches news headlines and scores macro sentiment."""

    def analyze(self) -> dict:
        """Fetch headlines from all RSS sources and compute sentiment scores."""
        log.info("Running sentiment analysis...")
        all_articles = []

        for source, url in RSS_SOURCES.items():
            articles = self._fetch_rss(source, url)
            all_articles.extend(articles)
            log.info(f"  {source}: {len(articles)} headlines fetched")

        if not all_articles:
            log.warning("No articles fetched. Using cached data if available.")
            return self.load()

        df = pd.DataFrame(all_articles)
        df = self._score_sentiment(df)

        # Per-source aggregate
        source_scores = {}
        for src, grp in df.groupby("source"):
            avg = float(grp["score"].mean())
            source_scores[src] = {
                "score":         round(avg, 2),
                "label":         self._label(avg),
                "article_count": len(grp),
            }

        # Overall aggregate
        overall = float(df["score"].mean())
        fear_greed = self._compute_fear_greed(df)

        result = {
            "overall_score":  round(overall, 2),
            "overall_label":  self._label(overall),
            "fear_greed":     fear_greed,
            "sources":        source_scores,
            "top_headlines":  df.nlargest(5, "score")[["title", "source", "score"]].to_dict("records"),
            "worst_headlines":df.nsmallest(5, "score")[["title", "source", "score"]].to_dict("records"),
            "timestamp":      datetime.datetime.utcnow().isoformat(),
        }

        log.info(f"Overall sentiment: {result['overall_label']} ({result['overall_score']})")
        self._save(result)
        return result

    # ──────────────────────────────────────────────────────────────────
    def _fetch_rss(self, source: str, url: str) -> list:
        try:
            resp = requests.get(url, timeout=10, headers=HEADERS)
            resp.raise_for_status()
            root = ET.fromstring(resp.content)
            articles = []
            for item in root.iter("item"):
                title = item.findtext("title", "").strip()
                desc  = item.findtext("description", "").strip()
                if title:
                    articles.append({
                        "source": source,
                        "title":  title,
                        "desc":   desc,
                        "id":     hashlib.md5(title.encode()).hexdigest(),
                    })
            return articles
        except Exception as e:
            log.warning(f"RSS fetch failed for {source}: {e}")
            return []

    def _score_sentiment(self, df: pd.DataFrame) -> pd.DataFrame:
        """Keyword-based sentiment scoring: range [-100, +100]."""
        scores = []
        for _, row in df.iterrows():
            text   = (row["title"] + " " + row.get("desc", "")).lower()
            words  = set(text.split())
            bull   = len(words & BULLISH_WORDS)
            bear   = len(words & BEARISH_WORDS)
            total  = bull + bear
            score  = ((bull - bear) / total * 100) if total > 0 else 0
            scores.append(round(score, 2))
        df["score"] = scores
        return df

    def _label(self, score: float) -> str:
        if score > 20:   return "Bullish"
        if score < -20:  return "Bearish"
        return "Neutral"

    def _compute_fear_greed(self, df: pd.DataFrame) -> dict:
        """
        Simplified Fear & Greed index: maps average sentiment score to 0-100.
        0 = Extreme Fear, 100 = Extreme Greed.
        """
        avg = float(df["score"].mean())
        # Map [-100, +100] → [0, 100]
        fg_score = int(np.clip((avg + 100) / 2, 0, 100))
        if fg_score >= 75:   label = "Extreme Greed"
        elif fg_score >= 55: label = "Greed"
        elif fg_score >= 45: label = "Neutral"
        elif fg_score >= 25: label = "Fear"
        else:                label = "Extreme Fear"
        return {"score": fg_score, "label": label}

    def _save(self, result: dict):
        os.makedirs(DATA_PROCESSED_PATH, exist_ok=True)
        import json
        path = os.path.join(DATA_PROCESSED_PATH, "sentiment.json")
        with open(path, "w") as f:
            json.dump(result, f, indent=2)
        log.info(f"Sentiment saved → {path}")

    def load(self) -> dict:
        import json
        path = os.path.join(DATA_PROCESSED_PATH, "sentiment.json")
        if not os.path.exists(path):
            return {"overall_score": 0, "overall_label": "Neutral", "sources": {}}
        with open(path) as f:
            return json.load(f)



