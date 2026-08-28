import React from 'react';
import { Product } from '../types';
import { 
  Plus, 
  Minus, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  Hash,
  ArrowUpDown
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdjust: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onQuickRemove: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onAdjust,
  onQuickAdd,
  onQuickRemove,
}) => {
  const qty = Number(product.quantity) || 0;
  const minQty = Number(product.min_quantity) || 0;
  const unitPrice = Number(product.unit_price) || 0;
  const totalValue = qty * unitPrice;

  const isZero = qty === 0;
  const isLow = qty > 0 && qty <= minQty;

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(unitPrice);

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalValue);

  // Percentage of stock relative to min_quantity * 2 (for progress bar visualization)
  const safeCapacity = Math.max(minQty * 2, 10);
  const stockPercentage = Math.min(100, Math.round((qty / safeCapacity) * 100));

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-sm flex flex-col justify-between overflow-hidden ${
      isZero
        ? 'border-rose-300 ring-1 ring-rose-200/50'
        : isLow
        ? 'border-amber-300 ring-1 ring-amber-200/50'
        : 'border-slate-200 hover:border-slate-300'
    }`}>
      {/* Card Header */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2.5">
          {/* Category Pill */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
            <Tag className="w-2.5 h-2.5 mr-1 text-slate-400" />
            {product.category || 'Geral'}
          </span>

          {/* Status Badge */}
          {isZero ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-3 h-3 mr-1 text-rose-500" />
              Esgotado
            </span>
          ) : isLow ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />
              Abaixo do Mínimo
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
              Regular
            </span>
          )}
        </div>

        {/* Product Title & SKU */}
        <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 leading-snug tracking-tight">
          {product.name}
        </h3>
        
        {product.sku && (
          <p className="text-[11px] font-mono text-slate-400 mt-1 flex items-center">
            <Hash className="w-2.5 h-2.5 mr-0.5 text-slate-400" />
            {product.sku}
          </p>
        )}

        {product.description && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
      </div>

      {/* Stock Quantity & Visual Indicator */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50/70 border-y border-slate-100">
        <div className="flex items-baseline justify-between mb-1.5">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quantidade Atual
            </span>
            <div className="flex items-baseline space-x-1">
              <span className={`text-2xl font-black tracking-tight ${
                isZero ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'
              }`}>
                {qty}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {product.unit || 'un'}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Mínimo
            </span>
            <span className="text-xs font-bold text-slate-700">
              {minQty} {product.unit || 'un'}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isZero
                ? 'bg-rose-500 w-0'
                : isLow
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: isZero ? '0%' : `${stockPercentage}%` }}
          />
        </div>

        {/* Price info if available */}
        {unitPrice > 0 && (
          <div className="flex items-center justify-between text-xs text-slate-600 mt-2.5 pt-2 border-t border-slate-200/60">
            <span>Unit: <strong className="text-slate-800 font-semibold">{formattedPrice}</strong></span>
            <span>Total: <strong className="text-slate-900 font-bold">{formattedTotal}</strong></span>
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="p-3 bg-white flex items-center justify-between gap-2">
        {/* Quick +/- controls */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200/50">
          <button
            id={`quick-remove-${product.id}`}
            onClick={() => onQuickRemove(product)}
            disabled={qty <= 0}
            className="w-7 h-7 rounded-md bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
            title="Dar saída de 1 unidade"
          >
            <Minus className="w-3 h-3" />
          </button>
          
          <button
            id={`quick-adjust-${product.id}`}
            onClick={() => onAdjust(product)}
            className="px-2 h-7 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 rounded-md flex items-center space-x-1 transition-colors cursor-pointer"
            title="Ajuste de movimentação avançada"
          >
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            <span className="hidden sm:inline">Ajustar</span>
          </button>

          <button
            id={`quick-add-${product.id}`}
            onClick={() => onQuickAdd(product)}
            className="w-7 h-7 rounded-md bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
            title="Dar entrada de 1 unidade"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Edit & Delete */}
        <div className="flex items-center space-x-0.5">
          <button
            id={`edit-product-${product.id}`}
            onClick={() => onEdit(product)}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-colors cursor-pointer"
            title="Editar produto"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            id={`delete-product-${product.id}`}
            onClick={() => onDelete(product)}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
            title="Excluir produto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

