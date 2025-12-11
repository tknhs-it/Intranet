/**
 * Health check endpoint tests
 */

import request from 'supertest';
import app from '../src/index';

describe('Health Check', () => {
  it('should return 200 and health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('services');
  });

  it('should return readiness status', async () => {
    const response = await request(app)
      .get('/api/health/ready')
      .expect(200);

    expect(response.body).toHaveProperty('status');
  });

  it('should return liveness status', async () => {
    const response = await request(app)
      .get('/api/health/live')
      .expect(200);

    expect(response.body.status).toBe('alive');
  });
});

