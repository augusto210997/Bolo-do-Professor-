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
  ArrowUpDown,
  Tag
} from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdjust: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onQuickRemove: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  onAdjust,
  onQuickAdd,
  onQuickRemove,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-600">
          <thead className="bg-slate-50/90 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-200 tracking-wider">
            <tr>
              <th scope="col" className="px-5 py-3.5">Produto</th>
              <th scope="col" className="px-4 py-3.5">Categoria</th>
              <th scope="col" className="px-4 py-3.5 text-center">Quantidade</th>
              <th scope="col" className="px-4 py-3.5 text-center">Mínimo</th>
              <th scope="col" className="px-4 py-3.5 text-center">Status</th>
              <th scope="col" className="px-4 py-3.5 text-right">Preço Unit.</th>
              <th scope="col" className="px-4 py-3.5 text-right">Valor Total</th>
              <th scope="col" className="px-5 py-3.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const qty = Number(product.quantity) || 0;
              const minQty = Number(product.min_quantity) || 0;
              const unitPrice = Number(product.unit_price) || 0;
              const totalVal = qty * unitPrice;

              const isZero = qty === 0;
              const isLow = qty > 0 && qty <= minQty;

              const formattedPrice = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(unitPrice);

              const formattedTotal = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(totalVal);

              return (
                <tr 
                  key={product.id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    isZero ? 'bg-rose-50/20' : isLow ? 'bg-amber-50/20' : ''
                  }`}
                >
                  {/* Product Name & SKU */}
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900 line-clamp-1">{product.name}</div>
                    {product.sku && (
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        SKU: {product.sku}
                      </div>
                    )}
                    {product.description && (
                      <div className="text-xs text-slate-500 line-clamp-1 max-w-xs mt-0.5">
                        {product.description}
                      </div>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
                      {product.category || 'Geral'}
                    </span>
                  </td>

                  {/* Quantity with quick buttons */}
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    <div className="inline-flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200/50">
                      <button
                        onClick={() => onQuickRemove(product)}
                        disabled={qty <= 0}
                        className="w-6 h-6 rounded-md bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 flex items-center justify-center shadow-2xs cursor-pointer transition-colors"
                        title="Subtrair 1"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className={`px-2 font-bold text-sm ${
                        isZero ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                      }`}>
                        {qty} <span className="text-[11px] font-normal text-slate-500">{product.unit || 'un'}</span>
                      </span>
                      <button
                        onClick={() => onQuickAdd(product)}
                        className="w-6 h-6 rounded-md bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center shadow-2xs cursor-pointer transition-colors"
                        title="Adicionar 1"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Minimum */}
                  <td className="px-4 py-3.5 text-center whitespace-nowrap font-medium text-slate-600">
                    {minQty} {product.unit || 'un'}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                    {isZero ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertCircle className="w-3 h-3 mr-1 text-rose-500" />
                        Esgotado
                      </span>
                    ) : isLow ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />
                        Abaixo do Mín.
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                        Normal
                      </span>
                    )}
                  </td>

                  {/* Unit Price */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap font-medium text-slate-700 text-xs">
                    {unitPrice > 0 ? formattedPrice : '-'}
                  </td>

                  {/* Total Value */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap font-bold text-slate-900 text-xs">
                    {unitPrice > 0 ? formattedTotal : '-'}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-0.5">
                      <button
                        onClick={() => onAdjust(product)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Movimentar estoque"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEdit(product)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(product)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
