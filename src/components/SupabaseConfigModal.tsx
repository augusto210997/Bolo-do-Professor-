import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  UploadCloud,
  Code
} from 'lucide-react';
import { 
  getStoredSupabaseConfig, 
  saveStoredSupabaseConfig, 
  testSupabaseConnection, 
  SUPABASE_SQL_SCHEMA 
} from '../lib/supabase';
import { inventoryService } from '../services/inventoryService';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionUpdated: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConnectionUpdated,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [showSqlCode, setShowSqlCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.key);
      setTestResult(null);
      setSyncResult(null);
      setCopiedSql(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testSupabaseConnection(url.trim(), anonKey.trim());
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Erro inesperado ao testar conexão.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = async () => {
    saveStoredSupabaseConfig(url, anonKey);
    await handleTestConnection();
    onConnectionUpdated();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await inventoryService.syncLocalToSupabase();
      if (res.error) {
        setSyncResult(`Falha na sincronização: ${res.error}`);
      } else {
        setSyncResult(`Sucesso! ${res.count} produtos sincronizados com o Supabase.`);
        onConnectionUpdated();
      }
    } catch (err: any) {
      setSyncResult(`Erro ao sincronizar: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-2xs">
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Conexão Supabase
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Conecte seu projeto Supabase para persistência remota e em tempo real
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4.5 flex-1">
          {/* Quick instructions banner */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200/70 rounded-xl text-xs text-emerald-950 space-y-2">
            <div className="flex items-center font-bold text-emerald-900 space-x-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Como conectar seu Supabase em 3 passos rápidos:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-emerald-900/90 text-[11px] leading-relaxed">
              <li>Crie um projeto gratuito no <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-950 hover:text-emerald-700">supabase.com</a>.</li>
              <li>Acesse o <strong>SQL Editor</strong> do seu Supabase e execute o script SQL do botão abaixo.</li>
              <li>Copie a <strong>Project URL</strong> e a <strong>anon public API Key</strong> (em Project Settings &gt; API) e cole abaixo.</li>
            </ol>
          </div>

          {/* Credentials Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Project URL (Supabase URL)
              </label>
              <input
                id="supabase-url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo-seu-projeto.supabase.co"
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-hidden transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Anon Public Key (Chave Anônima)
              </label>
              <input
                id="supabase-key-input"
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-hidden transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs font-medium flex items-start space-x-2.5 ${
              testResult.success 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{testResult.message}</p>
                {testResult.details === 'table_missing' && (
                  <p className="mt-1 text-slate-600">
                    Clique no botão abaixo para copiar o script SQL e cole-o no SQL Editor do seu Supabase para criar as tabelas necessárias.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons for Supabase Config */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              id="save-supabase-config-btn"
              onClick={handleSaveConfig}
              disabled={isTesting}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Testando Conexão...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Salvar &amp; Conectar</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopySql}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  <span className="text-emerald-700 font-bold">Script SQL Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar Script SQL</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowSqlCode(!showSqlCode)}
              className="px-3 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Code className="w-3.5 h-3.5 text-slate-400" />
              <span>{showSqlCode ? 'Ocultar SQL' : 'Visualizar SQL'}</span>
            </button>
          </div>

          {/* Optional SQL Viewer */}
          {showSqlCode && (
            <div className="relative bg-slate-950 text-emerald-400 p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800 shadow-inner">
              <pre>{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          )}

          {/* Sync Local Data to Supabase */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                  Sincronizar Dados Existentes
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Transfira produtos cadastrados em modo local para o banco Supabase
                </p>
              </div>
              <button
                id="sync-to-supabase-btn"
                onClick={handleSyncData}
                disabled={isSyncing || !url || !anonKey}
                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer shrink-0"
              >
                <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isSyncing ? 'Sincronizando...' : 'Enviar para o Supabase'}</span>
              </button>
            </div>
            {syncResult && (
              <p className="text-xs font-semibold text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                {syncResult}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 flex justify-end">
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
