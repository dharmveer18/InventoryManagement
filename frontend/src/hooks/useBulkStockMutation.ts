import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { AxiosError } from 'axios';
import { queryKeys } from './useInventory';
import type { StockRow, BulkResponseNormalized } from '../types/bulk';

export function useBulkStockMutation() {
  const qc = useQueryClient();

  return useMutation<BulkResponseNormalized, Error, { rows: StockRow[]; dryRun: boolean }>({
    mutationFn: async ({ rows, dryRun }) => {
      // Build payload expected by backend bulk_adjust_stock
      // Endpoint: POST /inventory/items/bulk_adjust_stock/
      if (dryRun) {
        // Client-side validation only for now; no server mutation
        return { ok: true, applied: 0, errors: [] };
      }

      const adjustments = rows
        .map((r) => ({
          item: r.item_id ? Number(r.item_id) : undefined,
          delta: r.quantity_delta,
          note: r.reason ?? '',
        }))
        .filter((a) => typeof a.item === 'number' && typeof a.delta === 'number');

      try {
        const { data } = await api.post(
          '/inventory/items/bulk_adjust_stock/',
          { adjustments, reason: 'csv' }
        );

        // Backend returns a list of transactions
        const normalized: BulkResponseNormalized = {
          ok: true,
          applied: Array.isArray(data) ? data.length : 0,
          errors: [],
        };
        return normalized;
      } catch (err) {
        const ax = err as AxiosError<any>;
        // Try to extract DRF validation details for a helpful message
        const data = ax.response?.data;
        if (data && typeof data === 'object') {
          // Common DRF shape: { adjustments: { '1': { item: ['Invalid pk 999.'] } } }
          const parts: string[] = [];
          const toStr = (v: any): string => {
            if (Array.isArray(v)) return v.join(', ');
            if (v && typeof v === 'object') return Object.values(v).map(toStr).join('; ');
            return String(v);
          };
          for (const [k, v] of Object.entries(data)) {
            parts.push(`${k}: ${toStr(v)}`);
          }
          const msg = parts.length ? `Validation failed: ${parts.join(' | ')}` : 'Validation failed';
          throw new Error(msg);
        }
        throw new Error(ax.message || 'Bulk update failed');
      }
    },
    onSuccess: () => {
      // Refresh the items list so new quantities/status reflect in UI
      qc.invalidateQueries({ queryKey: queryKeys.items });
    },
  });
}

export default useBulkStockMutation;
