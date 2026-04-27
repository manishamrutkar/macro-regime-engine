const request = require('supertest');
const app     = require('../../backend/server');

describe('GET /api/market/yield-curve', () => {
  it('should return yield curve data', async () => {
    const res = await request(app).get('/api/market/yield-curve');
    expect(res.statusCode).toBe(200);
  });
});

describe('GET /api/market/sectors', () => {
  it('should return sector data', async () => {
    const res = await request(app).get('/api/market/sectors');
    expect(res.statusCode).toBe(200);
  });
});

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});
