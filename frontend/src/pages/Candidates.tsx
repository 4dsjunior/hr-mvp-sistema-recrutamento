import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import CandidateTable from '../components/Candidates/CandidateTable';
import CandidateForm from '../components/Candidates/CandidateForm';
import CandidateModal from '../components/Candidates/CandidateModal';
import CandidatesFilters from '../components/Candidates/CandidatesFilters';
import Pagination from '../components/UI/Pagination';
import ToastContainer from '../components/UI/ToastContainer';
import { Candidate } from '../types';
import { candidatesApi } from '../services/candidatesApi';
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

  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      
      let results: Candidate[];
      
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
        await candidatesApi.delete(candidate.id);
        showSuccess('Candidato excluído', `${candidate.name} foi removido com sucesso.`);
        fetchCandidates();
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
        await candidatesApi.update(editingCandidate.id, data);
        showSuccess('Candidato atualizado', `${data.name} foi atualizado com sucesso.`);
      } else {
        // Create new candidate
        await candidatesApi.create(data);
        showSuccess('Candidato criado', `${data.name} foi adicionado com sucesso.`);
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