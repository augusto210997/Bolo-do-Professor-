import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, Plus, AlertCircle, Check, Tag, Hash, Package } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  productToEdit?: Product | null;
  categories: string[];
  onAddNewCategory: (name: string) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  categories,
  onAddNewCategory,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [minQuantity, setMinQuantity] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [unit, setUnit] = useState('un');
  const [description, setDescription] = useState('');
  
  const [newCatInput, setNewCatInput] = useState('');
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku || '');
      setCategory(productToEdit.category || (categories[0] || 'Geral'));
      setQuantity(productToEdit.quantity ?? 0);
      setMinQuantity(productToEdit.min_quantity ?? 0);
      setUnitPrice(productToEdit.unit_price ?? 0);
      setUnit(productToEdit.unit || 'un');
      setDescription(productToEdit.description || '');
    } else {
      setName('');
      setSku('');
      setCategory(categories[0] || 'Alimentos');
      setQuantity('');
      setMinQuantity(5);
      setUnitPrice('');
      setUnit('un');
      setDescription('');
    }
    setErrorMsg('');
    setIsAddingNewCat(false);
    setNewCatInput('');
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleAddCategorySubmit = async () => {
    if (!newCatInput.trim()) return;
    try {
      await onAddNewCategory(newCatInput.trim());
      setCategory(newCatInput.trim());
      setNewCatInput('');
      setIsAddingNewCat(false);
    } catch {
      setErrorMsg('Erro ao adicionar categoria');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('O nome do produto é obrigatório.');
      return;
    }

    const qtyNum = quantity === '' ? 0 : Number(quantity);
    const minQtyNum = minQuantity === '' ? 0 : Number(minQuantity);
    const priceNum = unitPrice === '' ? 0 : Number(unitPrice);

    if (qtyNum < 0) {
      setErrorMsg('A quantidade em estoque não pode ser negativa.');
      return;
    }
    if (minQtyNum < 0) {
      setErrorMsg('A quantidade mínima não pode ser negativa.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onSave({
        name: name.trim(),
        sku: sku.trim() || undefined,
        category: category || (categories[0] || 'Geral'),
        quantity: qtyNum,
        min_quantity: minQtyNum,
        unit_price: priceNum,
        unit: unit || 'un',
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const qty = typeof quantity === 'number' ? quantity : 0;
  const minQty = typeof minQuantity === 'number' ? minQuantity : 0;
  const isBelowMin = qty <= minQty && qty > 0;
  const isZero = qty === 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-2xs">
              <Package className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                {productToEdit ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {productToEdit ? 'Atualize as informações cadastrais e regras de estoque' : 'Preencha os dados e parâmetros de estoque mínimo'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nome do Produto */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nome do Produto <span className="text-rose-500">*</span>
            </label>
            <input
              id="product-form-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Café Especial Torrado 500g"
              className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all focus:outline-hidden"
            />
          </div>

          {/* Categoria & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Categoria */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Categoria <span className="text-rose-500">*</span>
                </label>
                {!isAddingNewCat && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCat(true)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                    <span>Nova</span>
                  </button>
                )}
              </div>

              {isAddingNewCat ? (
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="Nome da categoria"
                    className="flex-1 px-3 py-2 text-xs border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCategorySubmit}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-bold cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCat(false)}
                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-xs font-bold cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <select
                    id="product-form-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Código / SKU */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Código / SKU (Opcional)
              </label>
              <div className="relative">
                <input
                  id="product-form-sku"
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="Ex: ALM-CAF-001"
                  className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden transition-all"
                />
              </div>
            </div>
          </div>

          {/* Quantidades: Atual e Mínima */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
            {/* Quantidade Atual */}
            <div>
              <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1">
                Quantidade Atual <span className="text-rose-500">*</span>
              </label>
              <div className="flex space-x-1.5">
                <input
                  id="product-form-quantity"
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm sm:text-base font-black focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-20 px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden"
                >
                  <option value="un">un</option>
                  <option value="kg">kg</option>
                  <option value="pct">pct</option>
                  <option value="cx">cx</option>
                  <option value="l">L</option>
                  <option value="mt">m</option>
                  <option value="par">par</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Saldo inicial disponível</p>
            </div>

            {/* Quantidade Mínima */}
            <div>
              <label className="block text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-1">
                Quantidade Mínima (Alerta) <span className="text-rose-500">*</span>
              </label>
              <input
                id="product-form-min-quantity"
                type="number"
                min="0"
                step="any"
                required
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="5"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm sm:text-base font-black focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden"
              />
              <p className="text-[11px] text-amber-700 font-semibold mt-1">Dispara aviso quando ≤ mínimo</p>
            </div>
          </div>

          {/* Status Live Preview */}
          {(isZero || isBelowMin) && (
            <div className={`p-3 rounded-xl border text-xs font-medium flex items-center space-x-2 ${
              isZero 
                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {isZero 
                  ? 'Atenção: Este produto iniciará com estoque ZERADO (Esgotado).'
                  : `Atenção: A quantidade (${qty}) é menor ou igual ao mínimo (${minQty}). Ficará com status "Abaixo do Mínimo".`}
              </span>
            </div>
          )}

          {/* Preço Unitário & Descrição */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Preço Unitário (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">R$</span>
                <input
                  id="product-form-unit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0,00"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Descrição / Observações (Opcional)
              </label>
              <input
                id="product-form-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Fornecedor principal, lote, localização na prateleira"
                className="w-full px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              Cancelar
            </button>
            <button
              id="product-form-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-xs disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Salvando...</span>
              ) : (
                <span>{productToEdit ? 'Atualizar Produto' : 'Cadastrar Produto'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
