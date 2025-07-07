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

# =============================================================================
# CANDIDATES ENDPOINTS
# =============================================================================

@api.route('/candidates', methods=['GET'])
def get_candidates():
    try:
        response = supabase.table('candidates').select('*').order('created_at', desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/candidates', methods=['POST'])
def create_candidate():
    try:
        data = request.json
        
        # Validar campos obrigatórios
        required_fields = ['first_name', 'last_name', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        # Adicionar timestamps
        if 'created_at' not in data:
            data['created_at'] = datetime.now().isoformat()
        data['updated_at'] = datetime.now().isoformat()
        
        # Status padrão
        if 'status' not in data:
            data['status'] = 'active'
        
        response = supabase.table('candidates').insert(data).execute()
        return jsonify(response.data[0]), 201
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
            return jsonify(response.data[0])
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
            base_query = base_query.or_(f'first_name.ilike.%{query}%,last_name.ilike.%{query}%,email.ilike.%{query}%')
        
        if status:
            base_query = base_query.eq('status', status)
            
        response = base_query.order('created_at', desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================================================
# JOBS ENDPOINTS - MILESTONE 3
# =============================================================================

@api.route('/jobs', methods=['GET'])
def get_jobs():
    """Listar todas as vagas"""
    try:
        response = supabase.table('jobs').select('*').order('created_at', desc=True).execute()
        
        # Adicionar contagem de candidatos para cada vaga
        jobs_with_counts = []
        for job in response.data:
            # Contar candidaturas para esta vaga
            applications_response = supabase.table('applications').select('id').eq('job_id', job['id']).execute()
            job['candidates_count'] = len(applications_response.data)
            jobs_with_counts.append(job)
        
        return jsonify(jobs_with_counts)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/jobs', methods=['POST'])
def create_job():
    """Criar nova vaga"""
    try:
        data = request.json
        
        # Validar campos obrigatórios
        required_fields = ['title', 'description', 'location']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        # Adicionar timestamps e defaults
        if 'created_at' not in data:
            data['created_at'] = datetime.now().isoformat()
        data['updated_at'] = datetime.now().isoformat()
        
        # Valores padrão
        if 'status' not in data:
            data['status'] = 'active'
        if 'employment_type' not in data:
            data['employment_type'] = 'full-time'
        
        response = supabase.table('jobs').insert(data).execute()
        
        # Adicionar contador de candidatos (0 para nova vaga)
        job_data = response.data[0]
        job_data['candidates_count'] = 0
        
        return jsonify(job_data), 201
    except Exception as e:
        print('Erro ao criar vaga:', e)  # <-- Adiciona log do erro no terminal
        return jsonify({'error': str(e)}), 500

@api.route('/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    """Buscar vaga por ID"""
    try:
        response = supabase.table('jobs').select('*').eq('id', job_id).execute()
        if response.data:
            job = response.data[0]
            
            # Adicionar contagem de candidatos
            applications_response = supabase.table('applications').select('id').eq('job_id', job_id).execute()
            job['candidates_count'] = len(applications_response.data)
            
            return jsonify(job)
        return jsonify({'error': 'Vaga não encontrada'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/jobs/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    """Atualizar vaga"""
    try:
        data = request.json
        data['updated_at'] = datetime.now().isoformat()
        
        response = supabase.table('jobs').update(data).eq('id', job_id).execute()
        if response.data:
            job = response.data[0]
            
            # Adicionar contagem de candidatos
            applications_response = supabase.table('applications').select('id').eq('job_id', job_id).execute()
            job['candidates_count'] = len(applications_response.data)
            
            return jsonify(job)
        return jsonify({'error': 'Vaga não encontrada'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    """Excluir vaga"""
    try:
        # Verificar se há candidaturas para esta vaga
        applications_response = supabase.table('applications').select('id').eq('job_id', job_id).execute()
        if applications_response.data:
            return jsonify({'error': 'Não é possível excluir vaga com candidaturas'}), 400
        
        response = supabase.table('jobs').delete().eq('id', job_id).execute()
        return '', 204
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/jobs/search', methods=['GET'])
def search_jobs():
    """Buscar vagas com filtros"""
    try:
        query = request.args.get('q', '')
        status = request.args.get('status', '')
        department = request.args.get('department', '')
        employment_type = request.args.get('employment_type', '')
        
        base_query = supabase.table('jobs').select('*')
        
        if query:
            base_query = base_query.or_(f'title.ilike.%{query}%,description.ilike.%{query}%')
        
        if status:
            base_query = base_query.eq('status', status)
            
        if department:
            base_query = base_query.eq('department', department)
            
        if employment_type:
            base_query = base_query.eq('employment_type', employment_type)
            
        response = base_query.order('created_at', desc=True).execute()
        
        # Adicionar contagem de candidatos
        jobs_with_counts = []
        for job in response.data:
            applications_response = supabase.table('applications').select('id').eq('job_id', job['id']).execute()
            job['candidates_count'] = len(applications_response.data)
            jobs_with_counts.append(job)
        
        return jsonify(jobs_with_counts)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/jobs/departments', methods=['GET'])
def get_departments():
    """Listar departamentos únicos"""
    try:
        response = supabase.table('jobs').select('department').execute()
        departments = list(set([job['department'] for job in response.data if job.get('department')]))
        return jsonify(sorted(departments))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/jobs/<int:job_id>/stats', methods=['GET'])
def get_job_stats(job_id):
    """Obter estatísticas de uma vaga"""
    try:
        # Total de candidaturas
        applications_response = supabase.table('applications').select('*').eq('job_id', job_id).execute()
        total_applications = len(applications_response.data)
        
        # Candidaturas por status
        status_count = {}
        for app in applications_response.data:
            status = app.get('status', 'applied')
            status_count[status] = status_count.get(status, 0) + 1
        
        # Candidaturas por etapa
        stage_count = {}
        for app in applications_response.data:
            stage = app.get('current_stage', 1)
            stage_count[f'stage_{stage}'] = stage_count.get(f'stage_{stage}', 0) + 1
        
        # Última candidatura
        last_application = None
        if applications_response.data:
            last_application = max(applications_response.data, key=lambda x: x['applied_at'])['applied_at']
        
        return jsonify({
            'job_id': job_id,
            'total_applications': total_applications,
            'by_status': status_count,
            'by_stage': stage_count,
            'last_application': last_application
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# =============================================================================
# DASHBOARD METRICS - ÚNICA VERSÃO
# =============================================================================

@api.route('/dashboard/metrics', methods=['GET'])
def get_dashboard_metrics():
    """Métricas do dashboard incluindo vagas"""
    try:
        # Total de candidatos
        candidates_response = supabase.table('candidates').select('id').execute()
        total_candidates = len(candidates_response.data)
        
        # Vagas ativas
        active_jobs_response = supabase.table('jobs').select('id').eq('status', 'active').execute()
        active_jobs = len(active_jobs_response.data)
        
        # Candidaturas este mês
        from datetime import datetime, timedelta
        first_day = datetime.now().replace(day=1).isoformat()
        applications_response = supabase.table('applications').select('id').gte('applied_at', first_day).execute()
        monthly_applications = len(applications_response.data)
        
        # Taxa de conversão
        hired_response = supabase.table('applications').select('id').eq('status', 'hired').execute()
        conversion_rate = (len(hired_response.data) / total_candidates * 100) if total_candidates > 0 else 0
        
        # Entrevistas pendentes
        pending_interviews_response = supabase.table('applications').select('id').in_('current_stage', [5, 6, 7]).execute()
        pending_interviews = len(pending_interviews_response.data)
        
        return jsonify({
            'total_candidates': total_candidates,
            'active_jobs': active_jobs,
            'monthly_applications': monthly_applications,
            'conversion_rate': round(conversion_rate, 1),
            'pending_interviews': pending_interviews
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

print("✅ Todos os endpoints carregados com sucesso!")