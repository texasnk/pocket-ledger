import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../services/dashboard';
export const useDashboard = (month: string) =>
  useQuery({ queryKey: ['dashboard', month], queryFn: () => getDashboard(month) });
