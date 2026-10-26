import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/presentation/app.js';
describe('HTTP health', () => {
  it('returns API status', async () => {
    const response = await request(createApp()).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('returns a consistent client error for malformed JSON', async () => {
    const response = await request(createApp())
      .post('/api/accounts')
      .set('Content-Type', 'application/json')
      .send('{');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid input data.' });
  });

  it('rejects impossible dates before accessing the database', async () => {
    const response = await request(createApp()).post('/api/transactions').send({
      description: 'Invalid date',
      amountCents: 100,
      date: '2026-02-31',
      type: 'EXPENSE',
      accountId: 'account',
      categoryId: 'category'
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid input data.' });
  });

  it('returns a predictable response for unknown routes', async () => {
    const response = await request(createApp()).get('/api/missing');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Route not found.' });
  });
});
