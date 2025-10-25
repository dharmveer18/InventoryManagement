import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { Item, Category, PaginatedResponse } from '../types';

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
      const response = await api.get<PaginatedResponse<Item>>('/inventory/items/');
      return response.data;
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
    mutationFn: async (newItem: Partial<Item>) => {
      const { data } = await api.post('/inventory/items/', newItem);
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
      const { data } = await api.put(`/inventory/items/${updatedItem.id}/`, updatedItem);
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