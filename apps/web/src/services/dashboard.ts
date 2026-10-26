import { api } from '../lib/api';

export type Dashboard = {
  month: string;
  balanceCents: number;
  incomeCents: number;
  expenseCents: number;
  resultCents: number;
  byCategory: { name: string; color: string; amountCents: number }[];
  latest: {
    id: string;
    description: string;
    amountCents: number;
    type: string;
    date: string;
    category: { name: string } | null;
  }[];
  evolution: { label: string; incomeCents: number; expenseCents: number }[];
};
export const getDashboard = (month: string) => api<Dashboard>(`/dashboard?month=${month}`);
