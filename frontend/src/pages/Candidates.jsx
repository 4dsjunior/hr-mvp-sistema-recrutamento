import React, { useState } from 'react';
import { useCandidates } from '../hooks/useCandidates';

const Candidates = () => {
  const { 
    candidates, 
    loading, 
    error, 
    searchCandidates, 
    deleteCandidate 
  } = useCandidates();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleSearch = () => {
    searchCandidates(searchQuery, statusFilter);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este candidato?')) {
      await deleteCandidate(id);
    }
  };

  if (loading) return <div className="p-4">Carregando candidatos...</div>;
  if (error) return <div className="p-4 text-red-600">Erro: {error}</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Candidatos</h1>
        
        {/* Filtros */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
          
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Lista de Candidatos */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {candidates.map((candidate) => (
            <li key={candidate.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {candidate.first_name} {candidate.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">{candidate.email}</p>
                  <p className="text-sm text-gray-600">{candidate.phone}</p>
                  <span 
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      candidate.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {candidate.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(candidate.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {candidates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum candidato encontrado
        </div>
      )}
    </div>
  );
};

export default Candidates;