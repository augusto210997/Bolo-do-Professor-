import React, { useState } from 'react';
import { X, Plus, FolderOpen, Tag, Check, AlertCircle } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAddCategory: (name: string) => Promise<void>;
  productCountsByCategory: Record<string, number>;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  productCountsByCategory,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setErrorMsg('Informe o nome da categoria.');
      return;
    }

    if (categories.some((c) => c.toLowerCase() === newCatName.trim().toLowerCase())) {
      setErrorMsg('Esta categoria já existe.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onAddCategory(newCatName.trim());
      setNewCatName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao adicionar categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-2xs">
              <FolderOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Categorias de Produtos
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Organize a taxonomia dos seus produtos
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* New Category Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Criar Nova Categoria
            </label>
            <div className="flex space-x-2">
              <input
                id="new-category-name-input"
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Ex: Embalagens, Cosméticos, Peças..."
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden transition-all placeholder:text-slate-400"
              />
              <button
                id="add-category-submit-btn"
                type="submit"
                disabled={isSubmitting || !newCatName.trim()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Adicionar</span>
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-600 font-medium flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </p>
            )}
          </form>

          {/* Existing Categories List */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Categorias Cadastradas ({categories.length})
            </h3>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/30">
              {categories.map((cat) => {
                const count = productCountsByCategory[cat] || 0;
                return (
                  <div
                    key={cat}
                    className="px-3.5 py-2.5 flex items-center justify-between hover:bg-white transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">{cat}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                      {count} {count === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
