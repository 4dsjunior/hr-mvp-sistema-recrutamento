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
    
@api.route('/candidates/<int:candidate_id>', methods=['GET'])
def get_candidate(candidate_id):
    try:
        response = supabase.table('candidates').select('*').eq('id', candidate_id).execute()
        if response.data:
            return jsonify(response.data[0])
        return jsonify({'error': 'Candidato não encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/candidates/<int:candidate_id>', methods=['PUT'])
def update_candidate(candidate_id):
    try:
        data = request.json
        data['updated_at'] = 'now()'
        response = supabase.table('candidates').update(data).eq('id', candidate_id).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/candidates/<int:candidate_id>', methods=['DELETE'])
def delete_candidate(candidate_id):
    try:
        response = supabase.table('candidates').delete().eq('id', candidate_id).execute()
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/candidates/search', methods=['GET'])
def search_candidates():
    try:
        query = request.args.get('q', '')
        status = request.args.get('status', '')
        
        base_query = supabase.table('candidates').select('*')
        
        if query:
            # Busca por nome ou email
            base_query = base_query.or_(f'first_name.ilike.%{query}%,last_name.ilike.%{query}%,email.ilike.%{query}%')
        
        if status:
            base_query = base_query.eq('status', status)
            
        response = base_query.order('created_at', desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500