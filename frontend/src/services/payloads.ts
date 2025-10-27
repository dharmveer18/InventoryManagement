import type { Item, Category } from '../types';

export type ItemWritePayload = {
  name: string;
  price: string;
  low_stock_threshold: number;
  category_id: number;
};

export function buildItemWritePayload(input: Partial<Item>): ItemWritePayload {
  const name = (input.name ?? '').trim();
  if (!name) throw new Error('Name is required');

  const priceNum = typeof input.price === 'number' ? input.price : Number(input.price ?? 0);
  const price = String(Number.isFinite(priceNum) ? priceNum : 0);

  const low_stock_threshold = typeof input.low_stock_threshold === 'number' ? input.low_stock_threshold : 0;

  let category_id: number | undefined;
  if (input.category && typeof input.category === 'object') {
    category_id = (input.category as Category).id;
  }
  // allow category_id to be provided directly in drafts coming from forms
  if (!category_id && (input as any).category_id) {
    const cid = (input as any).category_id;
    category_id = typeof cid === 'string' ? parseInt(cid, 10) : cid;
  }
  if (typeof category_id !== 'number' || Number.isNaN(category_id)) {
    throw new Error('Category is required');
  }

  return { name, price, low_stock_threshold, category_id };
}
