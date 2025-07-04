from flask import Blueprint, request, jsonify
from supabase import create_client
import os

api = Blueprint('api', __name__)

# Configuração Supabase
supabase = create_client(
    os.getenv('SUPABASE_URL'), 
    os.getenv('SUPABASE_KEY')
)

@api.route('/test', methods=['GET'])
def test_connection():
    return jsonify({'message': 'API funcionando!', 'status': 'ok'})

# Candidates endpoints
@api.route('/candidates', methods=['GET'])
def get_candidates():
    try:
        response = supabase.table('candidates').select('*').execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/candidates', methods=['POST'])
def create_candidate():
    try:
        data = request.json
        response = supabase.table('candidates').insert(data).execute()
        return jsonify(response.data), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500