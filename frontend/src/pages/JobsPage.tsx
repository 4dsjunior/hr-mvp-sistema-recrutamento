// 🔧 CORREÇÃO: JobsPage.tsx - Exibir TODAS as 13 vagas do Supabase
// Arquivo: frontend/src/pages/JobsPage.tsx

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Briefcase, 
  MapPin, 
  Building, 
  Calendar,
  DollarSign,
  Users,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description?: string;
  requirements?: string;
  employment_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  status: 'active' | 'paused' | 'closed';
  created_at: string;
  updated_at: string;
  department?: string;
  benefits?: string;
  applications_count?: number;
}

interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  filters_applied?: any;
}

// ============================================================================
// API CALLS
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const jobsApi = {
  // ✅ Buscar TODAS as vagas do Supabase
  getAll: async (): Promise<JobsResponse> => {
    try {
      console.log('🔍 Buscando TODAS as vagas do Supabase...');
      const response = await axios.get(`${API_BASE_URL}/jobs?per_page=50`, {
        timeout: 10000
      });
      console.log('✅ Resposta da API de vagas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao carregar vagas:', error);
      throw new Error(error.response?.data?.error || 'Erro ao carregar vagas');
    }
  },

  // Buscar candidatos de uma vaga específica
  getCandidates: async (jobId: number): Promise<any> => {
    try {
      console.log(`🔍 Buscando candidatos da vaga ${jobId}...`);
      const response = await axios.get(`${API_BASE_URL}/applications?job_id=${jobId}`);
      console.log('✅ Candidatos encontrados:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar candidatos:', error);
      throw new Error(error.response?.data?.error || 'Erro ao buscar candidatos');
    }
  }
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [candidatesData, setCandidatesData] = useState<any>(null);

  // ✅ CARREGAR VAGAS REAIS DO SUPABASE
  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const jobsResponse = await jobsApi.getAll();
      const jobsList = jobsResponse.jobs || [];
      setJobs(jobsList);
      console.log(`✅ ${jobsList.length} vagas carregadas:`, jobsList);
    } catch (err: any) {
      console.error('❌ Erro ao carregar vagas:', err);
      setError(err.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar vagas na inicialização
  useEffect(() => {
    loadJobs();
  }, []);

  // ✅ FILTRAR VAGAS
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // ✅ VER CANDIDATOS DE UMA VAGA
  const handleViewCandidates = async (job: Job) => {
    try {
      setSelectedJob(job);
      console.log(`🔍 Abrindo candidatos da vaga: ${job.title}`);
      
      // Buscar candidatos da vaga
      const candidates = await jobsApi.getCandidates(job.id);
      setCandidatesData(candidates);
      setShowCandidatesModal(true);
    } catch (error: any) {
      console.error('❌ Erro ao buscar candidatos:', error);
      alert('Erro ao buscar candidatos: ' + error.message);
    }
  };

  // ✅ FORMATAÇÃO DE SALÁRIO
  const formatSalary = (min?: number, max?: number): string => {
    if (!min && !max) return 'Salário não informado';
    if (min && max) return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`;
    if (min) return `A partir de R$ ${min.toLocaleString()}`;
    if (max) return `Até R$ ${max.toLocaleString()}`;
    return 'Salário não informado';
  };

  // ✅ FORMATAÇÃO DE DATA
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // ✅ STATUS COLOR
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ STATUS LABEL
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'paused': return 'Pausada';
      case 'closed': return 'Fechada';
      default: return status;
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
          <h1 className="text-2xl font-bold text-gray-900">Vagas</h1>
          <p className="text-gray-600">Gerencie as vagas disponíveis na empresa</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadJobs}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={() => console.log('Criar nova vaga - TODO')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Vaga
          </button>
        </div>
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
                placeholder="Buscar vagas por título, empresa ou localização..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativas</option>
              <option value="paused">Pausadas</option>
              <option value="closed">Fechadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Carregando vagas...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-red-800 font-medium">Erro ao carregar vagas</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={loadJobs}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Jobs Stats */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {filteredJobs.length} de {jobs.length} vagas
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-green-600">
                {jobs.filter(j => j.status === 'active').length} Ativas
              </span>
              <span className="text-yellow-600">
                {jobs.filter(j => j.status === 'paused').length} Pausadas
              </span>
              <span className="text-red-600">
                {jobs.filter(j => j.status === 'closed').length} Fechadas
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {job.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <span className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {job.company}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                  {getStatusLabel(job.status)}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {job.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {formatSalary(job.salary_min, job.salary_max)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Criada em {formatDate(job.created_at)}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {job.employment_type}
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                  {job.experience_level}
                </span>
              </div>

              {/* Description */}
              {job.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {job.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleViewCandidates(job)}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Ver Candidatos ({job.applications_count || 0})
                </button>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => console.log('Ver detalhes', job.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => console.log('Editar vaga', job.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => console.log('Menu', job.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Mais opções"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredJobs.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {jobs.length === 0 ? 'Nenhuma vaga encontrada' : 'Nenhuma vaga corresponde aos filtros'}
          </h3>
          <p className="text-gray-600 mb-4">
            {jobs.length === 0 
              ? 'Comece criando sua primeira vaga de emprego.'
              : 'Tente ajustar os filtros de busca.'
            }
          </p>
          {jobs.length === 0 && (
            <button
              onClick={() => console.log('Criar primeira vaga')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Vaga
            </button>
          )}
        </div>
      )}

      {/* Modal de Candidatos */}
      {showCandidatesModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Candidatos - {selectedJob.title}
                  </h2>
                  <p className="text-gray-600">{selectedJob.company}</p>
                </div>
                <button
                  onClick={() => setShowCandidatesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {candidatesData ? (
                candidatesData.applications && candidatesData.applications.length > 0 ? (
                  <div className="space-y-4">
                    {candidatesData.applications.map((app: any) => (
                      <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {app.candidates?.first_name} {app.candidates?.last_name}
                            </h4>
                            <p className="text-sm text-gray-600">{app.candidates?.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Etapa {app.stage} • Status: {app.status}
                            </p>
                          </div>
                          <button
                            onClick={() => navigate('/pipeline')}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Ver no Pipeline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum candidato ainda
                    </h3>
                    <p className="text-gray-600">
                      Esta vaga ainda não recebeu candidaturas.
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando candidatos...</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowCandidatesModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;