import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import {
  accountFixture,
  expenseCategoryFixture,
  incomeCategoryFixture,
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

describe('Rotas funcionais de transações', () => {
  it('deve criar e consultar uma transação associada à categoria quando os dados forem válidos', async () => {
    const testApplication = createTestApplication();
    try {
      const account = await createAccount(testApplication.app, accountFixture);
      const category = await createCategory(testApplication.app, expenseCategoryFixture);
      const transaction = transactionFixture(account.id, category.id);
      const created = await request(testApplication.app)
        .post('/api/transactions')
        .send(transaction);
      assertJsonResponse(created, 201);
      assert.equal(created.body.length, 1);
      assert.equal(created.body[0].description, transaction.description);
      assert.equal(created.body[0].amountCents, transaction.amountCents);
      assert.equal(created.body[0].category.id, category.id);

      const listed = await request(testApplication.app)
        .get('/api/transactions')
        .query({ month: '2026-10', categoryId: category.id, type: 'EXPENSE' });
      assertJsonResponse(listed, 200);
      assert.equal(listed.body.total, 1);
      assert.equal(listed.body.items[0].id, created.body[0].id);
    } finally {
      testApplication.close();
    }
  });

  it('deve rejeitar corpo ausente e campos inválidos quando criar uma transação', async () => {
    const testApplication = createTestApplication();
    try {
      const missingBody = await request(testApplication.app).post('/api/transactions');
      assertPublicError(missingBody, 400, 'Invalid input data.');

      for (const transaction of [
        {},
        {
          description: '',
          amountCents: 100,
          date: '2026-10-15',
          type: 'EXPENSE',
          accountId: 'a',
          categoryId: 'c'
        },
        {
          description: 'Test',
          amountCents: 10.5,
          date: '2026-10-15',
          type: 'EXPENSE',
          accountId: 'a',
          categoryId: 'c'
        },
        {
          description: 'Test',
          amountCents: 100,
          date: '2026-02-31',
          type: 'EXPENSE',
          accountId: 'a',
          categoryId: 'c'
        },
        {
          description: 'Test',
          amountCents: 100,
          date: '2026-10-15',
          type: 'TRANSFER',
          accountId: 'a',
          categoryId: 'c'
        }
      ]) {
        const response = await request(testApplication.app)
          .post('/api/transactions')
          .send(transaction);
        assertPublicError(response, 400, 'Invalid input data.');
      }
    } finally {
      testApplication.close();
    }
  });

  it('deve retornar conflito seguro quando criar uma transação com relações inexistentes', async () => {
    const testApplication = createTestApplication();
    try {
      const response = await request(testApplication.app)
        .post('/api/transactions')
        .send(transactionFixture('missing-account', 'missing-category'));
      assertPublicError(response, 409, 'The record has invalid relationships.');
    } finally {
      testApplication.close();
    }
  });

  it('deve paginar e ordenar transações quando filtros válidos forem informados', async () => {
    const testApplication = createTestApplication();
    try {
      const account = await createAccount(testApplication.app, accountFixture);
      const expenseCategory = await createCategory(testApplication.app, expenseCategoryFixture);
      const incomeCategory = await createCategory(testApplication.app, incomeCategoryFixture);
      const oldest = await createTransaction(
        testApplication.app,
        transactionFixture(account.id, expenseCategory.id, {
          date: '2026-10-02',
          description: 'Test old expense'
        })
      );
      await createTransaction(
        testApplication.app,
        transactionFixture(account.id, incomeCategory.id, {
          date: '2026-10-20',
          description: 'Test income',
          type: 'INCOME',
          amountCents: 8_000
        })
      );

      const response = await request(testApplication.app).get('/api/transactions').query({
        month: '2026-10',
        page: 1,
        pageSize: 1,
        order: 'asc',
        categoryId: expenseCategory.id
      });
      assertJsonResponse(response, 200);
      assert.equal(response.body.total, 1);
      assert.equal(response.body.items.length, 1);
      assert.equal(response.body.items[0].id, oldest.id);
    } finally {
      testApplication.close();
    }
  });

  it('deve rejeitar parâmetros inválidos quando consultar transações', async () => {
    const testApplication = createTestApplication();
    try {
      for (const query of [
        { page: 0 },
        { pageSize: 101 },
        { month: '2026-13' },
        { order: 'sideways' },
        { from: 'not-a-date' }
      ]) {
        const response = await request(testApplication.app).get('/api/transactions').query(query);
        assertPublicError(response, 400, 'Invalid input data.');
      }
    } finally {
      testApplication.close();
    }
  });

  it('deve atualizar uma transação existente quando a alteração for válida', async () => {
    const testApplication = createTestApplication();
    try {
      const account = await createAccount(testApplication.app, accountFixture);
      const category = await createCategory(testApplication.app, expenseCategoryFixture);
      const transaction = await createTransaction(
        testApplication.app,
        transactionFixture(account.id, category.id)
      );
      const response = await request(testApplication.app)
        .patch(`/api/transactions/${transaction.id}`)
        .send({
          description: 'Test updated grocery purchase',
          amountCents: 3_500,
          date: '2026-10-16'
        });
      assertJsonResponse(response, 200);
      assert.equal(response.body.description, 'Test updated grocery purchase');
      assert.equal(response.body.amountCents, 3_500);
      assert.equal(response.body.date, '2026-10-16T12:00:00.000Z');
    } finally {
      testApplication.close();
    }
  });

  it('deve retornar resposta adequada quando atualizar uma transação inválida ou inexistente', async () => {
    const testApplication = createTestApplication();
    try {
      const invalid = await request(testApplication.app)
        .patch('/api/transactions/transaction-that-does-not-exist')
        .send({ amountCents: 0 });
      assertPublicError(invalid, 400, 'Invalid input data.');

      const missing = await request(testApplication.app)
        .patch('/api/transactions/transaction-that-does-not-exist')
        .send({ description: 'Test missing transaction' });
      assertPublicError(missing, 404, 'Record not found.');
    } finally {
      testApplication.close();
    }
  });

  it('deve remover uma transação existente e retornar ausente na exclusão seguinte', async () => {
    const testApplication = createTestApplication();
    try {
      const account = await createAccount(testApplication.app, accountFixture);
      const category = await createCategory(testApplication.app, expenseCategoryFixture);
      const transaction = await createTransaction(
        testApplication.app,
        transactionFixture(account.id, category.id)
      );
      const deleted = await request(testApplication.app).delete(
        `/api/transactions/${transaction.id}`
      );
      assert.equal(deleted.status, 204);
      assert.equal(deleted.text, '');

      const missing = await request(testApplication.app).delete(
        `/api/transactions/${transaction.id}`
      );
      assertPublicError(missing, 404, 'Record not found.');
    } finally {
      testApplication.close();
    }
  });

  it('deve seguir a convenção de rota inexistente quando usar método não suportado', async () => {
    const testApplication = createTestApplication();
    try {
      const response = await request(testApplication.app).put('/api/transactions').send({});
      assertPublicError(response, 404, 'Route not found.');
    } finally {
      testApplication.close();
    }
  });

  it('deve retornar erro interno seguro quando o banco de transações estiver indisponível', async () => {
    const testApplication = createTestApplication();
    testApplication.close();
    const response = await request(testApplication.app).get('/api/transactions');
    assertSafeInternalError(response);
  });
});
