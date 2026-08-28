import { Product, StockMovement, MovementType } from '../types';
import { getSupabaseClient } from '../lib/supabase';

const LOCAL_PRODUCTS_KEY = 'inventory_local_products_v1';
const LOCAL_MOVEMENTS_KEY = 'inventory_local_movements_v1';
const LOCAL_CATEGORIES_KEY = 'inventory_local_categories_v1';

// Initial sample data so the user can immediately see and use the system
const DEFAULT_CATEGORIES = [
  'Alimentos',
  'Bebidas',
  'Eletrônicos',
  'Limpeza',
  'Papelaria',
  'Ferramentas',
  'Vestuário',
  'Outros',
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1e5a8f23-64a1-4328-b0a1-7c98f121a001',
    name: 'Café Especial Torrado e Moído 500g',
    sku: 'CAF-500-G',
    category: 'Alimentos',
    quantity: 45,
    min_quantity: 15,
    unit_price: 24.90,
    unit: 'pct',
    description: 'Café 100% arábica com notas de chocolate e caramelo',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: '2b6b9c34-75b2-5439-c1b2-8d09a232b002',
    name: 'Água Mineral sem Gás 500ml',
    sku: 'BEB-AGU-500',
    category: 'Bebidas',
    quantity: 8,
    min_quantity: 20, // Low stock!
    unit_price: 3.50,
    unit: 'un',
    description: 'Fardo com garrafas pet 500ml',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3c7c0d45-86c3-6540-d2c3-9e10b343c003',
    name: 'Papel Sulfite A4 75g Resma 500 Folhas',
    sku: 'PAP-A4-500',
    category: 'Papelaria',
    quantity: 0, // Out of stock!
    min_quantity: 10,
    unit_price: 28.00,
    unit: 'cx',
    description: 'Resma alcalina para impressões de alta definição',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4d8d1e56-97d4-7651-e3d4-0f21c454d004',
    name: 'Teclado Mecânico Sem Fio RGB',
    sku: 'ELE-TEC-RGB',
    category: 'Eletrônicos',
    quantity: 14,
    min_quantity: 5,
    unit_price: 299.90,
    unit: 'un',
    description: 'Switch blue com conexão bluetooth e cabo destacável',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5e9e2f67-08e5-8762-f4e5-1a32d565e005',
    name: 'Detergente Neutro 500ml',
    sku: 'LIM-DET-500',
    category: 'Limpeza',
    quantity: 5,
    min_quantity: 12, // Low stock!
    unit_price: 2.80,
    unit: 'un',
    description: 'Fórmula biodegradável dermatologicamente testada',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'prod_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Local Storage Helpers
function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

function saveLocalProducts(products: Product[]): void {
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
}

function getLocalMovements(): StockMovement[] {
  try {
    const raw = localStorage.getItem(LOCAL_MOVEMENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalMovements(movements: StockMovement[]): void {
  localStorage.setItem(LOCAL_MOVEMENTS_KEY, JSON.stringify(movements));
}

export function getLocalCategories(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveLocalCategories(cats: string[]): void {
  localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(cats));
}

export const inventoryService = {
  // Fetch all products
  async fetchProducts(): Promise<{ data: Product[]; source: 'supabase' | 'local'; error?: string }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Sync to local cache
          saveLocalProducts(data);
          return { data: data as Product[], source: 'supabase' };
        } else if (error) {
          console.warn('Supabase query error, fallback to local storage:', error.message);
          return { data: getLocalProducts(), source: 'local', error: error.message };
        }
      } catch (err: any) {
        console.warn('Supabase connection failed, using local storage:', err.message);
      }
    }

    return { data: getLocalProducts(), source: 'local' };
  },

  // Create a new product
  async createProduct(
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ data: Product; source: 'supabase' | 'local'; error?: string }> {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: generateId(),
      quantity: Number(productData.quantity) || 0,
      min_quantity: Number(productData.min_quantity) || 0,
      unit_price: Number(productData.unit_price) || 0,
      unit: productData.unit || 'un',
      created_at: now,
      updated_at: now,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([newProduct])
          .select()
          .single();

        if (!error && data) {
          // Log initial movement if quantity > 0
          if (newProduct.quantity > 0) {
            await this.logMovement({
              product_id: data.id,
              product_name: data.name,
              type: 'entrada',
              quantity_change: newProduct.quantity,
              previous_quantity: 0,
              new_quantity: newProduct.quantity,
              reason: 'Cadastro inicial de estoque',
            });
          }
          return { data: data as Product, source: 'supabase' };
        } else if (error) {
          console.warn('Supabase insert failed, fallback to local:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase error on create:', err.message);
      }
    }

    // Fallback local
    const current = getLocalProducts();
    const updated = [newProduct, ...current];
    saveLocalProducts(updated);

    if (newProduct.quantity > 0) {
      await this.logMovement({
        product_id: newProduct.id,
        product_name: newProduct.name,
        type: 'entrada',
        quantity_change: newProduct.quantity,
        previous_quantity: 0,
        new_quantity: newProduct.quantity,
        reason: 'Cadastro inicial de estoque (Local)',
      });
    }

    return { data: newProduct, source: 'local' };
  },

  // Update existing product
  async updateProduct(
    id: string,
    updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<{ data: Product | null; source: 'supabase' | 'local'; error?: string }> {
    const now = new Date().toISOString();
    const cleanUpdates = {
      ...updates,
      ...(updates.quantity !== undefined ? { quantity: Number(updates.quantity) } : {}),
      ...(updates.min_quantity !== undefined ? { min_quantity: Number(updates.min_quantity) } : {}),
      ...(updates.unit_price !== undefined ? { unit_price: Number(updates.unit_price) } : {}),
      updated_at: now,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update(cleanUpdates)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          return { data: data as Product, source: 'supabase' };
        }
      } catch (err: any) {
        console.warn('Supabase update failed:', err.message);
      }
    }

    // Fallback local
    const current = getLocalProducts();
    let updatedProduct: Product | null = null;
    const updated = current.map((p) => {
      if (p.id === id) {
        updatedProduct = { ...p, ...cleanUpdates };
        return updatedProduct;
      }
      return p;
    });

    saveLocalProducts(updated);
    return { data: updatedProduct, source: 'local' };
  },

  // Delete product
  async deleteProduct(id: string): Promise<{ success: boolean; source: 'supabase' | 'local'; error?: string }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
          const current = getLocalProducts().filter((p) => p.id !== id);
          saveLocalProducts(current);
          return { success: true, source: 'supabase' };
        }
      } catch (err: any) {
        console.warn('Supabase delete failed:', err.message);
      }
    }

    // Local
    const current = getLocalProducts().filter((p) => p.id !== id);
    saveLocalProducts(current);
    return { success: true, source: 'local' };
  },

  // Quick Stock Adjustment (Entrada / Saída / Ajuste Direto)
  async adjustStock(
    productId: string,
    amount: number,
    type: MovementType,
    reason: string
  ): Promise<{ data: Product | null; error?: string }> {
    // Find current product
    const products = getLocalProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) return { data: null, error: 'Produto não encontrado' };

    const previous_quantity = Number(product.quantity) || 0;
    let new_quantity = previous_quantity;
    let quantity_change = Math.abs(amount);

    if (type === 'entrada') {
      new_quantity = previous_quantity + quantity_change;
    } else if (type === 'saida') {
      new_quantity = Math.max(0, previous_quantity - quantity_change);
      quantity_change = -quantity_change;
    } else if (type === 'ajuste') {
      new_quantity = Math.max(0, amount);
      quantity_change = new_quantity - previous_quantity;
    }

    // Update product
    const updateResult = await this.updateProduct(productId, {
      quantity: new_quantity,
    });

    if (updateResult.data) {
      // Log movement record
      await this.logMovement({
        product_id: productId,
        product_name: product.name,
        type,
        quantity_change,
        previous_quantity,
        new_quantity,
        reason: reason || (type === 'entrada' ? 'Entrada manual' : type === 'saida' ? 'Saída manual' : 'Inventário'),
      });
    }

    return updateResult;
  },

  // Log stock movement
  async logMovement(
    movement: Omit<StockMovement, 'id' | 'created_at'>
  ): Promise<{ data: StockMovement; source: 'supabase' | 'local' }> {
    const newMovement: StockMovement = {
      ...movement,
      id: generateId(),
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('stock_movements')
          .insert([newMovement])
          .select()
          .single();

        if (!error && data) {
          return { data: data as StockMovement, source: 'supabase' };
        }
      } catch (err) {
        console.warn('Supabase movement log error:', err);
      }
    }

    // Local
    const current = getLocalMovements();
    const updated = [newMovement, ...current].slice(0, 100); // keep last 100
    saveLocalMovements(updated);
    return { data: newMovement, source: 'local' };
  },

  // Fetch movement history
  async fetchMovements(): Promise<{ data: StockMovement[]; source: 'supabase' | 'local' }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('stock_movements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          saveLocalMovements(data);
          return { data: data as StockMovement[], source: 'supabase' };
        }
      } catch (err) {
        console.warn('Supabase fetch movements error:', err);
      }
    }

    return { data: getLocalMovements(), source: 'local' };
  },

  // Categories
  async fetchCategories(): Promise<string[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .order('name');

        if (!error && data && data.length > 0) {
          const names = data.map((c: any) => c.name);
          saveLocalCategories(names);
          return names;
        }
      } catch (err) {
        console.warn('Supabase fetch categories error:', err);
      }
    }
    return getLocalCategories();
  },

  async addCategory(name: string): Promise<string[]> {
    const trimmed = name.trim();
    if (!trimmed) return getLocalCategories();

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('categories').insert([{ name: trimmed }]);
      } catch (err) {
        console.warn('Supabase add category error:', err);
      }
    }

    const current = getLocalCategories();
    if (!current.includes(trimmed)) {
      const updated = [...current, trimmed].sort();
      saveLocalCategories(updated);
      return updated;
    }
    return current;
  },

  // Sync Local Data to Supabase when connected
  async syncLocalToSupabase(): Promise<{ count: number; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { count: 0, error: 'Cliente Supabase não configurado' };

    try {
      const localProducts = getLocalProducts();
      if (localProducts.length === 0) return { count: 0 };

      // Upsert products to Supabase
      const { data, error } = await supabase
        .from('products')
        .upsert(localProducts, { onConflict: 'id' })
        .select();

      if (error) {
        return { count: 0, error: error.message };
      }

      return { count: data?.length || localProducts.length };
    } catch (err: any) {
      return { count: 0, error: err.message || 'Erro durante a sincronização' };
    }
  },
};
