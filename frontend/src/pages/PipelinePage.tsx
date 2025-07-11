// 🔧 CORREÇÃO: PipelinePage.tsx - Pipeline REAL do Supabase
// Arquivo: frontend/src/pages/PipelinePage.tsx

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Filter, 
  Search, 
  ChevronRight,
  Clock,
  Calendar,
  Mail,
  Phone,
  Eye,
  ArrowRight,
  ArrowLeft,
  User,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

// Types baseados no Supabase
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

// API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const pipelineApi = {
  // Buscar pipeline completo
  getPipeline: async (jobId?: number): Promise<{ stages: RecruitmentStage[], applications: Application[] }> => {
    try {
      console.log('🔍 Buscando pipeline do Supabase...');
      
      // Buscar etapas de recrutamento
      const stagesResponse = await axios.get(`${API_BASE_URL}/recruitment-stages`);
      const stages = stagesResponse.data.stages || [];
      
      // Buscar candidaturas com filtro opcional por vaga
      let applicationsUrl = `${API_BASE_URL}/applications`;
      if (jobId) {
        applicationsUrl += `?job_id=${jobId}`;
      }
      
      const applicationsResponse = await axios.get(applicationsUrl);
      const applications = applicationsResponse.data.applications || [];
      
      console.log('✅ Pipeline carregado:', { stages: stages.length, applications: applications.length });
      
      return { stages, applications };
    } catch (error: any) {
      console.error('❌ Erro ao carregar pipeline:', error);
      throw new Error(error.response?.data?.error || 'Erro ao carregar pipeline');
    }
  },

  // Buscar estatísticas do pipeline
  getStats: async (): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pipeline/stats`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      return null;
    }
  },

  // Mover candidato entre etapas
  moveCandidate: async (applicationId: number, action: 'next' | 'previous' | 'specific', targetStage?: number, notes?: string): Promise<Application> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/applications/${applicationId}/stage`, {
        action,
        target_stage: targetStage,
        notes
      });
      return response.data.application;
    } catch (error: any) {
      console.error('❌ Erro ao mover candidato:', error);
      throw new Error(error.response?.data?.error || 'Erro ao mover candidato');
    }
  }
};

const PipelinePage: React.FC = () => {
  const [stages, setStages] = useState<RecruitmentStage[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<number | 'all'>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null);
  const [stats, setStats] = useState<any>(null);

  // ✅ CORREÇÃO: Carregar dados REAIS do Supabase
  const loadPipeline = async () => {
    setLoading(true);
    setError(null);
    try {
      const jobFilter = selectedJob === 'all' ? undefined : Number(selectedJob);
      const pipelineData = await pipelineApi.getPipeline(jobFilter);
      
      setStages(pipelineData.stages);
      setApplications(pipelineData.applications);
      
      // Carregar estatísticas
      const statsData = await pipelineApi.getStats();
      setStats(statsData);
      
      console.log(`✅ Pipeline carregado: ${pipelineData.stages.length} etapas, ${pipelineData.applications.length} candidaturas`);
    } catch (err: any) {
      console.error('❌ Erro ao carregar pipeline:', err);
      setError(err.message);
      // Usar dados fallback em caso de erro
      setStages([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar na inicialização e quando filtro de vaga mudar
  useEffect(() => {
    loadPipeline();
  }, [selectedJob]);

  // Organizar applications por stage
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

  // Total de candidatos no pipeline
  const totalCandidates = applications.length;

  // Estatísticas por etapa
  const getStageStats = (stagePosition: number) => {
    return applications.filter(app => app.stage === stagePosition).length;
  };

  // Mover candidato
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

  // Obter lista única de vagas para filtro
  const availableJobs = Array.from(
    new Map(
      applications
        .filter(app => app.jobs)
        .map(app => [app.jobs!.id, app.jobs!])
    ).values()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pipeline de Candidaturas</h1>
          <p className="text-gray-600">
            Acompanhe candidatos através das {stages.length} etapas do processo seletivo
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={loadPipeline}
            disabled={loading}
            className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{totalCandidates}</span> candidatos no pipeline
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Erro ao carregar pipeline</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={loadPipeline}
                className="mt-2 text-sm text-red-800 underline hover:text-red-900"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar candidatos por nome, email ou vaga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Job Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas as vagas</option>
              {availableJobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex space-x-6 overflow-x-auto">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex-shrink-0 w-80">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-20 bg-gray-100 rounded"></div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-x-auto">
          <div className="flex space-x-6 min-w-max">
            {stagesWithApplications.map((stageData, index) => (
              <StageColumn 
                key={stageData.stage.id}
                stageData={stageData}
                isLast={index === stagesWithApplications.length - 1}
                onMoveCandidate={handleMoveCandidate}
                onViewCandidate={setSelectedCandidate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total no Pipeline</p>
              <p className="text-2xl font-bold text-gray-900">{totalCandidates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Em Triagem</p>
              <p className="text-2xl font-bold text-gray-900">
                {getStageStats(4)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Calendar className="h-6 w-6 text-pink-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Em Entrevistas</p>
              <p className="text-2xl font-bold text-gray-900">
                {getStageStats(7)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChevronRight className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Contratações</p>
              <p className="text-2xl font-bold text-gray-900">
                {getStageStats(9)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateDetailModal 
          application={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onMoveCandidate={handleMoveCandidate}
        />
      )}
    </div>
  );
};

// Stage Column Component
const StageColumn: React.FC<{
  stageData: StageWithApplications;
  isLast: boolean;
  onMoveCandidate: (applicationId: number, action: 'next' | 'previous') => void;
  onViewCandidate: (application: Application) => void;
}> = ({ stageData, isLast, onMoveCandidate, onViewCandidate }) => {
  const { stage, applications } = stageData;

  return (
    <div className="flex-shrink-0 w-80">
      {/* Stage Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{stage.name}</h3>
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {applications.length}
          </span>
        </div>
        <p className="text-sm text-gray-600">{stage.description}</p>
      </div>

      {/* Applications */}
      <div className="space-y-3 min-h-[200px]">
        {applications.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum candidato</p>
          </div>
        ) : (
          applications.map((application) => (
            <ApplicationCard 
              key={application.id}
              application={application}
              onView={() => onViewCandidate(application)}
              onMoveNext={stage.order_position < 9 ? () => onMoveCandidate(application.id, 'next') : undefined}
              onMovePrev={stage.order_position > 1 ? () => onMoveCandidate(application.id, 'previous') : undefined}
              isLastStage={isLast}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Application Card Component
const ApplicationCard: React.FC<{
  application: Application;
  onView: () => void;
  onMoveNext?: () => void;
  onMovePrev?: () => void;
  isLastStage: boolean;
}> = ({ application, onView, onMoveNext, onMovePrev, isLastStage }) => {
  const candidate = application.candidates;
  const job = application.jobs;

  if (!candidate) return null;

  const candidateName = `${candidate.first_name} ${candidate.last_name}`.trim();
  const daysInStage = Math.floor((new Date().getTime() - new Date(application.updated_at).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Candidate Info */}
      <div className="flex items-start space-x-3 mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{candidateName}</p>
          <p className="text-sm text-gray-600 truncate">{candidate.email}</p>
          {job && (
            <p className="text-xs text-blue-600 truncate">{job.title}</p>
          )}
        </div>
      </div>

      {/* Time in stage */}
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <Clock className="h-3 w-3 mr-1" />
        {daysInStage} dia(s) nesta etapa
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onView}
          className="flex items-center text-xs text-blue-600 hover:text-blue-700"
        >
          <Eye className="h-3 w-3 mr-1" />
          Ver
        </button>
        
        <div className="flex space-x-1">
          {onMovePrev && (
            <button
              onClick={onMovePrev}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Voltar etapa"
            >
              <ArrowLeft className="h-3 w-3" />
            </button>
          )}
          {onMoveNext && (
            <button
              onClick={onMoveNext}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Próxima etapa"
            >
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Candidate Detail Modal
const CandidateDetailModal: React.FC<{
  application: Application;
  onClose: () => void;
  onMoveCandidate: (applicationId: number, action: 'next' | 'previous') => void;
}> = ({ application, onClose, onMoveCandidate }) => {
  const candidate = application.candidates;
  const job = application.jobs;

  if (!candidate) return null;

  const candidateName = `${candidate.first_name} ${candidate.last_name}`.trim();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Detalhes da Candidatura</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Profile */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900">{candidateName}</h4>
              <p className="text-gray-600">{candidate.email}</p>
              {job && (
                <p className="text-sm text-blue-600">{job.title}</p>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              {candidate.email}
            </div>
            {candidate.phone && (
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {candidate.phone}
              </div>
            )}
          </div>

          {/* Application Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-900 mb-1">
              Etapa Atual: {application.stage}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              Status: {application.status}
            </p>
            <p className="text-sm text-gray-600">
              Aplicou em: {new Date(application.applied_at).toLocaleDateString('pt-BR')}
            </p>
            {application.notes && (
              <p className="text-sm text-gray-600 mt-2">
                <strong>Notas:</strong> {application.notes}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            {application.stage > 1 && (
              <button
                onClick={() => {
                  onMoveCandidate(application.id, 'previous');
                  onClose();
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Voltar Etapa
              </button>
            )}
            {application.stage < 9 && (
              <button
                onClick={() => {
                  onMoveCandidate(application.id, 'next');
                  onClose();
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Próxima Etapa
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelinePage;