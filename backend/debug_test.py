#!/usr/bin/env python3
"""
Script de Debug - Sistema HR
Diagnosticar problemas de conexão e configuração
"""

import os
from dotenv import load_dotenv
from supabase import create_client
import traceback

def debug_environment():
    """Verificar variáveis de ambiente"""
    print("🔍 VERIFICANDO AMBIENTE...")
    print("=" * 50)
    
    # Carregar .env
    load_dotenv()
    
    # Verificar variáveis críticas
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    print(f"SUPABASE_URL: {supabase_url}")
    print(f"SUPABASE_KEY: {supabase_key[:20] + '...' if supabase_key else 'AUSENTE'}")
    print(f"FLASK_PORT: {os.getenv('FLASK_PORT', '5000')}")
    print(f"DEBUG: {os.getenv('DEBUG', 'False')}")
    
    if not supabase_url or not supabase_key:
        print("❌ ERRO: Variáveis de ambiente não configuradas!")
        return False
    
    return True, supabase_url, supabase_key

def test_supabase_connection(url, key):
    """Testar conexão com Supabase"""
    print("\n🔗 TESTANDO CONEXÃO SUPABASE...")
    print("=" * 50)
    
    try:
        # Criar cliente
        supabase = create_client(url, key)
        print("✅ Cliente Supabase criado")
        
        # Testar tabela candidates
        print("🔍 Testando tabela 'candidates'...")
        response = supabase.table('candidates').select('*').limit(1).execute()
        print(f"✅ Tabela acessível, registros: {len(response.data)}")
        
        # Tentar inserir dados de teste
        print("🧪 Testando inserção...")
        test_data = {
            'first_name': 'DEBUG',
            'last_name': 'TEST',
            'email': 'debug.test@example.com',
            'status': 'new'
        }
        
        # Verificar se email já existe
        existing = supabase.table('candidates').select('id').eq('email', test_data['email']).execute()
        if existing.data:
            print("⚠️ Email de teste já existe, usando outro...")
            test_data['email'] = f'debug.test.{hash(test_data["email"]) % 10000}@example.com'
        
        insert_response = supabase.table('candidates').insert(test_data).execute()
        
        if insert_response.data:
            print(f"✅ Inserção bem-sucedida: ID {insert_response.data[0]['id']}")
            
            # Limpar dados de teste
            candidate_id = insert_response.data[0]['id']
            supabase.table('candidates').delete().eq('id', candidate_id).execute()
            print("🧹 Dados de teste removidos")
            
            return True
        else:
            print("❌ Falha na inserção")
            return False
            
    except Exception as e:
        print(f"❌ ERRO na conexão: {e}")
        traceback.print_exc()
        return False

def test_validation():
    """Testar validações"""
    print("\n🧪 TESTANDO VALIDAÇÕES...")
    print("=" * 50)
    
    # Teste de email inválido
    invalid_emails = ['teste', 'teste@', '@email.com', 'teste@.com']
    
    import re
    def validate_email(email):
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    for email in invalid_emails:
        is_valid = validate_email(email)
        print(f"Email: '{email}' -> {'❌ Inválido' if not is_valid else '✅ Válido'}")
    
    # Teste de email válido
    valid_email = 'teste@email.com'
    is_valid = validate_email(valid_email)
    print(f"Email: '{valid_email}' -> {'✅ Válido' if is_valid else '❌ Inválido'}")

def main():
    """Executar todos os testes"""
    print("🚀 INICIANDO DEBUG DO BACKEND")
    print("=" * 60)
    
    # 1. Verificar ambiente
    env_ok = debug_environment()
    if not env_ok:
        print("\n❌ FALHA: Configure as variáveis de ambiente no arquivo .env")
        return
    
    url, key = env_ok[1], env_ok[2]
    
    # 2. Testar conexão
    connection_ok = test_supabase_connection(url, key)
    if not connection_ok:
        print("\n❌ FALHA: Problema na conexão com Supabase")
        return
    
    # 3. Testar validações
    test_validation()
    
    print("\n🎉 DEBUG CONCLUÍDO!")
    print("=" * 60)
    print("✅ Ambiente configurado corretamente")
    print("✅ Supabase funcionando")
    print("✅ Validações operacionais")
    print("\n🔧 Se ainda houver erros, verifique:")
    print("   - Logs detalhados no terminal do Flask")
    print("   - Permissões RLS no Supabase")
    print("   - Estrutura da tabela 'candidates'")

if __name__ == "__main__":
    main()