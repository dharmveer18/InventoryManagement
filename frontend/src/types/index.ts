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