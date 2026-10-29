import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../../src/presentation/app.js';
describe('HTTP health', () => {
  it('returns API status', async () => {
    const response = await request(createApp()).get('/api/health');
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { status: 'ok' });
  });

  it('returns a consistent client error for malformed JSON', async () => {
    const response = await request(createApp())
      .post('/api/accounts')
      .set('Content-Type', 'application/json')
      .send('{');

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { message: 'Invalid input data.' });
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

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, { message: 'Invalid input data.' });
  });

  it('returns a predictable response for unknown routes', async () => {
    const response = await request(createApp()).get('/api/missing');

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, { message: 'Route not found.' });
  });
});
