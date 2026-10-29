import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import {
  accountFixture,
  expenseCategoryFixture,
  incomeCategoryFixture,
  testMonth,
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

describe('Rotas funcionais de dashboard', () => {
  it('deve apresentar indicadores zerados quando não houver movimentações no mês', async () => {
    const testApplication = createTestApplication();
    try {
      const response = await request(testApplication.app)
        .get('/api/dashboard')
        .query({ month: testMonth });
      assertJsonResponse(response, 200);
      assert.equal(response.body.month, testMonth);
      assert.equal(response.body.balanceCents, 0);
      assert.equal(response.body.incomeCents, 0);
      assert.equal(response.body.expenseCents, 0);
      assert.equal(response.body.resultCents, 0);
      assert.deepEqual(response.body.byCategory, []);
      assert.deepEqual(response.body.latest, []);
      assert.deepEqual(response.body.evolution, [
        { label: testMonth, incomeCents: 0, expenseCents: 0, resultCents: 0 }
      ]);
    } finally {
      testApplication.close();
    }
  });

  it('deve calcular saldo, receitas, despesas e categoria quando houver movimentações no mês', async () => {
    const testApplication = createTestApplication();
    try {
      const account = await createAccount(testApplication.app, accountFixture);
      const expenseCategory = await createCategory(testApplication.app, expenseCategoryFixture);
      const incomeCategory = await createCategory(testApplication.app, incomeCategoryFixture);
      await createTransaction(
        testApplication.app,
        transactionFixture(account.id, incomeCategory.id, {
          description: 'Test monthly income',
          amountCents: 10_000,
          date: '2026-10-05',
          type: 'INCOME'
        })
      );
      await createTransaction(
        testApplication.app,
        transactionFixture(account.id, expenseCategory.id, {
          description: 'Test monthly expense',
          amountCents: 3_000,
          date: '2026-10-15'
        })
      );

      const response = await request(testApplication.app)
        .get('/api/dashboard')
        .query({ month: testMonth });
      assertJsonResponse(response, 200);
      assert.equal(response.body.balanceCents, 12_000);
      assert.equal(response.body.incomeCents, 10_000);
      assert.equal(response.body.expenseCents, 3_000);
      assert.equal(response.body.resultCents, 7_000);
      assert.deepEqual(response.body.byCategory, [
        {
          name: expenseCategoryFixture.name,
          color: expenseCategoryFixture.color,
          amountCents: 3_000
        }
      ]);
      assert.equal(response.body.latest.length, 2);
      assert.deepEqual(response.body.evolution, [
        { label: testMonth, incomeCents: 10_000, expenseCents: 3_000, resultCents: 7_000 }
      ]);
    } finally {
      testApplication.close();
    }
  });

  it('deve rejeitar mês ausente ou inválido quando consultar o dashboard', async () => {
    const testApplication = createTestApplication();
    try {
      const missingMonth = await request(testApplication.app).get('/api/dashboard');
      assertPublicError(missingMonth, 400, 'Invalid input data.');

      const invalidMonth = await request(testApplication.app)
        .get('/api/dashboard')
        .query({ month: '2026-13' });
      assertPublicError(invalidMonth, 400, 'Invalid input data.');
    } finally {
      testApplication.close();
    }
  });

  it('deve seguir a convenção de rota inexistente quando usar método não suportado', async () => {
    const testApplication = createTestApplication();
    try {
      const response = await request(testApplication.app)
        .post('/api/dashboard')
        .send({ month: testMonth });
      assertPublicError(response, 404, 'Route not found.');
    } finally {
      testApplication.close();
    }
  });

  it('deve retornar erro interno seguro quando o banco do dashboard estiver indisponível', async () => {
    const testApplication = createTestApplication();
    testApplication.close();
    const response = await request(testApplication.app)
      .get('/api/dashboard')
      .query({ month: testMonth });
    assertSafeInternalError(response);
  });
});
