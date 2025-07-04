import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import CandidateTable from '../components/Candidates/CandidateTable';
import CandidateForm from '../components/Candidates/CandidateForm';
import CandidateModal from '../components/Candidates/CandidateModal';
import CandidatesFilters from '../components/Candidates/CandidatesFilters';
import Pagination from '../components/UI/Pagination';
import { Candidate, PaginatedResponse } from '../types';
import api from '../lib/api';

const Candidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  
  // Filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCandidates();
  }, [searchQuery, statusFilter, sortBy, currentPage]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      
      // Simulate API call - replace with real API
      const mockCandidates: Candidate[] = [
        {
          id: '1',
          name: 'Maria Silva',
          email: 'maria@email.com',
          phone: '(11) 99999-9999',
          position: 'Desenvolvedor Frontend',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'João Santos',
          email: 'joao@email.com',
          phone: '(11) 88888-8888',
          position: 'Designer UX',
          status: 'interviewed',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          name: 'Ana Costa',
          email: 'ana@email.com',
          phone: '(11) 77777-7777',
          position: 'Analista de Dados',
          status: 'approved',
          created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          name: 'Pedro Oliveira',
          email: 'pedro@email.com',
          phone: '(11) 66666-6666',
          position: 'Desenvolvedor Backend',
          status: 'rejected',
          created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        },
      ];

      // Apply filters
      let filteredCandidates = mockCandidates;
      
      if (searchQuery) {
        filteredCandidates = filteredCandidates.filter(candidate =>
          candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (statusFilter) {
        filteredCandidates = filteredCandidates.filter(candidate =>
          candidate.status === statusFilter
        );
      }

      // Apply sorting
      filteredCandidates.sort((a, b) => {
        switch (sortBy) {
          case 'created_at_desc':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'created_at_asc':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'name_desc':
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      });

      // Pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

      setTotalItems(filteredCandidates.length);
      setTotalPages(Math.ceil(filteredCandidates.length / itemsPerPage));
      setCandidates(paginatedCandidates);
      
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar candidatos:', error);
      setLoading(false);
    }
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

  const handleDeleteCandidate = (candidate: Candidate) => {
    if (window.confirm('Tem certeza que deseja excluir este candidato?')) {
      setCandidates(candidates.filter(c => c.id !== candidate.id));
    }
  };

  const handleSubmitCandidate = async (data: Partial<Candidate>) => {
    try {
      if (editingCandidate) {
        // Update existing candidate
        const updatedCandidate = {
          ...editingCandidate,
          ...data,
          updated_at: new Date().toISOString(),
        };
        setCandidates(candidates.map(c => 
          c.id === editingCandidate.id ? updatedCandidate : c
        ));
      } else {
        // Create new candidate
        const newCandidate: Candidate = {
          id: Date.now().toString(),
          ...data as Candidate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCandidates([newCandidate, ...candidates]);
      }
      
      setShowForm(false);
      setEditingCandidate(null);
    } catch (error) {
      console.error('Erro ao salvar candidato:', error);
    }
  };

  const handleExport = () => {
    // Simulate export functionality
    const csvContent = [
      ['Nome', 'Email', 'Telefone', 'Posição', 'Status', 'Data de Cadastro'],
      ...candidates.map(c => [
        c.name,
        c.email,
        c.phone || '',
        c.position,
        c.status,
        new Date(c.created_at).toLocaleDateString('pt-BR'),
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidatos.csv';
    a.click();
    URL.revokeObjectURL(url);
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
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Candidato</span>
        </button>
      </div>

      <CandidatesFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onExport={handleExport}
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
        />
      )}

      {showModal && selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setShowModal(false)}
          onEdit={handleEditCandidate}
        />
      )}
    </div>
  );
};

export default Candidates;