import { api } from '../lib/api';
import type { CatalogFormValues, CategoryCreationValues } from '../schemas/catalog-schema';

export type CatalogKind = 'accounts' | 'categories';
export type Account = { id: string; name: string; balanceCents?: number };
export type Category = { id: string; name: string; type: 'INCOME' | 'EXPENSE'; color: string };
export type CatalogItem = Account | Category;

export const getAccounts = () => api<Account[]>('/accounts');
export const getCategories = () => api<Category[]>('/categories');
export const getCatalogItems = (kind: CatalogKind) => api<CatalogItem[]>(`/${kind}`);
export const createCategory = (category: CategoryCreationValues) =>
  api<Category>('/categories', { method: 'POST', body: JSON.stringify(category) });
export async function createCatalogItem(kind: CatalogKind, data: CatalogFormValues): Promise<void> {
  const body =
    kind === 'accounts'
      ? { name: data.name, initialBalanceCents: Math.round(data.initialBalance * 100) }
      : { name: data.name, type: data.type, color: data.color };
  await api(`/${kind}`, { method: 'POST', body: JSON.stringify(body) });
}
export const deleteCatalogItem = (kind: CatalogKind, id: string) =>
  api<void>(`/${kind}/${id}`, { method: 'DELETE' });
