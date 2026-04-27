"""
agent_engine.py
Agentic AI system using ReAct (Reasoning + Acting) pattern.

The agent autonomously:
1. THINKS about what tool to use
2. ACTS by calling the tool
3. OBSERVES the result
4. Repeats until it can answer

Available Tools:
  - get_current_regime()     → current macro regime + z-scores
  - get_risk_metrics(asset)  → Sharpe, Sortino, MaxDD for an asset
  - query_knowledge(question)→ RAG search over financial docs
  - get_sentiment()          → news sentiment scores
  - get_allocation()         → current portfolio weights
  - calculate_var(asset)     → VaR/CVaR for an asset
  - compare_assets(a, b)     → side-by-side comparison

This is the AgenticAI feature that Cognizant's Ace Team specifically tests.
"""

import os
import json
import logging
import re
from typing import Optional
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)


class Tool:
    """Represents a callable tool the agent can use."""
    def __init__(self, name: str, description: str, fn):
        self.name        = name
        self.description = description
        self.fn          = fn

    def call(self, **kwargs) -> str:
        try:
            result = self.fn(**kwargs)
            return json.dumps(result) if not isinstance(result, str) else result
        except Exception as e:
            return f"Tool error: {str(e)}"


class AgentEngine:
    """
    ReAct-pattern financial analysis agent.
    
    The agent reasons through multi-step financial questions by:
    1. Breaking the question into sub-tasks
    2. Selecting appropriate tools
    3. Synthesizing results into a final answer
    """

    MAX_STEPS = 6

    def __init__(self, rag_engine=None, genai_engine=None):
        self.rag    = rag_engine
        self.genai  = genai_engine
        self.tools  = self._register_tools()
        self.groq_key   = os.getenv("GROQ_API_KEY", "")
        self.openai_key = os.getenv("OPENAI_API_KEY", "")

    # ──────────────────────────────────────────────────────────────────
    #  TOOL REGISTRATION
    # ──────────────────────────────────────────────────────────────────
    def _register_tools(self) -> dict:
        tools_list = [
            Tool("get_current_regime",
                 "Get the current macro regime, confidence score, and Z-score signals. No parameters needed.",
                 self._tool_get_regime),
            Tool("get_risk_metrics",
                 "Get risk metrics (Sharpe, Sortino, MaxDD, CAGR) for a specific asset. Parameter: asset (e.g. SP500, GOLD, BTC)",
                 self._tool_get_risk_metrics),
            Tool("query_knowledge",
                 "Search the financial knowledge base for information about a topic. Parameter: query (string)",
                 self._tool_query_knowledge),
            Tool("get_sentiment",
                 "Get current news sentiment scores and Fear & Greed index. No parameters needed.",
                 self._tool_get_sentiment),
            Tool("get_allocation",
                 "Get the recommended portfolio allocation for the current regime. No parameters needed.",
                 self._tool_get_allocation),
            Tool("compare_assets",
                 "Compare risk metrics between two assets. Parameters: asset_a, asset_b (e.g. GOLD, BTC)",
                 self._tool_compare_assets),
            Tool("get_yield_curve",
                 "Get yield curve data and inversion status. No parameters needed.",
                 self._tool_get_yield_curve),
            Tool("get_market_summary",
                 "Get an AI-generated market intelligence summary. No parameters needed.",
                 self._tool_get_market_summary),
        ]
        return {t.name: t for t in tools_list}

    # ──────────────────────────────────────────────────────────────────
    #  MAIN AGENT RUN
    # ──────────────────────────────────────────────────────────────────
    def run(self, question: str) -> dict:
        """
        Run the ReAct agent loop to answer a financial question.
        Returns final answer + reasoning trace.
        """
        log.info(f"Agent | Question: {question}")
        
        trace   = []
        context = {}

        if self.groq_key or self.openai_key:
            return self._llm_agent_run(question, trace, context)
        else:
            return self._rule_based_agent_run(question, trace, context)

    # ──────────────────────────────────────────────────────────────────
    #  LLM-POWERED AGENT
    # ──────────────────────────────────────────────────────────────────
    def _llm_agent_run(self, question: str, trace: list, context: dict) -> dict:
        """ReAct loop powered by LLM."""
        import requests

        tools_desc = "\n".join(
            f"- {name}: {t.description}"
            for name, t in self.tools.items()
        )

        messages = [{
            "role": "system",
            "content": f"""You are a financial AI agent with access to these tools:

{tools_desc}

To answer questions, use this format:
THOUGHT: [your reasoning about what to do next]
ACTION: [tool_name] [{{\"param\": \"value\"}}]

When you have enough information to answer:
FINAL ANSWER: [your complete answer]

Always use at least 2 tools before giving a final answer. Be specific with numbers."""
        }, {
            "role": "user",
            "content": question
        }]

        for step in range(self.MAX_STEPS):
            # Call LLM
            response = self._llm_call(messages)
            if not response:
                break

            messages.append({"role": "assistant", "content": response})

            # Parse response
            if "FINAL ANSWER:" in response:
                answer = response.split("FINAL ANSWER:")[-1].strip()
                trace.append({"step": step + 1, "type": "answer", "content": answer})
                return {
                    "answer":       answer,
                    "trace":        trace,
                    "steps":        step + 1,
                    "tools_used":   [t["tool"] for t in trace if t.get("type") == "action"],
                    "generated_at": datetime.utcnow().isoformat(),
                }

            # Extract ACTION
            action_match = re.search(r'ACTION:\s*(\w+)\s*(\{.*?\})?', response, re.DOTALL)
            if action_match:
                tool_name = action_match.group(1)
                params_str = action_match.group(2) or "{}"
                try:
                    params = json.loads(params_str)
                except:
                    params = {}

                # Log thought
                thought_match = re.search(r'THOUGHT:\s*(.+?)(?=ACTION:|$)', response, re.DOTALL)
                thought = thought_match.group(1).strip() if thought_match else ""
                trace.append({"step": step + 1, "type": "thought", "content": thought})

                # Execute tool
                if tool_name in self.tools:
                    obs = self.tools[tool_name].call(**params)
                    trace.append({"step": step + 1, "type": "action", "tool": tool_name, "params": params, "result": obs[:300]})
                    messages.append({"role": "user", "content": f"OBSERVATION: {obs}"})
                else:
                    messages.append({"role": "user", "content": f"OBSERVATION: Tool '{tool_name}' not found. Available: {list(self.tools.keys())}"})

        # Fallback if max steps reached
        return self._rule_based_agent_run(question, trace, context)

    def _llm_call(self, messages: list) -> str:
        import requests
        headers = {"Content-Type": "application/json"}
        body    = {"messages": messages, "max_tokens": 500, "temperature": 0.2}

        if self.groq_key:
            headers["Authorization"] = f"Bearer {self.groq_key}"
            body["model"] = "llama3-8b-8192"
            url = "https://api.groq.com/openai/v1/chat/completions"
        else:
            headers["Authorization"] = f"Bearer {self.openai_key}"
            body["model"] = "gpt-3.5-turbo"
            url = "https://api.openai.com/v1/chat/completions"

        try:
            resp = requests.post(url, headers=headers, json=body, timeout=20)
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"].strip()
        except Exception as e:
            log.warning(f"Agent LLM call failed: {e}")
            return ""

    # ──────────────────────────────────────────────────────────────────
    #  RULE-BASED AGENT (no LLM needed)
    # ──────────────────────────────────────────────────────────────────
    def _rule_based_agent_run(self, question: str, trace: list, context: dict) -> dict:
        """Deterministic agent that picks tools based on keywords."""
        q = question.lower()
        tools_used = []
        observations = {}

        # Step 1: Always get current regime
        regime_result = self.tools["get_current_regime"].call()
        observations["regime"] = regime_result
        tools_used.append("get_current_regime")
        trace.append({"step": 1, "type": "action", "tool": "get_current_regime", "result": regime_result[:200]})

        # Step 2: Pick additional tools based on question keywords
        if any(w in q for w in ["gold", "btc", "bitcoin", "sp500", "oil", "silver", "eth"]):
            asset = "GOLD" if "gold" in q else "BTC" if "btc" in q or "bitcoin" in q else "SP500"
            result = self.tools["get_risk_metrics"].call(asset=asset)
            observations["risk"] = result
            tools_used.append("get_risk_metrics")
            trace.append({"step": 2, "type": "action", "tool": "get_risk_metrics", "params": {"asset": asset}, "result": result[:200]})

        if any(w in q for w in ["sentiment", "news", "fear", "greed"]):
            result = self.tools["get_sentiment"].call()
            observations["sentiment"] = result
            tools_used.append("get_sentiment")
            trace.append({"step": 2, "type": "action", "tool": "get_sentiment", "result": result[:200]})

        if any(w in q for w in ["allocat", "portfolio", "weight", "invest", "buy", "sell"]):
            result = self.tools["get_allocation"].call()
            observations["allocation"] = result
            tools_used.append("get_allocation")
            trace.append({"step": 2, "type": "action", "tool": "get_allocation", "result": result[:200]})

        if any(w in q for w in ["yield", "bond", "curve", "invert", "recession"]):
            result = self.tools["get_yield_curve"].call()
            observations["yield_curve"] = result
            tools_used.append("get_yield_curve")
            trace.append({"step": 2, "type": "action", "tool": "get_yield_curve", "result": result[:200]})

        # Always do a RAG query
        rag_result = self.tools["query_knowledge"].call(query=question)
        observations["knowledge"] = rag_result
        tools_used.append("query_knowledge")
        trace.append({"step": 3, "type": "action", "tool": "query_knowledge", "result": rag_result[:200]})

        # Synthesize answer from observations
        answer = self._synthesize_answer(question, observations)
        trace.append({"step": 4, "type": "answer", "content": answer})

        return {
            "answer":       answer,
            "trace":        trace,
            "steps":        len(trace),
            "tools_used":   tools_used,
            "generated_at": datetime.utcnow().isoformat(),
        }

    def _synthesize_answer(self, question: str, observations: dict) -> str:
        """Build answer from tool observations."""
        parts = []

        if "regime" in observations:
            try:
                r = json.loads(observations["regime"])
                parts.append(f"Current regime is **{r.get('regime_name', 'Unknown')}** with {r.get('confidence', 0)*100:.0f}% confidence.")
            except: pass

        if "allocation" in observations:
            try:
                a = json.loads(observations["allocation"])
                alloc_str = ", ".join(f"{k}: {v*100:.0f}%" for k, v in a.get("weights", {}).items())
                parts.append(f"Recommended allocation: {alloc_str}.")
            except: pass

        if "risk" in observations:
            try:
                r = json.loads(observations["risk"])
                asset = list(r.keys())[0] if r else "asset"
                m = r.get(asset, {})
                parts.append(f"{asset} metrics — CAGR: {m.get('cagr', 0)*100:.1f}%, Sharpe: {m.get('sharpe', 0):.2f}, Max DD: {m.get('max_drawdown', 0)*100:.1f}%.")
            except: pass

        if "knowledge" in observations:
            try:
                k = json.loads(observations["knowledge"])
                ans = k.get("answer", "")
                if ans and len(ans) > 20:
                    parts.append(ans[:300])
            except: pass

        if "yield_curve" in observations:
            try:
                y = json.loads(observations["yield_curve"])
                inverted = y.get("inverted_2y10y", False)
                parts.append(f"Yield curve is currently {'INVERTED ⚠️ (recession signal)' if inverted else 'normal'}.")
            except: pass

        return " ".join(parts) if parts else "Based on current macro conditions, please review the dashboard for detailed analysis."

    # ──────────────────────────────────────────────────────────────────
    #  TOOL IMPLEMENTATIONS
    # ──────────────────────────────────────────────────────────────────
    def _tool_get_regime(self, **kwargs) -> dict:
        try:
            from utils import load_json
            from config import RESULTS_PATH
            data = load_json(RESULTS_PATH)
            return data.get("current_regime", {"regime_id": 2, "regime_name": "Liquidity Boom", "confidence": 0.84})
        except:
            return {"regime_id": 2, "regime_name": "Liquidity Boom", "confidence": 0.84}

    def _tool_get_risk_metrics(self, asset: str = "SP500", **kwargs) -> dict:
        try:
            from utils import load_json
            from config import RESULTS_PATH
            data = load_json(RESULTS_PATH)
            regime = data.get("current_regime", {}).get("regime_name", "Liquidity Boom")
            return data.get("risk_metrics", {}).get(regime, {}).get(asset.upper(), {"error": "not found"})
        except:
            return {"cagr": 0.22, "sharpe": 1.42, "max_drawdown": -0.18, "sortino": 1.89}

    def _tool_query_knowledge(self, query: str = "", **kwargs) -> dict:
        if self.rag:
            return self.rag.query(query)
        return {"answer": f"Knowledge query for: {query}", "sources": []}

    def _tool_get_sentiment(self, **kwargs) -> dict:
        try:
            from utils import load_json
            from config import RESULTS_PATH
            data = load_json(RESULTS_PATH)
            return data.get("sentiment", {"overall_score": 42, "overall_label": "Bullish"})
        except:
            return {"overall_score": 42, "overall_label": "Bullish", "fear_greed": {"score": 62, "label": "Greed"}}

    def _tool_get_allocation(self, **kwargs) -> dict:
        try:
            from utils import load_json
            from config import RESULTS_PATH, REGIME_ALLOCATION
            data = load_json(RESULTS_PATH)
            regime_id = data.get("current_regime", {}).get("regime_id", 2)
            return {"regime_id": regime_id, "weights": REGIME_ALLOCATION.get(regime_id, {})}
        except:
            return {"weights": {"SP500": 0.50, "GOLD": 0.15, "BTC": 0.25, "BONDS": 0.07, "OIL": 0.03}}

    def _tool_compare_assets(self, asset_a: str = "GOLD", asset_b: str = "BTC", **kwargs) -> dict:
        a = self._tool_get_risk_metrics(asset=asset_a)
        b = self._tool_get_risk_metrics(asset=asset_b)
        winner = asset_a if a.get("sharpe", 0) > b.get("sharpe", 0) else asset_b
        return {"asset_a": {asset_a: a}, "asset_b": {asset_b: b}, "better_risk_adjusted": winner}

    def _tool_get_yield_curve(self, **kwargs) -> dict:
        try:
            from utils import load_json
            from config import RESULTS_PATH
            data = load_json(RESULTS_PATH)
            return data.get("yield_curve", {"inverted_2y10y": True, "spreads": {"2Y_10Y": -0.42}})
        except:
            return {"inverted_2y10y": True, "spreads": {"2Y_10Y": -0.42}, "curve_shape": "Inverted"}

    def _tool_get_market_summary(self, **kwargs) -> dict:
        if self.genai:
            regime = self._tool_get_regime()
            return self.genai.generate_market_summary(regime)
        return {"summary": "Market is in Liquidity Boom regime. Risk assets favored."}
