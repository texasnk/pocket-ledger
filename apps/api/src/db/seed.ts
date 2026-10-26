import { randomUUID } from 'node:crypto';
import { createDatabase } from './client.js';
import { accounts, categories, transactions } from './schema.js';

const database = createDatabase();
const account = database.db
  .insert(accounts)
  .values({ id: randomUUID(), name: 'Main account', initialBalanceCents: 250000 })
  .onConflictDoNothing()
  .returning()
  .get();
const mainAccount = account ?? database.db.select().from(accounts).get();
if (!mainAccount) throw new Error('Could not create the default account.');
const seedCategory = (name: string, type: 'INCOME' | 'EXPENSE', color: string) =>
  database.db
    .insert(categories)
    .values({ id: randomUUID(), name, type, color })
    .onConflictDoNothing()
    .returning()
    .get() ??
  database.db
    .select()
    .from(categories)
    .all()
    .find((category) => category.name === name && category.type === type);
const food = seedCategory('Food', 'EXPENSE', '#e9a8a8');
const salary = seedCategory('Salary', 'INCOME', '#9bc9b5');
if (!food || !salary) throw new Error('Could not create default categories.');
if (!database.db.select().from(transactions).all().length) {
  const now = new Date().toISOString();
  database.db
    .insert(transactions)
    .values([
      {
        id: randomUUID(),
        description: 'Salary',
        amountCents: 550000,
        date: now,
        type: 'INCOME',
        accountId: mainAccount.id,
        categoryId: salary.id,
        updatedAt: now
      },
      {
        id: randomUUID(),
        description: 'Groceries',
        amountCents: 42890,
        date: now,
        type: 'EXPENSE',
        accountId: mainAccount.id,
        categoryId: food.id,
        updatedAt: now
      }
    ])
    .run();
}
database.client.close();
