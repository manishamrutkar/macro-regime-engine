const request = require('supertest');
const app     = require('../../backend/server');

describe('POST /api/portfolio/simulate', () => {
  it('should return metrics for valid weights', async () => {
    const res = await request(app)
      .post('/api/portfolio/simulate')
      .send({ SP500: 0.40, GOLD: 0.25, BTC: 0.20, BONDS: 0.15 });
    expect(res.statusCode).toBe(200);
    expect(res.body.metrics).toHaveProperty('estimated_cagr');
    expect(res.body.metrics).toHaveProperty('estimated_sharpe');
    expect(res.body.metrics).toHaveProperty('estimated_volatility');
  });

  it('should reject weights that do not sum to 1', async () => {
    const res = await request(app)
      .post('/api/portfolio/simulate')
      .send({ SP500: 0.80, GOLD: 0.80 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return sharpe > 0 for positive-return portfolios', async () => {
    const res = await request(app)
      .post('/api/portfolio/simulate')
      .send({ SP500: 0.60, BONDS: 0.40 });
    expect(res.statusCode).toBe(200);
    expect(res.body.metrics.estimated_sharpe).toBeGreaterThan(0);
  });
});
