/**
 * Annualised Sharpe Ratio from monthly return array.
 */
export const sharpeRatio = (returns, rfAnnual = 0.05) => {
  const rfMonthly = rfAnnual / 12;
  const excess    = returns.map(r => r - rfMonthly);
  const mean      = excess.reduce((a, b) => a + b, 0) / excess.length;
  const std       = Math.sqrt(
    excess.map(r => (r - mean) ** 2).reduce((a, b) => a + b, 0) / excess.length
  );
  return std > 0 ? (mean / std) * Math.sqrt(12) : 0;
};

/**
 * Max Drawdown from price/cumulative series.
 */
export const maxDrawdown = (prices) => {
  let peak = -Infinity;
  let maxDD = 0;
  for (const p of prices) {
    if (p > peak) peak = p;
    const dd = peak > 0 ? (peak - p) / peak : 0;
    if (dd > maxDD) maxDD = dd;
  }
  return -maxDD;
};

/**
 * CAGR from start value, end value, and number of years.
 */
export const cagr = (start, end, years) => {
  if (!start || !years) return 0;
  return (end / start) ** (1 / years) - 1;
};

/**
 * Estimated portfolio metrics from weights + per-asset stats.
 */
export const estimatePortfolioMetrics = (weights, assetStats) => {
  let portReturn = 0;
  let portVar    = 0;
  for (const [asset, w] of Object.entries(weights)) {
    const stats = assetStats[asset];
    if (!stats) continue;
    portReturn += w * stats.cagr;
    portVar    += (w * stats.vol) ** 2;
  }
  const portVol = Math.sqrt(portVar);
  const sharpe  = portVol > 0 ? (portReturn - 0.05) / portVol : 0;
  return {
    cagr:       parseFloat(portReturn.toFixed(4)),
    volatility: parseFloat(portVol.toFixed(4)),
    sharpe:     parseFloat(sharpe.toFixed(4)),
  };
};

export const ASSET_STATS = {
  SP500: { cagr: 0.12, vol: 0.16 },
  GOLD:  { cagr: 0.08, vol: 0.14 },
  BTC:   { cagr: 0.45, vol: 0.75 },
  BONDS: { cagr: 0.04, vol: 0.05 },
  OIL:   { cagr: 0.06, vol: 0.32 },
  ETH:   { cagr: 0.38, vol: 0.85 },
};
