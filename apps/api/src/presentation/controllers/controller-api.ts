import { randomUUID } from 'node:crypto';
import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import { and, asc, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { z } from 'zod';
import {
  accountSchema,
  budgetSchema,
  categorySchema,
  historyQuerySchema,
  monthSchema,
  transactionFiltersSchema,
  transactionSchema,
  transactionUpdateSchema,
  transferSchema
} from './schema-api.js';
import { createDatabase, type Database } from '../../db/client.js';
import { accounts, auditLogs, budgets, categories, transactions } from '../../db/schema.js';
import {
  DomainError,
  RecordNotFoundError,
  assertPositiveCents
} from '../../domain/financial.js';
import { TransactionService } from '../../application/transaction-service.js';
import { DrizzleTransactionRepository } from '../../infrastructure/drizzle-repositories.js';
import { monthBounds } from '../../shared/date.js';
import { isForeignKeyConstraint, isUniqueConstraint } from '../../shared/sqlite-error.js';

type AuditEntity = 'ACCOUNT' | 'CATEGORY' | 'TRANSACTION' | 'BUDGET';
type AuditAction = 'CREATED' | 'UPDATED' | 'DELETED';

/** Creates the HTTP app without binding a port, keeping integration tests isolated. */
export function createApp(database: Database = createDatabase()) {
  const app = express();
  const repository = new DrizzleTransactionRepository(database);
  const transactionService = new TransactionService(repository);
  const audit = (entity: AuditEntity, action: AuditAction, entityId: string, snapshot: unknown) =>
    database.db
      .insert(auditLogs)
      .values({ id: randomUUID(), entity, action, entityId, snapshot })
      .run();
  const balance = (accountId: string, initial: number) => {
    const sumFor = (where: ReturnType<typeof and>) =>
      database.db
        .select({ total: sql<number>`coalesce(sum(${transactions.amountCents}), 0)` })
        .from(transactions)
        .where(where)
        .get()?.total ?? 0;
    return (
      initial +
      sumFor(and(eq(transactions.accountId, accountId), eq(transactions.type, 'INCOME'))) -
      sumFor(and(eq(transactions.accountId, accountId), eq(transactions.type, 'EXPENSE'))) -
      sumFor(
        and(
          eq(transactions.accountId, accountId),
          eq(transactions.transferFromAccountId, accountId)
        )
      ) +
      sumFor(
        and(eq(transactions.accountId, accountId), eq(transactions.transferToAccountId, accountId))
      )
    );
  };
  const findAccount = (id: string) =>
    database.db.select().from(accounts).where(eq(accounts.id, id)).get();
  const findCategory = (id: string) =>
    database.db.select().from(categories).where(eq(categories.id, id)).get();

  app.use(cors({ origin: 'http://localhost:5173' }));
  app.use(express.json());
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app
    .route('/api/accounts')
    .get((_req, res) =>
      res.json(
        database.db
          .select()
          .from(accounts)
          .orderBy(asc(accounts.name))
          .all()
          .map((account) => ({
            ...account,
            balanceCents: balance(account.id, account.initialBalanceCents)
          }))
      )
    )
    .post((req, res) => {
      const account = { id: randomUUID(), ...accountSchema.parse(req.body) };
      database.db.insert(accounts).values(account).run();
      audit('ACCOUNT', 'CREATED', account.id, account);
      res.status(201).json(account);
    });
  app
    .route('/api/accounts/:id')
    .patch((req, res) => {
      database.db
        .update(accounts)
        .set(accountSchema.partial().parse(req.body))
        .where(eq(accounts.id, req.params.id))
        .run();
      const account = findAccount(req.params.id);
      if (!account) throw new RecordNotFoundError();
      res.json(account);
    })
    .delete((req, res) => {
      const account = findAccount(req.params.id);
      if (!account) throw new RecordNotFoundError();
      database.db.delete(accounts).where(eq(accounts.id, account.id)).run();
      audit('ACCOUNT', 'DELETED', account.id, account);
      res.status(204).end();
    });
  app
    .route('/api/categories')
    .get((_req, res) =>
      res.json(
        database.db
          .select()
          .from(categories)
          .orderBy(asc(categories.type), asc(categories.name))
          .all()
      )
    )
    .post((req, res) => {
      const category = { id: randomUUID(), ...categorySchema.parse(req.body) };
      database.db.insert(categories).values(category).run();
      audit('CATEGORY', 'CREATED', category.id, category);
      res.status(201).json(category);
    });
  app
    .route('/api/categories/:id')
    .patch((req, res) => {
      database.db
        .update(categories)
        .set(categorySchema.partial().parse(req.body))
        .where(eq(categories.id, req.params.id))
        .run();
      const category = findCategory(req.params.id);
      if (!category) throw new RecordNotFoundError();
      res.json(category);
    })
    .delete((req, res) => {
      const category = findCategory(req.params.id);
      if (!category) throw new RecordNotFoundError();
      database.db.delete(categories).where(eq(categories.id, category.id)).run();
      audit('CATEGORY', 'DELETED', category.id, category);
      res.status(204).end();
    });
  app.get('/api/transactions', async (req, res) => {
    const query = transactionFiltersSchema.parse(req.query);
    res.json(await repository.list(query));
  });
  app.post('/api/transactions', async (req, res) => {
    const created = await transactionService.create(transactionSchema.parse(req.body));
    created.forEach((item) => audit('TRANSACTION', 'CREATED', item.id, item));
    res.status(201).json(created);
  });
  app.patch('/api/transactions/:id', async (req, res) => {
    const data = transactionUpdateSchema.parse(req.body);
    const { date, ...changes } = data;
    if (changes.amountCents) assertPositiveCents(changes.amountCents);
    res.json(
      await repository.update(req.params.id, {
        ...changes,
        ...(date ? { date: new Date(`${date}T12:00:00.000Z`) } : {})
      })
    );
  });
  app.delete('/api/transactions/:id', async (req, res) => {
    const transaction = await repository.findById(req.params.id);
    if (!transaction) throw new RecordNotFoundError();
    await repository.delete(transaction.id);
    audit('TRANSACTION', 'DELETED', transaction.id, transaction);
    res.status(204).end();
  });
  app.post('/api/transfers', async (req, res) => {
    const data = transferSchema.parse(req.body);
    const created = await transactionService.transfer(data);
    created.forEach((item) => audit('TRANSACTION', 'CREATED', item.id, item));
    res.status(201).json(created);
  });
  app.get('/api/history', (req, res) => {
    const { page, pageSize } = historyQuerySchema.parse(req.query);
    const items = database.db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .all();
    const total =
      database.db
        .select({ count: sql<number>`count(*)` })
        .from(auditLogs)
        .get()?.count ?? 0;
    res.json({ items, total, page, pageSize });
  });
  app.get('/api/budgets', (req, res) => {
    const month = monthSchema.parse(req.query.month);
    const { from, to } = monthBounds(month);
    const rows = database.db
      .select({ budget: budgets, category: categories })
      .from(budgets)
      .innerJoin(categories, eq(budgets.categoryId, categories.id))
      .where(eq(budgets.month, month))
      .all();
    const usage = database.db
      .select({
        categoryId: transactions.categoryId,
        total: sql<number>`coalesce(sum(${transactions.amountCents}), 0)`
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.type, 'EXPENSE'),
          gte(transactions.date, from.toISOString()),
          lt(transactions.date, to.toISOString())
        )
      )
      .groupBy(transactions.categoryId)
      .all();
    res.json(
      rows.map(({ budget, category }) => {
        const spentCents = usage.find((item) => item.categoryId === budget.categoryId)?.total ?? 0;
        return {
          ...budget,
          category,
          spentCents,
          percentage: Math.round((spentCents / budget.limitCents) * 100)
        };
      })
    );
  });
  app.put('/api/budgets/:categoryId', (req, res) => {
    const data = budgetSchema.parse(req.body);
    database.db
      .insert(budgets)
      .values({ id: randomUUID(), categoryId: req.params.categoryId, ...data })
      .onConflictDoUpdate({
        target: [budgets.categoryId, budgets.month],
        set: { limitCents: data.limitCents }
      })
      .run();
    const budget = database.db
      .select()
      .from(budgets)
      .where(and(eq(budgets.categoryId, req.params.categoryId), eq(budgets.month, data.month)))
      .get();
    if (!budget) throw new Error('Budget was not saved.');
    audit('BUDGET', 'CREATED', budget.id, budget);
    res.json(budget);
  });
  app.get('/api/dashboard', (req, res) => {
    const month = monthSchema.parse(req.query.month);
    const { from, to } = monthBounds(month);
    const rows = database.db
      .select({ transaction: transactions, category: categories })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(gte(transactions.date, from.toISOString()), lt(transactions.date, to.toISOString()))
      )
      .orderBy(desc(transactions.date))
      .all();
    const incomeCents = rows
      .filter((row) => row.transaction.type === 'INCOME')
      .reduce((sum, row) => sum + row.transaction.amountCents, 0);
    const expenseCents = rows
      .filter((row) => row.transaction.type === 'EXPENSE')
      .reduce((sum, row) => sum + row.transaction.amountCents, 0);
    const totals = new Map<string, { name: string; color: string; amountCents: number }>();
    rows
      .filter((row) => row.transaction.type === 'EXPENSE' && row.category)
      .forEach(({ transaction, category }) => {
        const current = totals.get(transaction.categoryId!);
        totals.set(transaction.categoryId!, {
          name: category!.name,
          color: category!.color,
          amountCents: (current?.amountCents ?? 0) + transaction.amountCents
        });
      });
    const balanceCents = database.db
      .select()
      .from(accounts)
      .all()
      .reduce((sum, account) => sum + balance(account.id, account.initialBalanceCents), 0);
    res.json({
      month,
      balanceCents,
      incomeCents,
      expenseCents,
      resultCents: incomeCents - expenseCents,
      byCategory: [...totals.values()],
      latest: rows.slice(0, 6).map((row) => ({ ...row.transaction, category: row.category })),
      evolution: [
        { label: month, incomeCents, expenseCents, resultCents: incomeCents - expenseCents }
      ]
    });
  });
  app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));
  const errors: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof z.ZodError || (error instanceof SyntaxError && 'body' in error))
      return res.status(400).json({ message: 'Invalid input data.' });
    if (error instanceof RecordNotFoundError)
      return res.status(404).json({ message: error.message });
    if (error instanceof DomainError) return res.status(400).json({ message: error.message });
    if (isForeignKeyConstraint(error))
      return res.status(409).json({ message: 'The record has invalid relationships.' });
    if (isUniqueConstraint(error))
      return res.status(409).json({ message: 'A record with these values already exists.' });
    return res.status(500).json({ message: 'Internal server error.' });
  };
  app.use(errors);
  return app;
}
