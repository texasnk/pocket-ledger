import { migrate } from 'drizzle-orm/node-sqlite/migrator';
import { createDatabase } from './client.js';

const database = createDatabase();
migrate(database.db, { migrationsFolder: 'drizzle' });
database.client.close();
