// 🔧 CORREÇÃO: PipelinePage.tsx - Código Completo Corrigido
// Arquivo: frontend/src/pages/PipelinePage.tsx

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Clock,
  Calendar,
  Mail,
  Phone,
  Eye,
  ArrowRight,
  ArrowLeft,
  User,
  RefreshCw,
  AlertCircle,
  Briefcase
} from 'lucide-react';

// ✅ CORREÇÃO: Usar API centralizada com interceptors
import api from '../lib/api';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
}

interface Job {
  id: number;
  title: string;
  company?: string;
  location?: string;
  status: string;
}

interface RecruitmentStage {
  id: number;
  name: string;
  description: string;
  order_position: number;
  color: string;
  is_active: boolean;
}

interface Application {
  id: number;
  candidate_id: number;
  job_id: number;
  status: string;
  stage: number;
  notes?: string;
  applied_at: string;
  updated_at: string;
  candidates?: Candidate;
  jobs?: Job;
  recruitment_stages?: RecruitmentStage;
}

interface StageWithApplications {
  stage: RecruitmentStage;
  applications: Application[];
}

interface PipelineStats {
  total_applications: number;
  status_count: Record<string, number>;
  stage_count: Record<number, number>;
  conversion_rate: number;
  hired_count: number;
}

// ============================================================================
// API CALLS
// ============================================================================

const pipelineApi = {
  // ✅ Buscar pipeline completo do Supabase
  getPipeline: async (jobId?: number): Promise<{ stages: RecruitmentStage[], applications: Application[] }> => {
    try {
      console.log('🔍 Buscando pipeline completo do Supabase...');
      
      // 1. Buscar etapas de recrutamento
      const stagesResponse = await api.get('/api/recruitment-stages');
      const stages = stagesResponse.data.stages || [];
      console.log('📊 Etapas carregadas:', stages.length);
      
      // 2. Buscar candidaturas com dados relacionados
      let applicationsUrl = '/api/applications';
      if (jobId) {
        applicationsUrl += `?job_id=${jobId}`;
      }
      
      const applicationsResponse = await api.get(applicationsUrl);
      const applications = applicationsResponse.data.applications || [];
      console.log('🔄 Candidaturas carregadas:', applications.length);
      
      // 3. Log das candidaturas por etapa
      const stageDistribution: Record<number, number> = {};
      applications.forEach((app: Application) => {
        const stage = app.stage || 1;
        stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
      });
      console.log('📈 Distribuição por etapa:', stageDistribution);
      
      return { stages, applications };
    } catch (error: any) {
      console.error('❌ Erro ao carregar pipeline:', error);
      throw new Error(error.response?.data?.error || 'Erro ao carregar pipeline');
    }
  },

  // Buscar estatísticas do pipeline
  getStats: async (jobId?: number): Promise<PipelineStats | null> => {
    try {
      const params = jobId ? `?job_id=${jobId}` : '';
      const response = await api.get(`/api/pipeline/stats${params}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      return null;
    }
  },

  // Mover candidato entre etapas
  moveCandidate: async (applicationId: number, action: 'next' | 'previous', notes?: string): Promise<void> => {
    try {
      const response = await api.put(`/api/applications/${applicationId}/stage`, {
        action,
        notes
      });
      console.log('✅ Candidato movido:', response.data);
    } catch (error: any) {
      console.error('❌ Erro ao mover candidato:', error);
      throw new Error(error.response?.data?.error || 'Erro ao mover candidato');
    }
  },

  // Buscar vagas para filtro
  getJobs: async (): Promise<Job[]> => {
    try {
      const response = await api.get('/api/jobs?per_page=50');
      return response.data.jobs || [];
    } catch (error: any) {
      console.error('❌ Erro ao carregar vagas:', error);
      return [];
    }
  }
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const PipelinePage: React.FC = () => {
  const [stages, setStages] = useState<RecruitmentStage[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);

  // ✅ CARREGAR PIPELINE COMPLETO - CORREÇÃO APLICADA
  const loadPipeline = async () => {
    setLoading(true);
    setError(null);
    try {
      // Determinar filtro de vaga
      const jobFilter = selectedJob === 'all' ? undefined : Number(selectedJob);
      
      // ✅ CORREÇÃO: Carregar pipeline sequencialmente ao invés de Promise.all
      console.log('🔍 Carregando pipeline sequencialmente...');

      // 1. Carregar pipeline primeiro  
      const pipelineData = await pipelineApi.getPipeline(jobFilter);
      console.log('✅ Pipeline carregado');

      // 2. Carregar estatísticas depois
      const statsData = await pipelineApi.getStats(jobFilter);
      console.log('✅ Estatísticas carregadas');
      
      setStages(pipelineData.stages);
      setApplications(pipelineData.applications);
      setStats(statsData);
      
      console.log(`✅ Pipeline carregado: ${pipelineData.stages.length} etapas, ${pipelineData.applications.length} candidaturas`);
    } catch (err: any) {
      console.error('❌ Erro ao carregar pipeline:', err);
      setError(err.message);
      setStages([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CARREGAR VAGAS PARA FILTRO
  const loadJobs = async () => {
    try {
      const jobs = await pipelineApi.getJobs();
      setAvailableJobs(jobs);
    } catch (error) {
      console.error('❌ Erro ao carregar vagas para filtro:', error);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadJobs();
  }, []);

  // Recarregar pipeline quando filtro de vaga mudar
  useEffect(() => {
    loadPipeline();
  }, [selectedJob]);

  // ✅ ORGANIZAR CANDIDATURAS POR ETAPA
  const stagesWithApplications: StageWithApplications[] = stages.map(stage => {
    const stageApplications = applications.filter(app => {
      const matchesStage = app.stage === stage.order_position;
      const matchesSearch = !searchQuery || 
        app.candidates?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidates?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidates?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobs?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStage && matchesSearch;
    });

    return {
      stage,
      applications: stageApplications
    };
  });

  // ✅ MOVER CANDIDATO
  const handleMoveCandidate = async (applicationId: number, action: 'next' | 'previous') => {
    try {
      await pipelineApi.moveCandidate(applicationId, action);
      console.log('✅ Candidato movido com sucesso');
      await loadPipeline(); // Recarregar pipeline
    } catch (err: any) {
      console.error('❌ Erro ao mover candidato:', err);
      alert('Erro ao mover candidato: ' + err.message);
    }
  };

  // ✅ FORMATAÇÃO DE DATA
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline de Candidatos</h1>
          <p className="text-gray-600">Acompanhe o progresso dos candidatos no processo seletivo</p>
        </div>
        <button
          onClick={loadPipeline}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar candidatos por nome, email ou vaga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Job Filter */}
          <div className="sm:w-64">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas as vagas</option>
              {availableJobs.map((job) => (
                <option key={job.id} value={job.id.toString()}>
                  {job.title} - {job.company}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pipeline Stats */}
      {stats && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Candidatos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_applications}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contratados</p>
                <p className="text-2xl font-bold text-green-900">{stats.hired_count}</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-purple-900">{stats.conversion_rate}%</p>
              </div>
              <ArrowRight className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Processo</p>
                <p className="text-2xl font-bold text-orange-900">
                  {stats.total_applications - stats.hired_count}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Carregando pipeline...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-red-800 font-medium">Erro ao carregar pipeline</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={loadPipeline}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Pipeline Kanban */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-x-auto">
          <div className="flex space-x-4 min-w-max">
            {stagesWithApplications.map((stageData) => (
              <div
                key={stageData.stage.id}
                className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4"
                style={{ borderTop: `4px solid ${stageData.stage.color}` }}
              >
                {/* Stage Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {stageData.stage.name}
                    </h3>
                    <span 
                      className="px-2 py-1 text-xs font-medium text-white rounded-full"
                      style={{ backgroundColor: stageData.stage.color }}
                    >
                      {stageData.applications.length}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {stageData.stage.description}
                  </p>
                </div>

                {/* Applications */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stageData.applications.length > 0 ? (
                    stageData.applications.map((app: Application) => (
                      <div
                        key={app.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                      >
                        {/* Candidate Info */}
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900">
                            {app.candidates?.first_name} {app.candidates?.last_name}
                          </h4>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Mail className="h-3 w-3 mr-1" />
                            {app.candidates?.email}
                          </p>
                          {app.candidates?.phone && (
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1" />
                              {app.candidates.phone}
                            </p>
                          )}
                        </div>

                        {/* Job Info */}
                        {app.jobs && (
                          <div className="mb-3 p-2 bg-blue-50 rounded">
                            <p className="text-sm font-medium text-blue-900 flex items-center">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {app.jobs.title}
                            </p>
                            {app.jobs.company && (
                              <p className="text-xs text-blue-700">{app.jobs.company}</p>
                            )}
                          </div>
                        )}

                        {/* Meta Info */}
                        <div className="text-xs text-gray-500 mb-3">
                          <p className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Aplicou em {formatDate(app.applied_at)}
                          </p>
                          <p className="mt-1">Status: {app.status}</p>
                        </div>

                        {/* Notes */}
                        {app.notes && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              {app.notes}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <button
                            onClick={() => handleMoveCandidate(app.id, 'previous')}
                            disabled={stageData.stage.order_position === 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Voltar etapa"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => console.log('Ver perfil', app.id)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Ver perfil"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleMoveCandidate(app.id, 'next')}
                            disabled={stageData.stage.order_position === 9}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Próxima etapa"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum candidato nesta etapa</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && applications.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma candidatura encontrada
          </h3>
          <p className="text-gray-600 mb-4">
            {selectedJob === 'all' 
              ? 'Não há candidaturas no sistema ainda.'
              : 'Não há candidaturas para a vaga selecionada.'
            }
          </p>
          {selectedJob !== 'all' && (
            <button
              onClick={() => setSelectedJob('all')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver todas as candidaturas
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PipelinePage;