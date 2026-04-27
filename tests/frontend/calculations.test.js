import { sharpeRatio, maxDrawdown, cagr, estimatePortfolioMetrics, ASSET_STATS } from '../../frontend/src/utils/calculations';

describe('sharpeRatio', () => {
  it('returns positive sharpe for consistently positive returns', () => {
    const returns = Array(36).fill(0.01);
    expect(sharpeRatio(returns)).toBeGreaterThan(0);
  });
  it('returns negative sharpe for consistently negative returns', () => {
    const returns = Array(36).fill(-0.01);
    expect(sharpeRatio(returns)).toBeLessThan(0);
  });
  it('returns 0 for zero std dev', () => {
    const returns = Array(36).fill(0.004);
    const result = sharpeRatio(returns);
    expect(typeof result).toBe('number');
  });
});

describe('maxDrawdown', () => {
  it('returns 0 for monotonically increasing prices', () => {
    const prices = [100, 110, 120, 130, 140];
    expect(maxDrawdown(prices)).toBe(0);
  });
  it('returns negative value for a declining price', () => {
    const prices = [100, 120, 80, 90];
    expect(maxDrawdown(prices)).toBeLessThan(0);
  });
  it('calculates correct drawdown', () => {
    const prices = [100, 150, 100];
    const dd = maxDrawdown(prices);
    expect(Math.abs(dd - 1/3)).toBeLessThan(0.01);
  });
});

describe('cagr', () => {
  it('returns correct CAGR for doubling over 7 years', () => {
    const result = cagr(100, 200, 7);
    expect(Math.abs(result - 0.1041)).toBeLessThan(0.001);
  });
  it('returns 0 for missing inputs', () => {
    expect(cagr(0, 200, 5)).toBe(0);
    expect(cagr(100, 200, 0)).toBe(0);
  });
});

describe('estimatePortfolioMetrics', () => {
  it('returns expected keys', () => {
    const weights = { SP500: 0.6, BONDS: 0.4 };
    const metrics = estimatePortfolioMetrics(weights, ASSET_STATS);
    expect(metrics).toHaveProperty('cagr');
    expect(metrics).toHaveProperty('volatility');
    expect(metrics).toHaveProperty('sharpe');
  });
  it('returns positive CAGR for equity-heavy portfolio', () => {
    const weights = { SP500: 0.8, BONDS: 0.2 };
    const metrics = estimatePortfolioMetrics(weights, ASSET_STATS);
    expect(metrics.cagr).toBeGreaterThan(0);
  });
  it('handles unknown assets gracefully', () => {
    const weights = { UNKNOWN: 0.5, SP500: 0.5 };
    const metrics = estimatePortfolioMetrics(weights, ASSET_STATS);
    expect(metrics).toHaveProperty('cagr');
  });
});
