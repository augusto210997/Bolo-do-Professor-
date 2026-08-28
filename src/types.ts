export interface Product {
  id: string;
  name: string;
  sku?: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit_price?: number;
  unit?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export type MovementType = 'entrada' | 'saida' | 'ajuste';

export interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  type: MovementType;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  reason?: string;
  created_at: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastChecked?: string;
  error?: string | null;
}

export type StockStatus = 'out_of_stock' | 'low_stock' | 'normal_stock' | 'surplus_stock';

export interface InventoryFilter {
  search: string;
  category: string;
  status: 'all' | 'low' | 'out' | 'normal';
  sortBy: 'name' | 'quantity_asc' | 'quantity_desc' | 'updated_at' | 'value_desc';
}
