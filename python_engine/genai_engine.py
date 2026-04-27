"""
genai_engine.py
GenAI-powered market intelligence engine.

Features:
- Regime narrative generation (plain English market summary)
- Trade recommendation generator
- Risk explanation in plain English
- Portfolio health check narrative
- News headline analysis

Uses: Groq API (free) → OpenAI fallback → Rule-based fallback
"""

import os
import json
import logging
import requests
from datetime import datetime
from config import REGIME_NAMES, REGIME_COLORS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

GROQ_API_URL  = "https://api.groq.com/openai/v1/chat/completions"
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"

# Rule-based narratives as fallback
REGIME_NARRATIVES = {
    0: {
        "summary": "We are in a HIGH INFLATION regime. Prices are rising faster than the Fed's 2% target, eroding purchasing power. Real interest rates are negative, making cash a losing proposition. Gold and commodities are your best friends right now.",
        "recommendation": "Overweight Gold (40%), reduce equity exposure to 20%. Add oil/commodity ETFs. Avoid long-duration bonds. Consider TIPS for bond allocation.",
        "risk_warning": "Inflation can spike further if supply chains remain disrupted. Equities face valuation compression as discount rates rise.",
        "key_indicator": "Watch CPI monthly print. If inflation exceeds 8%, reduce equities further.",
    },
    1: {
        "summary": "We are in a TIGHT POLICY regime. The Fed is aggressively raising rates to fight inflation. Real rates are turning positive, which is bad for gold and speculative assets. Capital is flowing into bonds and cash.",
        "recommendation": "Overweight Bonds (40%), maintain Gold (30%) as hedge. Severely underweight BTC (5%). Cash is attractive at these yields.",
        "risk_warning": "Rate hikes risk triggering a recession. Watch for credit spreads widening and unemployment rising.",
        "key_indicator": "Monitor Fed Funds futures for rate cut expectations. Inverted yield curve signals recession risk.",
    },
    2: {
        "summary": "We are in a LIQUIDITY BOOM regime. M2 money supply is expanding, real rates are accommodative, and risk appetite is high. This is historically the best environment for equities and crypto.",
        "recommendation": "Overweight S&P 500 (50%) and Bitcoin (25%). Reduce bonds to minimum (7%). Add tech and growth sectors.",
        "risk_warning": "Liquidity booms can end abruptly when the Fed pivots. Watch M2 growth rate for deceleration signals.",
        "key_indicator": "Track M2 YoY growth. Any deceleration below 3% signals regime change risk.",
    },
    3: {
        "summary": "We are in a RECESSION regime. GDP is contracting, unemployment is rising, and risk assets are under severe pressure. Capital preservation is the primary objective.",
        "recommendation": "Maximize Bonds (40%) and Gold (40%). Minimum equity exposure (10%). Avoid crypto entirely (5% max).",
        "risk_warning": "Recessions can deepen unexpectedly. Corporate earnings will disappoint. Avoid high-yield bonds.",
        "key_indicator": "Watch unemployment claims weekly. Fed rate cuts are bullish signal for recovery.",
    },
}


class GenAIEngine:
    """Generates natural language market intelligence using LLM or rules."""

    def __init__(self):
        self.groq_key   = os.getenv("GROQ_API_KEY", "")
        self.openai_key = os.getenv("OPENAI_API_KEY", "")
        self._has_llm   = bool(self.groq_key or self.openai_key)

    # ──────────────────────────────────────────────────────────────────
    #  PUBLIC METHODS
    # ──────────────────────────────────────────────────────────────────
    def generate_market_summary(self, regime_data: dict, risk_data: dict = None) -> dict:
        """Generate a complete market intelligence report."""
        regime_id   = regime_data.get("regime_id", 2)
        regime_name = regime_data.get("regime_name", "Liquidity Boom")
        confidence  = regime_data.get("confidence", 0.84)

        if self._has_llm:
            summary = self._llm_market_summary(regime_data, risk_data)
        else:
            summary = self._rule_based_summary(regime_id)

        return {
            "regime_id":      regime_id,
            "regime_name":    regime_name,
            "confidence":     confidence,
            "generated_at":   datetime.utcnow().isoformat(),
            "summary":        summary["summary"],
            "recommendation": summary["recommendation"],
            "risk_warning":   summary["risk_warning"],
            "key_indicator":  summary["key_indicator"],
            "model_used":     "groq-llama3" if self.groq_key else ("gpt-3.5-turbo" if self.openai_key else "rule-based"),
        }

    def generate_trade_recommendation(self, regime_id: int, asset: str, current_price: float = None) -> dict:
        """Generate a trade recommendation for a specific asset in current regime."""
        regime_name = REGIME_NAMES.get(regime_id, "Unknown")

        from config import REGIME_ALLOCATION
        weights = REGIME_ALLOCATION.get(regime_id, {})
        weight  = weights.get(asset, 0)

        action = "BUY" if weight >= 0.20 else ("HOLD" if weight >= 0.10 else "REDUCE")

        if self._has_llm:
            rationale = self._llm_trade_rationale(asset, regime_name, weight, action)
        else:
            rationale = self._rule_based_rationale(asset, regime_name, weight, action)

        return {
            "asset":        asset,
            "action":       action,
            "weight":       weight,
            "regime":       regime_name,
            "rationale":    rationale,
            "confidence":   "HIGH" if abs(weight - 0.25) < 0.1 else "MEDIUM",
        }

    def explain_risk_metric(self, metric: str, value: float, asset: str) -> str:
        """Explain a risk metric in plain English."""
        explanations = {
            "sharpe": f"The Sharpe Ratio of {value:.2f} for {asset} means it earned {value:.2f} units of return for every unit of risk taken. {'Excellent' if value > 1.5 else 'Good' if value > 1.0 else 'Below average'} performance.",
            "max_drawdown": f"{asset} fell {abs(value)*100:.1f}% from its peak at worst. {'Manageable' if abs(value) < 0.2 else 'Significant' if abs(value) < 0.4 else 'Severe'} drawdown.",
            "sortino": f"The Sortino Ratio of {value:.2f} shows {asset} earned {value:.2f}x return per unit of downside risk. Better than Sharpe as it ignores upside volatility.",
            "cagr": f"{asset} compounded at {value*100:.1f}% annually. {'Exceptional' if value > 0.20 else 'Strong' if value > 0.12 else 'Moderate'} long-term growth.",
            "calmar": f"The Calmar Ratio of {value:.2f} means {asset} earned {value:.2f}x its maximum drawdown in annual returns. Above 1.0 is considered good.",
        }
        return explanations.get(metric.lower(), f"{metric}: {value:.4f}")

    def portfolio_health_check(self, weights: dict, metrics: dict) -> dict:
        """Generate a plain English portfolio health report."""
        cagr    = metrics.get("cagr", 0)
        sharpe  = metrics.get("sharpe", 0)
        max_dd  = metrics.get("max_drawdown", 0)
        vol     = metrics.get("volatility", 0)

        score = 0
        issues = []
        strengths = []

        if sharpe > 1.2: score += 25; strengths.append("Excellent risk-adjusted returns (Sharpe > 1.2)")
        elif sharpe > 0.8: score += 15; strengths.append("Good risk-adjusted returns")
        else: issues.append("Low Sharpe ratio — consider reducing volatile assets")

        if abs(max_dd) < 0.20: score += 25; strengths.append("Drawdown well controlled (< 20%)")
        elif abs(max_dd) < 0.35: score += 15
        else: issues.append(f"High max drawdown of {abs(max_dd)*100:.0f}% — add defensive assets")

        if cagr > 0.15: score += 25; strengths.append(f"Strong CAGR of {cagr*100:.1f}%")
        elif cagr > 0.08: score += 15
        else: issues.append("Low growth rate — consider adding more risk assets")

        if vol < 0.20: score += 25; strengths.append("Low volatility portfolio")
        elif vol < 0.35: score += 15
        else: issues.append(f"High volatility ({vol*100:.0f}%) — reduce BTC/crypto allocation")

        grade = "A" if score >= 80 else "B" if score >= 60 else "C" if score >= 40 else "D"

        return {
            "score":     score,
            "grade":     grade,
            "strengths": strengths,
            "issues":    issues,
            "summary":   f"Portfolio grade {grade} ({score}/100). {strengths[0] if strengths else ''} {issues[0] if issues else ''}",
        }

    # ──────────────────────────────────────────────────────────────────
    #  LLM METHODS
    # ──────────────────────────────────────────────────────────────────
    def _llm_call(self, prompt: str, max_tokens: int = 300) -> str:
        """Call Groq or OpenAI API."""
        headers = {"Content-Type": "application/json"}
        body    = {"messages": [{"role": "user", "content": prompt}], "max_tokens": max_tokens, "temperature": 0.4}

        if self.groq_key:
            headers["Authorization"] = f"Bearer {self.groq_key}"
            body["model"] = "llama3-8b-8192"
            url = GROQ_API_URL
        else:
            headers["Authorization"] = f"Bearer {self.openai_key}"
            body["model"] = "gpt-3.5-turbo"
            url = OPENAI_API_URL

        try:
            resp = requests.post(url, headers=headers, json=body, timeout=15)
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"].strip()
        except Exception as e:
            log.warning(f"LLM API failed: {e}")
            return ""

    def _llm_market_summary(self, regime_data: dict, risk_data: dict) -> dict:
        regime_id   = regime_data.get("regime_id", 2)
        regime_name = regime_data.get("regime_name", "Liquidity Boom")
        confidence  = regime_data.get("confidence", 0.84)

        prompt = f"""You are a senior macro analyst at a hedge fund. Write a brief market intelligence report.

Current Regime: {regime_name} (confidence: {confidence*100:.0f}%)
Regime ID: {regime_id} (0=High Inflation, 1=Tight Policy, 2=Liquidity Boom, 3=Recession)

Write exactly 4 items in this JSON format (no markdown, just JSON):
{{
  "summary": "2-3 sentence plain English description of current macro environment",
  "recommendation": "Specific portfolio allocation recommendation with percentages",
  "risk_warning": "Main risk to watch out for",
  "key_indicator": "One specific indicator to monitor this month"
}}"""

        response = self._llm_call(prompt, max_tokens=400)
        try:
            # Try to parse JSON from response
            start = response.find('{')
            end   = response.rfind('}') + 1
            if start >= 0 and end > start:
                return json.loads(response[start:end])
        except:
            pass
        # Fallback to rule-based
        return self._rule_based_summary(regime_id)

    def _llm_trade_rationale(self, asset, regime, weight, action):
        prompt = f"""In 2 sentences, explain why {action} {asset} (weight: {weight*100:.0f}%) makes sense in a {regime} macro regime. Be specific and concise."""
        result = self._llm_call(prompt, max_tokens=100)
        return result or self._rule_based_rationale(asset, regime, weight, action)

    # ──────────────────────────────────────────────────────────────────
    #  RULE-BASED FALLBACKS
    # ──────────────────────────────────────────────────────────────────
    def _rule_based_summary(self, regime_id: int) -> dict:
        return REGIME_NARRATIVES.get(regime_id, REGIME_NARRATIVES[2])

    def _rule_based_rationale(self, asset, regime, weight, action):
        rationales = {
            ("SP500", "Liquidity Boom"):  "Equities thrive in liquidity booms as cheap money flows into risk assets. S&P 500 historically returns 20%+ in these environments.",
            ("GOLD",  "High Inflation"):  "Gold is the classic inflation hedge. With real rates negative, gold's opportunity cost disappears, historically driving 15-30% gains.",
            ("BTC",   "Liquidity Boom"):  "Bitcoin is the highest-beta risk asset and historically surges 100-400% during liquidity expansions. Maximum allocation warranted.",
            ("BONDS", "Tight Policy"):    "Bonds benefit as the market prices in eventual rate cuts. Short-duration bonds protect against further rate rises.",
            ("GOLD",  "Recession"):       "Gold is the ultimate safe haven in recessions. Investors flee to quality, driving gold up 15-25% during downturns.",
        }
        key = (asset, regime)
        return rationales.get(key, f"{action} {asset} at {weight*100:.0f}% is optimal for the {regime} macro environment based on historical backtesting.")
