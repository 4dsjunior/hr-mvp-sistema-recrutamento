#!/usr/bin/env python
# backend/app.py - Arquivo principal do Flask
"""
Sistema HR MVP - Backend Flask
Arquivo principal para inicializar o servidor Flask
"""

import os
import sys
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Adicionar o diretório atual ao Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

try:
    from app import create_app
    
    # Criar a aplicação Flask
    app = create_app()
    
    if __name__ == '__main__':
        print("🚀 Iniciando servidor Flask...")
        print("📍 Backend rodando em: http://localhost:5000")
        print("📋 API endpoints disponíveis:")
        print("   GET  /api/test - Teste de conexão")
        print("   GET  /api/candidates - Listar candidatos")
        print("   POST /api/candidates - Criar candidato")
        print("   GET  /api/jobs - Listar vagas")
        print("   POST /api/jobs - Criar vaga")
        print("   GET  /api/dashboard/metrics - Métricas do dashboard")
        print("🔄 Pressione Ctrl+C para parar o servidor")
        print("-" * 50)
        
        # Configurações do servidor
        host = os.getenv('FLASK_HOST', '127.0.0.1')
        port = int(os.getenv('FLASK_PORT', 5000))
        debug = os.getenv('FLASK_ENV', 'development') == 'development'
        
        app.run(
            host=host,
            port=port,
            debug=debug,
            threaded=True
        )
        
except ImportError as e:
    print("❌ ERRO: Não foi possível importar a aplicação Flask")
    print(f"   Detalhes: {e}")
    print("💡 Soluções:")
    print("   1. Verifique se o arquivo app/__init__.py existe")
    print("   2. Instale as dependências: pip install -r requirements.txt")
    print("   3. Ative o ambiente virtual: venv\\Scripts\\activate")
    sys.exit(1)
    
except Exception as e:
    print(f"❌ ERRO GERAL: {e}")
    print("💡 Verifique as configurações e dependências")
    sys.exit(1)