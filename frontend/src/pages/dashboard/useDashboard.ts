import { useState } from 'react';
import {
  useItems,
  useCategories,
  useAddItem,
  useUpdateItem,
  useDeleteItem,
  useAdjustStock,
} from '../../hooks/useInventory';
import type { Item, Category } from '../../types';

export type AdjustPayload = { id: number; delta: number; note?: string; reason?: string };

export function useDashboard() {
  // Queries
  const {
    data: itemsResponse,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useItems();

  const {
    data: categoriesResponse,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useCategories();

  // Mutations
  const addItemMutation = useAddItem();
  const updateItemMutation = useUpdateItem();
  const deleteItemMutation = useDeleteItem();
  const adjustStockMutation = useAdjustStock();

  const items: Item[] = itemsResponse?.results || [];
  const categories: Category[] = categoriesResponse?.results || [];

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editIntent, setEditIntent] = useState<'edit' | 'adjust'>('edit');
  // No separate Adjust dialog; we unify into Edit dialog. Keep adjust mutation only.

  const error = itemsError
    ? 'Failed to load inventory items'
    : categoriesError
    ? 'Failed to load categories'
    : addItemMutation.error
    ? 'Failed to add item'
    : updateItemMutation.error
    ? 'Failed to update item'
    : deleteItemMutation.error
    ? 'Failed to delete item'
    : null;

  const openAdd = () => setIsAddDialogOpen(true);
  const closeAdd = () => setIsAddDialogOpen(false);
  const submitAdd = async (payload: Partial<Item>) => {
    const created = await addItemMutation.mutateAsync(payload as any);
    // If an initial quantity was provided, apply it as an adjustment
    if (payload.quantity && typeof payload.quantity === 'number' && payload.quantity !== 0) {
      try {
        await adjustStockMutation.mutateAsync({ id: created.id, delta: payload.quantity, reason: 'init' });
      } catch {
        // swallow and rely on adjustments UI; item was created successfully
      }
    }
    setIsAddDialogOpen(false);
  };

  const openEdit = (item: Item) => {
    setEditIntent('edit');
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };
  const openAdjust = (item: Item) => {
    setEditIntent('adjust');
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };
  const closeEdit = () => setIsEditDialogOpen(false);
  const submitEdit = async (updated: Item) => {
    await updateItemMutation.mutateAsync(updated);
    setIsEditDialogOpen(false);
    setSelectedItem(null);
  };

  const submitAdjust = async (payload: AdjustPayload) => {
    await adjustStockMutation.mutateAsync(payload);
  };

  const deleteItem = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    await deleteItemMutation.mutateAsync(id);
  };

  return {
    items,
    categories,
    isLoadingItems,
    isLoadingCategories,
    error,

    selectedItem,
    setSelectedItem,

    isAddDialogOpen,
    openAdd,
    closeAdd,
    submitAdd,

    isEditDialogOpen,
    openEdit,
  openAdjust,
    closeEdit,
    submitEdit,
  editIntent,

    submitAdjust,

    deleteItem,
  } as const;
}

export default useDashboard;
