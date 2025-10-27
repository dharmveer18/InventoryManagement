// src/types/contracts.ts
// Use components and operation schemas from the generated openapi.d.ts
// Avoid indexing by literal path keys that may not exist on `paths` in this generator output.

import type { components } from './openapi';

// Core entity schemas
export type Item = components['schemas']['Item'];
export type Category = components['schemas']['Category'];
export type InventoryTransaction = components['schemas']['InventoryTransaction'];
export type Alert = components['schemas']['Alert'];
// Current generated spec returns User for /api/users/me/
export type Me = components['schemas']['User'];

// Paginated list schemas
export type PaginatedItemList = components['schemas']['PaginatedItemList'];
export type PaginatedCategoryList = components['schemas']['PaginatedCategoryList'];
export type PaginatedInventoryTransactionList = components['schemas']['PaginatedInventoryTransactionList'];
export type PaginatedAlertList = components['schemas']['PaginatedAlertList'];

// Request bodies (write shapes)
// According to the spec:
// - POST /items and PUT /items/{id} both use components['schemas']['Item'] as requestBody
// - PATCH /items/{id} uses components['schemas']['PatchedItem']
export type ItemCreateRequest = components['schemas']['Item'];
// Minimal API payload for creating an item (write shape)
type APIItemCreatePayload = {
  name: string;
  price: string; // DRF DecimalField commonly expects string
  low_stock_threshold?: number;
  category_id: number;
};
export type ItemPutRequest = components['schemas']['Item'];
export type ItemPatchRequest = components['schemas']['PatchedItem'];

export type CategoryCreateRequest = components['schemas']['Category'];
export type CategoryPutRequest = components['schemas']['Category'];
export type CategoryPatchRequest = components['schemas']['PatchedCategory'];

// Stock adjustment payloads
export type StockAdjustment = components['schemas']['StockAdjustment'];
export type BulkStockAdjustment = components['schemas']['BulkStockAdjustment'];

// Convenience helpers
export type ListResult<TPaginated extends { results: any[] }> = TPaginated['results'][number];
export type ListItem = ListResult<PaginatedItemList>;
export type ListCategory = ListResult<PaginatedCategoryList>;
export type ListTransaction = ListResult<PaginatedInventoryTransactionList>;
export type ListAlert = ListResult<PaginatedAlertList>;
