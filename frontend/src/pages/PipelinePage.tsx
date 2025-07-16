// 🔧 PIPELINE COM DRAG & DROP - VERSÃO AVANÇADA
// Arquivo: frontend/src/pages/PipelinePage.tsx

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Clock,
  Calendar,
  Mail,
  Phone,
  Eye,
  ArrowRight,
  ArrowLeft,
  User,
  RefreshCw,
  AlertCircle,
  Briefcase,
  MessageCircle,
  History,
  GripVertical
} from 'lucide-react';

// 🚀 DRAG & DROP IMPORTS
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ✅ CORREÇÃO: Usar API centralizada com interceptors
import api from '../lib/api';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
}

interface Job {
  id: number;
  title: string;
  company?: string;
  location?: string;
  status: string;
}

interface RecruitmentStage {
  id: number;
  name: string;
  description: string;
  order_position: number;
  color: string;
  is_active: boolean;
}

interface Application {
  id: number;
  candidate_id: number;
  job_id: number;
  status: string;
  stage: number;
  notes?: string;
  applied_at: string;
  updated_at: string;
  candidates?: Candidate;
  jobs?: Job;
  recruitment_stages?: RecruitmentStage;
}

interface StageWithApplications {
  stage: RecruitmentStage;
  applications: Application[];
}

interface PipelineStats {
  total_applications: number;
  status_count: Record<string, number>;
  stage_count: Record<number, number>;
  conversion_rate: number;
  hired_count: number;
}

interface MovementHistory {
  id: number;
  application_id: number;
  from_stage: number;
  to_stage: number;
  moved_by: string;
  moved_at: string;
  notes?: string;
}

interface Comment {
  id: number;
  application_id: number;
  content: string;
  created_by: string;
  created_at: string;
}

// ============================================================================
// API CALLS
// ============================================================================

const pipelineApi = {
  // ✅ Buscar pipeline completo do Supabase
  getPipeline: async (jobId?: number): Promise<{ stages: RecruitmentStage[], applications: Application[] }> => {
    try {
      console.log('🔍 Buscando pipeline completo do Supabase...');
      
      // 1. Buscar etapas de recrutamento
      const stagesResponse = await api.get('/api/recruitment-stages');
      const stages = stagesResponse.data.stages || [];
      console.log('📊 Etapas carregadas:', stages.length);
      
      // 2. Buscar candidaturas com dados relacionados
      let applicationsUrl = '/api/applications';
      if (jobId) {
        applicationsUrl += `?job_id=${jobId}`;
      }
      
      const applicationsResponse = await api.get(applicationsUrl);
      const applications = applicationsResponse.data.applications || [];
      console.log('🔄 Candidaturas carregadas:', applications.length);
      
      // 3. Log das candidaturas por etapa
      const stageDistribution: Record<number, number> = {};
      applications.forEach((app: Application) => {
        const stage = app.stage || 1;
        stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
      });
      console.log('📈 Distribuição por etapa:', stageDistribution);
      
      return { stages, applications };
    } catch (error: any) {
      console.error('❌ Erro ao carregar pipeline:', error);
      throw new Error(error.response?.data?.error || 'Erro ao carregar pipeline');
    }
  },

  // Buscar estatísticas do pipeline
  getStats: async (jobId?: number): Promise<PipelineStats | null> => {
    try {
      const params = jobId ? `?job_id=${jobId}` : '';
      const response = await api.get(`/api/pipeline/stats${params}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      return null;
    }
  },

  // Mover candidato entre etapas
  moveCandidate: async (applicationId: number, action: 'next' | 'previous', notes?: string): Promise<void> => {
    try {
      const response = await api.put(`/api/applications/${applicationId}/stage`, {
        action,
        notes
      });
      console.log('✅ Candidato movido:', response.data);
    } catch (error: any) {
      console.error('❌ Erro ao mover candidato:', error);
      throw new Error(error.response?.data?.error || 'Erro ao mover candidato');
    }
  },

  // Mover candidato para etapa específica (drag & drop)
  moveToStage: async (applicationId: number, targetStage: number, notes?: string): Promise<void> => {
    try {
      const response = await api.put(`/api/applications/${applicationId}/move-to-stage`, {
        target_stage: targetStage,
        notes
      });
      console.log('✅ Candidato movido para etapa:', targetStage, response.data);
    } catch (error: any) {
      console.error('❌ Erro ao mover candidato para etapa:', error);
      throw new Error(error.response?.data?.error || 'Erro ao mover candidato para etapa');
    }
  },

  // Buscar histórico de movimentações
  getMovementHistory: async (applicationId: number): Promise<MovementHistory[]> => {
    try {
      const response = await api.get(`/api/applications/${applicationId}/history`);
      return response.data.history || [];
    } catch (error: any) {
      console.error('❌ Erro ao buscar histórico:', error);
      return [];
    }
  },

  // Buscar comentários
  getComments: async (applicationId: number): Promise<Comment[]> => {
    try {
      const response = await api.get(`/api/applications/${applicationId}/comments`);
      return response.data.comments || [];
    } catch (error: any) {
      console.error('❌ Erro ao buscar comentários:', error);
      return [];
    }
  },

  // Adicionar comentário
  addComment: async (applicationId: number, content: string): Promise<Comment> => {
    try {
      const response = await api.post(`/api/applications/${applicationId}/comments`, {
        content
      });
      return response.data.comment;
    } catch (error: any) {
      console.error('❌ Erro ao adicionar comentário:', error);
      throw new Error(error.response?.data?.error || 'Erro ao adicionar comentário');
    }
  },

  // Buscar vagas para filtro
  getJobs: async (): Promise<Job[]> => {
    try {
      const response = await api.get('/api/jobs?per_page=50');
      return response.data.jobs || [];
    } catch (error: any) {
      console.error('❌ Erro ao carregar vagas:', error);
      return [];
    }
  }
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const PipelinePage: React.FC = () => {
  const [stages, setStages] = useState<RecruitmentStage[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);

  // 🚀 DRAG & DROP STATES
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedApplication, setDraggedApplication] = useState<Application | null>(null);
  
  // 📊 MODAL STATES
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [movementHistory, setMovementHistory] = useState<MovementHistory[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  // 🎯 SENSORS FOR DRAG & DROP
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  // ✅ CARREGAR PIPELINE COMPLETO - CORREÇÃO APLICADA
  const loadPipeline = async () => {
    setLoading(true);
    setError(null);
    try {
      // Determinar filtro de vaga
      const jobFilter = selectedJob === 'all' ? undefined : Number(selectedJob);
      
      // ✅ CORREÇÃO: Carregar pipeline sequencialmente ao invés de Promise.all
      console.log('🔍 Carregando pipeline sequencialmente...');

      // 1. Carregar pipeline primeiro  
      const pipelineData = await pipelineApi.getPipeline(jobFilter);
      console.log('✅ Pipeline carregado');

      // 2. Carregar estatísticas depois
      const statsData = await pipelineApi.getStats(jobFilter);
      console.log('✅ Estatísticas carregadas');
      
      setStages(pipelineData.stages);
      setApplications(pipelineData.applications);
      setStats(statsData);
      
      console.log(`✅ Pipeline carregado: ${pipelineData.stages.length} etapas, ${pipelineData.applications.length} candidaturas`);
    } catch (err: any) {
      console.error('❌ Erro ao carregar pipeline:', err);
      setError(err.message);
      setStages([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CARREGAR VAGAS PARA FILTRO
  const loadJobs = async () => {
    try {
      const jobs = await pipelineApi.getJobs();
      setAvailableJobs(jobs);
    } catch (error) {
      console.error('❌ Erro ao carregar vagas para filtro:', error);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadJobs();
  }, []);

  // Recarregar pipeline quando filtro de vaga mudar
  useEffect(() => {
    loadPipeline();
  }, [selectedJob]);

  // ✅ ORGANIZAR CANDIDATURAS POR ETAPA
  const stagesWithApplications: StageWithApplications[] = stages.map(stage => {
    const stageApplications = applications.filter(app => {
      const matchesStage = app.stage === stage.order_position;
      const matchesSearch = !searchQuery || 
        app.candidates?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidates?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.candidates?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobs?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStage && matchesSearch;
    });

    return {
      stage,
      applications: stageApplications
    };
  });

  // ✅ MOVER CANDIDATO
  const handleMoveCandidate = async (applicationId: number, action: 'next' | 'previous') => {
    try {
      await pipelineApi.moveCandidate(applicationId, action);
      console.log('✅ Candidato movido com sucesso');
      await loadPipeline(); // Recarregar pipeline
    } catch (err: any) {
      console.error('❌ Erro ao mover candidato:', err);
      alert('Erro ao mover candidato: ' + err.message);
    }
  };

  // 🚀 DRAG & DROP HANDLERS
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const applicationId = String(active.id);
    
    console.log('🎯 Iniciando drag:', applicationId);
    
    const application = applications.find(app => app.id === parseInt(applicationId));
    if (application) {
      setActiveId(applicationId);
      setDraggedApplication(application);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      console.log('🚫 Drag cancelado - sem destino');
      setActiveId(null);
      setDraggedApplication(null);
      return;
    }

    const applicationId = parseInt(String(active.id));
    const targetStageId = String(over.id);
    
    console.log('📦 Finalizando drag:', { applicationId, targetStageId });
    
    // Encontrar a etapa de destino
    const targetStage = stages.find(stage => `stage-${stage.id}` === targetStageId);
    
    if (!targetStage) {
      console.log('🚫 Etapa de destino não encontrada');
      setActiveId(null);
      setDraggedApplication(null);
      return;
    }

    // Verificar se a candidatura já está nesta etapa
    const currentApplication = applications.find(app => app.id === applicationId);
    if (currentApplication?.stage === targetStage.order_position) {
      console.log('🚫 Candidatura já está nesta etapa');
      setActiveId(null);
      setDraggedApplication(null);
      return;
    }

    try {
      console.log('🔄 Movendo candidato para etapa:', targetStage.order_position);
      await pipelineApi.moveToStage(applicationId, targetStage.order_position);
      console.log('✅ Candidato movido via drag & drop');
      await loadPipeline(); // Recarregar pipeline
    } catch (err: any) {
      console.error('❌ Erro ao mover candidato via drag & drop:', err);
      alert('Erro ao mover candidato: ' + err.message);
    } finally {
      setActiveId(null);
      setDraggedApplication(null);
    }
  };

  // 📊 MODAL HANDLERS
  const handleViewHistory = async (application: Application) => {
    try {
      console.log('📊 Carregando histórico para:', application.id);
      setSelectedApplication(application);
      const history = await pipelineApi.getMovementHistory(application.id);
      setMovementHistory(history);
      setShowHistoryModal(true);
    } catch (err: any) {
      console.error('❌ Erro ao carregar histórico:', err);
      alert('Erro ao carregar histórico: ' + err.message);
    }
  };

  const handleViewComments = async (application: Application) => {
    try {
      console.log('💬 Carregando comentários para:', application.id);
      setSelectedApplication(application);
      const comments = await pipelineApi.getComments(application.id);
      setComments(comments);
      setShowCommentsModal(true);
    } catch (err: any) {
      console.error('❌ Erro ao carregar comentários:', err);
      alert('Erro ao carregar comentários: ' + err.message);
    }
  };

  const handleAddComment = async () => {
    if (!selectedApplication || !newComment.trim()) return;
    
    try {
      setIsAddingComment(true);
      const comment = await pipelineApi.addComment(selectedApplication.id, newComment.trim());
      setComments([...comments, comment]);
      setNewComment('');
      console.log('✅ Comentário adicionado');
    } catch (err: any) {
      console.error('❌ Erro ao adicionar comentário:', err);
      alert('Erro ao adicionar comentário: ' + err.message);
    } finally {
      setIsAddingComment(false);
    }
  };

  // ✅ FORMATAÇÃO DE DATA
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // ============================================================================
  // COMPONENTES DRAG & DROP
  // ============================================================================

  interface DraggableApplicationProps {
    application: Application;
    isOverlay?: boolean;
  }

  const DraggableApplication: React.FC<DraggableApplicationProps> = ({ 
    application, 
    isOverlay = false 
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ 
      id: application.id,
      data: { application }
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`
          bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow
          ${isOverlay ? 'shadow-lg' : ''}
          ${isDragging ? 'opacity-50' : ''}
        `}
        {...attributes}
      >
        {/* Drag Handle */}
        <div className="flex items-center justify-between mb-2">
          <div 
            {...listeners} 
            className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            title="Arrastar para mover"
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleViewHistory(application)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Ver histórico"
            >
              <History className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleViewComments(application)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Ver comentários"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Candidate Info */}
        <div className="mb-3">
          <h4 className="font-medium text-gray-900">
            {application.candidates?.first_name} {application.candidates?.last_name}
          </h4>
          <p className="text-sm text-gray-600 flex items-center mt-1">
            <Mail className="h-3 w-3 mr-1" />
            {application.candidates?.email}
          </p>
          {application.candidates?.phone && (
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <Phone className="h-3 w-3 mr-1" />
              {application.candidates.phone}
            </p>
          )}
        </div>

        {/* Job Info */}
        {application.jobs && (
          <div className="mb-3 p-2 bg-blue-50 rounded">
            <p className="text-sm font-medium text-blue-900 flex items-center">
              <Briefcase className="h-3 w-3 mr-1" />
              {application.jobs.title}
            </p>
            {application.jobs.company && (
              <p className="text-xs text-blue-700">{application.jobs.company}</p>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="text-xs text-gray-500 mb-3">
          <p className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Aplicou em {formatDate(application.applied_at)}
          </p>
          <p className="mt-1">Status: {application.status}</p>
        </div>

        {/* Notes */}
        {application.notes && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              {application.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button
            onClick={() => handleMoveCandidate(application.id, 'previous')}
            disabled={application.stage === 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Voltar etapa"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => console.log('Ver perfil', application.id)}
            className="p-1 text-blue-600 hover:text-blue-800"
            title="Ver perfil"
          >
            <Eye className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => handleMoveCandidate(application.id, 'next')}
            disabled={application.stage === 9}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Próxima etapa"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  interface DroppableStageProps {
    stage: RecruitmentStage;
    applications: Application[];
  }

  const DroppableStage: React.FC<DroppableStageProps> = ({ stage, applications }) => {
    const { isOver, setNodeRef } = useSortable({
      id: `stage-${stage.id}`,
      data: { stage }
    });

    return (
      <div
        ref={setNodeRef}
        className={`
          flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4 transition-colors
          ${isOver ? 'bg-blue-50 border-blue-200' : ''}
        `}
        style={{ borderTop: `4px solid ${stage.color}` }}
      >
        {/* Stage Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">
              {stage.name}
            </h3>
            <span 
              className="px-2 py-1 text-xs font-medium text-white rounded-full"
              style={{ backgroundColor: stage.color }}
            >
              {applications.length}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {stage.description}
          </p>
        </div>

        {/* Applications */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <SortableContext items={applications.map(app => app.id)} strategy={verticalListSortingStrategy}>
            {applications.length > 0 ? (
              applications.map((application) => (
                <DraggableApplication
                  key={application.id}
                  application={application}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum candidato nesta etapa</p>
              </div>
            )}
          </SortableContext>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline de Candidatos</h1>
          <p className="text-gray-600">Acompanhe o progresso dos candidatos no processo seletivo</p>
        </div>
        <button
          onClick={loadPipeline}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
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
                placeholder="Buscar candidatos por nome, email ou vaga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Job Filter */}
          <div className="sm:w-64">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas as vagas</option>
              {availableJobs.map((job) => (
                <option key={job.id} value={job.id.toString()}>
                  {job.title} - {job.company}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pipeline Stats */}
      {stats && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Candidatos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_applications}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contratados</p>
                <p className="text-2xl font-bold text-green-900">{stats.hired_count}</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-purple-900">{stats.conversion_rate}%</p>
              </div>
              <ArrowRight className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Processo</p>
                <p className="text-2xl font-bold text-orange-900">
                  {stats.total_applications - stats.hired_count}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Carregando pipeline...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-red-800 font-medium">Erro ao carregar pipeline</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={loadPipeline}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Pipeline Kanban com Drag & Drop */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex space-x-4 min-w-max">
              <SortableContext items={stages.map(stage => `stage-${stage.id}`)} strategy={verticalListSortingStrategy}>
                {stagesWithApplications.map((stageData) => (
                  <DroppableStage
                    key={stageData.stage.id}
                    stage={stageData.stage}
                    applications={stageData.applications}
                  />
                ))}
              </SortableContext>
            </div>
            
            {/* Drag Overlay */}
            <DragOverlay>
              {draggedApplication && (
                <DraggableApplication
                  application={draggedApplication}
                  isOverlay={true}
                />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && applications.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma candidatura encontrada
          </h3>
          <p className="text-gray-600 mb-4">
            {selectedJob === 'all' 
              ? 'Não há candidaturas no sistema ainda.'
              : 'Não há candidaturas para a vaga selecionada.'
            }
          </p>
          {selectedJob !== 'all' && (
            <button
              onClick={() => setSelectedJob('all')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver todas as candidaturas
            </button>
          )}
        </div>
      )}

      {/* Modal de Histórico */}
      {showHistoryModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Histórico de Movimentações
                  </h2>
                  <p className="text-gray-600">
                    {selectedApplication.candidates?.first_name} {selectedApplication.candidates?.last_name}
                  </p>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {movementHistory.length > 0 ? (
                <div className="space-y-4">
                  {movementHistory.map((movement) => (
                    <div key={movement.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Etapa {movement.from_stage} → Etapa {movement.to_stage}
                          </p>
                          <p className="text-sm text-gray-600">
                            Movido por: {movement.moved_by}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(movement.moved_at)}
                          </p>
                        </div>
                      </div>
                      {movement.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-600">{movement.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma movimentação ainda
                  </h3>
                  <p className="text-gray-600">
                    Este candidato ainda não foi movido entre etapas.
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Comentários */}
      {showCommentsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Comentários
                  </h2>
                  <p className="text-gray-600">
                    {selectedApplication.candidates?.first_name} {selectedApplication.candidates?.last_name}
                  </p>
                </div>
                <button
                  onClick={() => setShowCommentsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{comment.created_by}</p>
                        <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum comentário ainda
                  </h3>
                  <p className="text-gray-600">
                    Seja o primeiro a comentar sobre este candidato.
                  </p>
                </div>
              )}
            </div>
            
            {/* Adicionar comentário */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicione um comentário..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isAddingComment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAddingComment ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowCommentsModal(false)}
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

export default PipelinePage;