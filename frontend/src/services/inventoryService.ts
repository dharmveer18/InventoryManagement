import api from '../api/client';
import { PaginatedResponse } from '../types';

export interface Item {
  id: number;
  name: string;
  description: string;
  quantity: number;
  category: {
    id: number;
    name: string;
  };
  unit_price: number;
  created_at: string;
  modified_at: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Transaction {
  id: number;
  item: number;
  quantity: number;
  transaction_type: 'IN' | 'OUT';
  reference: string;
  notes: string;
  created_at: string;
}

class InventoryService {
  async getItems(params?: { 
    page?: number; 
    search?: string; 
    category?: number;
  }): Promise<{ results: Item[]; count: number }> {
    console.log('=== Inventory Service: getItems ===');
    console.log('Request params:', params);
    
    try {
            const response = await api.get<PaginatedResponse<Item>>('/inventory/items/');
      
      console.log('=== API Response ===');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.results) {
        console.log(`Received ${response.data.results.length} items`);
        console.log('Total items:', response.data.count);
        console.log('First item sample:', response.data.results[0]);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }

  async getItem(id: number): Promise<Item> {
    console.log('=== Inventory Service: getItem ===');
    console.log('Fetching item with ID:', id);
    
    try {
      const response = await api.get(`/inventory/items/${id}/`);
      
      console.log('=== API Response ===');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Item data:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  }

  async createItem(item: Partial<Item>): Promise<Item> {
    console.log('=== Inventory Service: createItem ===');
    console.log('Creating item with data:', JSON.stringify(item, null, 2));
    
    try {
      const response = await api.post('/inventory/items/', item);
      
      console.log('=== API Response ===');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Created item:', JSON.stringify(response.data, null, 2));
      
      return response.data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  async updateItem(id: number, item: Partial<Item>): Promise<Item> {
    const response = await api.patch(`/inventory/items/${id}/`, item);
    return response.data;
  }

  async deleteItem(id: number): Promise<void> {
    await api.delete(`/inventory/items/${id}/`);
  }

  async getCategories(): Promise<Category[]> {
    const response = await api.get('/inventory/categories/');
    return response.data;
  }

  async createCategory(category: { name: string }): Promise<Category> {
    const response = await api.post('/inventory/categories/', category);
    return response.data;
  }

  async getTransactions(params?: {
    page?: number;
    item?: number;
    transaction_type?: 'IN' | 'OUT';
  }): Promise<{ results: Transaction[]; count: number }> {
    const response = await api.get('/inventory/transactions/', { params });
    return response.data;
  }

  async createTransaction(transaction: {
    item: number;
    quantity: number;
    transaction_type: 'IN' | 'OUT';
    reference?: string;
    notes?: string;
  }): Promise<Transaction> {
    const response = await api.post('/inventory/transactions/', transaction);
    return response.data;
  }
}

export const inventoryService = new InventoryService();