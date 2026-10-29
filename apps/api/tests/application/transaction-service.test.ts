import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TransactionService } from '../../src/application/transaction-service.js';
import { DomainError } from '../../src/domain/financial.js';
import { FakeTransactionRepository } from '../helpers/fake-transaction-repository.js';
import {
  createTransactionInputFixture,
  transferInputFixture
} from '../fixtures/unit-financial-fixtures.js';

describe('TransactionService — criação e recorrências', () => {
  it('deve criar uma transação simples com um centavo e defaults quando não houver parcelas', async () => {
    const repository = new FakeTransactionRepository();
    const service = new TransactionService(repository);

    const [created] = await service.create(createTransactionInputFixture({ amountCents: 1 }));

    assert.ok(created);
    assert.equal(created.amountCents, 1);
    assert.equal(created.date.toISOString(), '2026-10-15T12:00:00.000Z');
    assert.equal(created.type, 'EXPENSE');
    assert.equal(created.accountId, 'test-account-1');
    assert.equal(created.categoryId, 'test-category-1');
    assert.equal(created.installmentGroupId, null);
    assert.equal(created.installmentNumber, null);
    assert.equal(created.installmentTotal, null);
    assert.equal(created.recurrenceGroupId, null);
    assert.equal(repository.atomicCalls, 1);
  });

  it('deve aceitar o maior valor monetário seguro quando criar uma transação simples', async () => {
    const repository = new FakeTransactionRepository();
    const service = new TransactionService(repository);

    const [created] = await service.create(
      createTransactionInputFixture({ amountCents: Number.MAX_SAFE_INTEGER })
    );

    assert.equal(created?.amountCents, Number.MAX_SAFE_INTEGER);
  });

  it('deve distribuir o resto dos centavos e agrupar parcelas quando o total não for divisível', async () => {
    const repository = new FakeTransactionRepository();
    const service = new TransactionService(repository);

    const records = await service.create(
      createTransactionInputFixture({
        amountCents: 100,
        date: '2026-01-10',
        installments: 3
      })
    );

    assert.deepEqual(
      records.map((record) => record.amountCents),
      [34, 33, 33]
    );
    assert.equal(
      records.reduce((sum, record) => sum + record.amountCents, 0),
      100
    );
    assert.deepEqual(
      records.map((record) => record.date.toISOString()),
      ['2026-01-10T12:00:00.000Z', '2026-02-10T12:00:00.000Z', '2026-03-10T12:00:00.000Z']
    );
    assert.deepEqual(
      records.map((record) => record.installmentNumber),
      [1, 2, 3]
    );
    assert.ok(records[0]?.installmentGroupId);
    assert.equal(new Set(records.map((record) => record.installmentGroupId)).size, 1);
    assert.ok(records.every((record) => record.installmentTotal === 3));
    assert.ok(records.every((record) => record.recurrenceGroupId === null));
  });

  it('deve aceitar cento e vinte parcelas quando estiverem no limite máximo', async () => {
    const repository = new FakeTransactionRepository();
    const service = new TransactionService(repository);

    const records = await service.create(
      createTransactionInputFixture({ amountCents: 120, date: '2026-01-01', installments: 120 })
    );

    assert.equal(records.length, 120);
    assert.equal(records[0]?.amountCents, 1);
    assert.equal(records[119]?.amountCents, 1);
    assert.equal(records[119]?.date.toISOString(), '2035-12-01T12:00:00.000Z');
    assert.equal(records[0]?.installmentNumber, 1);
    assert.equal(records[119]?.installmentNumber, 120);
  });

  it('deve materializar recorrências até o limite e manter o mesmo agrupamento', async () => {
    const repository = new FakeTransactionRepository();
    const service = new TransactionService(repository);

    const records = await service.create(
      createTransactionInputFixture({ date: '2026-11-01', recurringMonths: 120 })
    );

    assert.equal(records.length, 120);
    assert.ok(records[0]?.recurrenceGroupId);
    assert.equal(new Set(records.map((record) => record.recurrenceGroupId)).size, 1);
    assert.ok(records.every((record) => record.installmentGroupId === null));
    assert.equal(records[0]?.date.toISOString(), '2026-11-01T12:00:00.000Z');
    assert.equal(records[1]?.date.toISOString(), '2026-12-01T12:00:00.000Z');
    assert.equal(records[2]?.date.toISOString(), '2027-01-01T12:00:00.000Z');
  });

  it('deve rejeitar valores monetários fora dos limites sem acionar persistência', async () => {
    const repository = new FakeTransactionRepository();
    const service = new TransactionService(repository);

    for (const amountCents of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, Number.NaN]) {
      await assert.rejects(
        service.create(createTransactionInputFixture({ amountCents })),
        DomainError
      );
    }

    assert.equal(repository.createCalls, 0);
    assert.equal(repository.atomicCalls, 0);
  });

  it('deve rejeitar datas inválidas antes de iniciar uma operação de persistência', async () => {
    const repository = new FakeTransactionRepository();
    const service = new TransactionService(repository);

    for (const date of ['2026-02-29', '2026-02-31', '15-10-2026', '2026-10-15T00:00:00Z']) {
      await assert.rejects(service.create(createTransactionInputFixture({ date })), DomainError);
    }

    assert.equal(repository.createCalls, 0);
    assert.equal(repository.atomicCalls, 0);
  });

  it('deve rejeitar quantidade de parcelas ou recorrências fora do intervalo inclusivo de um a cento e vinte', async () => {
    const repository = new FakeTransactionRepository();
    const service = new TransactionService(repository);

    for (const periods of [0, -1, 1.5, 121]) {
      await assert.rejects(
        service.create(createTransactionInputFixture({ installments: periods })),
        DomainError
      );
      await assert.rejects(
        service.create(createTransactionInputFixture({ recurringMonths: periods })),
        DomainError
      );
    }

    assert.equal(repository.createCalls, 0);
    assert.equal(repository.atomicCalls, 0);
  });

  it('deve rejeitar parcelamento combinado com recorrência sem persistir parcialmente', async () => {
    const repository = new FakeTransactionRepository();
    const service = new TransactionService(repository);

    await assert.rejects(
      service.create(createTransactionInputFixture({ installments: 2, recurringMonths: 2 })),
      DomainError
    );

    assert.deepEqual(repository.records, []);
    assert.equal(repository.createCalls, 0);
    assert.equal(repository.atomicCalls, 0);
  });
});

describe('TransactionService — transferências', () => {
  it('deve criar lançamentos espelhados ligados pelo mesmo grupo quando as contas forem distintas', async () => {
    const repository = new FakeTransactionRepository();
    const service = new TransactionService(repository);

    const records = await service.transfer(transferInputFixture());

    assert.equal(records.length, 2);
    assert.deepEqual(
      records.map((record) => record.accountId),
      ['test-account-from', 'test-account-to']
    );
    assert.ok(records.every((record) => record.type === 'TRANSFER'));
    assert.ok(records.every((record) => record.amountCents === 4_200));
    assert.ok(records.every((record) => record.categoryId === null));
    assert.ok(records.every((record) => record.transferFromAccountId === 'test-account-from'));
    assert.ok(records.every((record) => record.transferToAccountId === 'test-account-to'));
    assert.ok(records[0]?.recurrenceGroupId);
    assert.equal(new Set(records.map((record) => record.recurrenceGroupId)).size, 1);
  });

  it('deve rejeitar transferência para a mesma conta antes de chamar o repositório', async () => {
    const repository = new FakeTransactionRepository();
    const service = new TransactionService(repository);

    await assert.rejects(
      service.transfer(
        transferInputFixture({ fromAccountId: 'same-account', toAccountId: 'same-account' })
      ),
      DomainError
    );

    assert.equal(repository.createCalls, 0);
    assert.equal(repository.atomicCalls, 0);
  });

  it('deve rejeitar transferência com valor inválido sem chamar o repositório', async () => {
    const repository = new FakeTransactionRepository();
    const service = new TransactionService(repository);

    await assert.rejects(service.transfer(transferInputFixture({ amountCents: 0 })), DomainError);

    assert.equal(repository.createCalls, 0);
    assert.equal(repository.atomicCalls, 0);
  });
});

describe('TransactionService — falhas de dependências', () => {
  it('deve propagar falha de persistência e reverter registros parciais quando uma parcela falhar', async () => {
    const persistenceFailure = new Error('synthetic repository failure');
    const repository = new FakeTransactionRepository({
      createFailure: { callNumber: 2, error: persistenceFailure }
    });
    const service = new TransactionService(repository);

    await assert.rejects(
      service.create(createTransactionInputFixture({ installments: 3 })),
      (error: unknown) => error === persistenceFailure
    );

    assert.deepEqual(repository.records, []);
    assert.equal(repository.createCalls, 3);
    assert.equal(repository.atomicCalls, 1);
  });

  it('deve propagar falha ao iniciar a transação sem enviar comandos de gravação', async () => {
    const transactionFailure = new Error('synthetic transaction failure');
    const repository = new FakeTransactionRepository({ atomicFailure: transactionFailure });
    const service = new TransactionService(repository);

    await assert.rejects(
      service.create(createTransactionInputFixture()),
      (error: unknown) => error === transactionFailure
    );

    assert.deepEqual(repository.records, []);
    assert.equal(repository.createCalls, 0);
    assert.equal(repository.atomicCalls, 1);
  });

  it('deve reverter os dois lados da transferência quando a segunda gravação falhar', async () => {
    const persistenceFailure = new Error('synthetic transfer persistence failure');
    const repository = new FakeTransactionRepository({
      createFailure: { callNumber: 2, error: persistenceFailure }
    });
    const service = new TransactionService(repository);

    await assert.rejects(
      service.transfer(transferInputFixture()),
      (error: unknown) => error === persistenceFailure
    );

    assert.deepEqual(repository.records, []);
    assert.equal(repository.createCalls, 2);
    assert.equal(repository.atomicCalls, 1);
  });
});
