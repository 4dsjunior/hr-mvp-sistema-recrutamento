// 🎯 SEMANA 7-8: Sistema de Candidaturas - Frontend API Service
// Arquivo: frontend/src/services/applicationsApi.ts

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Tipos TypeScript para Applications
export interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  address?: string;
  birth_date?: string;
  linkedin?: string;
  github?: string;
  resume_url?: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  status: string;
}

export interface RecruitmentStage {
  id: number;
  name: string;
  description: string;
  order_position: number;
  color: string;
  is_active: boolean;
}

export interface ApplicationHistory {
  id: number;
  application_id: number;
  previous_status: string | null;
  new_status: string;
  previous_stage: number | null;
  new_stage: number;
  notes: string;
  changed_by: string;
  changed_at: string;
  profiles?: {
    full_name: string;
  };
}

export interface ApplicationComment {
  id: number;
  application_id: number;
  user_id: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export interface Application {
  id: number;
  candidate_id: number;
  job_id: number;
  status: 'applied' | 'in_progress' | 'hired' | 'rejected';
  stage: number;
  notes: string;
  applied_at: string;
  updated_at: string;
  created_by?: string;
  candidates?: Candidate;
  jobs?: Job;
  recruitment_stages?: RecruitmentStage;
  history?: ApplicationHistory[];
  comments?: ApplicationComment[];
}

export interface ApplicationFormData {
  candidate_id: number;
  job_id: number;
  status?: string;
  stage?: number;
  notes?: string;
}

export interface ApplicationFilters {
  page?: number;
  per_page?: number;
  status?: string;
  stage?: number;
  job_id?: number;
  candidate_id?: number;
}

export interface ApplicationsResponse {
  applications: Application[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface PipelineStage {
  stage: RecruitmentStage;
  applications: Application[];
}

export interface Pipeline {
  pipeline: Record<number, PipelineStage>;
  stages: RecruitmentStage[];
  total_applications: number;
}

export interface PipelineStats {
  total_applications: number;
  status_count: Record<string, number>;
  stage_count: Record<number, number>;
  conversion_rate: number;
  avg_time_to_hire_days: number;
  hired_count: number;
}

export interface StageUpdateData {
  action: 'next' | 'previous' | 'specific';
  target_stage?: number;
  notes?: string;
}

export interface BatchStageUpdate {
  application_ids: number[];
  target_stage: number;
  notes?: string;
}

export interface CommentData {
  comment: string;
  is_internal?: boolean;
}

// Configuração do axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Applications API Error:', error.response?.data || error.message);
    throw error;
  }
);

// ==================== APPLICATIONS API ====================

class ApplicationsApi {
  // Listar candidaturas com filtros
  async getApplications(filters: ApplicationFilters = {}): Promise<ApplicationsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/applications?${params.toString()}`);
    return response.data;
  }

  // Obter candidatura específica com histórico
  async getApplication(id: number): Promise<Application> {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  }

  // Criar nova candidatura
  async createApplication(applicationData: ApplicationFormData): Promise<Application> {
    const response = await api.post('/applications', applicationData);
    return response.data.application;
  }

  // Atualizar candidatura
  async updateApplication(id: number, applicationData: Partial<ApplicationFormData>): Promise<Application> {
    const response = await api.put(`/applications/${id}`, applicationData);
    return response.data.application;
  }

  // Mover candidatura para outra etapa
  async moveApplicationStage(id: number, stageData: StageUpdateData): Promise<Application> {
    const response = await api.put(`/applications/${id}/stage`, stageData);
    return response.data.application;
  }

  // Deletar candidatura
  async deleteApplication(id: number): Promise<void> {
    await api.delete(`/applications/${id}`);
  }

  // Obter pipeline Kanban
  async getPipeline(jobId?: number): Promise<Pipeline> {
    const params = jobId ? `?job_id=${jobId}` : '';
    const response = await api.get(`/pipeline${params}`);
    return response.data;
  }

  // Estatísticas do pipeline
  async getPipelineStats(jobId?: number): Promise<PipelineStats> {
    const params = jobId ? `?job_id=${jobId}` : '';
    const response = await api.get(`/pipeline/stats${params}`);
    return response.data;
  }

  // Obter etapas do recrutamento
  async getRecruitmentStages(): Promise<RecruitmentStage[]> {
    const response = await api.get('/recruitment-stages');
    return response.data.stages;
  }

  // Comentários da candidatura
  async getApplicationComments(applicationId: number): Promise<ApplicationComment[]> {
    const response = await api.get(`/applications/${applicationId}/comments`);
    return response.data.comments;
  }

  // Adicionar comentário
  async addApplicationComment(applicationId: number, commentData: CommentData): Promise<ApplicationComment> {
    const response = await api.post(`/applications/${applicationId}/comments`, commentData);
    return response.data.comment;
  }

  // Operações em lote - mover múltiplas candidaturas
  async batchMoveApplications(batchData: BatchStageUpdate): Promise<{ updated_count: number; message: string }> {
    const response = await api.put('/applications/batch/stage', batchData);
    return response.data;
  }

  // Exportar candidaturas para CSV
  async exportApplications(filters: ApplicationFilters = {}): Promise<string> {
    const { applications } = await this.getApplications(filters);
    
    const headers = [
      'ID',
      'Candidato',
      'Email',
      'Telefone',
      'Vaga',
      'Empresa',
      'Status',
      'Etapa',
      'Data da Candidatura',
      'Última Atualização',
      'Notas'
    ];
    
    const rows = applications.map(app => [
      app.id,
      app.candidates ? `${app.candidates.first_name} ${app.candidates.last_name}` : 'N/A',
      app.candidates?.email || 'N/A',
      app.candidates?.phone || 'N/A',
      app.jobs?.title || 'N/A',
      app.jobs?.company || 'N/A',
      formatStatus(app.status),
      app.recruitment_stages?.name || `Etapa ${app.stage}`,
      new Date(app.applied_at).toLocaleDateString('pt-BR'),
      new Date(app.updated_at).toLocaleDateString('pt-BR'),
      app.notes || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');
    
    return csvContent;
  }
}

// Instância singleton da API
export const applicationsApi = new ApplicationsApi();

// ==================== UTILITY FUNCTIONS ====================

export const formatStatus = (status: string): string => {
  const statuses: Record<string, string> = {
    'applied': 'Candidatou-se',
    'in_progress': 'Em andamento',
    'hired': 'Contratado',
    'rejected': 'Rejeitado'
  };
  return statuses[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'applied': 'bg-blue-100 text-blue-800',
    'in_progress': 'bg-yellow-100 text-yellow-800',
    'hired': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStageColor = (stageId: number): string => {
  const colors: Record<number, string> = {
    1: '#3b82f6', // blue
    2: '#8b5cf6', // purple
    3: '#06b6d4', // cyan
    4: '#f59e0b', // amber
    5: '#10b981', // emerald
    6: '#ef4444', // red
    7: '#84cc16', // lime
    8: '#f97316', // orange
    9: '#22c55e'  // green
  };
  return colors[stageId] || '#6b7280';
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Agora há pouco';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h atrás`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} dias atrás`;
  
  return date.toLocaleDateString('pt-BR');
};

export const calculateDaysInProcess = (appliedAt: string, updatedAt?: string): number => {
  const startDate = new Date(appliedAt);
  const endDate = updatedAt ? new Date(updatedAt) : new Date();
  const diffInMs = endDate.getTime() - startDate.getTime();
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
};

export const getProgressPercentage = (currentStage: number, totalStages: number = 9): number => {
  return Math.round((currentStage / totalStages) * 100);
};

// Função para determinar próxima ação recomendada
export const getRecommendedAction = (application: Application): string => {
  const stage = application.stage;
  const daysSinceUpdate = calculateDaysInProcess(application.applied_at, application.updated_at);
  
  if (daysSinceUpdate > 7) {
    return 'Candidato parado há mais de 7 dias - verificar status';
  }
  
  const actions: Record<number, string> = {
    1: 'Revisar currículo e mover para triagem',
    2: 'Agendar validação telefônica',
    3: 'Enviar teste técnico',
    4: 'Agendar entrevista com RH',
    5: 'Agendar entrevista técnica',
    6: 'Verificar referências',
    7: 'Preparar proposta',
    8: 'Aguardar resposta da proposta',
    9: 'Processo finalizado - candidato contratado'
  };
  
  return actions[stage] || 'Verificar próximos passos';
};

// Validações
export const validateApplicationData = (data: ApplicationFormData): string[] => {
  const errors: string[] = [];
  
  if (!data.candidate_id) {
    errors.push('Candidato é obrigatório');
  }
  
  if (!data.job_id) {
    errors.push('Vaga é obrigatória');
  }
  
  if (data.stage && (data.stage < 1 || data.stage > 9)) {
    errors.push('Etapa deve estar entre 1 e 9');
  }
  
  return errors;
};

export default applicationsApi;