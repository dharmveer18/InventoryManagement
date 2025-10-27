// Generated API contract types (do not modify their shapes)
import type {
  Item as APIItem,
  Category as APICategory,
  ItemCreateRequest,
  ItemPutRequest,
} from './contracts';

// Re-export generated types under API* names so app code can opt-in gradually
export type { APIItem, APICategory, ItemCreateRequest, ItemPutRequest };

export interface Category {
  id: number;
  name: string;
  created_at: string;
  modified_at: string;
}

export interface Item {
  id: number;
  name: string;
  quantity: number;
  price: number;
  low_stock_threshold: number;
  category: Category;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type Me = {
  id: number;
  username: string;
  role: "admin" | "manager" | "viewer";
  perms: string[];
};

// Minimal API payload for creating an item (write shape)
export type APIItemCreatePayload = {
  name: string;
  price: string; // DRF DecimalField commonly expects string
  low_stock_threshold?: number;
  category_id: number;
};