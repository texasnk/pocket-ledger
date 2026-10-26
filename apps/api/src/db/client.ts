import 'dotenv/config';
import { DatabaseSync } from 'node:sqlite';
import { drizzle } from 'drizzle-orm/node-sqlite';
import * as schema from './schema.js';

export type Database = ReturnType<typeof createDatabase>;

function databasePath(databaseUrl: string): string {
  if (!databaseUrl.startsWith('file:')) return databaseUrl;
  return databaseUrl.slice('file:'.length);
}

export function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required.');
  const client = new DatabaseSync(databasePath(databaseUrl));
  client.exec('PRAGMA foreign_keys = ON');
  return { client, db: drizzle({ client, schema }) };
}
