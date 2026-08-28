import React from 'react';
import { InventoryFilter } from '../types';
import { 
  Search, 
  LayoutGrid, 
  List, 
  Download, 
  ArrowDownUp, 
  X,
  AlertTriangle
} from 'lucide-react';

interface ProductListControlsProps {
  filter: InventoryFilter;
  onFilterChange: (newFilter: Partial<InventoryFilter>) => void;
  categories: string[];
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalFiltered: number;
  totalAll: number;
  onExportCSV: () => void;
}

export const ProductListControls: React.FC<ProductListControlsProps> = ({
  filter,
  onFilterChange,
  categories,
  viewMode,
  onViewModeChange,
  totalFiltered,
  totalAll,
  onExportCSV,
}) => {
  const isFiltered = filter.search !== '' || filter.category !== 'all' || filter.status !== 'all';

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: 'all',
      status: 'all',
    });
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 mb-6 shadow-xs space-y-4">
      {/* Top row: Search and View Mode / Export */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            id="inventory-search-input"
            type="text"
            value={filter.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Buscar por produto, SKU, categoria ou descrição..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50/70 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all focus:outline-hidden"
          />
          {filter.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Switcher & Export */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Export CSV button */}
          <button
            id="export-csv-btn"
            onClick={onExportCSV}
            className="inline-flex items-center px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            title="Exportar dados para planilha CSV"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          {/* Grid / Table Toggle */}
          <div className="bg-slate-100/90 p-1 rounded-lg flex items-center border border-slate-200/60">
            <button
              id="view-grid-btn"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visualização em Grade"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-table-btn"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Visualização em Tabela"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Filter Chips & Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => onFilterChange({ status: 'all' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter.status === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({totalAll})
            </button>

            <button
              onClick={() => onFilterChange({ status: 'low' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                filter.status === 'low'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-500 group-hover:text-amber-700" />
              <span>Abaixo do Mínimo</span>
            </button>

            <button
              onClick={() => onFilterChange({ status: 'out' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter.status === 'out'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/80'
              }`}
            >
              Esgotados
            </button>

            <button
              onClick={() => onFilterChange({ status: 'normal' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter.status === 'normal'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
              }`}
            >
              Estoque Regular
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            id="filter-category-select"
            value={filter.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden transition-all"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {isFiltered && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center space-x-1 px-2 py-1 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center space-x-1.5">
          <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Ordenar:</span>
          <select
            id="sort-by-select"
            value={filter.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden transition-all"
          >
            <option value="updated_at">Mais Recentes</option>
            <option value="name">Nome (A - Z)</option>
            <option value="quantity_asc">Menor Quantidade (Críticos primeiro)</option>
            <option value="quantity_desc">Maior Quantidade</option>
            <option value="value_desc">Maior Valor Total</option>
          </select>
        </div>
      </div>
    </div>
  );
};

