import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import { expenseCategoryFixture } from '../fixtures/financial-fixtures.js';
import { createCategory, createTestApplication } from '../helpers/api-test-application.js';
import {
  assertJsonResponse,
  assertPublicError,
  assertSafeInternalError
} from '../helpers/http-assertions.js';

describe('Rotas funcionais de histórico', () => {
  it('deve recuperar o histórico paginado quando houver alterações persistidas', async () => {
    const testApplication = createTestApplication();
    try {
      const category = await createCategory(testApplication.app, expenseCategoryFixture);
      const response = await request(testApplication.app)
        .get('/api/history')
        .query({ page: 1, pageSize: 1 });
      assertJsonResponse(response, 200);
      assert.equal(response.body.total, 1);
      assert.equal(response.body.page, 1);
      assert.equal(response.body.pageSize, 1);
      assert.equal(response.body.items.length, 1);
      assert.equal(response.body.items[0].entity, 'CATEGORY');
      assert.equal(response.body.items[0].action, 'CREATED');
      assert.equal(response.body.items[0].entityId, category.id);
    } finally {
      testApplication.close();
    }
  });

  it('deve retornar histórico vazio quando não houver movimentações auditadas', async () => {
    const testApplication = createTestApplication();
    try {
      const response = await request(testApplication.app).get('/api/history');
      assertJsonResponse(response, 200);
      assert.deepEqual(response.body, { items: [], total: 0, page: 1, pageSize: 30 });
    } finally {
      testApplication.close();
    }
  });

  it('deve rejeitar paginação inválida quando consultar o histórico', async () => {
    const testApplication = createTestApplication();
    try {
      for (const query of [{ page: 0 }, { page: 'one' }, { pageSize: 101 }]) {
        const response = await request(testApplication.app).get('/api/history').query(query);
        assertPublicError(response, 400, 'Invalid input data.');
      }
    } finally {
      testApplication.close();
    }
  });

  it('deve seguir a convenção de rota inexistente quando usar método não suportado', async () => {
    const testApplication = createTestApplication();
    try {
      const response = await request(testApplication.app).post('/api/history').send({});
      assertPublicError(response, 404, 'Route not found.');
    } finally {
      testApplication.close();
    }
  });

  it('deve retornar erro interno seguro quando o banco de histórico estiver indisponível', async () => {
    const testApplication = createTestApplication();
    testApplication.close();
    const response = await request(testApplication.app).get('/api/history');
    assertSafeInternalError(response);
  });
});
