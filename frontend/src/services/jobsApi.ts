// 🎯 CORREÇÃO: jobsApi.ts - Service Completo
// Arquivo: frontend/src/services/jobsApi.ts

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Tipos TypeScript para Jobs
export interface Job {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  employment_type: string;
  experience_level: string;
  status: string;
  requirements: string;
  benefits: string;
  application_deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobFormData {
  title: string;
  description: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  employment_type: string;
  experience_level: string;
  status: string;
  requirements: string;
  benefits: string;
  application_deadline: string | null;
}

export interface JobFilters {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  employment_type?: string;
  experience_level?: string;
  company?: string;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface JobStats {
  total_jobs: number;
  active_jobs: number;
  paused_jobs: number;
  closed_jobs: number;
  employment_types: Record<string, number>;
  experience_levels: Record<string, number>;
  top_companies: Array<[string, number]>;
}

export interface JobOptions {
  employment_types: Array<{value: string; label: string}>;
  experience_levels: Array<{value: string; label: string}>;
  status_options: Array<{value: string; label: string}>;
}

export interface SearchJobsParams {
  q?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  employment_type?: string;
  experience_level?: string;
}

export interface SearchJobsResponse {
  jobs: Job[];
  total: number;
  search_params: SearchJobsParams;
}

// Configuração do axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Jobs API Error:', error.response?.data || error.message);
    throw error;
  }
);

// ==================== JOBS API ====================

class JobsApi {
  // Listar vagas com filtros
  async getJobs(filters: JobFilters = {}): Promise<JobsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data;
  }

  // Obter vaga específica
  async getJob(id: number): Promise<Job> {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  }

  // Criar nova vaga
  async createJob(jobData: JobFormData): Promise<Job> {
    const response = await api.post('/jobs', jobData);
    return response.data.job;
  }

  // Atualizar vaga
  async updateJob(id: number, jobData: Partial<JobFormData>): Promise<Job> {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data.job;
  }

  // Deletar vaga
  async deleteJob(id: number): Promise<void> {
    await api.delete(`/jobs/${id}`);
  }

  // Estatísticas das vagas
  async getJobStats(): Promise<JobStats> {
    const response = await api.get('/jobs/stats');
    return response.data;
  }

  // Busca avançada
  async searchJobs(params: SearchJobsParams = {}): Promise<SearchJobsResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/jobs/search?${searchParams.toString()}`);
    return response.data;
  }

  // Opções para filtros
  async getJobOptions(): Promise<JobOptions> {
    const response = await api.get('/jobs/options');
    return response.data;
  }

  // Exportar vagas para CSV
  async exportJobs(filters: JobFilters = {}): Promise<string> {
    const { jobs } = await this.getJobs(filters);
    
    const headers = [
      'ID',
      'Título',
      'Empresa',
      'Localização',
      'Salário Mín',
      'Salário Máx',
      'Tipo',
      'Nível',
      'Status',
      'Criado em'
    ];
    
    const rows = jobs.map(job => [
      job.id,
      job.title,
      job.company,
      job.location || 'N/A',
      job.salary_min ? `R$ ${job.salary_min.toLocaleString()}` : 'N/A',
      job.salary_max ? `R$ ${job.salary_max.toLocaleString()}` : 'N/A',
      job.employment_type,
      job.experience_level,
      job.status,
      new Date(job.created_at).toLocaleDateString('pt-BR')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');
    
    return csvContent;
  }
}

// Instância singleton da API
export const jobsApi = new JobsApi();

// Utilitários para formatação
export const formatSalary = (min: number | null, max: number | null): string => {
  if (!min && !max) return 'A combinar';
  if (min && max) return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`;
  if (min) return `A partir de R$ ${min.toLocaleString()}`;
  if (max) return `Até R$ ${max.toLocaleString()}`;
  return 'A combinar';
};

export const formatEmploymentType = (type: string): string => {
  const types: Record<string, string> = {
    'full-time': 'Tempo Integral',
    'part-time': 'Meio Período',
    'contract': 'Contrato',
    'internship': 'Estágio',
    'freelance': 'Freelance'
  };
  return types[type] || type;
};

export const formatExperienceLevel = (level: string): string => {
  const levels: Record<string, string> = {
    'entry-level': 'Iniciante',
    'junior': 'Júnior',
    'mid-level': 'Pleno',
    'senior': 'Sênior',
    'executive': 'Executivo'
  };
  return levels[level] || level;
};

export const formatStatus = (status: string): string => {
  const statuses: Record<string, string> = {
    'active': 'Ativa',
    'paused': 'Pausada',
    'closed': 'Fechada'
  };
  return statuses[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'active': 'bg-green-100 text-green-800',
    'paused': 'bg-yellow-100 text-yellow-800',
    'closed': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getEmploymentTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'full-time': 'bg-blue-100 text-blue-800',
    'part-time': 'bg-purple-100 text-purple-800',
    'contract': 'bg-orange-100 text-orange-800',
    'internship': 'bg-pink-100 text-pink-800',
    'freelance': 'bg-indigo-100 text-indigo-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export default jobsApi;