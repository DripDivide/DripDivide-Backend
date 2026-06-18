import request from 'supertest';
import { app } from '../../src/app';

describe('Health API', () => {
  it('returns health status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'healthy' });
    expect(res.body.timestamp).toBeDefined();
  });

  it('returns a consistent 404 envelope', async () => {
    const res = await request(app).get('/missing');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
      },
    });
  });
});
