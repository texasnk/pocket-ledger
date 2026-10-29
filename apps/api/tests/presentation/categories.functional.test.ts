import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import {
  accountFixture,
  expenseCategoryFixture,
  transactionFixture
} from '../fixtures/financial-fixtures.js';
import {
  createAccount,
  createCategory,
  createTestApplication,
  createTransaction
} from '../helpers/api-test-application.js';
import {
  assertJsonResponse,
  assertPublicError,
  assertSafeInternalError
} from '../helpers/http-assertions.js';

describe('Rotas funcionais de categorias', () => {
  it('deve criar e listar uma categoria quando a requisição for válida', async () => {
    const testApplication = createTestApplication();
    try {
      const created = await request(testApplication.app)
        .post('/api/categories')
        .send(expenseCategoryFixture);
      assertJsonResponse(created, 201);
      assert.equal(created.body.name, expenseCategoryFixture.name);
      assert.equal(created.body.type, expenseCategoryFixture.type);
      assert.equal(created.body.color, expenseCategoryFixture.color);
      assert.equal(typeof created.body.id, 'string');

      const listed = await request(testApplication.app).get('/api/categories');
      assertJsonResponse(listed, 200);
      assert.equal(listed.body.length, 1);
      assert.equal(listed.body[0].id, created.body.id);
    } finally {
      testApplication.close();
    }
  });

  it('deve rejeitar dados de categoria ausentes ou inválidos quando criar uma categoria', async () => {
    const testApplication = createTestApplication();
    try {
      const missingBody = await request(testApplication.app).post('/api/categories');
      assertPublicError(missingBody, 400, 'Invalid input data.');

      for (const category of [
        {},
        { name: '', type: 'EXPENSE' },
        { name: 'Test', type: 'OTHER' },
        { name: 'Test', type: 'EXPENSE', color: 'red' }
      ]) {
        const response = await request(testApplication.app).post('/api/categories').send(category);
        assertPublicError(response, 400, 'Invalid input data.');
      }
    } finally {
      testApplication.close();
    }
  });

  it('deve retornar conflito quando criar uma categoria com nome e tipo já existentes', async () => {
    const testApplication = createTestApplication();
    try {
      await createCategory(testApplication.app, expenseCategoryFixture);
      const response = await request(testApplication.app)
        .post('/api/categories')
        .send(expenseCategoryFixture);
      assertPublicError(response, 409, 'A record with these values already exists.');
    } finally {
      testApplication.close();
    }
  });

  it('deve atualizar uma categoria existente quando a alteração for válida', async () => {
    const testApplication = createTestApplication();
    try {
      const category = await createCategory(testApplication.app, expenseCategoryFixture);
      const response = await request(testApplication.app)
        .patch(`/api/categories/${category.id}`)
        .send({ name: 'Test household groceries', color: '#2563eb' });
      assertJsonResponse(response, 200);
      assert.equal(response.body.name, 'Test household groceries');
      assert.equal(response.body.color, '#2563eb');
    } finally {
      testApplication.close();
    }
  });

  it('deve rejeitar alteração inválida quando atualizar uma categoria existente', async () => {
    const testApplication = createTestApplication();
    try {
      const category = await createCategory(testApplication.app, expenseCategoryFixture);
      const response = await request(testApplication.app)
        .patch(`/api/categories/${category.id}`)
        .send({ color: 'invalid-color' });
      assertPublicError(response, 400, 'Invalid input data.');
    } finally {
      testApplication.close();
    }
  });

  it('deve retornar erro seguro quando atualizar ou excluir uma categoria inexistente', async () => {
    const testApplication = createTestApplication();
    try {
      const updated = await request(testApplication.app)
        .patch('/api/categories/category-that-does-not-exist')
        .send({ name: 'Test missing category' });
      assertPublicError(updated, 404, 'Record not found.');

      const deleted = await request(testApplication.app).delete(
        '/api/categories/category-that-does-not-exist'
      );
      assertPublicError(deleted, 404, 'Record not found.');
    } finally {
      testApplication.close();
    }
  });

  it('deve remover uma categoria sem transações relacionadas quando excluir uma categoria existente', async () => {
    const testApplication = createTestApplication();
    try {
      const category = await createCategory(testApplication.app, expenseCategoryFixture);
      const deleted = await request(testApplication.app).delete(`/api/categories/${category.id}`);
      assert.equal(deleted.status, 204);
      assert.equal(deleted.text, '');

      const listed = await request(testApplication.app).get('/api/categories');
      assertJsonResponse(listed, 200);
      assert.equal(listed.body.length, 0);
    } finally {
      testApplication.close();
    }
  });

  it('deve preservar a relação com transações quando tentar remover uma categoria utilizada', async () => {
    const testApplication = createTestApplication();
    try {
      const account = await createAccount(testApplication.app, accountFixture);
      const category = await createCategory(testApplication.app, expenseCategoryFixture);
      await createTransaction(testApplication.app, transactionFixture(account.id, category.id));

      const response = await request(testApplication.app).delete(`/api/categories/${category.id}`);
      assertPublicError(response, 409, 'The record has invalid relationships.');
    } finally {
      testApplication.close();
    }
  });

  it('deve seguir a convenção de rota inexistente quando usar método não suportado', async () => {
    const testApplication = createTestApplication();
    try {
      const response = await request(testApplication.app)
        .put('/api/categories')
        .send(expenseCategoryFixture);
      assertPublicError(response, 404, 'Route not found.');
    } finally {
      testApplication.close();
    }
  });

  it('deve retornar erro interno seguro quando o banco de categorias estiver indisponível', async () => {
    const testApplication = createTestApplication();
    testApplication.close();
    const response = await request(testApplication.app).get('/api/categories');
    assertSafeInternalError(response);
  });
});
