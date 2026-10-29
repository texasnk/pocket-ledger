import { DatabaseSync } from 'node:sqlite';
import type { Express } from 'express';
import { drizzle } from 'drizzle-orm/node-sqlite';
import { migrate } from 'drizzle-orm/node-sqlite/migrator';
import request from 'supertest';
import { createApp } from '../../src/presentation/app.js';
import * as schema from '../../src/db/schema.js';
import type {
  AccountRequest,
  CategoryRequest,
  TransactionRequest
} from '../fixtures/financial-fixtures.js';

type CreatedRecord = { id: string };

export type TestApplication = {
  app: Express;
  close: () => void;
};

export function createTestApplication(): TestApplication {
  const client = new DatabaseSync(':memory:');
  client.exec('PRAGMA foreign_keys = ON');
  const database = { client, db: drizzle({ client, schema }) };
  migrate(database.db, { migrationsFolder: 'drizzle' });

  return {
    app: createApp(database),
    close: () => client.close()
  };
}

export async function createAccount(app: Express, account: AccountRequest): Promise<CreatedRecord> {
  const response = await request(app).post('/api/accounts').send(account);
  if (response.status !== 201 || typeof response.body.id !== 'string') {
    throw new Error('The test account could not be created through the public API.');
  }
  return { id: response.body.id };
}

export async function createCategory(
  app: Express,
  category: CategoryRequest
): Promise<CreatedRecord> {
  const response = await request(app).post('/api/categories').send(category);
  if (response.status !== 201 || typeof response.body.id !== 'string') {
    throw new Error('The test category could not be created through the public API.');
  }
  return { id: response.body.id };
}

export async function createTransaction(
  app: Express,
  transaction: TransactionRequest
): Promise<CreatedRecord> {
  const response = await request(app).post('/api/transactions').send(transaction);
  const createdTransaction = response.body[0] as unknown;
  if (
    response.status !== 201 ||
    typeof createdTransaction !== 'object' ||
    createdTransaction === null ||
    !('id' in createdTransaction) ||
    typeof createdTransaction.id !== 'string'
  ) {
    throw new Error('The test transaction could not be created through the public API.');
  }
  return { id: createdTransaction.id };
}
