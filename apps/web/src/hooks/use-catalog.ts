import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCatalogItem,
  createCategory,
  deleteCatalogItem,
  getAccounts,
  getCatalogItems,
  getCategories,
  type CatalogKind
} from '../services/catalog';

export const useAccounts = () => useQuery({ queryKey: ['accounts'], queryFn: getAccounts });
export const useCategories = () => useQuery({ queryKey: ['categories'], queryFn: getCategories });
export const useCatalogItems = (kind: CatalogKind) =>
  useQuery({ queryKey: [kind], queryFn: () => getCatalogItems(kind) });

export function useCreateCatalogItem(kind: CatalogKind) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createCatalogItem>[1]) => createCatalogItem(kind, data),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: [kind] }),
        client.invalidateQueries({ queryKey: ['history'] })
      ])
  });
}

export function useCreateCategory() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ['categories'] }),
        client.invalidateQueries({ queryKey: ['history'] })
      ])
  });
}

export function useDeleteCatalogItem(kind: CatalogKind) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCatalogItem(kind, id),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: [kind] }),
        client.invalidateQueries({ queryKey: ['history'] })
      ])
  });
}
