"""Called by Node.js backend via child_process for GenAI tasks."""
import sys, json
from genai_engine import GenAIEngine

def main():
    try:
        inp = json.loads(sys.stdin.read())
    except:
        inp = {}

    genai  = GenAIEngine()
    action = inp.get("action", "market_summary")

    if action == "market_summary":
        from utils import load_json
        from config import RESULTS_PATH
        try:
            data       = load_json(RESULTS_PATH)
            regime     = data.get("current_regime", {"regime_id": 2, "regime_name": "Liquidity Boom", "confidence": 0.84})
            risk_data  = data.get("risk_metrics", {})
        except:
            regime    = {"regime_id": 2, "regime_name": "Liquidity Boom", "confidence": 0.84}
            risk_data = {}
        result = genai.generate_market_summary(regime, risk_data)

    elif action == "trade_recommend":
        result = genai.generate_trade_recommendation(
            regime_id = int(inp.get("regime_id", 2)),
            asset     = inp.get("asset", "GOLD"),
        )
    elif action == "portfolio_health":
        result = genai.portfolio_health_check(
            weights = inp.get("weights", {}),
            metrics = inp.get("metrics", {}),
        )
    else:
        result = {"error": f"Unknown action: {action}"}

    print(json.dumps(result, default=str))

if __name__ == "__main__":
    main()
