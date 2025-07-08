from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

def create_app():
    """Factory function para criar a aplicação Flask"""
    
    # Carregar variáveis de ambiente
    load_dotenv()
    
    # Criar instância do Flask
    app = Flask(__name__)
    
    # Configurações da aplicação
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['DEBUG'] = os.getenv('FLASK_ENV', 'development') == 'development'
    
    # Configurar CORS
    CORS(app, 
         origins=[
             "http://localhost:3000",  # React dev server
             "http://localhost:5173",  # Vite dev server
             "http://127.0.0.1:3000",
             "http://127.0.0.1:5173"
         ],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization']
    )
    
    # Registrar blueprints
    try:
        from app.routes import api
        app.register_blueprint(api, url_prefix='/api')
        print("✅ Blueprint API registrado com sucesso")
    except ImportError as e:
        print(f"❌ Erro ao importar rotas: {e}")
        raise
    
    # Rota de teste básica
    @app.route('/')
    def home():
        return {
            'message': 'HR MVP API está funcionando!',
            'version': '1.0.0',
            'status': 'ok'
        }
    
    # Handler de erro global
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Endpoint não encontrado'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Erro interno do servidor'}, 500
    
    print("✅ Aplicação Flask criada com sucesso")
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='127.0.0.1', port=5000)