// Types for bulk stock CSV workflow

export type StockRow = {
  item_id?: string;
  item_name?: string; // optional, for operator reference only
  quantity_delta?: number; // signed integer (can be negative)
  reason?: string; // optional
};

export type ParsedRow = StockRow & {
  row: number; // 1-based index including header (header at 1)
  invalid?: string; // client-side validation error message
};

export type BulkResponse = {
  ok: boolean;
  applied: number;
  errors?: { row: number; message: string | Record<string, unknown> }[];
};

export type BulkResponseNormalized = {
  ok: boolean;
  applied: number;
  errors?: { row: number; message: string }[];
};
