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
    """Listar todos os candidatos com suporte a filtros básicos"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
        
        # Parâmetros de consulta
        search = request.args.get('search', '').strip()
        status = request.args.get('status', '').strip()
        
        print(f"📊 GET /candidates - Search: '{search}', Status: '{status}'")
        
        # Query base - sempre buscar todos primeiro
        response = supabase.table('candidates').select('*').order('created_at', desc=True).execute()
        
        if response.data is None:
            print("⚠️ Nenhum dado retornado do Supabase")
            return jsonify([])
        
        # Filtrar no Python se necessário (mais compatível)
        filtered_data = response.data
        
        if search:
            search_lower = search.lower()
            filtered_data = [
                candidate for candidate in filtered_data
                if (
                    search_lower in candidate.get('first_name', '').lower() or
                    search_lower in candidate.get('last_name', '').lower() or
                    search_lower in candidate.get('email', '').lower()
                )
            ]
        
        if status and status != 'all':
            filtered_data = [
                candidate for candidate in filtered_data
                if candidate.get('status') == status
            ]
        
        result_count = len(filtered_data)
        print(f"✅ {result_count} candidatos retornados")
        
        return jsonify(filtered_data)
        
    except Exception as e:
        print(f"❌ Erro ao buscar candidatos: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# SUBSTITUIR APENAS estas 4 funções no routes.py:

@api.route('/candidates', methods=['POST'])
def create_candidate():
    """Criar novo candidato"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
            
        data = request.json
        print(f"➕ Criando candidato: {data}")
        
        # Validar campos obrigatórios
        required_fields = ['first_name', 'last_name', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        # Validar email único - ABORDAGEM MAIS ROBUSTA
        email = data['email']
        print(f"🔍 Verificando email único: {email}")
        
        try:
            # Buscar todos e filtrar no Python para evitar erro de sintaxe
            all_candidates = supabase.table('candidates').select('id, email').execute()
            
            if all_candidates.data:
                for candidate in all_candidates.data:
                    if candidate.get('email') == email:
                        print(f"⚠️ Email {email} já existe")
                        return jsonify({'error': 'Email já cadastrado'}), 400
        except Exception as e:
            print(f"⚠️ Erro ao verificar email único: {e}")
            # Continua mesmo com erro na verificação
        
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
        
        if response.data and len(response.data) > 0:
            print(f"✅ Candidato criado: {response.data[0].get('email')}")
            return jsonify(response.data[0]), 201
        else:
            print("❌ Erro ao criar candidato - sem dados retornados")
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
        
        print(f"🔍 Buscando candidato ID: {candidate_id}")
        
        # ABORDAGEM MAIS ROBUSTA: Buscar todos e filtrar no Python
        response = supabase.table('candidates').select('*').execute()
        
        if response.data:
            # Filtrar por ID no Python
            found_candidate = None
            for candidate in response.data:
                if candidate.get('id') == candidate_id:
                    found_candidate = candidate
                    break
            
            if found_candidate:
                print(f"✅ Candidato encontrado: {found_candidate.get('email')}")
                return jsonify(found_candidate)
            else:
                print(f"⚠️ Candidato ID {candidate_id} não encontrado")
                return jsonify({'error': 'Candidato não encontrado'}), 404
        else:
            print(f"⚠️ Nenhum candidato encontrado na base")
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
        print(f"📝 Atualizando candidato ID: {candidate_id} com dados: {data}")
        
        # Primeiro, verificar se candidato existe
        all_candidates = supabase.table('candidates').select('*').execute()
        
        candidate_exists = False
        if all_candidates.data:
            for candidate in all_candidates.data:
                if candidate.get('id') == candidate_id:
                    candidate_exists = True
                    break
        
        if not candidate_exists:
            print(f"⚠️ Candidato ID {candidate_id} não encontrado")
            return jsonify({'error': 'Candidato não encontrado'}), 404
        
        # Adicionar timestamp de atualização
        data['updated_at'] = datetime.now().isoformat()
        
        # Limpar campos vazios
        data = {k: v for k, v in data.items() if v is not None and v != ''}
        
        # ABORDAGEM ALTERNATIVA: Deletar e recriar (só para teste)
        # Primeiro buscar dados atuais
        current_data = None
        for candidate in all_candidates.data:
            if candidate.get('id') == candidate_id:
                current_data = candidate
                break
        
        if current_data:
            # Atualizar dados atuais com novos dados
            updated_data = {**current_data, **data}
            
            # Remover o ID para reinserção
            candidate_id_backup = updated_data.pop('id', None)
            
            # Deletar registro antigo
            try:
                # Buscar todos e deletar o correto
                delete_response = supabase.table('candidates').delete().match({'id': candidate_id}).execute()
                print(f"🗑️ Candidato {candidate_id} deletado para atualização")
            except Exception as e:
                print(f"⚠️ Erro ao deletar para atualização: {e}")
            
            # Inserir dados atualizados
            insert_response = supabase.table('candidates').insert(updated_data).execute()
            
            if insert_response.data and len(insert_response.data) > 0:
                print(f"✅ Candidato atualizado: {insert_response.data[0].get('email')}")
                return jsonify(insert_response.data[0])
            else:
                print(f"❌ Erro ao reinserir candidato atualizado")
                return jsonify({'error': 'Erro ao atualizar candidato'}), 500
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
        
        print(f"🗑️ Excluindo candidato ID: {candidate_id}")
        
        # Primeiro, verificar se candidato existe
        all_candidates = supabase.table('candidates').select('*').execute()
        
        candidate_exists = False
        if all_candidates.data:
            for candidate in all_candidates.data:
                if candidate.get('id') == candidate_id:
                    candidate_exists = True
                    break
        
        if not candidate_exists:
            print(f"⚠️ Candidato ID {candidate_id} não encontrado")
            return jsonify({'error': 'Candidato não encontrado'}), 404
        
        # ABORDAGEM ALTERNATIVA: Usar match em vez de eq
        try:
            response = supabase.table('candidates').delete().match({'id': candidate_id}).execute()
            print(f"✅ Candidato ID {candidate_id} excluído com sucesso")
            return '', 204
        except Exception as delete_error:
            print(f"❌ Erro na exclusão direta: {delete_error}")
            
            # FALLBACK: Marcar como inativo em vez de deletar
            update_data = {
                'status': 'deleted',
                'updated_at': datetime.now().isoformat(),
                'deleted_at': datetime.now().isoformat()
            }
            
            # Buscar candidato atual
            current_candidate = None
            for candidate in all_candidates.data:
                if candidate.get('id') == candidate_id:
                    current_candidate = candidate
                    break
            
            if current_candidate:
                updated_data = {**current_candidate, **update_data}
                updated_data.pop('id', None)
                
                # Deletar e reinserir com status deleted
                try:
                    supabase.table('candidates').delete().match({'id': candidate_id}).execute()
                    supabase.table('candidates').insert(updated_data).execute()
                    print(f"✅ Candidato ID {candidate_id} marcado como deletado")
                    return '', 204
                except Exception as fallback_error:
                    print(f"❌ Erro no fallback: {fallback_error}")
                    return jsonify({'error': 'Erro ao excluir candidato'}), 500
            else:
                return jsonify({'error': 'Candidato não encontrado'}), 404
        
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
        
        print(f"🔍 Busca recebida - Query: '{query}', Status: '{status}'")
        
        # Buscar todos os candidatos primeiro
        response = supabase.table('candidates').select('*').order('created_at', desc=True).execute()
        
        if response.data is None:
            return jsonify([])
        
        # Filtrar no Python (mais compatível com todas as versões do Supabase)
        filtered_data = response.data
        
        if query:
            query_lower = query.lower()
            filtered_data = [
                candidate for candidate in filtered_data
                if (
                    query_lower in candidate.get('first_name', '').lower() or
                    query_lower in candidate.get('last_name', '').lower() or
                    query_lower in candidate.get('email', '').lower()
                )
            ]
        
        if status and status != 'all':
            filtered_data = [
                candidate for candidate in filtered_data
                if candidate.get('status') == status
            ]
        
        result_count = len(filtered_data)
        print(f"✅ Busca concluída - {result_count} candidatos encontrados")
        
        return jsonify(filtered_data)
        
    except Exception as e:
        print(f"❌ Erro na busca de candidatos: {e}")
        import traceback
        traceback.print_exc()
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
        
        print("💼 Buscando vagas no Supabase...")
        
        # Buscar vagas
        response = supabase.table('jobs').select('*').order('created_at', desc=True).execute()
        
        if response.data is None:
            print("⚠️ Nenhuma vaga encontrada")
            return jsonify([])
        
        # Adicionar campos extras para compatibilidade
        jobs_with_counts = []
        for job in response.data:
            # Garantir que todos os campos existem
            job_data = {
                'id': job.get('id'),
                'title': job.get('title', 'Título não informado'),
                'description': job.get('description', ''),
                'location': job.get('location', 'Local não informado'),
                'department': job.get('department', ''),
                'employment_type': job.get('employment_type', 'full-time'),
                'status': job.get('status', 'active'),
                'salary_min': job.get('salary_min', 0),
                'salary_max': job.get('salary_max', 0),
                'requirements': job.get('requirements', ''),
                'created_at': job.get('created_at'),
                'updated_at': job.get('updated_at'),
                'candidates_count': 0  # Placeholder
            }
            jobs_with_counts.append(job_data)
        
        print(f"✅ {len(jobs_with_counts)} vagas retornadas")
        return jsonify(jobs_with_counts)
        
    except Exception as e:
        print(f"❌ Erro ao buscar vagas: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@api.route('/jobs', methods=['POST'])
def create_job():
    """Criar nova vaga"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
            
        data = request.json
        print(f"💼 Criando nova vaga: {data}")
        
        # Validar campos obrigatórios
        required_fields = ['title']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        # Preparar dados com valores padrão
        now = datetime.now().isoformat()
        job_data = {
            'title': data['title'],
            'description': data.get('description', ''),
            'location': data.get('location', 'Remoto'),
            'department': data.get('department', ''),
            'employment_type': data.get('employment_type', 'full-time'),
            'status': data.get('status', 'active'),
            'salary_min': data.get('salary_min', 0),
            'salary_max': data.get('salary_max', 0),
            'requirements': data.get('requirements', ''),
            'created_at': now,
            'updated_at': now
        }
        
        # Limpar campos vazios
        job_data = {k: v for k, v in job_data.items() if v is not None and v != ''}
        
        response = supabase.table('jobs').insert(job_data).execute()
        
        if response.data:
            job_created = response.data[0]
            job_created['candidates_count'] = 0  # Nova vaga sem candidatos
            print(f"✅ Vaga criada com ID: {job_created.get('id')}")
            return jsonify(job_created), 201
        else:
            return jsonify({'error': 'Erro ao criar vaga'}), 500
            
    except Exception as e:
        print(f"❌ Erro ao criar vaga: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# =============================================================================
# DEBUG ENDPOINTS
# =============================================================================

@api.route('/debug/jobs', methods=['GET'])
def debug_jobs():
    """Debug da tabela jobs"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
        
        # Tentar acessar a tabela jobs
        try:
            response = supabase.table('jobs').select('*').execute()
            
            debug_info = {
                'table_exists': True,
                'jobs_count': len(response.data) if response.data else 0,
                'sample_job': response.data[0] if response.data else None,
                'all_jobs': response.data,
                'supabase_connected': True,
                'timestamp': datetime.now().isoformat()
            }
            
            return jsonify(debug_info)
            
        except Exception as table_error:
            return jsonify({
                'table_exists': False,
                'error': str(table_error),
                'message': 'Tabela jobs não existe ou não tem dados',
                'supabase_connected': True,
                'timestamp': datetime.now().isoformat()
            })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'supabase_connected': False,
            'timestamp': datetime.now().isoformat()
        }), 500

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
@api.route('/candidates/<int:candidate_id>', methods=['GET'])
def get_candidate_by_id(candidate_id):
    """Buscar candidato específico por ID"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
        
        print(f"📋 GET /candidates/{candidate_id}")
        
        response = supabase.table('candidates').select('*').eq('id', candidate_id).execute()
        
        if not response.data:
            return jsonify({'error': 'Candidato não encontrado'}), 404
        
        candidate = response.data[0]
        print(f"✅ Candidato {candidate_id} encontrado: {candidate.get('first_name')} {candidate.get('last_name')}")
        
        return jsonify(candidate)
        
    except Exception as e:
        print(f"❌ Erro ao buscar candidato {candidate_id}: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@api.route('/candidates', methods=['POST'])
def create_candidate():
    """Criar novo candidato com validação completa"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        print(f"➕ POST /candidates - Dados recebidos:", data)
        
        # Validações obrigatórias
        required_fields = ['first_name', 'last_name', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        # Verificar email único
        existing = supabase.table('candidates').select('id').eq('email', data['email']).execute()
        if existing.data:
            return jsonify({'error': 'Email já cadastrado'}), 409
        
        # Preparar dados para inserção
        candidate_data = {
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'email': data['email'],
            'phone': data.get('phone'),
            'address': data.get('address'),
            'summary': data.get('summary'),
            'linkedin_url': data.get('linkedin_url'),
            'status': data.get('status', 'active')
        }
        
        # Remover campos None
        candidate_data = {k: v for k, v in candidate_data.items() if v is not None}
        
        print(f"📤 Inserindo no Supabase:", candidate_data)
        
        # Inserir candidato
        response = supabase.table('candidates').insert(candidate_data).execute()
        
        if response.data:
            new_candidate = response.data[0]
            print(f"✅ Candidato criado com ID: {new_candidate['id']}")
            return jsonify(new_candidate), 201
        else:
            print("❌ Falha ao criar candidato - resposta vazia")
            return jsonify({'error': 'Falha ao criar candidato'}), 500
        
    except Exception as e:
        print(f"❌ Erro ao criar candidato: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@api.route('/candidates/<int:candidate_id>', methods=['PUT'])
def update_candidate(candidate_id):
    """Atualizar candidato existente"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        print(f"📝 PUT /candidates/{candidate_id} - Dados:", data)
        
        # Verificar se candidato existe
        existing = supabase.table('candidates').select('id').eq('id', candidate_id).execute()
        if not existing.data:
            return jsonify({'error': 'Candidato não encontrado'}), 404
        
        # Verificar email único (exceto o próprio candidato)
        if 'email' in data:
            email_check = supabase.table('candidates').select('id').eq('email', data['email']).neq('id', candidate_id).execute()
            if email_check.data:
                return jsonify({'error': 'Email já está em uso por outro candidato'}), 409
        
        # Preparar dados para atualização
        update_data = {}
        allowed_fields = ['first_name', 'last_name', 'email', 'phone', 'address', 'summary', 'linkedin_url', 'status']
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        if not update_data:
            return jsonify({'error': 'Nenhum campo válido para atualizar'}), 400
        
        print(f"📤 Atualizando no Supabase:", update_data)
        
        # Atualizar candidato
        response = supabase.table('candidates').update(update_data).eq('id', candidate_id).execute()
        
        if response.data:
            updated_candidate = response.data[0]
            print(f"✅ Candidato {candidate_id} atualizado com sucesso")
            return jsonify(updated_candidate)
        else:
            print("❌ Falha ao atualizar candidato - resposta vazia")
            return jsonify({'error': 'Falha ao atualizar candidato'}), 500
        
    except Exception as e:
        print(f"❌ Erro ao atualizar candidato {candidate_id}: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@api.route('/candidates/<int:candidate_id>', methods=['DELETE'])
def delete_candidate(candidate_id):
    """Deletar candidato"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
        
        print(f"🗑️ DELETE /candidates/{candidate_id}")
        
        # Verificar se candidato existe
        existing = supabase.table('candidates').select('id', 'first_name', 'last_name').eq('id', candidate_id).execute()
        if not existing.data:
            return jsonify({'error': 'Candidato não encontrado'}), 404
        
        candidate_name = f"{existing.data[0].get('first_name', '')} {existing.data[0].get('last_name', '')}".strip()
        
        # Deletar candidato
        response = supabase.table('candidates').delete().eq('id', candidate_id).execute()
        
        print(f"✅ Candidato {candidate_id} ({candidate_name}) deletado com sucesso")
        return jsonify({
            'message': f'Candidato {candidate_name} deletado com sucesso',
            'id': candidate_id
        })
        
    except Exception as e:
        print(f"❌ Erro ao deletar candidato {candidate_id}: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@api.route('/candidates/search', methods=['GET'])
def search_candidates():
    """Buscar candidatos com filtros avançados"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
        
        # Parâmetros de busca
        query = request.args.get('q', '').strip()
        status = request.args.get('status', '').strip()
        
        print(f"🔍 GET /candidates/search - Query: '{query}', Status: '{status}'")
        
        # Começar com busca básica
        response = supabase.table('candidates').select('*').order('created_at', desc=True).execute()
        
        if response.data is None:
            return jsonify([])
        
        # Filtrar resultados
        filtered_data = response.data
        
        # Filtro por texto (nome ou email)
        if query:
            query_lower = query.lower()
            filtered_data = [
                candidate for candidate in filtered_data
                if (
                    query_lower in candidate.get('first_name', '').lower() or
                    query_lower in candidate.get('last_name', '').lower() or
                    query_lower in candidate.get('email', '').lower()
                )
            ]
        
        # Filtro por status
        if status and status != 'all':
            filtered_data = [
                candidate for candidate in filtered_data
                if candidate.get('status') == status
            ]
        
        result_count = len(filtered_data)
        print(f"✅ {result_count} candidatos encontrados na busca")
        
        return jsonify(filtered_data)
        
    except Exception as e:
        print(f"❌ Erro na busca de candidatos: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# =============================================================================
# ENDPOINT PARA MÉTRICAS DO DASHBOARD
# =============================================================================

@api.route('/dashboard/metrics', methods=['GET'])
def get_dashboard_metrics():
    """Obter métricas para o dashboard"""
    try:
        if not supabase:
            return jsonify({'error': 'Database not connected'}), 500
        
        print("📊 GET /dashboard/metrics")
        
        # Buscar todos os candidatos
        candidates_response = supabase.table('candidates').select('*').execute()
        candidates = candidates_response.data or []
        
        # Calcular métricas
        total_candidates = len(candidates)
        
        # Contar por status
        status_counts = {}
        for candidate in candidates:
            status = candidate.get('status', 'active')
            status_counts[status] = status_counts.get(status, 0) + 1
        
        # Candidatos recentes (últimos 30 dias)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        recent_candidates = [
            c for c in candidates 
            if datetime.fromisoformat(c['created_at'].replace('Z', '+00:00')) > thirty_days_ago
        ]
        
        metrics = {
            'total_candidates': total_candidates,
            'active_jobs': 5,  # placeholder - implementar quando tiver tabela jobs
            'monthly_applications': len(recent_candidates),
            'conversion_rate': round((status_counts.get('approved', 0) / max(total_candidates, 1)) * 100, 1),
            'pending_interviews': status_counts.get('interviewed', 0),
            'status_breakdown': status_counts,
            'last_updated': datetime.now().isoformat()
        }
        
        print(f"✅ Métricas calculadas: {metrics}")
        return jsonify(metrics)
        
    except Exception as e:
        print(f"❌ Erro ao calcular métricas: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
