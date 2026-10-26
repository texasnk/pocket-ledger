import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTransaction, deleteTransaction, getTransactions } from '../services/transactions';

export function useTransactions(month: string) {
  return useQuery({ queryKey: ['transactions', month], queryFn: () => getTransactions(month) });
}

export function useCreateTransaction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ['transactions'] }),
        client.invalidateQueries({ queryKey: ['dashboard'] }),
        client.invalidateQueries({ queryKey: ['history'] })
      ])
  });
}

export function useDeleteTransaction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ['transactions'] }),
        client.invalidateQueries({ queryKey: ['dashboard'] }),
        client.invalidateQueries({ queryKey: ['history'] })
      ])
  });
}
