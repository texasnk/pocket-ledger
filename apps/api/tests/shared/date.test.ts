import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DomainError } from '../../src/domain/financial.js';
import {
  addMonths,
  isIsoDate,
  isIsoMonth,
  monthBounds,
  parseIsoDate
} from '../../src/shared/date.js';

describe('Validação e conversão de datas ISO', () => {
  it('deve aceitar datas de calendário válidas incluindo o limite de ano bissexto', () => {
    assert.equal(isIsoDate('2028-02-29'), true);
    assert.equal(isIsoDate('2026-01-01'), true);
    assert.equal(isIsoDate('2026-12-31'), true);
    assert.equal(parseIsoDate('2028-02-29').toISOString(), '2028-02-29T12:00:00.000Z');
  });

  it('deve rejeitar datas impossíveis, formatos inválidos e dias normalizados pelo JavaScript', () => {
    for (const date of ['2026-02-29', '2026-02-31', '2026-2-01', '2026-01-01T00:00:00Z']) {
      assert.equal(isIsoDate(date), false);
      assert.throws(() => parseIsoDate(date), DomainError);
    }
  });

  it('deve aceitar janeiro e dezembro e rejeitar meses inválidos', () => {
    assert.equal(isIsoMonth('2026-01'), true);
    assert.equal(isIsoMonth('2026-12'), true);
    for (const month of ['2026-00', '2026-13', '2026-1', '2026/12']) {
      assert.equal(isIsoMonth(month), false);
    }
  });

  it('deve calcular limites inclusivos de início e exclusivos do mês seguinte', () => {
    const january = monthBounds('2026-01');
    assert.equal(january.from.toISOString(), '2026-01-01T00:00:00.000Z');
    assert.equal(january.to.toISOString(), '2026-02-01T00:00:00.000Z');

    const december = monthBounds('2026-12');
    assert.equal(december.from.toISOString(), '2026-12-01T00:00:00.000Z');
    assert.equal(december.to.toISOString(), '2027-01-01T00:00:00.000Z');
    assert.throws(() => monthBounds('2026-13'), DomainError);
  });

  it('deve somar ou subtrair meses preservando o dia nos casos sem transbordamento de calendário', () => {
    const date = new Date('2026-12-15T12:00:00.000Z');

    assert.equal(addMonths(date, 1).toISOString(), '2027-01-15T12:00:00.000Z');
    assert.equal(addMonths(date, -1).toISOString(), '2026-11-15T12:00:00.000Z');
    assert.equal(date.toISOString(), '2026-12-15T12:00:00.000Z');
  });
});
