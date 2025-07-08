from flask import Blueprint, request, jsonify
from supabase import create_client
import os
from datetime import datetime

api = Blueprint('api', __name__)

# Configuração Supabase
try:
    supabase = create_client(
        os.getenv('SUPABASE_URL'), 
        os.getenv('SUPABASE_KEY')
    )
    print("✅ Supabase conectado com sucesso")
except Exception as e:
    print(f"❌ Erro ao conectar Supabase: {e}")
    supabase = None

@api.route('/test', methods=['GET'])
def test_connection():
    """Teste de conexão da API"""
    try:
        if supabase:
            # Teste simples de conexão
            response = supabase.table('candidates').select('id').limit(1).execute()
            return jsonify({
                'message': 'API funcionando!', 
                'status': 'ok',
                'database': 'connected'
            })
        else:
            return jsonify({
                'message': 'API funcionando!', 
                'status': 'ok',
                'database': 'disconnected'
            }), 200
    except Exception as e:
        return jsonify({
            'message': 'API funcionando!', 
            'status': 'ok',
            'database': 'error',
            'error': str(e)
        }), 200

# =============================================================================
# CANDIDATES ENDPOINTS
# =============================================================================

@api.route('/candidates', methods=['GET'])
def get_candidates():
    """Listar todos os candidatos"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
            
        response = supabase.table('candidates').select('*').order('created_at', desc=True).execute()
        
        if response.data is None:
            return jsonify([])
            
        return jsonify(response.data)
    except Exception as e:
        print(f"❌ Erro ao buscar candidatos: {e}")
        return jsonify({'error': str(e)}), 500

@api.route('/candidates', methods=['POST'])
def create_candidate():
    """Criar novo candidato"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
            
        data = request.json
        
        # Validar campos obrigatórios
        required_fields = ['first_name', 'last_name', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        # Validar email único
        existing = supabase.table('candidates').select('id').eq('email', data['email']).execute()
        if existing.data:
            return jsonify({'error': 'Email já cadastrado'}), 400
        
        # Adicionar timestamps
        now = datetime.now().isoformat()
        data['created_at'] = now
        data['updated_at'] = now
        
        # Status padrão
        if 'status' not in data:
            data['status'] = 'active'
        
        # Limpar campos vazios
        data = {k: v for k, v in data.items() if v is not None and v != ''}
        
        response = supabase.table('candidates').insert(data).execute()
        
        if response.data:
            return jsonify(response.data[0]), 201
        else:
            return jsonify({'error': 'Erro ao criar candidato'}), 500
            
    except Exception as e:
        print(f"❌ Erro ao criar candidato: {e}")
        return jsonify({'error': str(e)}), 500
    
@api.route('/candidates/<int:candidate_id>', methods=['GET'])
def get_candidate(candidate_id):
    """Buscar candidato por ID"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
            
        response = supabase.table('candidates').select('*').eq('id', candidate_id).execute()
        
        if response.data:
            return jsonify(response.data[0])
        else:
            return jsonify({'error': 'Candidato não encontrado'}), 404
            
    except Exception as e:
        print(f"❌ Erro ao buscar candidato: {e}")
        return jsonify({'error': str(e)}), 500

@api.route('/candidates/<int:candidate_id>', methods=['PUT'])
def update_candidate(candidate_id):
    """Atualizar candidato"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
            
        data = request.json
        data['updated_at'] = datetime.now().isoformat()
        
        # Limpar campos vazios
        data = {k: v for k, v in data.items() if v is not None and v != ''}
        
        response = supabase.table('candidates').update(data).eq('id', candidate_id).execute()
        
        if response.data:
            return jsonify(response.data[0])
        else:
            return jsonify({'error': 'Candidato não encontrado'}), 404
            
    except Exception as e:
        print(f"❌ Erro ao atualizar candidato: {e}")
        return jsonify({'error': str(e)}), 500

@api.route('/candidates/<int:candidate_id>', methods=['DELETE'])
def delete_candidate(candidate_id):
    """Excluir candidato"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
            
        # Verificar se existe
        existing = supabase.table('candidates').select('id').eq('id', candidate_id).execute()
        if not existing.data:
            return jsonify({'error': 'Candidato não encontrado'}), 404
            
        response = supabase.table('candidates').delete().eq('id', candidate_id).execute()
        return '', 204
        
    except Exception as e:
        print(f"❌ Erro ao deletar candidato: {e}")
        return jsonify({'error': str(e)}), 500

@api.route('/candidates/search', methods=['GET'])
def search_candidates():
    """Buscar candidatos com filtros"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
            
        query = request.args.get('q', '').strip()
        status = request.args.get('status', '').strip()
        
        base_query = supabase.table('candidates').select('*')
        
        # Aplicar filtros
        if query:
            base_query = base_query.or_(
                f'first_name.ilike.%{query}%,'
                f'last_name.ilike.%{query}%,'
                f'email.ilike.%{query}%'
            )
        
        if status:
            base_query = base_query.eq('status', status)
            
        response = base_query.order('created_at', desc=True).execute()
        
        if response.data is None:
            return jsonify([])
            
        return jsonify(response.data)
        
    except Exception as e:
        print(f"❌ Erro ao buscar candidatos: {e}")
        return jsonify({'error': str(e)}), 500

# =============================================================================
# DASHBOARD METRICS
# =============================================================================

@api.route('/dashboard/metrics', methods=['GET'])
def get_dashboard_metrics():
    """Métricas do dashboard com dados reais do Supabase"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
        
        print("📊 Calculando métricas do dashboard...")
        
        # 1. TOTAL DE CANDIDATOS
        candidates_response = supabase.table('candidates').select('id, status, created_at').execute()
        total_candidates = len(candidates_response.data) if candidates_response.data else 0
        print(f"   Total de candidatos: {total_candidates}")
        
        # 2. VAGAS ATIVAS (se tabela jobs existir)
        active_jobs = 0
        try:
            jobs_response = supabase.table('jobs').select('id').eq('status', 'active').execute()
            active_jobs = len(jobs_response.data) if jobs_response.data else 0
            print(f"   Vagas ativas: {active_jobs}")
        except Exception as e:
            print(f"   ⚠️  Tabela jobs não encontrada: {e}")
            active_jobs = 0
        
        # 3. CANDIDATOS ESTE MÊS
        from datetime import datetime, timedelta
        try:
            # Primeiro dia do mês atual
            now = datetime.now()
            first_day = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            first_day_iso = first_day.isoformat()
            
            monthly_candidates = []
            if candidates_response.data:
                monthly_candidates = [
                    c for c in candidates_response.data 
                    if c.get('created_at') and c['created_at'] >= first_day_iso
                ]
            
            monthly_applications = len(monthly_candidates)
            print(f"   Candidatos este mês: {monthly_applications}")
            
        except Exception as e:
            print(f"   ⚠️  Erro ao calcular candidatos mensais: {e}")
            monthly_applications = 0
        
        # 4. CANDIDATOS POR STATUS
        status_counts = {
            'active': 0,
            'interviewed': 0,
            'approved': 0,
            'rejected': 0,
            'inactive': 0
        }
        
        if candidates_response.data:
            for candidate in candidates_response.data:
                status = candidate.get('status', 'active')
                if status in status_counts:
                    status_counts[status] += 1
                else:
                    status_counts['active'] += 1
        
        print(f"   Status counts: {status_counts}")
        
        # 5. TAXA DE CONVERSÃO (aprovados / total)
        approved_count = status_counts.get('approved', 0)
        conversion_rate = (approved_count / total_candidates * 100) if total_candidates > 0 else 0
        print(f"   Taxa de conversão: {conversion_rate:.1f}%")
        
        # 6. ENTREVISTAS PENDENTES
        pending_interviews = status_counts.get('interviewed', 0)
        print(f"   Entrevistas pendentes: {pending_interviews}")
        
        # 7. MONTAR RESPOSTA
        metrics = {
            'total_candidates': total_candidates,
            'active_jobs': active_jobs,
            'monthly_applications': monthly_applications,
            'conversion_rate': round(conversion_rate, 1),
            'pending_interviews': pending_interviews,
            'status_breakdown': status_counts,
            'last_updated': datetime.now().isoformat()
        }
        
        print(f"✅ Métricas calculadas: {metrics}")
        return jsonify(metrics)
        
    except Exception as e:
        print(f"❌ Erro ao calcular métricas: {e}")
        import traceback
        traceback.print_exc()
        
        # Retornar métricas vazias em caso de erro
        return jsonify({
            'total_candidates': 0,
            'active_jobs': 0,
            'monthly_applications': 0,
            'conversion_rate': 0.0,
            'pending_interviews': 0,
            'status_breakdown': {},
            'error': str(e),
            'last_updated': datetime.now().isoformat()
        }), 200  # Não retornar erro 500 para não quebrar o frontend

# =============================================================================
# JOBS ENDPOINTS
# =============================================================================

@api.route('/jobs', methods=['GET'])
def get_jobs():
    """Listar todas as vagas"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
            
        response = supabase.table('jobs').select('*').order('created_at', desc=True).execute()
        
        if response.data is None:
            return jsonify([])
        
        # Adicionar contagem de candidatos para cada vaga (se tabela applications existir)
        jobs_with_counts = []
        for job in response.data:
            job['candidates_count'] = 0  # Placeholder até implementarmos applications
            jobs_with_counts.append(job)
        
        return jsonify(jobs_with_counts)
    except Exception as e:
        print(f"❌ Erro ao buscar vagas: {e}")
        return jsonify({'error': str(e)}), 500

@api.route('/jobs', methods=['POST'])
def create_job():
    """Criar nova vaga"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
            
        data = request.json
        
        # Validar campos obrigatórios
        required_fields = ['title', 'description', 'location']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        # Adicionar timestamps e defaults
        now = datetime.now().isoformat()
        data['created_at'] = now
        data['updated_at'] = now
        
        # Valores padrão
        if 'status' not in data:
            data['status'] = 'active'
        if 'employment_type' not in data:
            data['employment_type'] = 'full-time'
        
        # Limpar campos vazios
        data = {k: v for k, v in data.items() if v is not None and v != ''}
        
        response = supabase.table('jobs').insert(data).execute()
        
        if response.data:
            job_data = response.data[0]
            job_data['candidates_count'] = 0  # Nova vaga sem candidatos
            return jsonify(job_data), 201
        else:
            return jsonify({'error': 'Erro ao criar vaga'}), 500
            
    except Exception as e:
        print(f"❌ Erro ao criar vaga: {e}")
        return jsonify({'error': str(e)}), 500

# =============================================================================
# HEALTH CHECK
# =============================================================================

@api.route('/health', methods=['GET'])
def health_check():
    """Verificação de saúde da API"""
    try:
        status = {
            'api': 'ok',
            'database': 'disconnected',
            'timestamp': datetime.now().isoformat()
        }
        
        if supabase:
            # Teste de conexão simples
            test_response = supabase.table('candidates').select('id').limit(1).execute()
            status['database'] = 'connected'
            status['candidates_count'] = len(test_response.data) if test_response.data else 0
        
        return jsonify(status)
        
    except Exception as e:
        return jsonify({
            'api': 'ok',
            'database': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

print("✅ Endpoints carregados com sucesso!")