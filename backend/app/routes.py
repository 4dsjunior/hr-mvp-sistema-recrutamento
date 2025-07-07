// 1. CORREÇÃO: backend/app/routes.py - Ajustar formato de resposta
from flask import Blueprint, request, jsonify
from supabase import create_client
import os
from datetime import datetime

api = Blueprint('api', __name__)

# Configuração Supabase
supabase = create_client(
    os.getenv('SUPABASE_URL'), 
    os.getenv('SUPABASE_KEY')
)

@api.route('/test', methods=['GET'])
def test_connection():
    return jsonify({'message': 'API funcionando!', 'status': 'ok'})

# CORRIGIDO: Candidates endpoints com formato consistente
@api.route('/candidates', methods=['GET'])
def get_candidates():
    try:
        response = supabase.table('candidates').select('*').order('created_at', desc=True).execute()
        return jsonify(response.data)  # Retorna array direto
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/candidates', methods=['POST'])
def create_candidate():
    try:
        data = request.json
        # Adicionar timestamp se não existir
        if 'created_at' not in data:
            data['created_at'] = datetime.now().isoformat()
        data['updated_at'] = datetime.now().isoformat()
        
        response = supabase.table('candidates').insert(data).execute()
        return jsonify(response.data[0]), 201  # Retorna primeiro item
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
        data['updated_at'] = datetime.now().isoformat()
        response = supabase.table('candidates').update(data).eq('id', candidate_id).execute()
        if response.data:
            return jsonify(response.data[0])  # Retorna primeiro item
        return jsonify({'error': 'Candidato não encontrado'}), 404
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

# 2. NOVO: Endpoint para métricas do dashboard
@api.route('/dashboard/metrics', methods=['GET'])
def get_dashboard_metrics():
    try:
        # Total de candidatos
        candidates_response = supabase.table('candidates').select('id').execute()
        total_candidates = len(candidates_response.data)
        
        # Vagas ativas (adicionar quando criar tabela jobs)
        active_jobs = 8  # Mock por enquanto
        
        # Candidaturas este mês
        from datetime import datetime, timedelta
        first_day = datetime.now().replace(day=1).isoformat()
        monthly_applications = total_candidates  # Simplificado
        
        # Taxa de conversão mock
        conversion_rate = 23.5
        
        return jsonify({
            'total_candidates': total_candidates,
            'active_jobs': active_jobs,
            'monthly_applications': monthly_applications,
            'conversion_rate': conversion_rate
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500