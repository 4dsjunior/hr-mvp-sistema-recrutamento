// 🔧 CRIAÇÃO: JobsPage.tsx - Página de Vagas Completa
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
  MoreVertical
} from 'lucide-react';

// Types
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
}

// Mock API calls (substituir por API real depois)
const mockJobs: Job[] = [
  {
    id: 1,
    title: "Desenvolvedor Frontend React",
    company: "Tech Solutions Ltd",
    location: "São Paulo, SP",
    description: "Vaga para desenvolvedor frontend especializado em React...",
    requirements: "React, TypeScript, 2+ anos experiência",
    employment_type: "full-time",
    experience_level: "mid-level",
    salary_min: 5000,
    salary_max: 8000,
    status: "active",
    created_at: "2024-07-01T10:00:00Z",
    updated_at: "2024-07-01T10:00:00Z"
  },
  {
    id: 2,
    title: "Designer UX/UI",
    company: "Creative Agency",
    location: "Rio de Janeiro, RJ",
    description: "Procuramos designer criativo para projetos inovadores...",
    requirements: "Figma, Adobe, portfolio strong",
    employment_type: "full-time",
    experience_level: "senior",
    salary_min: 4500,
    salary_max: 7000,
    status: "active",
    created_at: "2024-07-02T10:00:00Z",
    updated_at: "2024-07-02T10:00:00Z"
  },
  {
    id: 3,
    title: "Product Manager",
    company: "Startup Inovadora",
    location: "Belo Horizonte, MG",
    description: "Lidere o desenvolvimento de produtos digitais...",
    requirements: "Experiência em produto, metodologias ágeis",
    employment_type: "full-time",
    experience_level: "senior",
    salary_min: 8000,
    salary_max: 12000,
    status: "paused",
    created_at: "2024-06-25T10:00:00Z",
    updated_at: "2024-06-25T10:00:00Z"
  }
];

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load jobs
  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        // TODO: Substituir por API real
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simular loading
        setJobs(mockJobs);
      } catch (error) {
        console.error('Erro ao carregar vagas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchQuery.toLowerCase());
    
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
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Vaga</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar vagas por título, empresa ou localização..."
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma vaga encontrada</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando sua primeira vaga'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Criar Primeira Vaga</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Criar Nova Vaga</h3>
            <p className="text-gray-600 mb-4">
              Funcionalidade em desenvolvimento. Em breve você poderá criar e gerenciar vagas completas.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  // TODO: Implementar criação
                  console.log('Criar vaga - Em desenvolvimento');
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Job Card Component
const JobCard: React.FC<{ job: Job }> = ({ job }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Building className="h-4 w-4 mr-1" />
            {job.company}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            {job.location}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Status Badge */}
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </button>
              </div>
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
          <DollarSign className="h-4 w-4 mr-2" />
          {job.salary_min && job.salary_max 
            ? `R$ ${job.salary_min.toLocaleString()} - R$ ${job.salary_max.toLocaleString()}`
            : 'Salário a combinar'
          }
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          {job.employment_type === 'full-time' ? 'Tempo integral' : 
           job.employment_type === 'part-time' ? 'Meio período' : 
           job.employment_type === 'contract' ? 'Contrato' : 'Freelance'}
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          Criada em {new Date(job.created_at).toLocaleDateString('pt-BR')}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Ver Candidatos
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
          Editar
        </button>
      </div>
    </div>
  );
};

export default JobsPage;