import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const timestamp = (name: string) =>
  text(name)
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`);

export const accounts = sqliteTable('Account', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  initialBalanceCents: integer('initialBalanceCents').notNull().default(0),
  createdAt: timestamp('createdAt')
});

export const categories = sqliteTable(
  'Category',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type', { enum: ['INCOME', 'EXPENSE'] }).notNull(),
    color: text('color').notNull().default('#94a3b8'),
    createdAt: timestamp('createdAt')
  },
  (table) => [uniqueIndex('Category_name_type_key').on(table.name, table.type)]
);

export const transactions = sqliteTable(
  'Transaction',
  {
    id: text('id').primaryKey(),
    description: text('description').notNull(),
    amountCents: integer('amountCents').notNull(),
    date: text('date').notNull(),
    type: text('type', { enum: ['INCOME', 'EXPENSE', 'TRANSFER'] }).notNull(),
    accountId: text('accountId')
      .notNull()
      .references(() => accounts.id),
    categoryId: text('categoryId').references(() => categories.id),
    transferFromAccountId: text('transferFromAccountId').references(() => accounts.id),
    transferToAccountId: text('transferToAccountId').references(() => accounts.id),
    installmentGroupId: text('installmentGroupId'),
    installmentNumber: integer('installmentNumber'),
    installmentTotal: integer('installmentTotal'),
    recurrenceGroupId: text('recurrenceGroupId'),
    createdAt: timestamp('createdAt'),
    updatedAt: text('updatedAt').notNull()
  },
  (table) => [
    index('Transaction_date_idx').on(table.date),
    index('Transaction_accountId_date_idx').on(table.accountId, table.date),
    index('Transaction_categoryId_date_idx').on(table.categoryId, table.date)
  ]
);

export const budgets = sqliteTable(
  'Budget',
  {
    id: text('id').primaryKey(),
    categoryId: text('categoryId')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    month: text('month').notNull(),
    limitCents: integer('limitCents').notNull()
  },
  (table) => [uniqueIndex('Budget_categoryId_month_key').on(table.categoryId, table.month)]
);

export const auditLogs = sqliteTable(
  'AuditLog',
  {
    id: text('id').primaryKey(),
    entity: text('entity', { enum: ['ACCOUNT', 'CATEGORY', 'TRANSACTION', 'BUDGET'] }).notNull(),
    action: text('action', { enum: ['CREATED', 'UPDATED', 'DELETED'] }).notNull(),
    entityId: text('entityId').notNull(),
    snapshot: text('snapshot', { mode: 'json' }).notNull(),
    createdAt: timestamp('createdAt')
  },
  (table) => [
    index('AuditLog_createdAt_idx').on(table.createdAt),
    index('AuditLog_entity_entityId_idx').on(table.entity, table.entityId)
  ]
);
