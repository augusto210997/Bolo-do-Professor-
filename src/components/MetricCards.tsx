import React from 'react';
import { Product } from '../types';
import { Package, AlertCircle, TrendingUp, Layers } from 'lucide-react';

interface MetricCardsProps {
  products: Product[];
  onFilterByStatus: (status: 'all' | 'low' | 'out' | 'normal') => void;
  activeStatusFilter: 'all' | 'low' | 'out' | 'normal';
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  products,
  onFilterByStatus,
  activeStatusFilter,
}) => {
  const totalItems = products.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
  const totalProducts = products.length;

  const lowStockCount = products.filter(
    (p) => p.quantity > 0 && p.quantity <= p.min_quantity
  ).length;

  const outOfStockCount = products.filter((p) => p.quantity <= 0).length;

  const totalValue = products.reduce(
    (acc, p) => acc + (Number(p.quantity) || 0) * (Number(p.unit_price) || 0),
    0
  );

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalValue);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
      {/* 1. Total de Itens */}
      <div 
        id="metric-total-items"
        onClick={() => onFilterByStatus('all')}
        className={`bg-white p-4 sm:p-5 rounded-xl border transition-all cursor-pointer shadow-xs ${
          activeStatusFilter === 'all' 
            ? 'border-indigo-500 ring-2 ring-indigo-500/15' 
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total de Itens
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {totalItems.toLocaleString('pt-BR')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Em {totalProducts} {totalProducts === 1 ? 'produto' : 'produtos cadastrados'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200/60">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Alerta de Estoque Mínimo (Baixo) */}
      <div 
        id="metric-low-stock"
        onClick={() => onFilterByStatus('low')}
        className={`bg-white p-4 sm:p-5 rounded-xl border transition-all cursor-pointer shadow-xs ${
          activeStatusFilter === 'low' 
            ? 'border-amber-500 ring-2 ring-amber-500/15 bg-amber-50/10' 
            : 'border-slate-200 hover:border-amber-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Abaixo do Mínimo
            </p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1 tracking-tight">
              {lowStockCount}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {lowStockCount === 0 ? 'Nenhum item em nível crítico' : 'Requer reposição urgente'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Produtos Esgotados */}
      <div 
        id="metric-out-of-stock"
        onClick={() => onFilterByStatus('out')}
        className={`bg-white p-4 sm:p-5 rounded-xl border transition-all cursor-pointer shadow-xs ${
          activeStatusFilter === 'out' 
            ? 'border-rose-500 ring-2 ring-rose-500/15 bg-rose-50/10' 
            : 'border-slate-200 hover:border-rose-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              Esgotados (Zerados)
            </p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1 tracking-tight">
              {outOfStockCount}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {outOfStockCount === 0 ? 'Sem produtos zerados' : 'Itens sem estoque disponível'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Valor Total em Estoque */}
      <div 
        id="metric-total-value"
        className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Valor Total do Estoque
            </p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1 tracking-tight">
              {formattedValue}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Avaliação do patrimônio atual
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

