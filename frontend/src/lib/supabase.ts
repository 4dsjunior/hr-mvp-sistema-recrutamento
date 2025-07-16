// 🔧 MELHORIA: supabase.ts - Cliente Supabase Melhorado
// Arquivo: frontend/src/lib/supabase.ts (SUBSTITUIR o existente)

import { createClient } from '@supabase/supabase-js';

// Configuração das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug de configuração (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔧 Configurando Supabase...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'AUSENTE');
}

// Validação das variáveis
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis de ambiente do Supabase não configuradas!');
  console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
  throw new Error('Supabase não configurado. Verifique as variáveis de ambiente.');
}

// Criar cliente Supabase com configurações otimizadas
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
    storage: window.sessionStorage, // ✅ MUDANÇA: sessionStorage ao invés de localStorage
    storageKey: 'supabase.auth.token',
    debug: import.meta.env.DEV
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'hr-mvp-frontend'
    }
  }
});

// Log de sucesso apenas em desenvolvimento
if (import.meta.env.DEV) {
  console.log('✅ Cliente Supabase criado com sucesso');
}