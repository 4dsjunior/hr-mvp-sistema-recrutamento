// frontend/src/components/Candidates/CandidatesFilters.tsx - VERSÃO LIMPA
import React from 'react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';

interface CandidatesFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onExport: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

const CandidatesFilters: React.FC<CandidatesFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  onExport,
  onRefresh,
  loading,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-card p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
            >
              <option value="">Todos os status</option>
              <option value="pending">Ativo</option>
              <option value="interviewed">Entrevistado</option>
              <option value="approved">Contratado</option>
              <option value="rejected">Inativo</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm"
          >
            <option value="created_at_desc">Mais recente</option>
            <option value="created_at_asc">Mais antigo</option>
            <option value="name_asc">Nome (A-Z)</option>
            <option value="name_desc">Nome (Z-A)</option>
            <option value="status_asc">Status</option>
          </select>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Atualizar"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={onExport}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(searchQuery || statusFilter) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">Filtros ativos:</span>
            {searchQuery && (
              <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                Busca: "{searchQuery}"
              </span>
            )}
            {statusFilter && (
              <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                Status: {statusFilter === 'pending' ? 'Ativo' : 
                        statusFilter === 'interviewed' ? 'Entrevistado' :
                        statusFilter === 'approved' ? 'Contratado' : 'Inativo'}
              </span>
            )}
            <button
              onClick={() => {
                onSearchChange('');
                onStatusFilterChange('');
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidatesFilters;