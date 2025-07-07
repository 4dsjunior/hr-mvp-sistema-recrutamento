import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export interface JobFrontend {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  department?: string;
  location: string;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  salary_min?: number;
  salary_max?: number;
  status: 'active' | 'paused' | 'closed' | 'draft';
  created_at: string;
  updated_at: string;
  candidates_count?: number;
}

const backendToFrontend = (job: any): JobFrontend => ({
  id: job.id.toString(),
  title: job.title,
  description: job.description,
  requirements: job.requirements ? job.requirements.split('\n').filter((r: string) => r.trim()) : [],
  department: job.department,
  location: job.location,
  employment_type: job.employment_type || 'full-time',
  salary_min: job.salary_min,
  salary_max: job.salary_max,
  status: job.status || 'active',
  created_at: job.created_at,
  updated_at: job.updated_at,
  candidates_count: job.candidates_count || 0,
});

const frontendToBackend = (job: Partial<JobFrontend>) => ({
  title: job.title,
  description: job.description,
  requirements: job.requirements?.join('\n'),
  department: job.department,
  location: job.location,
  employment_type: job.employment_type || 'full-time',
  salary_min: job.salary_min,
  salary_max: job.salary_max,
  status: job.status || 'active',
});

export const jobsApi = {
  getAll: async (): Promise<JobFrontend[]> => {
    try {
      const response = await api.get('/jobs');
      return Array.isArray(response.data) ? response.data.map(backendToFrontend) : [];
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao carregar vagas');
    }
  },

  create: async (jobData: Partial<JobFrontend>): Promise<JobFrontend> => {
    const response = await api.post('/jobs', frontendToBackend(jobData));
    return backendToFrontend(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },
};
