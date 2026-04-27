const request = require('supertest');
const app     = require('../../backend/server');

describe('GET /api/regime/current', () => {
  it('should return 200 with regime data', async () => {
    const res = await request(app).get('/api/regime/current');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('regime_id');
    expect(res.body).toHaveProperty('regime_name');
  });
});

describe('GET /api/regime/transition-matrix', () => {
  it('should return a 4x4 matrix object', async () => {
    const res = await request(app).get('/api/regime/transition-matrix');
    expect(res.statusCode).toBe(200);
    const keys = Object.keys(res.body);
    expect(keys.length).toBe(4);
  });
});

describe('GET /health', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
