import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ZodError } from 'zod';
import {
  categorySchema,
  historyQuerySchema,
  monthSchema,
  transactionFiltersSchema,
  transactionSchema,
  transactionUpdateSchema,
  transferSchema
} from '../../../src/presentation/controllers/schema-api.js';
import {
  categoryRequestFixture,
  transactionRequestFixture
} from '../../fixtures/unit-financial-fixtures.js';

describe('Validação unitária dos dados de categoria', () => {
  it('deve normalizar nomes e aplicar a cor padrão quando campos válidos forem enviados', () => {
    const category = categorySchema.parse({ name: '  A  ', type: 'EXPENSE' });

    assert.deepEqual(category, { name: 'A', type: 'EXPENSE', color: '#94a3b8' });
  });

  it('deve aceitar os comprimentos mínimo e máximo do nome quando estiverem dentro dos limites', () => {
    assert.equal(categorySchema.parse({ ...categoryRequestFixture, name: 'A' }).name, 'A');
    const maximumName = 'C'.repeat(60);
    assert.equal(
      categorySchema.parse({ ...categoryRequestFixture, name: maximumName }).name,
      maximumName
    );
  });

  it('deve rejeitar nome vazio, só com espaços ou acima do limite quando validar categoria', () => {
    for (const name of ['', '   ', 'C'.repeat(61)]) {
      assert.throws(() => categorySchema.parse({ ...categoryRequestFixture, name }), ZodError);
    }
  });

  it('deve aceitar caracteres especiais e cores hexadecimais quando estiverem no formato permitido', () => {
    const category = categorySchema.parse({
      ...categoryRequestFixture,
      name: 'Café & casa / 2026',
      color: '#aAbBcC'
    });

    assert.equal(category.name, 'Café & casa / 2026');
    assert.equal(category.color, '#aAbBcC');
  });

  it('deve rejeitar tipo ou cor inválidos quando validar categoria', () => {
    assert.throws(
      () => categorySchema.parse({ ...categoryRequestFixture, type: 'TRANSFER' }),
      ZodError
    );
    for (const color of ['red', '#12345', '#1234567', ' #123456']) {
      assert.throws(() => categorySchema.parse({ ...categoryRequestFixture, color }), ZodError);
    }
  });
});

describe('Validação unitária dos dados de transação', () => {
  it('deve normalizar a descrição e aceitar um centavo quando validar criação', () => {
    const transaction = transactionSchema.parse({
      ...transactionRequestFixture,
      description: '  X  ',
      amountCents: 1
    });

    assert.equal(transaction.description, 'X');
    assert.equal(transaction.amountCents, 1);
  });

  it('deve aceitar a descrição no comprimento máximo quando validar criação', () => {
    const maximumDescription = 'D'.repeat(120);
    assert.equal(
      transactionSchema.parse({ ...transactionRequestFixture, description: maximumDescription })
        .description,
      maximumDescription
    );
  });

  it('deve rejeitar descrição ausente, vazia, só com espaços ou acima do limite', () => {
    assert.throws(() => transactionSchema.parse({}), ZodError);
    for (const description of ['', '   ', 'D'.repeat(121)]) {
      assert.throws(
        () => transactionSchema.parse({ ...transactionRequestFixture, description }),
        ZodError
      );
    }
  });

  it('deve rejeitar valores monetários zero, negativos ou fracionários quando validar criação', () => {
    for (const amountCents of [0, -1, 1.5]) {
      assert.throws(
        () => transactionSchema.parse({ ...transactionRequestFixture, amountCents }),
        ZodError
      );
    }
  });

  it('deve aceitar inteiros monetários acima do limite seguro da linguagem no schema antes da validação de domínio', () => {
    const amountAboveSafeInteger = Number.MAX_SAFE_INTEGER + 1;
    assert.equal(
      transactionSchema.parse({ ...transactionRequestFixture, amountCents: amountAboveSafeInteger })
        .amountCents,
      amountAboveSafeInteger
    );
  });

  it('deve aceitar a data-limite de ano bissexto e rejeitar uma data impossível', () => {
    assert.equal(
      transactionSchema.parse({ ...transactionRequestFixture, date: '2028-02-29' }).date,
      '2028-02-29'
    );
    for (const date of ['2026-02-29', '2026-02-31', '2026-2-01', '2026-01-01T00:00:00Z']) {
      assert.throws(
        () => transactionSchema.parse({ ...transactionRequestFixture, date }),
        ZodError
      );
    }
  });

  it('deve aceitar parcelas e recorrências de um a cento e vinte períodos', () => {
    for (const periods of [1, 120]) {
      assert.equal(
        transactionSchema.parse({ ...transactionRequestFixture, installments: periods })
          .installments,
        periods
      );
      assert.equal(
        transactionSchema.parse({ ...transactionRequestFixture, recurringMonths: periods })
          .recurringMonths,
        periods
      );
    }
  });

  it('deve rejeitar parcelas ou recorrências imediatamente fora dos limites', () => {
    for (const periods of [0, 121, 1.5]) {
      assert.throws(
        () => transactionSchema.parse({ ...transactionRequestFixture, installments: periods }),
        ZodError
      );
      assert.throws(
        () => transactionSchema.parse({ ...transactionRequestFixture, recurringMonths: periods }),
        ZodError
      );
    }
  });

  it('deve rejeitar tipo e identificadores vazios quando validar criação', () => {
    assert.throws(
      () => transactionSchema.parse({ ...transactionRequestFixture, type: 'TRANSFER' }),
      ZodError
    );
    assert.throws(
      () => transactionSchema.parse({ ...transactionRequestFixture, accountId: '' }),
      ZodError
    );
    assert.throws(
      () => transactionSchema.parse({ ...transactionRequestFixture, categoryId: '' }),
      ZodError
    );
  });

  it('deve permitir atualização parcial sem alterar tipo ou opções de parcelamento', () => {
    assert.deepEqual(transactionUpdateSchema.parse({}), {});
    assert.deepEqual(
      transactionUpdateSchema.parse({
        type: 'INCOME',
        installments: 4,
        recurringMonths: 2,
        description: 'Changed'
      }),
      { description: 'Changed' }
    );
  });

  it('deve rejeitar atualização com descrição vazia ou valor não positivo', () => {
    assert.throws(() => transactionUpdateSchema.parse({ description: ' ' }), ZodError);
    assert.throws(() => transactionUpdateSchema.parse({ amountCents: 0 }), ZodError);
  });
});

describe('Validação unitária dos filtros das transações', () => {
  it('deve aplicar paginação e ordenação padrão quando a consulta não informar filtros', () => {
    assert.deepEqual(transactionFiltersSchema.parse({}), {
      page: 1,
      pageSize: 20,
      order: 'desc'
    });
  });

  it('deve aceitar limites de paginação e ordenação ascendente quando os valores forem válidos', () => {
    assert.deepEqual(transactionFiltersSchema.parse({ page: '1', pageSize: '1', order: 'asc' }), {
      page: 1,
      pageSize: 1,
      order: 'asc'
    });
    assert.equal(transactionFiltersSchema.parse({ page: '1', pageSize: '100' }).pageSize, 100);
  });

  it('deve rejeitar página zero, limite acima do máximo, valores fracionários e filtros inválidos', () => {
    for (const query of [
      { page: '0' },
      { page: '1.5' },
      { pageSize: '0' },
      { pageSize: '101' },
      { type: 'OTHER' },
      { order: 'random' },
      { month: '2026-13' },
      { from: '2026-02-30' }
    ]) {
      assert.throws(() => transactionFiltersSchema.parse(query), ZodError);
    }
  });

  it('deve aceitar os tipos de transação suportados e intervalos na mesma data', () => {
    for (const type of ['INCOME', 'EXPENSE', 'TRANSFER'] as const) {
      assert.equal(transactionFiltersSchema.parse({ type }).type, type);
    }
    assert.deepEqual(transactionFiltersSchema.parse({ from: '2026-10-31', to: '2026-10-31' }), {
      from: '2026-10-31',
      to: '2026-10-31',
      page: 1,
      pageSize: 20,
      order: 'desc'
    });
  });

  it('deve aceitar intervalo invertido porque o schema não define validação cruzada entre datas', () => {
    assert.deepEqual(transactionFiltersSchema.parse({ from: '2026-11-01', to: '2026-10-01' }), {
      from: '2026-11-01',
      to: '2026-10-01',
      page: 1,
      pageSize: 20,
      order: 'desc'
    });
  });
});

describe('Validação unitária de histórico e mês do dashboard', () => {
  it('deve aplicar paginação padrão do histórico quando a consulta estiver vazia', () => {
    assert.deepEqual(historyQuerySchema.parse({}), { page: 1, pageSize: 30 });
  });

  it('deve aceitar primeira página e limites de tamanho de página do histórico', () => {
    assert.deepEqual(historyQuerySchema.parse({ page: '1', pageSize: '1' }), {
      page: 1,
      pageSize: 1
    });
    assert.equal(historyQuerySchema.parse({ page: '2', pageSize: '100' }).pageSize, 100);
  });

  it('deve rejeitar valores de paginação imediatamente fora dos limites do histórico', () => {
    for (const query of [
      { page: '0' },
      { page: '1.5' },
      { pageSize: '0' },
      { pageSize: '101' },
      { pageSize: '-1' }
    ]) {
      assert.throws(() => historyQuerySchema.parse(query), ZodError);
    }
  });

  it('deve aceitar janeiro e dezembro e rejeitar meses fora do calendário', () => {
    assert.equal(monthSchema.parse('2026-01'), '2026-01');
    assert.equal(monthSchema.parse('2026-12'), '2026-12');
    for (const month of ['2026-00', '2026-13', '2026-1', '2026/12']) {
      assert.throws(() => monthSchema.parse(month), ZodError);
    }
  });
});

describe('Validação unitária de transferências', () => {
  it('deve aceitar o valor mínimo e nomes de conta não vazios quando validar transferência', () => {
    const transfer = transferSchema.parse({
      description: 'T',
      amountCents: 1,
      date: '2026-10-15',
      fromAccountId: 'account-a',
      toAccountId: 'account-b'
    });

    assert.equal(transfer.amountCents, 1);
    assert.equal(transfer.fromAccountId, 'account-a');
  });

  it('deve rejeitar descrição composta apenas por espaços quando validar transferência', () => {
    assert.throws(
      () =>
        transferSchema.parse({
          description: '   ',
          amountCents: 1,
          date: '2026-10-15',
          fromAccountId: 'account-a',
          toAccountId: 'account-b'
        }),
      ZodError
    );
  });

  it('deve rejeitar transferência sem campos obrigatórios ou com valor inválido', () => {
    assert.throws(() => transferSchema.parse({}), ZodError);
    assert.throws(
      () =>
        transferSchema.parse({
          description: 'T',
          amountCents: 0,
          date: '2026-10-15',
          fromAccountId: 'account-a',
          toAccountId: 'account-b'
        }),
      ZodError
    );
  });
});
