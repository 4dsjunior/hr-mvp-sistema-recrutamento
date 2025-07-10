// 🎯 SEMANA 5-6: CRUD de Vagas - Frontend Jobs Page
// Arquivo: frontend/src/pages/JobsPage.tsx

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Users,
  Download,
  RefreshCw,
  X
} from 'lucide-react';
import { 
  jobsApi, 
  Job, 
  JobFilters, 
  JobOptions,
  formatSalary,
  formatEmploymentType,
  formatExperienceLevel,
  formatStatus,
  getStatusColor,
  getEmploymentTypeColor
} from '../services/jobsApi';

interface JobsPageProps {}

const JobsPage: React.FC<JobsPageProps> = () => {
  // Estado principal
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Paginação e filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [filters, setFilters] = useState<JobFilters>({
    per_page: 10,
    search: '',
    status: '',
    employment_type: '',
    experience_level: '',
    company: ''
  });
  
  // Opções para filtros
  const [jobOptions, setJobOptions] = useState<JobOptions | null>(null);
  
  // Estados da UI
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  
  // Carregar dados iniciais
  useEffect(() => {
    loadJobs();
    loadJobOptions();
  }, []);
  
  // Recarregar vagas quando filtros mudarem
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadJobs();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [filters, currentPage]);
  
  // Função para carregar vagas
  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsApi.getJobs({
        ...filters,
        page: currentPage
      });
      
      setJobs(response.jobs);
      setTotalPages(response.total_pages);
      setTotalJobs(response.total);
      
    } catch (err) {
      setError('Erro ao carregar vagas. Tente novamente.');
      console.error('Erro ao carregar vagas:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar opções para filtros
  const loadJobOptions = async () => {
    try {
      const options = await jobsApi.getJobOptions();
      setJobOptions(options);
    } catch (err) {
      console.error('Erro ao carregar opções:', err);
    }
  };
  
  // Handlers para filtros
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  };
  
  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setFilters({
      per_page: 10,
      search: '',
      status: '',
      employment_type: '',
      experience_level: '',
      company: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };
  
  // Handlers para ações
  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setShowJobModal(true);
  };
  
  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };
  
  const handleDeleteJob = async (job: Job) => {
    if (!confirm(`Tem certeza que deseja excluir a vaga "${job.title}"?`)) {
      return;
    }
    
    try {
      await jobsApi.deleteJob(job.id);
      loadJobs(); // Recarregar lista
      alert('Vaga excluída com sucesso!');
    } catch (err) {
      alert('Erro ao excluir vaga. Tente novamente.');
      console.error('Erro ao excluir vaga:', err);
    }
  };
  
  const handleCreateJob = () => {
    setEditingJob(null);
    setShowJobForm(true);
  };
  
  // Exportar vagas
  const handleExportJobs = async () => {
    try {
      const csvContent = await jobsApi.exportJobs(filters);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vagas_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erro ao exportar vagas. Tente novamente.');
      console.error('Erro ao exportar:', err);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vagas</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Gerencie todas as vagas de emprego
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleExportJobs}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
                <button
                  onClick={handleCreateJob}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Vaga
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filtros e Busca */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Barra de busca */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título, empresa ou descrição..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium ${
                showFilters 
                  ? 'border-blue-300 text-blue-700 bg-blue-50' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
            <button
              onClick={loadJobs}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
          
          {/* Filtros expandidos */}
          {showFilters && jobOptions && (
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos os status</option>
                    {jobOptions.status_options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Emprego
                  </label>
                  <select
                    value={filters.employment_type || ''}
                    onChange={(e) => handleFilterChange('employment_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos os tipos</option>
                    {jobOptions.employment_types.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nível de Experiência
                  </label>
                  <select
                    value={filters.experience_level || ''}
                    onChange={(e) => handleFilterChange('experience_level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos os níveis</option>
                    {jobOptions.experience_levels.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa
                  </label>
                  <input
                    type="text"
                    placeholder="Nome da empresa..."
                    value={filters.company || ''}
                    onChange={(e) => handleFilterChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar filtros
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Lista de Vagas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-gray-200 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma vaga encontrada
                </h3>
                <p className="text-gray-500 mb-6">
                  {filters.search || filters.status || filters.employment_type || filters.experience_level || filters.company
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Comece criando sua primeira vaga de emprego.'
                  }
                </p>
                {!filters.search && !filters.status && !filters.employment_type && !filters.experience_level && !filters.company && (
                  <button
                    onClick={handleCreateJob}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Vaga
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onView={handleViewJob}
                    onEdit={handleEditJob}
                    onDelete={handleDeleteJob}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-6 py-3 border-t border-gray-200 mt-6 rounded-lg shadow-sm border">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">{((currentPage - 1) * 10) + 1}</span>
                  {' '}a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 10, totalJobs)}
                  </span>
                  {' '}de{' '}
                  <span className="font-medium">{totalJobs}</span>
                  {' '}vagas
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          isActive
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Próximo
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modais (você implementará estes componentes em seguida) */}
      {showJobModal && selectedJob && (
        <JobViewModal
          job={selectedJob}
          onClose={() => setShowJobModal(false)}
        />
      )}
      
      {showJobForm && (
        <JobFormModal
          job={editingJob}
          onClose={() => setShowJobForm(false)}
          onSave={() => {
            setShowJobForm(false);
            loadJobs();
          }}
        />
      )}
    </div>
  );
};

// Componente JobCard
interface JobCardProps {
  job: Job;
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onView, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {job.title}
              </h3>
              <div className="flex items-center text-sm text-gray-600 space-x-4 mb-2">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {job.company}
                </div>
                {job.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                )}
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {formatSalary(job.salary_min, job.salary_max)}
                </div>
              </div>
            </div>
            
            {/* Status e tipo */}
            <div className="flex items-center space-x-2 ml-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                {formatStatus(job.status)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEmploymentTypeColor(job.employment_type)}`}>
                {formatEmploymentType(job.employment_type)}
              </span>
            </div>
          </div>
          
          {/* Descrição */}
          {job.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {job.description}
            </p>
          )}
          
          {/* Metadados */}
          <div className="flex items-center text-xs text-gray-500 space-x-4">
            <span>Nível: {formatExperienceLevel(job.experience_level)}</span>
            <span>•</span>
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              Criado em {new Date(job.created_at).toLocaleDateString('pt-BR')}
            </div>
            {job.application_deadline && (
              <>
                <span>•</span>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Prazo: {new Date(job.application_deadline).toLocaleDateString('pt-BR')}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Menu de ações */}
        <div className="relative ml-4">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => {
                  onView(job);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </button>
              <button
                onClick={() => {
                  onEdit(job);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </button>
              <button
                onClick={() => {
                  onDelete(job);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componentes de Modal (placeholders - implementar posteriormente)
const JobViewModal: React.FC<{ job: Job; onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
      <div className="p-6">
        <p>Modal de visualização de vaga (implementar)</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-300 rounded">
          Fechar
        </button>
      </div>
    </div>
  </div>
);

const JobFormModal: React.FC<{ job: Job | null; onClose: () => void; onSave: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
      <div className="p-6">
        <p>Modal de formulário de vaga (implementar)</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-300 rounded">
          Fechar
        </button>
      </div>
    </div>
  </div>
);

export default JobsPage;