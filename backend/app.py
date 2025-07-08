#!/usr/bin/env python3
"""
Sistema HR - MVP
Aplicação Principal Flask
"""

import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Criar aplicação Flask
app = Flask(__name__)

# Configurações
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['DEBUG'] = os.getenv('DEBUG', 'True').lower() == 'true'

# Configurar CORS
CORS(app, 
     origins=[
         "http://localhost:3000",
         "http://localhost:5173",
         "http://127.0.0.1:3000", 
         "http://127.0.0.1:5173"
     ],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization']
)

# Importar suas rotas do arquivo routes.py
from routes import api
app.register_blueprint(api, url_prefix='/api')

@app.route('/')
def index():
    """Endpoint raiz para verificação"""
    return {
        'message': 'Sistema HR - API funcionando!',
        'version': '1.0.0',
        'status': 'active',
        'endpoints': {
            'test': '/api/test',
            'candidates': '/api/candidates', 
            'jobs': '/api/jobs',
            'dashboard': '/api/dashboard/metrics'
        }
    }

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    host = os.getenv('FLASK_HOST', '127.0.0.1')
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    
    print("🚀 INICIANDO SISTEMA HR - MVP")
    print("============================")
    print(f"🌐 URL: http://{host}:{port}")
    print(f"🔧 Debug: {debug}")
    print(f"📡 API: http://{host}:{port}/api")
    print("============================")
    
    app.run(host=host, port=port, debug=debug)