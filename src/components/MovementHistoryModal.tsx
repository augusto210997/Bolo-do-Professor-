import React, { useState } from 'react';
import { StockMovement } from '../types';
import { 
  X, 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Search,
  Calendar,
  Layers
} from 'lucide-react';

interface MovementHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  movements: StockMovement[];
}

export const MovementHistoryModal: React.FC<MovementHistoryModalProps> = ({
  isOpen,
  onClose,
  movements,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'entrada' | 'saida' | 'ajuste'>('all');

  if (!isOpen) return null;

  const filtered = movements.filter((m) => {
    const matchesSearch = 
      m.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.reason && m.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-2xs">
              <History className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Histórico de Movimentações
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Auditoria de entradas, saídas e ajustes de saldo
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

        {/* Filter bar */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por produto ou motivo..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('entrada')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filterType === 'entrada'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70 border border-emerald-200'
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setFilterType('saida')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filterType === 'saida'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100/70 border border-rose-200'
              }`}
            >
              Saídas
            </button>
            <button
              onClick={() => setFilterType('ajuste')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                filterType === 'ajuste'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100/70 border border-indigo-200'
              }`}
            >
              Ajustes
            </button>
          </div>
        </div>

        {/* Movement Table / Timeline */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Layers className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold text-slate-600">Nenhuma movimentação encontrada.</p>
              <p className="text-xs text-slate-400 mt-1">
                As entradas e saídas de produtos registradas aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const date = new Date(item.created_at);
                const formattedDate = new Intl.DateTimeFormat('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                }).format(date);

                const isEntrada = item.type === 'entrada';
                const isSaida = item.type === 'saida';

                return (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/70 px-2.5 rounded-xl transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Icon */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          isEntrada
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : isSaida
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        }`}
                      >
                        {isEntrada ? (
                          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                        ) : isSaida ? (
                          <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                      </div>

                      {/* Product Name & Reason */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {item.product_name}
                        </h4>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-semibold text-slate-700">
                            {item.reason || (isEntrada ? 'Entrada manual' : isSaida ? 'Saída manual' : 'Ajuste')}
                          </span>
                          <span>•</span>
                          <span className="flex items-center text-slate-400">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formattedDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity difference & Saldo */}
                    <div className="text-right">
                      <div
                        className={`text-xs sm:text-sm font-black ${
                          isEntrada
                            ? 'text-emerald-600'
                            : isSaida
                            ? 'text-rose-600'
                            : 'text-indigo-600'
                        }`}
                      >
                        {isEntrada ? `+${Math.abs(item.quantity_change)}` : isSaida ? `-${Math.abs(item.quantity_change)}` : `${item.quantity_change > 0 ? '+' : ''}${item.quantity_change}`}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        Saldo: <span className="font-bold text-slate-700">{item.previous_quantity} → {item.new_quantity}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            Total de <strong className="text-slate-800">{filtered.length}</strong> registro(s) listado(s)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
