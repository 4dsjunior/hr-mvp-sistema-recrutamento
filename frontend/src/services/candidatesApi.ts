// frontend/src/services/candidatesApi.ts - VERSÃO CORRIGIDA
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ API Error:`, error);
    return Promise.reject(error);
  }
);

// Interface para candidato conforme nosso backend
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

// Interface do frontend
interface CandidateFrontend {
  id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  status: 'pending' | 'interviewed' | 'approved' | 'rejected';
  photo_url?: string;
  address?: string;
  summary?: string;
  linkedin?: string;
  created_at: string;
  updated_at: string;
}

// CORREÇÃO: Funções de conversão melhoradas
const backendToFrontend = (candidate: CandidateBackend): CandidateFrontend => {
  const fullName = `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim();
  
  return {
    id: candidate.id.toString(),
    name: fullName || 'Nome não informado',
    email: candidate.email,
    phone: candidate.phone,
    position: extractPosition(candidate.summary) || 'Candidato',
    status: mapStatus(candidate.status),
    address: candidate.address,
    summary: candidate.summary,
    linkedin: candidate.linkedin_url,
    created_at: candidate.created_at,
    updated_at: candidate.updated_at,
  };
};

const frontendToBackend = (candidate: Partial<CandidateFrontend>) => {
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

// CORREÇÃO: Mapeamento de status corrigido baseado nos dados reais
const mapStatus = (backendStatus: string): CandidateFrontend['status'] => {
  switch (backendStatus?.toLowerCase()) {
    case 'active':
      return 'pending';
    case 'inactive':
      return 'rejected';
    case 'interviewed':
      return 'interviewed';
    case 'approved':
    case 'hired':
      return 'approved';
    default:
      return 'pending';
  }
};

const mapStatusToBackend = (frontendStatus?: CandidateFrontend['status']): string => {
  switch (frontendStatus) {
    case 'pending':
      return 'active';
    case 'rejected':
      return 'inactive';
    case 'interviewed':
      return 'interviewed';
    case 'approved':
      return 'approved';
    default:
      return 'active';
  }
};

// CORREÇÃO: Extração de posição melhorada
const extractPosition = (summary?: string): string => {
  if (!summary) return 'Candidato';
  
  const positions = [
    { keywords: ['desenvolvedor', 'developer', 'dev'], title: 'Desenvolvedor' },
    { keywords: ['designer', 'design', 'ux'], title: 'Designer' },
    { keywords: ['analista', 'analyst'], title: 'Analista' },
    { keywords: ['gerente', 'manager'], title: 'Gerente' },
    { keywords: ['coordenador', 'coordinator'], title: 'Coordenador' },
    { keywords: ['product manager', 'pm'], title: 'Product Manager' },
    { keywords: ['frontend', 'front-end'], title: 'Desenvolvedor Frontend' },
    { keywords: ['backend', 'back-end'], title: 'Desenvolvedor Backend' },
    { keywords: ['fullstack', 'full-stack'], title: 'Desenvolvedor Fullstack' },
    { keywords: ['junior'], title: 'Desenvolvedor Junior' },
  ];
  
  const lowerSummary = summary.toLowerCase();
  
  for (const position of positions) {
    if (position.keywords.some(keyword => lowerSummary.includes(keyword))) {
      return position.title;
    }
  }
  
  return 'Candidato';
};

// CORREÇÃO: Serviços com melhor tratamento de erro e logging
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

  // Listar todos candidatos
  getAll: async (): Promise<CandidateFrontend[]> => {
    try {
      const response = await api.get('/candidates');
      
      if (!Array.isArray(response.data)) {
        console.warn('Backend retornou formato inesperado:', response.data);
        return [];
      }
      
      const converted = response.data.map(backendToFrontend);
      console.log('✅ Candidatos convertidos:', converted);
      return converted;
    } catch (error: any) {
      console.error('Erro ao buscar candidatos:', error);
      throw new Error(error.response?.data?.error || 'Erro ao carregar candidatos');
    }
  },

  // Buscar candidato por ID
  getById: async (id: string): Promise<CandidateFrontend> => {
    try {
      const response = await api.get(`/candidates/${id}`);
      const converted = backendToFrontend(response.data);
      console.log('✅ Candidato individual convertido:', converted);
      return converted;
    } catch (error: any) {
      console.error('Erro ao buscar candidato:', error);
      throw new Error(error.response?.data?.error || 'Erro ao buscar candidato');
    }
  },

  // Criar novo candidato
  create: async (candidateData: Partial<CandidateFrontend>): Promise<CandidateFrontend> => {
    try {
      const backendData = frontendToBackend(candidateData);
      console.log('📤 Enviando dados para criar candidato:', backendData);
      
      const response = await api.post('/candidates', backendData);
      const converted = backendToFrontend(response.data);
      console.log('✅ Candidato criado e convertido:', converted);
      return converted;
    } catch (error: any) {
      console.error('Erro ao criar candidato:', error);
      throw new Error(error.response?.data?.error || 'Erro ao criar candidato');
    }
  },

  // Atualizar candidato
  update: async (id: string, candidateData: Partial<CandidateFrontend>): Promise<CandidateFrontend> => {
    try {
      const backendData = frontendToBackend(candidateData);
      console.log('📤 Enviando dados para atualizar candidato:', backendData);
      
      const response = await api.put(`/candidates/${id}`, backendData);
      const converted = backendToFrontend(response.data);
      console.log('✅ Candidato atualizado e convertido:', converted);
      return converted;
    } catch (error: any) {
      console.error('Erro ao atualizar candidato:', error);
      throw new Error(error.response?.data?.error || 'Erro ao atualizar candidato');
    }
  },

  // Deletar candidato
  delete: async (id: string): Promise<boolean> => {
    try {
      console.log('🗑️ Deletando candidato ID:', id);
      await api.delete(`/candidates/${id}`);
      console.log('✅ Candidato deletado com sucesso');
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar candidato:', error);
      throw new Error(error.response?.data?.error || 'Erro ao deletar candidato');
    }
  },

  // Buscar candidatos
  search: async (query: string, status?: string): Promise<CandidateFrontend[]> => {
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('q', query.trim());
      if (status) {
        const backendStatus = mapStatusToBackend(status as CandidateFrontend['status']);
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
      console.log('✅ Candidatos da busca convertidos:', converted);
      return converted;
    } catch (error: any) {
      console.error('Erro ao buscar candidatos:', error);
      throw new Error(error.response?.data?.error || 'Erro na busca');
    }
  }
};

export default candidatesApi;