import { z } from 'zod';
import { isIsoDate, isIsoMonth } from '../../shared/date.js';

export const dateSchema = z.string().refine(isIsoDate, 'Invalid date.');
export const monthSchema = z.string().refine(isIsoMonth, 'Invalid month.');
export const accountSchema = z.object({
  name: z.string().trim().min(1).max(60),
  initialBalanceCents: z.number().int().optional().default(0)
});
export const categorySchema = z.object({
  name: z.string().trim().min(1).max(60),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional()
    .default('#94a3b8')
});
export const transactionSchema = z.object({
  description: z.string().trim().min(1).max(120),
  amountCents: z.number().int().positive(),
  date: dateSchema,
  type: z.enum(['INCOME', 'EXPENSE']),
  accountId: z.string().min(1),
  categoryId: z.string().min(1),
  installments: z.number().int().min(1).max(120).optional(),
  recurringMonths: z.number().int().min(1).max(120).optional()
});
export const transactionUpdateSchema = transactionSchema
  .partial()
  .omit({ type: true, installments: true, recurringMonths: true });
export const transactionFiltersSchema = z.object({
  month: monthSchema.optional(),
  categoryId: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  order: z.enum(['asc', 'desc']).default('desc')
});
export const transferSchema = z.object({
  description: z.string().trim().min(1),
  amountCents: z.number().int().positive(),
  date: dateSchema,
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1)
});
export const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30)
});
export const budgetSchema = z.object({
  month: monthSchema,
  limitCents: z.number().int().positive()
});
