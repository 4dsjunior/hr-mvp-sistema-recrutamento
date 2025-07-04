import { supabase } from './lib/supabase.js'

// Função para testar autenticação
export async function testAuth() {
  console.log('🧪 === INICIANDO TESTES DE AUTENTICAÇÃO ===')
  
  try {
    // Teste 1: Verificar se cliente foi criado
    console.log('✅ TESTE 1: Cliente Supabase criado:', !!supabase)
    
    if (supabase.supabaseUrl) {
      console.log('   URL:', supabase.supabaseUrl)
      console.log('   Key:', supabase.supabaseKey.substring(0, 20) + '...')
    }
    
    // Teste 2: Tentar buscar sessão atual
    console.log('🔍 TESTE 2: Verificando sessão atual...')
    const { data: session, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('❌ Erro ao buscar sessão:', sessionError.message)
    } else {
      console.log('✅ Sessão obtida:', session?.session ? 'Usuário logado' : 'Nenhum usuário logado')
    }
    
    // Teste 3: Verificar se consegue acessar tabela candidates
    console.log('🔍 TESTE 3: Testando acesso ao banco de dados...')
    const { data, error: dbError } = await supabase
      .from('candidates')
      .select('count')
      .limit(1)
    
    if (dbError) {
      console.log('❌ Erro no banco:', dbError.message)
      if (dbError.message.includes('RLS') || dbError.message.includes('policy')) {
        console.log('💡 Dica: Erro de RLS é normal sem autenticação')
      }
    } else {
      console.log('✅ Banco acessível! Dados:', data)
    }
    
    console.log('🎉 === TESTES CONCLUÍDOS ===')
    
  } catch (error) {
    console.log('❌ ERRO GERAL:', error.message)
  }
}

// Auto-executar
console.log('🚀 Módulo de teste carregado, executando testes...')
testAuth()