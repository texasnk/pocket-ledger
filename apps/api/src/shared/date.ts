import { DomainError } from '../domain/financial.js';

const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const monthPattern = /^(\d{4})-(\d{2})$/;

export function isIsoDate(value: string): boolean {
  const match = datePattern.exec(value);
  if (!match) return false;
  const date = new Date(`${value}T12:00:00.000Z`);
  return (
    !Number.isNaN(date.valueOf()) &&
    date.getUTCFullYear() === Number(match[1]) &&
    date.getUTCMonth() === Number(match[2]) - 1 &&
    date.getUTCDate() === Number(match[3])
  );
}

export function isIsoMonth(value: string): boolean {
  const match = monthPattern.exec(value);
  return match !== null && Number(match[2]) >= 1 && Number(match[2]) <= 12;
}

export function parseIsoDate(value: string): Date {
  if (!isIsoDate(value)) throw new DomainError('Invalid date.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new DomainError('Data inválida.');
  const date = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(date.valueOf())) throw new DomainError('Data inválida.');
  return date;
}

export function addMonths(date: Date, months: number): Date {
  const copy = new Date(date);
  copy.setUTCMonth(copy.getUTCMonth() + months);
  return copy;
}

export function monthBounds(month: string): { from: Date; to: Date } {
  if (!isIsoMonth(month)) throw new DomainError('Invalid month.');
  if (!/^\d{4}-\d{2}$/.test(month)) throw new DomainError('Mês inválido.');
  const from = new Date(`${month}-01T00:00:00.000Z`);
  const to = new Date(from);
  to.setUTCMonth(to.getUTCMonth() + 1);
  return { from, to };
}
