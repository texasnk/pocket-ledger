import { api } from '../lib/api';
export type AuditLog = {
  id: string;
  entity: 'ACCOUNT' | 'CATEGORY' | 'TRANSACTION' | 'BUDGET';
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  entityId: string;
  snapshot: Record<string, unknown>;
  createdAt: string;
};
export type HistoryResponse = { items: AuditLog[]; total: number; page: number; pageSize: number };
export const getHistory = () => api<HistoryResponse>('/history');
