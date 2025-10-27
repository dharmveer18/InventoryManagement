import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Item, Category, PaginatedResponse, APIItemCreatePayload } from '../types';
import type { Item as APIItem } from '../types/contracts';
import { buildItemWritePayload } from '../services/payloads';

// Query keys
export const queryKeys = {
  items: ['items'] as const,
  categories: ['categories'] as const,
  item: (id: number) => ['items', id] as const,
};

// Items queries and mutations
export const useItems = () => {
  return useQuery<PaginatedResponse<Item>>({
    queryKey: queryKeys.items,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await api.get('/inventory/items/');
      const data = response.data as {
        count: number;
        next: string | null;
        previous: string | null;
        results: APIItem[];
      };

      const mapItem = (i: APIItem): Item => ({
        id: i.id,
        name: i.name,
        // API returns decimals as strings; convert safely for UI display/calcs
        quantity: Number(i.quantity),
        price: Number(i.price),
        low_stock_threshold: i.low_stock_threshold ?? 0,
        category: {
          id: i.category.id,
          name: i.category.name,
          // fall back to empty strings if missing
          created_at: i.category.created_at ?? '',
          modified_at: i.category.modified_at ?? '',
        },
      });

      return {
        count: data.count,
        next: data.next,
        previous: data.previous,
        results: data.results.map(mapItem),
      } satisfies PaginatedResponse<Item>;
    }
  });
};

export const useCategories = () => {
  return useQuery<PaginatedResponse<Category>>({
    queryKey: queryKeys.categories,
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Category>>('/inventory/categories/');
      return response.data;
    }
  });
};

export const useAddItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newItem: APIItemCreatePayload) => {
      const body = buildItemWritePayload(newItem as unknown as Partial<Item>);
      const { data } = await api.post('/inventory/items/', body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updatedItem: Item) => {
      const payload = buildItemWritePayload(updatedItem);
      const { data } = await api.put(`/inventory/items/${updatedItem.id}/`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/inventory/items/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
    },
  });
};

// Adjust stock mutation
export const useAdjustStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number; delta: number; note?: string; reason?: string }) => {
      const { id, delta, note, reason } = payload;
      const { data } = await api.post(`/inventory/items/${id}/adjust_stock/`, {
        item: id,
        delta,
        note,
        reason: reason ?? 'manual',
      });
      return data;
    },
    onSuccess: () => {
      // Refresh the items list to reflect the latest quantity snapshot
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
    },
  });
};