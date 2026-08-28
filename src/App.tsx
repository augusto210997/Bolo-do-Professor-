import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, StockMovement, InventoryFilter, MovementType } from './types';
import { inventoryService } from './services/inventoryService';
import { testSupabaseConnection, getSupabaseClient } from './lib/supabase';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { ProductListControls } from './components/ProductListControls';
import { ProductCard } from './components/ProductCard';
import { ProductTable } from './components/ProductTable';
import { ProductFormModal } from './components/ProductFormModal';
import { StockAdjustmentModal } from './components/StockAdjustmentModal';
import { MovementHistoryModal } from './components/MovementHistoryModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { 
  PackageSearch, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Trash2,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [selectedProductForAdjustment, setSelectedProductForAdjustment] = useState<Product | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  // Filter & View State
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filter, setFilter] = useState<InventoryFilter>({
    search: '',
    category: 'all',
    status: 'all',
    sortBy: 'updated_at',
  });

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Check Supabase connection
  const checkConnection = useCallback(async () => {
    const res = await testSupabaseConnection();
    setIsSupabaseConnected(res.success && res.details !== 'table_missing');
  }, []);

  // Load initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      await checkConnection();
      const [prodRes, movRes, catRes] = await Promise.all([
        inventoryService.fetchProducts(),
        inventoryService.fetchMovements(),
        inventoryService.fetchCategories(),
      ]);

      setProducts(prodRes.data);
      setMovements(movRes.data);
      setCategories(catRes);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      showToast('Erro ao carregar dados do estoque', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up Supabase Realtime Subscription if client is available
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !isSupabaseConnected) return;

    try {
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => {
            inventoryService.fetchProducts().then((res) => {
              if (res.data) setProducts(res.data);
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'stock_movements' },
          () => {
            inventoryService.fetchMovements().then((res) => {
              if (res.data) setMovements(res.data);
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }
  }, [isSupabaseConnected]);

  // Handle Save (Create / Update Product)
  const handleSaveProduct = async (
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      if (productToEdit) {
        const res = await inventoryService.updateProduct(productToEdit.id, productData);
        if (res.data) {
          setProducts((prev) =>
            prev.map((p) => (p.id === productToEdit.id ? res.data! : p))
          );
          showToast(`Produto "${res.data.name}" atualizado com sucesso!`);
        }
      } else {
        const res = await inventoryService.createProduct(productData);
        if (res.data) {
          setProducts((prev) => [res.data, ...prev]);
          // Refresh movements list for initial stock log
          inventoryService.fetchMovements().then((m) => setMovements(m.data));
          showToast(`Produto "${res.data.name}" cadastrado com sucesso!`);
        }
      }
      setIsProductModalOpen(false);
      setProductToEdit(null);
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar produto', 'error');
      throw err;
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    try {
      const res = await inventoryService.deleteProduct(deleteConfirmProduct.id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteConfirmProduct.id));
        showToast(`Produto "${deleteConfirmProduct.name}" removido com sucesso!`);
      }
      setDeleteConfirmProduct(null);
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir produto', 'error');
    }
  };

  // Handle Stock Movement (Entrada / Saída / Ajuste)
  const handleStockAdjustment = async (
    productId: string,
    amount: number,
    type: MovementType,
    reason: string
  ) => {
    try {
      const res = await inventoryService.adjustStock(productId, amount, type, reason);
      if (res.data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? res.data! : p))
        );
        const movRes = await inventoryService.fetchMovements();
        setMovements(movRes.data);

        const verb = type === 'entrada' ? 'Entrada de' : type === 'saida' ? 'Saída de' : 'Ajuste para';
        showToast(`${verb} ${amount} registrada com sucesso!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao ajustar estoque', 'error');
      throw err;
    }
  };

  // Quick 1-Click + / - Buttons
  const handleQuickAdd = async (product: Product) => {
    await handleStockAdjustment(product.id, 1, 'entrada', 'Entrada rápida (+1)');
  };

  const handleQuickRemove = async (product: Product) => {
    if (product.quantity <= 0) return;
    await handleStockAdjustment(product.id, 1, 'saida', 'Saída rápida (-1)');
  };

  // Add Category
  const handleAddCategory = async (name: string) => {
    const updated = await inventoryService.addCategory(name);
    setCategories(updated);
    showToast(`Categoria "${name}" adicionada com sucesso!`);
  };

  // Count products by category
  const productCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search term
      if (filter.search.trim()) {
        const q = filter.search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku ? p.sku.toLowerCase().includes(q) : false;
        const matchDesc = p.description ? p.description.toLowerCase().includes(q) : false;
        const matchCat = p.category ? p.category.toLowerCase().includes(q) : false;
        if (!matchName && !matchSku && !matchDesc && !matchCat) return false;
      }

      // Category
      if (filter.category !== 'all' && p.category !== filter.category) {
        return false;
      }

      // Status
      if (filter.status === 'low') {
        if (!(p.quantity > 0 && p.quantity <= p.min_quantity)) return false;
      } else if (filter.status === 'out') {
        if (p.quantity > 0) return false;
      } else if (filter.status === 'normal') {
        if (p.quantity <= p.min_quantity) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filter.sortBy === 'name') {
        return a.name.localeCompare(b.name, 'pt-BR');
      } else if (filter.sortBy === 'quantity_asc') {
        return (a.quantity || 0) - (b.quantity || 0);
      } else if (filter.sortBy === 'quantity_desc') {
        return (b.quantity || 0) - (a.quantity || 0);
      } else if (filter.sortBy === 'value_desc') {
        const valA = (a.quantity || 0) * (a.unit_price || 0);
        const valB = (b.quantity || 0) * (b.unit_price || 0);
        return valB - valA;
      } else {
        // updated_at desc
        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
      }
    });
  }, [products, filter]);

  // Export to CSV
  const handleExportCSV = () => {
    if (products.length === 0) {
      showToast('Não há produtos para exportar', 'info');
      return;
    }

    const headers = ['ID', 'Nome', 'SKU', 'Categoria', 'Quantidade', 'Quantidade Minima', 'Unidade', 'Preco Unitario', 'Valor Total', 'Descricao', 'Data Atualizacao'];
    const rows = products.map((p) => [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${(p.sku || '').replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.quantity,
      p.min_quantity,
      `"${p.unit || 'un'}"`,
      p.unit_price || 0,
      ((p.quantity || 0) * (p.unit_price || 0)).toFixed(2),
      `"${(p.description || '').replace(/"/g, '""')}"`,
      `"${p.updated_at || p.created_at}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventario_estoque_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Relatório de estoque CSV gerado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 transition-all transform animate-in slide-in-from-bottom-4 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center space-x-3 ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800 shadow-slate-900/10'
                : toast.type === 'error'
                ? 'bg-rose-700 text-white border-rose-800 shadow-rose-900/10'
                : toast.type === 'warning'
                ? 'bg-amber-600 text-white border-amber-700 shadow-amber-900/10'
                : 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-900/10'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-200 shrink-0" />}
            <span className="text-xs font-semibold">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-slate-300 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* App Header */}
      <Header
        isSupabaseConnected={isSupabaseConnected}
        onOpenProductModal={() => {
          setProductToEdit(null);
          setIsProductModalOpen(true);
        }}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        productCount={products.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Metric Cards KPI */}
        <MetricCards
          products={products}
          activeStatusFilter={filter.status}
          onFilterByStatus={(status) => setFilter((prev) => ({ ...prev, status }))}
        />

        {/* Filter & View Mode Controls */}
        <ProductListControls
          filter={filter}
          onFilterChange={(newF) => setFilter((prev) => ({ ...prev, ...newF }))}
          categories={categories}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFiltered={filteredProducts.length}
          totalAll={products.length}
          onExportCSV={handleExportCSV}
        />

        {/* Products List / Grid / Empty State */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center shadow-xs">
            <RefreshCw className="w-7 h-7 mx-auto text-indigo-600 animate-spin mb-3" />
            <p className="text-sm font-semibold text-slate-800">Carregando catálogo e inventário...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
            <PackageSearch className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-900">
              Nenhum produto encontrado
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              {filter.search || filter.category !== 'all' || filter.status !== 'all'
                ? 'Tente ajustar ou limpar os filtros de busca para encontrar o item desejado.'
                : 'Seu estoque está vazio. Comece cadastrando o seu primeiro produto agora!'}
            </p>
            {filter.search || filter.category !== 'all' || filter.status !== 'all' ? (
              <button
                onClick={() =>
                  setFilter({
                    search: '',
                    category: 'all',
                    status: 'all',
                    sortBy: 'updated_at',
                  })
                }
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Limpar Todos os Filtros
              </button>
            ) : (
              <button
                id="empty-state-new-product-btn"
                onClick={() => {
                  setProductToEdit(null);
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Primeiro Produto</span>
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={(p) => {
                  setProductToEdit(p);
                  setIsProductModalOpen(true);
                }}
                onDelete={(p) => setDeleteConfirmProduct(p)}
                onAdjust={(p) => {
                  setSelectedProductForAdjustment(p);
                  setIsAdjustmentModalOpen(true);
                }}
                onQuickAdd={handleQuickAdd}
                onQuickRemove={handleQuickRemove}
              />
            ))}
          </div>
        ) : (
          <ProductTable
            products={filteredProducts}
            onEdit={(p) => {
              setProductToEdit(p);
              setIsProductModalOpen(true);
            }}
            onDelete={(p) => setDeleteConfirmProduct(p)}
            onAdjust={(p) => {
              setSelectedProductForAdjustment(p);
              setIsAdjustmentModalOpen(true);
            }}
            onQuickAdd={handleQuickAdd}
            onQuickRemove={handleQuickRemove}
          />
        )}
      </main>

      {/* Modals */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
        categories={categories}
        onAddNewCategory={handleAddCategory}
      />

      <StockAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => {
          setIsAdjustmentModalOpen(false);
          setSelectedProductForAdjustment(null);
        }}
        product={selectedProductForAdjustment}
        onConfirmAdjustment={handleStockAdjustment}
      />

      <MovementHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        movements={movements}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConnectionUpdated={() => {
          checkConnection();
          loadData();
        }}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        productCountsByCategory={productCountsByCategory}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Excluir Produto?
            </h3>
            <p className="text-xs text-slate-600 mt-1 mb-5">
              Tem certeza que deseja remover <strong>"{deleteConfirmProduct.name}"</strong>? O item será desativado do controle de estoque.
            </p>
            <div className="flex items-center justify-center space-x-2.5">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="confirm-delete-product-btn"
                onClick={handleDeleteProduct}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
