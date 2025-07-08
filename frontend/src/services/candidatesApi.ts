import axios from 'axios';
import { Candidate } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configurar axios com timeout e headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para logging de requests
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para logging de responses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ API Error:`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Interfaces para conversão Backend <-> Frontend
interface CandidateBackend {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  summary?: string;
  linkedin_url?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Funções de conversão
const backendToFrontend = (candidate: CandidateBackend): Candidate => {
  const fullName = `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim();
  
  return {
    id: candidate.id.toString(),
    name: fullName || 'Nome não informado',
    email: candidate.email,
    phone: candidate.phone || undefined,
    position: extractPosition(candidate.summary) || 'Candidato',
    status: mapStatus(candidate.status),
    address: candidate.address || undefined,
    summary: candidate.summary || undefined,
    linkedin: candidate.linkedin_url || undefined,
    created_at: candidate.created_at,
    updated_at: candidate.updated_at,
  };
};

const frontendToBackend = (candidate: Partial<Candidate>) => {
  const nameParts = (candidate.name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    first_name: firstName,
    last_name: lastName,
    email: candidate.email,
    phone: candidate.phone || null,
    address: candidate.address || null,
    summary: candidate.summary || null,
    linkedin_url: candidate.linkedin || null,
    status: mapStatusToBackend(candidate.status),
  };
};

// Mapeamento de status
const mapStatus = (backendStatus: string): Candidate['status'] => {
  const statusMap: Record<string, Candidate['status']> = {
    'active': 'pending',
    'inactive': 'rejected',
    'interviewed': 'interviewed',
    'approved': 'approved',
    'hired': 'approved',
    'rejected': 'rejected',
  };
  
  return statusMap[backendStatus?.toLowerCase()] || 'pending';
};

const mapStatusToBackend = (frontendStatus?: Candidate['status']): string => {
  const statusMap: Record<string, string> = {
    'pending': 'active',
    'rejected': 'inactive',
    'interviewed': 'interviewed',
    'approved': 'approved',
  };
  
  return statusMap[frontendStatus || 'pending'] || 'active';
};

// Extração inteligente de posição
const extractPosition = (summary?: string): string => {
  if (!summary) return 'Candidato';
  
  const positions = [
    { keywords: ['desenvolvedor', 'developer', 'dev'], title: 'Desenvolvedor' },
    { keywords: ['designer', 'design', 'ux', 'ui'], title: 'Designer' },
    { keywords: ['analista', 'analyst'], title: 'Analista' },
    { keywords: ['gerente', 'manager'], title: 'Gerente' },
    { keywords: ['coordenador', 'coordinator'], title: 'Coordenador' },
    { keywords: ['product manager', 'pm'], title: 'Product Manager' },
    { keywords: ['frontend', 'front-end'], title: 'Desenvolvedor Frontend' },
    { keywords: ['backend', 'back-end'], title: 'Desenvolvedor Backend' },
    { keywords: ['fullstack', 'full-stack'], title: 'Desenvolvedor Fullstack' },
    { keywords: ['qa', 'quality', 'teste'], title: 'QA Analyst' },
    { keywords: ['devops', 'infrastructure'], title: 'DevOps Engineer' },
    { keywords: ['data', 'scientist'], title: 'Data Scientist' },
    { keywords: ['mobile', 'android', 'ios'], title: 'Desenvolvedor Mobile' },
  ];
  
  const lowerSummary = summary.toLowerCase();
  
  for (const position of positions) {
    if (position.keywords.some(keyword => lowerSummary.includes(keyword))) {
      return position.title;
    }
  }
  
  return 'Candidato';
};

// Serviços da API
export const candidatesApi = {
  // Testar conexão
  test: async (): Promise<boolean> => {
    try {
      const response = await api.get('/test');
      return response.data.status === 'ok';
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  },

  // Verificar saúde da API
  health: async (): Promise<any> => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar saúde:', error);
      return { api: 'error', database: 'error' };
    }
  },

  // Listar todos candidatos
  getAll: async (): Promise<Candidate[]> => {
    try {
      const response = await api.get('/candidates');
      
      if (!Array.isArray(response.data)) {
        console.warn('Backend retornou formato inesperado:', response.data);
        return [];
      }
      
      const converted = response.data.map(backendToFrontend);
      console.log(`✅ ${converted.length} candidatos convertidos`);
      return converted;
    } catch (error: any) {
      console.error('Erro ao buscar candidatos:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao carregar candidatos';
      throw new Error(errorMessage);
    }
  },

  // Buscar candidato por ID
  getById: async (id: string): Promise<Candidate> => {
    try {
      const response = await api.get(`/candidates/${id}`);
      const converted = backendToFrontend(response.data);
      console.log('✅ Candidato individual convertido:', converted);
      return converted;
    } catch (error: any) {
      console.error('Erro ao buscar candidato:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao buscar candidato';
      throw new Error(errorMessage);
    }
  },

  // Criar novo candidato
  create: async (candidateData: Partial<Candidate>): Promise<Candidate> => {
    try {
      // Validação básica
      if (!candidateData.name || !candidateData.email) {
        throw new Error('Nome e email são obrigatórios');
      }

      const backendData = frontendToBackend(candidateData);
      console.log('📤 Enviando dados para criar candidato:', backendData);
      
      const response = await api.post('/candidates', backendData);
      const converted = backendToFrontend(response.data);
      console.log('✅ Candidato criado e convertido:', converted);
      return converted;
    } catch (error: any) {
      console.error('Erro ao criar candidato:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao criar candidato';
      throw new Error(errorMessage);
    }
  },

  // Atualizar candidato
  update: async (id: string, candidateData: Partial<Candidate>): Promise<Candidate> => {
    try {
      const backendData = frontendToBackend(candidateData);
      console.log('📤 Enviando dados para atualizar candidato:', backendData);
      
      const response = await api.put(`/candidates/${id}`, backendData);
      const converted = backendToFrontend(response.data);
      console.log('✅ Candidato atualizado e convertido:', converted);
      return converted;
    } catch (error: any) {
      console.error('Erro ao atualizar candidato:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao atualizar candidato';
      throw new Error(errorMessage);
    }
  },

  // Deletar candidato
  delete: async (id: string): Promise<void> => {
    try {
      console.log('🗑️ Deletando candidato ID:', id);
      await api.delete(`/candidates/${id}`);
      console.log('✅ Candidato deletado com sucesso');
    } catch (error: any) {
      console.error('Erro ao deletar candidato:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao deletar candidato';
      throw new Error(errorMessage);
    }
  },

  // Buscar candidatos com filtros
  search: async (query: string, status?: string): Promise<Candidate[]> => {
    try {
      const params = new URLSearchParams();
      
      if (query.trim()) {
        params.append('q', query.trim());
      }
      
      if (status) {
        const backendStatus = mapStatusToBackend(status as Candidate['status']);
        params.append('status', backendStatus);
      }
      
      const url = `/candidates/search${params.toString() ? `?${params}` : ''}`;
      console.log('🔍 Buscando candidatos:', url);
      
      const response = await api.get(url);
      
      if (!Array.isArray(response.data)) {
        console.warn('Search retornou formato inesperado:', response.data);
        return [];
      }
      
      const converted = response.data.map(backendToFrontend);
      console.log(`✅ ${converted.length} candidatos da busca convertidos`);
      return converted;
    } catch (error: any) {
      console.error('Erro ao buscar candidatos:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro na busca';
      throw new Error(errorMessage);
    }
  },

  // Obter estatísticas dos candidatos
  getStats: async (): Promise<any> => {
    try {
      const candidates = await candidatesApi.getAll();
      
      const stats = {
        total: candidates.length,
        by_status: candidates.reduce((acc: Record<string, number>, candidate) => {
          acc[candidate.status] = (acc[candidate.status] || 0) + 1;
          return acc;
        }, {}),
        recent: candidates
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5),
      };
      
      return stats;
    } catch (error: any) {
      console.error('Erro ao obter estatísticas:', error);
      throw new Error('Erro ao carregar estatísticas');
    }
  }
};

export default candidatesApi;