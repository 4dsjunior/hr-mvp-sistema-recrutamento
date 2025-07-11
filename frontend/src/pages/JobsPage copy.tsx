// 🔧 CORREÇÃO: JobsPage.tsx - Dados REAIS do Supabase
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
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

// Types
interface Job {
  id: number;
  title: string;
  company?: string;
  location?: string;
  description?: string;
  requirements?: string;
  employment_type?: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  status: 'active' | 'paused' | 'closed';
  created_at: string;
  updated_at: string;
  department?: string;
  benefits?: string;
}

// API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const jobsApi = {
  // Buscar todas as vagas
  getAll: async (): Promise<Job[]> => {
    try {
      console.log('🔍 Buscando vagas do Supabase...');
      const response = await axios.get(`${API_BASE_URL}/jobs`);
      console.log('✅ Vagas carregadas:', response.data);
      return response.data || [];
    } catch (error: any) {
      console.error('❌ Erro ao carregar vagas:', error);
      throw new Error(error.response?.data?.error || 'Erro ao carregar vagas');
    }
  },

  // Buscar vaga por ID
  getById: async (id: number): Promise<Job> => {
    const response = await axios.get(`${API_BASE_URL}/jobs/${id}`);
    return response.data;
  },

  // Criar nova vaga
  create: async (jobData: Partial<Job>): Promise<Job> => {
    const response = await axios.post(`${API_BASE_URL}/jobs`, jobData);
    return response.data;
  },

  // Atualizar vaga
  update: async (id: number, jobData: Partial<Job>): Promise<Job> => {
    const response = await axios.put(`${API_BASE_URL}/jobs/${id}`, jobData);
    return response.data;
  },

  // Deletar vaga
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/jobs/${id}`);
  }
};

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ✅ CORREÇÃO: Buscar vagas REAIS do Supabase
  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const jobsData = await jobsApi.getAll();
      setJobs(jobsData);
      console.log(`✅ ${jobsData.length} vagas carregadas do Supabase`);
    } catch (err: any) {
      console.error('❌ Erro ao carregar vagas:', err);
      setError(err.message);
      setJobs([]); // Array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  // Load jobs on mount
  useEffect(() => {
    loadJobs();
  }, []);

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Status badge
  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800', 
      closed: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      active: 'Ativa',
      paused: 'Pausada',
      closed: 'Fechada'
    };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  // Format salary
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'A combinar';
    if (min && max) return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`;
    if (min) return `A partir de R$ ${min.toLocaleString()}`;
    return `Até R$ ${max?.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Handle delete
  const handleDelete = async (job: Job) => {
    if (window.confirm(`Tem certeza que deseja excluir a vaga "${job.title}"?`)) {
      try {
        await jobsApi.delete(job.id);
        console.log('✅ Vaga deletada:', job.title);
        await loadJobs(); // Recarregar lista
      } catch (err: any) {
        console.error('❌ Erro ao deletar vaga:', err);
        alert('Erro ao deletar vaga: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vagas de Emprego</h1>
          <p className="text-gray-600">
            Gerencie as vagas abertas e acompanhe o processo de recrutamento
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadJobs}
            disabled={loading}
            className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Vaga</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro ao carregar vagas</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={loadJobs}
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
              placeholder="Buscar vagas por título, empresa, localização ou departamento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas</option>
              <option value="active">Ativas</option>
              <option value="paused">Pausadas</option>
              <option value="closed">Fechadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {loading ? 'Carregando...' : `${filteredJobs.length} vaga(s) encontrada(s)`}
        </span>
        <span>
          Total: {jobs.length} vagas
        </span>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error ? 'Erro ao carregar vagas' : 'Nenhuma vaga encontrada'}
          </h3>
          <p className="text-gray-600 mb-4">
            {error ? 'Verifique sua conexão e tente novamente' :
             searchQuery || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando sua primeira vaga'
            }
          </p>
          {!error && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Criar Primeira Vaga</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Criar Nova Vaga</h3>
            <p className="text-gray-600 mb-4">
              Funcionalidade de criação de vagas será implementada na próxima fase do projeto.
            </p>
            <p className="text-sm text-blue-600 mb-4">
              <strong>Dados atuais:</strong> {jobs.length} vagas já cadastradas no Supabase
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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

// Job Card Component
const JobCard: React.FC<{ job: Job; onDelete: (job: Job) => void }> = ({ job, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {job.title || 'Título não informado'}
          </h3>
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Building className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{job.company || 'Empresa não informada'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">{job.location || 'Local não informado'}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {/* Status Badge */}
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
            job.status === 'active' ? 'bg-green-100 text-green-800' :
            job.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {job.status === 'active' ? 'Ativa' : 
             job.status === 'paused' ? 'Pausada' : 'Fechada'}
          </span>
          
          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <button 
                    onClick={() => {
                      console.log('Ver detalhes da vaga:', job.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </button>
                  <button 
                    onClick={() => {
                      console.log('Editar vaga:', job.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </button>
                  <button 
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(job);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {job.description}
        </p>
      )}

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">
            {job.salary_min && job.salary_max 
              ? `R$ ${job.salary_min.toLocaleString()} - R$ ${job.salary_max.toLocaleString()}`
              : 'Salário a combinar'
            }
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">
            {job.employment_type === 'full-time' ? 'Tempo integral' : 
             job.employment_type === 'part-time' ? 'Meio período' : 
             job.employment_type === 'contract' ? 'Contrato' : 
             job.employment_type === 'internship' ? 'Estágio' : 'Tipo não informado'}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">
            Criada em {new Date(job.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button 
          onClick={() => console.log('Ver candidatos da vaga:', job.id)}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Ver Candidatos
        </button>
        <button 
          onClick={() => console.log('Editar vaga:', job.id)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Editar
        </button>
      </div>
    </div>
  );
};

export default JobsPage;