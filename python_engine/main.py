"""
main.py
Full pipeline entry point.
Run: python main.py [--mode api|full]
  full → fetches fresh data, retrains model, saves all outputs
  api  → loads cached outputs and prints JSON for the Node backend
"""

import sys
import json
import logging
import argparse
import traceback

from utils import NpEncoder, save_json
from config import RESULTS_PATH

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stderr)],
)
log = logging.getLogger(__name__)


def run_full_pipeline() -> dict:
    """Fetch fresh data and run the complete analysis pipeline."""
    from data_fetcher         import DataFetcher
    from data_loader          import DataLoader
    from feature_engineering  import FeatureEngineer
    from regime_model         import RegimeModel
    from transition_matrix    import TransitionMatrix
    from risk_engine          import RiskEngine
    from backtest_engine      import BacktestEngine
    from sentiment_engine     import SentimentEngine
    from forecast_model       import ForecastModel
    from monte_carlo          import MonteCarloSimulator
    from var_engine           import VaREngine
    from sector_engine        import SectorEngine
    from yield_curve          import YieldCurveAnalyzer

    log.info("=" * 55)
    log.info("  MACRO REGIME ENGINE — Full Pipeline")
    log.info("=" * 55)

    # 1. Fetch
    raw = DataFetcher().fetch_all()

    # 2. Load & clean
    df = DataLoader().load_and_clean(raw)

    # 3. Features
    features = FeatureEngineer().build_features(df)

    # 4. Regime detection
    regime_model = RegimeModel()
    regimes      = regime_model.fit_predict(features)
    current      = regime_model.predict_latest(features)

    # 5. Transition matrix
    tm     = TransitionMatrix()
    matrix = tm.compute(regimes)

    # 6. Risk
    risk_metrics = RiskEngine().compute(df, regimes)

    # 7. Backtest
    backtest = BacktestEngine().run(df, regimes)

    # 8. Sentiment
    sentiment = SentimentEngine().analyze()

    # 9. Forecast
    forecast = ForecastModel().predict(features, regimes)

    # 10. Monte Carlo
    mc_result = MonteCarloSimulator().run(backtest)

    # 11. VaR
    var_metrics = VaREngine().compute(backtest)

    # 12. Sectors
    sector_result = SectorEngine().analyze(regimes)

    # 13. Yield curve
    yield_result = YieldCurveAnalyzer().analyze(df)

    output = {
        "status":          "ok",
        "current_regime":  current,
        "transition_matrix": tm.to_dict(),
        "risk_metrics":    risk_metrics,
        "backtest":        {
            "summary":    backtest["summary"],
            "cumulative": backtest["cumulative"][-60:],   # last 5 years for API
        },
        "sentiment":       sentiment,
        "forecast":        forecast,
        "monte_carlo":     mc_result,
        "var_metrics":     var_metrics,
        "sector_rotation": sector_result,
        "yield_curve":     yield_result,
    }

    save_json(output, RESULTS_PATH)
    log.info(f"Results saved → {RESULTS_PATH}")
    return output


def run_api_mode() -> dict:
    """Load cached results for fast API response."""
    from utils import load_json
    try:
        return load_json(RESULTS_PATH)
    except FileNotFoundError:
        log.warning("No cached results found. Running full pipeline...")
        return run_full_pipeline()


def main():
    parser = argparse.ArgumentParser(description="Macro Regime Engine")
    parser.add_argument(
        "--mode",
        choices=["full", "api"],
        default="api",
        help="full = fetch + retrain; api = load cache (default: api)",
    )
    args = parser.parse_args()

    try:
        if args.mode == "full":
            result = run_full_pipeline()
        else:
            result = run_api_mode()

        # Print JSON to stdout (consumed by Node.js backend)
        print(json.dumps(result, cls=NpEncoder))

    except Exception as e:
        log.error(f"Pipeline failed: {e}")
        traceback.print_exc(file=sys.stderr)
        error_output = {"status": "error", "message": str(e)}
        print(json.dumps(error_output))
        sys.exit(1)


if __name__ == "__main__":
    main()
