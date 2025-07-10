// 🎯 SEMANA 7-8: Sistema de Candidaturas - Pipeline Kanban Page
// Arquivo: frontend/src/pages/PipelinePage.tsx

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Filter, 
  RefreshCw,
  BarChart3,
  Download,
  Plus,
  Search,
  Building
} from 'lucide-react';
import { 
  applicationsApi, 
  Pipeline, 
  PipelineStats,
  Application,
  RecruitmentStage,
  formatStatus,
  formatTimeAgo,
  getProgressPercentage,
  calculateDaysInProcess
} from '../services/applicationsApi';
import { jobsApi, Job } from '../services/jobsApi';

interface PipelinePageProps {}

const PipelinePage: React.FC<PipelinePageProps> = () => {
  // Estado principal
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [showStats, setShowStats] = useState(false);
  
  // UI estados
  const [draggedApplication, setDraggedApplication] = useState<Application | null>(null);
  const [dragOverStage, setDragOverStage] = useState<number | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
    loadJobs();
  }, []);

  // Recarregar quando job selecionado mudar
  useEffect(() => {
    loadData();
  }, [selectedJobId]);

  // Carregar pipeline e estatísticas
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pipelineData, statsData] = await Promise.all([
        applicationsApi.getPipeline(selectedJobId || undefined),
        applicationsApi.getPipelineStats(selectedJobId || undefined)
      ]);

      setPipeline(pipelineData);
      setStats(statsData);

    } catch (err) {
      setError('Erro ao carregar dados do pipeline. Tente novamente.');
      console.error('Erro ao carregar pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar lista de vagas para filtro
  const loadJobs = async () => {
    try {
      const response = await jobsApi.getJobs({ status: 'active', per_page: 100 });
      setJobs(response.jobs);
    } catch (err) {
      console.error('Erro ao carregar vagas:', err);
    }
  };

  // Handlers para drag and drop
  const handleDragStart = (e: React.DragEvent, application: Application) => {
    setDraggedApplication(application);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: number) => {
    e.preventDefault();
    setDragOverStage(null);

    if (!draggedApplication || draggedApplication.stage === targetStageId) {
      setDraggedApplication(null);
      return;
    }

    try {
      await applicationsApi.moveApplicationStage(draggedApplication.id, {
        action: 'specific',
        target_stage: targetStageId,
        notes: `Movido para ${pipeline?.stages.find(s => s.id === targetStageId)?.name}`
      });

      // Recarregar dados
      loadData();
      setDraggedApplication(null);

    } catch (err) {
      console.error('Erro ao mover candidatura:', err);
      alert('Erro ao mover candidatura. Tente novamente.');
    }
  };

  // Exportar dados do pipeline
  const handleExport = async () => {
    try {
      const csvContent = await applicationsApi.exportApplications({ 
        job_id: selectedJobId || undefined 
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pipeline_${selectedJobId ? `vaga_${selectedJobId}_` : ''}${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erro ao exportar dados. Tente novamente.');
      console.error('Erro ao exportar:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pipeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pipeline de Candidaturas</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Gerencie o processo de recrutamento através das 9 etapas
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium ${
                    showStats 
                      ? 'border-blue-300 text-blue-700 bg-blue-50' 
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Estatísticas
                </button>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
                <button
                  onClick={loadData}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por Vaga
              </label>
              <select
                value={selectedJobId || ''}
                onChange={(e) => setSelectedJobId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas as vagas</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.company}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedJobId && (
              <button
                onClick={() => setSelectedJobId(null)}
                className="mt-6 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Limpar filtro
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas do Pipeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Total</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.total_applications}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">Contratados</p>
                    <p className="text-2xl font-bold text-green-900">{stats.hired_count}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">Taxa Conversão</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.conversion_rate}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-600">Tempo Médio</p>
                    <p className="text-2xl font-bold text-orange-900">{stats.avg_time_to_hire_days}d</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-600">Em Andamento</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {stats.status_count.in_progress || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Kanban */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {pipeline && pipeline.stages.length > 0 ? (
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {pipeline.stages.map((stage) => {
              const stageData = pipeline.pipeline[stage.id];
              const applications = stageData?.applications || [];
              const isDragOver = dragOverStage === stage.id;

              return (
                <div
                  key={stage.id}
                  className={`flex-shrink-0 w-80 bg-white rounded-lg shadow-sm border-2 transition-colors ${
                    isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                  }`}
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Header da coluna */}
                  <div 
                    className="p-4 border-b border-gray-200"
                    style={{ borderTopColor: stage.color }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                        <p className="text-sm text-gray-500">{stage.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span 
                          className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full"
                          style={{ backgroundColor: stage.color }}
                        >
                          {applications.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lista de candidaturas */}
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {applications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma candidatura</p>
                      </div>
                    ) : (
                      applications.map((application) => (
                        <ApplicationCard
                          key={application.id}
                          application={application}
                          onDragStart={handleDragStart}
                          isDragging={draggedApplication?.id === application.id}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma candidatura encontrada
            </h3>
            <p className="text-gray-500">
              {selectedJobId 
                ? 'Esta vaga ainda não possui candidaturas.' 
                : 'Não há candidaturas no sistema.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente ApplicationCard
interface ApplicationCardProps {
  application: Application;
  onDragStart: (e: React.DragEvent, application: Application) => void;
  isDragging: boolean;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ 
  application, 
  onDragStart, 
  isDragging 
}) => {
  const candidate = application.candidates;
  const job = application.jobs;
  const daysInProcess = calculateDaysInProcess(application.applied_at, application.updated_at);
  const progress = getProgressPercentage(application.stage);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, application)}
      className={`p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:shadow-md transition-all ${
        isDragging ? 'opacity-50 rotate-2' : ''
      }`}
    >
      {/* Cabeçalho do card */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Candidato'}
          </h4>
          <p className="text-xs text-gray-600 truncate">
            {candidate?.email}
          </p>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          application.status === 'hired' ? 'bg-green-100 text-green-800' :
          application.status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {formatStatus(application.status)}
        </span>
      </div>

      {/* Informações da vaga */}
      {job && (
        <div className="mb-2">
          <p className="text-xs text-gray-600 truncate">
            <Building className="h-3 w-3 inline mr-1" />
            {job.title} - {job.company}
          </p>
        </div>
      )}

      {/* Progresso */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progresso</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Tempo no processo */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {daysInProcess} {daysInProcess === 1 ? 'dia' : 'dias'}
        </span>
        <span>{formatTimeAgo(application.applied_at)}</span>
      </div>

      {/* Notas (se houver) */}
      {application.notes && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600 line-clamp-2">
            {application.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default PipelinePage;