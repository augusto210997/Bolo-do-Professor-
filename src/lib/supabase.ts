import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'stock_supabase_url';
const STORAGE_KEY_KEY = 'stock_supabase_key';

export function getStoredSupabaseConfig(): { url: string; key: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem(STORAGE_KEY_URL);
  const storedKey = localStorage.getItem(STORAGE_KEY_KEY);

  const url = (storedUrl && storedUrl.trim() !== '') 
    ? storedUrl.trim() 
    : (envUrl.trim() !== '' && !envUrl.includes('your-project') ? envUrl.trim() : '');

  const key = (storedKey && storedKey.trim() !== '') 
    ? storedKey.trim() 
    : (envKey.trim() !== '' && !envKey.includes('your-anon') ? envKey.trim() : '');

  return { url, key };
}

export function saveStoredSupabaseConfig(url: string, key: string): void {
  if (url.trim()) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
  }

  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_KEY);
  }

  // Clear cached client
  currentClient = null;
}

let currentClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (currentClient) return currentClient;

  const { url, key } = getStoredSupabaseConfig();
  if (!url || !key) return null;

  try {
    currentClient = createClient(url, key, {
      auth: { persistSession: true },
    });
    return currentClient;
  } catch (error) {
    console.error('Falha ao inicializar cliente Supabase:', error);
    return null;
  }
}

export async function testSupabaseConnection(url?: string, key?: string): Promise<{ success: boolean; message: string; details?: string }> {
  const targetUrl = url || getStoredSupabaseConfig().url;
  const targetKey = key || getStoredSupabaseConfig().key;

  if (!targetUrl || !targetKey) {
    return {
      success: false,
      message: 'URL e Chave Anônima do Supabase não fornecidas.',
    };
  }

  try {
    const testClient = createClient(targetUrl, targetKey);
    // Tenta consultar a tabela products
    const { error } = await testClient.from('products').select('id').limit(1);

    if (error) {
      // If table doesn't exist yet (code 42P01 in Postgres or message contains relation does not exist)
      if (error.message && (error.message.includes('relation') || error.message.includes('does not exist') || error.code === '42P01')) {
        return {
          success: true,
          message: 'Conectado ao Supabase! A tabela "products" ainda não foi criada. Execute o script SQL fornecido.',
          details: 'table_missing',
        };
      }
      return {
        success: false,
        message: `Erro na resposta do Supabase: ${error.message}`,
      };
    }

    return {
      success: true,
      message: 'Conexão com o Supabase estabelecida com sucesso e tabelas detectadas!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha na conexão: ${err.message || 'Verifique se a URL e a Chave estão corretas.'}`,
    };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS E STORAGE (SUPABASE)
-- Execute este script no SQL Editor do seu painel Supabase
-- ========================================================

-- 1. Criação da Tabela de Produtos
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT,
    category TEXT NOT NULL DEFAULT 'Geral',
    quantity NUMERIC NOT NULL DEFAULT 0,
    min_quantity NUMERIC NOT NULL DEFAULT 0,
    unit_price NUMERIC DEFAULT 0,
    unit TEXT DEFAULT 'un',
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criação da Tabela de Movimentações de Estoque (Histórico de Entradas / Saídas)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('entrada', 'saida', 'ajuste')),
    quantity_change NUMERIC NOT NULL,
    previous_quantity NUMERIC NOT NULL,
    new_quantity NUMERIC NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Criação da Tabela de Categorias Customizadas
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Inserir algumas categorias padrão
INSERT INTO public.categories (name) VALUES 
    ('Alimentos'),
    ('Bebidas'),
    ('Eletrônicos'),
    ('Limpeza'),
    ('Papelaria'),
    ('Ferramentas'),
    ('Vestuário'),
    ('Outros')
ON CONFLICT (name) DO NOTHING;

-- 5. Habilitar Row Level Security (RLS) com políticas de acesso completo
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acesso completo a produtos" 
ON public.products FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Permitir acesso completo a movimentacoes" 
ON public.stock_movements FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Permitir acesso completo a categorias" 
ON public.categories FOR ALL 
USING (true) 
WITH CHECK (true);

-- 6. Configuração do Storage (Bucket de Armazenamento para Arquivos/Imagens de Estoque)
INSERT INTO storage.buckets (id, name, public)
VALUES ('inventory-storage', 'inventory-storage', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Segurança do Storage (storage.objects)
CREATE POLICY "Permitir leitura pública de arquivos de estoque" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'inventory-storage');

CREATE POLICY "Permitir upload de arquivos de estoque" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'inventory-storage');

CREATE POLICY "Permitir atualização de arquivos de estoque" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'inventory-storage')
WITH CHECK (bucket_id = 'inventory-storage');

CREATE POLICY "Permitir exclusão de arquivos de estoque" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'inventory-storage');

-- 7. Habilitar Realtime para atualizações instantâneas
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_movements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
`;
