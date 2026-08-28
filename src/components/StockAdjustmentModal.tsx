import React, { useState, useEffect } from 'react';
import { Product, MovementType } from '../types';
import { X, Plus, Minus, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirmAdjustment: (
    productId: string,
    amount: number,
    type: MovementType,
    reason: string
  ) => Promise<void>;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirmAdjustment,
}) => {
  const [type, setType] = useState<MovementType>('entrada');
  const [amount, setAmount] = useState<number | ''>(1);
  const [reason, setReason] = useState('Reposição de estoque');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (product) {
      setType('entrada');
      setAmount(1);
      setReason('Reposição de estoque');
      setCustomReason('');
      setErrorMsg('');
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const currentQty = Number(product.quantity) || 0;
  const adjustAmount = amount === '' ? 0 : Number(amount);

  let newQty = currentQty;
  if (type === 'entrada') {
    newQty = currentQty + adjustAmount;
  } else if (type === 'saida') {
    newQty = Math.max(0, currentQty - adjustAmount);
  } else if (type === 'ajuste') {
    newQty = Math.max(0, adjustAmount);
  }

  const isBelowMin = newQty <= product.min_quantity && newQty > 0;
  const isZero = newQty === 0;

  const handleReasonPreset = (r: string) => {
    setReason(r);
    setCustomReason('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === '' || adjustAmount <= 0 && type !== 'ajuste') {
      setErrorMsg('Informe uma quantidade válida para a movimentação.');
      return;
    }

    if (type === 'saida' && adjustAmount > currentQty) {
      setErrorMsg(`A quantidade de saída (${adjustAmount}) não pode ser maior que o saldo atual (${currentQty}).`);
      return;
    }

    const finalReason = customReason.trim() ? customReason.trim() : reason;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await onConfirmAdjustment(product.id, adjustAmount, type, finalReason);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao movimentar estoque.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Movimentar Estoque
            </h2>
            <p className="text-xs text-slate-500 truncate max-w-xs font-semibold">
              {product.name}
            </p>
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
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Stock Banner */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                Estoque Atual
              </span>
              <span className="text-xl font-black text-slate-900">
                {currentQty} {product.unit || 'un'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                Estoque Mínimo
              </span>
              <span className="text-xs font-bold text-slate-700">
                {product.min_quantity} {product.unit || 'un'}
              </span>
            </div>
          </div>

          {/* Type Selector (Entrada, Saída, Ajuste) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tipo de Movimentação
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="adjust-type-entrada"
                onClick={() => {
                  setType('entrada');
                  setReason('Reposição de estoque');
                }}
                className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                  type === 'entrada'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/15'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Plus className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span>Entrada (+)</span>
              </button>

              <button
                type="button"
                id="adjust-type-saida"
                onClick={() => {
                  setType('saida');
                  setReason('Venda / Saída regular');
                }}
                className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                  type === 'saida'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/15'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Minus className="w-4 h-4 text-rose-600 stroke-[2.5]" />
                <span>Saída (-)</span>
              </button>

              <button
                type="button"
                id="adjust-type-ajuste"
                onClick={() => {
                  setType('ajuste');
                  setAmount(currentQty);
                  setReason('Ajuste de inventário / Balanço');
                }}
                className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                  type === 'ajuste'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/15'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <RefreshCw className="w-4 h-4 text-indigo-600 stroke-[2.5]" />
                <span>Ajuste Direto</span>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {type === 'ajuste' ? 'Novo Saldo Real' : 'Quantidade a Movimentar'} ({product.unit || 'un'})
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="adjust-amount-input"
                type="number"
                min={type === 'ajuste' ? '0' : '1'}
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="1"
                className="flex-1 px-4 py-2.5 text-base font-black border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden bg-slate-50/50 focus:bg-white transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* New Resulting Quantity Box */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            isZero
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : isBelowMin
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                Novo Saldo Resultante
              </span>
              <span className="text-lg font-black tracking-tight">
                {newQty} {product.unit || 'un'}
              </span>
            </div>
            <div className="text-right text-xs font-semibold">
              {isZero ? (
                <span className="text-rose-700 font-bold">Ficará Esgotado!</span>
              ) : isBelowMin ? (
                <span className="text-amber-700 font-bold">Abaixo do Mínimo ({product.min_quantity})</span>
              ) : (
                <span className="text-emerald-700 font-bold">Estoque Regular</span>
              )}
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Motivo / Observação
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {type === 'entrada' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleReasonPreset('Reposição de estoque')}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                      reason === 'Reposição de estoque' && !customReason ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Reposição
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReasonPreset('Compra / Pedido de Fornecedor')}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                      reason === 'Compra / Pedido de Fornecedor' && !customReason ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Compra
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReasonPreset('Devolução de Cliente')}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                      reason === 'Devolução de Cliente' && !customReason ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Devolução
                  </button>
                </>
              )}

              {type === 'saida' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleReasonPreset('Venda / Saída regular')}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                      reason === 'Venda / Saída regular' && !customReason ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Venda
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReasonPreset('Consumo Interno / Uso')}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                      reason === 'Consumo Interno / Uso' && !customReason ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Uso Interno
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReasonPreset('Perda / Avaria / Vencimento')}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                      reason === 'Perda / Avaria / Vencimento' && !customReason ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Perda/Avaria
                  </button>
                </>
              )}

              {type === 'ajuste' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleReasonPreset('Ajuste de inventário / Balanço')}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                      reason === 'Ajuste de inventário / Balanço' && !customReason ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Inventário Físico
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReasonPreset('Correção de contagem')}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                      reason === 'Correção de contagem' && !customReason ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Correção de Erro
                  </button>
                </>
              )}
            </div>

            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Ou digite um motivo específico..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-hidden bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs"
            >
              Cancelar
            </button>
            <button
              id="adjust-confirm-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-xs font-bold text-white rounded-lg shadow-xs disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer transition-all ${
                type === 'entrada'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : type === 'saida'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Gravando...' : 'Confirmar Movimentação'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
