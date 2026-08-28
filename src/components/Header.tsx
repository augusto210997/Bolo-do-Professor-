import React from 'react';
import { 
  Boxes, 
  Plus, 
  History, 
  FolderOpen
} from 'lucide-react';

interface HeaderProps {
  isSupabaseConnected?: boolean;
  onOpenProductModal: () => void;
  onOpenSupabaseModal?: () => void;
  onOpenHistoryModal: () => void;
  onOpenCategoryModal: () => void;
  productCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenProductModal,
  onOpenHistoryModal,
  onOpenCategoryModal,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-xs border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-xs">
              <Boxes className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Controle de Estoque
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                Gestão ágil de produtos, categorias e quantidades mínimas
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            <button
              id="header-categories-btn"
              onClick={onOpenCategoryModal}
              className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
              title="Gerenciar Categorias"
            >
              <FolderOpen className="w-3.5 h-3.5 sm:mr-1.5 text-slate-500" />
              <span className="hidden sm:inline">Categorias</span>
            </button>

            <button
              id="header-history-btn"
              onClick={onOpenHistoryModal}
              className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
              title="Histórico de Movimentações"
            >
              <History className="w-3.5 h-3.5 sm:mr-1.5 text-slate-500" />
              <span className="hidden sm:inline">Histórico</span>
            </button>

            <button
              id="header-new-product-btn"
              onClick={onOpenProductModal}
              className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 sm:mr-1.5 stroke-[2.5]" />
              <span>Novo Produto</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

