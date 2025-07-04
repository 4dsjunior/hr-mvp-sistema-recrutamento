import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import CandidateTable from '../components/Candidates/CandidateTable';
import CandidateForm from '../components/Candidates/CandidateForm';
import CandidateModal from '../components/Candidates/CandidateModal';
import CandidatesFilters from '../components/Candidates/CandidatesFilters';
import Pagination from '../components/UI/Pagination';
import ToastContainer from '../components/UI/ToastContainer';
import { Candidate } from '../types';
<<<<<<< HEAD
import { candidatesApi } from '../services/candidatesApi';
=======
import { candidateService, CandidateFilters } from '../services/candidateService';
>>>>>>> 7f531d6f5fd857414939463899b888cc5aefc78f
import { useToast } from '../hooks/useToast';

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

<<<<<<< HEAD
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();
=======
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();
>>>>>>> 7f531d6f5fd857414939463899b888cc5aefc78f

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      
<<<<<<< HEAD
      let results: Candidate[];
=======
      // For now, use mock data since backend integration is not complete
      const mockCandidates: Candidate[] = [
        {
          id: '1',
          name: 'Maria Silva Santos',
          email: 'maria.silva@email.com',
          phone: '(11) 99999-9999',
          position: 'Desenvolvedor Frontend',
          status: 'pending',
          photo_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
          address: 'São Paulo, SP',
          summary: 'Desenvolvedora Frontend com 5 anos de experiência em React, TypeScript e Node.js. Especialista em desenvolvimento de interfaces modernas e responsivas.',
          linkedin: 'https://linkedin.com/in/mariasilva',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'João Santos Oliveira',
          email: 'joao.santos@email.com',
          phone: '(11) 88888-8888',
          position: 'Designer UX/UI',
          status: 'interviewed',
          address: 'Rio de Janeiro, RJ',
          summary: 'Designer UX/UI com foco em experiência do usuário e design thinking. Experiência em Figma, Adobe XD e prototipagem.',
          linkedin: 'https://linkedin.com/in/joaosantos',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          name: 'Ana Costa Ferreira',
          email: 'ana.costa@email.com',
          phone: '(11) 77777-7777',
          position: 'Analista de Dados',
          status: 'approved',
          photo_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
          address: 'Belo Horizonte, MG',
          summary: 'Analista de dados especializada em Python, SQL e Machine Learning. Experiência em análise estatística e visualização de dados.',
          linkedin: 'https://linkedin.com/in/anacosta',
          created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          name: 'Pedro Oliveira Lima',
          email: 'pedro.oliveira@email.com',
          phone: '(11) 66666-6666',
          position: 'Desenvolvedor Backend',
          status: 'rejected',
          address: 'Porto Alegre, RS',
          summary: 'Desenvolvedor Backend com expertise em Java, Spring Boot e microserviços. Conhecimento em arquitetura de sistemas distribuídos.',
          linkedin: 'https://linkedin.com/in/pedrooliveira',
          created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '5',
          name: 'Carla Mendes Rodrigues',
          email: 'carla.mendes@email.com',
          phone: '(11) 55555-5555',
          position: 'Product Manager',
          status: 'pending',
          photo_url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
          address: 'Curitiba, PR',
          summary: 'Product Manager com experiência em metodologias ágeis, análise de mercado e gestão de produtos digitais.',
          linkedin: 'https://linkedin.com/in/carlamendes',
          created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
        },
      ];

      // Apply filters
      let filteredCandidates = mockCandidates;
>>>>>>> 7f531d6f5fd857414939463899b888cc5aefc78f
      
      // Se há filtros, usar search, senão usar getAll
      if (searchQuery || statusFilter) {
        results = await candidatesApi.search(searchQuery, statusFilter);
      } else {
        results = await candidatesApi.getAll();
      }

      // Apply sorting
      results.sort((a, b) => {
        switch (sortBy) {
          case 'created_at_desc':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'created_at_asc':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'name_desc':
            return b.name.localeCompare(a.name);
          case 'status_asc':
            return a.status.localeCompare(b.status);
          default:
            return 0;
        }
      });

      // Pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedCandidates = results.slice(startIndex, endIndex);

      setTotalItems(results.length);
      setTotalPages(Math.ceil(results.length / itemsPerPage));
      setCandidates(paginatedCandidates);
      
    } catch (error: any) {
      console.error('Erro ao carregar candidatos:', error);
      showError('Erro ao carregar candidatos', error.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, sortBy, currentPage, showError]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Debounced search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      fetchCandidates();
    }, 300);
    
    setSearchTimeout(timeout);
  };

  const handleCreateCandidate = () => {
    setEditingCandidate(null);
    setShowForm(true);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setShowForm(true);
    setShowModal(false);
  };

  const handleViewCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  const handleDeleteCandidate = async (candidate: Candidate) => {
    if (window.confirm(`Tem certeza que deseja excluir o candidato ${candidate.name}?`)) {
      try {
<<<<<<< HEAD
        await candidatesApi.delete(candidate.id);
        showSuccess('Candidato excluído', `${candidate.name} foi removido com sucesso.`);
        fetchCandidates();
=======
        // await candidateService.deleteCandidate(candidate.id);
        setCandidates(candidates.filter(c => c.id !== candidate.id));
        showSuccess('Candidato excluído', `${candidate.name} foi removido com sucesso.`);
>>>>>>> 7f531d6f5fd857414939463899b888cc5aefc78f
      } catch (error: any) {
        console.error('Erro ao excluir candidato:', error);
        showError('Erro ao excluir candidato', error.message);
      }
    }
  };

  const handleSubmitCandidate = async (data: Partial<Candidate>) => {
    try {
      setFormLoading(true);
      
      if (editingCandidate) {
        // Update existing candidate
<<<<<<< HEAD
        await candidatesApi.update(editingCandidate.id, data);
        showSuccess('Candidato atualizado', `${data.name} foi atualizado com sucesso.`);
      } else {
        // Create new candidate
        await candidatesApi.create(data);
        showSuccess('Candidato criado', `${data.name} foi adicionado com sucesso.`);
=======
        // const updatedCandidate = await candidateService.updateCandidate(editingCandidate.id, data);
        const updatedCandidate = {
          ...editingCandidate,
          ...data,
          updated_at: new Date().toISOString(),
        };
        setCandidates(candidates.map(c => 
          c.id === editingCandidate.id ? updatedCandidate : c
        ));
        showSuccess('Candidato atualizado', `${updatedCandidate.name} foi atualizado com sucesso.`);
      } else {
        // Create new candidate
        // const newCandidate = await candidateService.createCandidate(data as Omit<Candidate, 'id' | 'created_at' | 'updated_at'>);
        const newCandidate: Candidate = {
          id: Date.now().toString(),
          ...data as Candidate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCandidates([newCandidate, ...candidates]);
        showSuccess('Candidato criado', `${newCandidate.name} foi adicionado com sucesso.`);
>>>>>>> 7f531d6f5fd857414939463899b888cc5aefc78f
      }
      
      setShowForm(false);
      setEditingCandidate(null);
      fetchCandidates();
    } catch (error: any) {
      console.error('Erro ao salvar candidato:', error);
      showError('Erro ao salvar candidato', error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // For now, create a simple CSV export
      const csvContent = [
        ['Nome', 'Email', 'Telefone', 'Posição', 'Status', 'Endereço', 'Data de Cadastro'],
        ...candidates.map(c => [
          c.name,
          c.email,
          c.phone || '',
          c.position,
          c.status === 'pending' ? 'Ativo' :
          c.status === 'interviewed' ? 'Entrevistado' :
          c.status === 'approved' ? 'Contratado' : 'Inativo',
          c.address || '',
          new Date(c.created_at).toLocaleDateString('pt-BR'),
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidatos_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      showSuccess('Exportação concluída', 'Arquivo CSV baixado com sucesso.');
    } catch (error: any) {
      console.error('Erro ao exportar candidatos:', error);
      showError('Erro na exportação', error.message);
    }
  };

  const handleRefresh = () => {
    fetchCandidates();
    showInfo('Lista atualizada', 'Dados dos candidatos foram recarregados.');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Candidatos</h1>
          <p className="text-gray-600">
            Gerencie os candidatos do seu processo seletivo
          </p>
        </div>
        <button
          onClick={handleCreateCandidate}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Candidato</span>
        </button>
      </div>

      <CandidatesFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={(status) => {
          setStatusFilter(status);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        onSortChange={(sort) => {
          setSortBy(sort);
          setCurrentPage(1);
        }}
        onExport={handleExport}
        onRefresh={handleRefresh}
        loading={loading}
      />

      <CandidateTable
        candidates={candidates}
        loading={loading}
        onView={handleViewCandidate}
        onEdit={handleEditCandidate}
        onDelete={handleDeleteCandidate}
      />

      {!loading && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {showForm && (
        <CandidateForm
          candidate={editingCandidate || undefined}
          onSubmit={handleSubmitCandidate}
          onCancel={() => {
            setShowForm(false);
            setEditingCandidate(null);
          }}
          loading={formLoading}
        />
      )}

      {showModal && selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setShowModal(false)}
          onEdit={handleEditCandidate}
        />
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default Candidates;