import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Interface do frontend (do types/index.ts)
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
  resume_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Função para converter backend para frontend
const backendToFrontend = (candidate: CandidateBackend): CandidateFrontend => ({
  id: candidate.id.toString(),
  name: `${candidate.first_name} ${candidate.last_name}`.trim(),
  email: candidate.email,
  phone: candidate.phone,
  position: extractPosition(candidate.summary) || 'Candidato',
  status: mapStatus(candidate.status),
  address: candidate.address,
  summary: candidate.summary,
  linkedin: candidate.linkedin_url,
  created_at: candidate.created_at,
  updated_at: candidate.updated_at,
});

// Função para converter frontend para backend
const frontendToBackend = (candidate: Partial<CandidateFrontend>) => {
  const nameParts = candidate.name?.split(' ') || ['', ''];
  return {
    first_name: nameParts[0],
    last_name: nameParts.slice(1).join(' '),
    email: candidate.email,
    phone: candidate.phone,
    address: candidate.address,
    summary: candidate.summary,
    linkedin_url: candidate.linkedin,
    status: mapStatusToBackend(candidate.status),
  };
};

// Mapear status do backend para frontend
const mapStatus = (backendStatus: string): CandidateFrontend['status'] => {
  switch (backendStatus) {
    case 'active': return 'pending';
    case 'inactive': return 'rejected';
    default: return 'pending';
  }
};

// Mapear status do frontend para backend
const mapStatusToBackend = (frontendStatus?: CandidateFrontend['status']): string => {
  switch (frontendStatus) {
    case 'pending': return 'active';
    case 'rejected': return 'inactive';
    case 'interviewed': return 'active';
    case 'approved': return 'active';
    default: return 'active';
  }
};

// Extrair posição do summary (simples)
const extractPosition = (summary?: string): string => {
  if (!summary) return 'Candidato';
  
  const positions = ['desenvolvedor', 'designer', 'analista', 'gerente', 'coordenador'];
  const lowerSummary = summary.toLowerCase();
  
  for (const position of positions) {
    if (lowerSummary.includes(position)) {
      return position.charAt(0).toUpperCase() + position.slice(1);
    }
  }
  
  return 'Candidato';
};

// Serviços de Candidatos
export const candidatesApi = {
  // Listar todos candidatos
  getAll: async (): Promise<CandidateFrontend[]> => {
    try {
      const response = await api.get('/candidates');
      return response.data.map(backendToFrontend);
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      throw error;
    }
  },

  // Buscar candidato por ID
  getById: async (id: string): Promise<CandidateFrontend> => {
    try {
      const response = await api.get(`/candidates/${id}`);
      return backendToFrontend(response.data);
    } catch (error) {
      console.error('Erro ao buscar candidato:', error);
      throw error;
    }
  },

  // Criar novo candidato
  create: async (candidateData: Partial<CandidateFrontend>): Promise<CandidateFrontend> => {
    try {
      const backendData = frontendToBackend(candidateData);
      const response = await api.post('/candidates', backendData);
      return backendToFrontend(response.data[0]); // Backend retorna array
    } catch (error) {
      console.error('Erro ao criar candidato:', error);
      throw error;
    }
  },

  // Atualizar candidato
  update: async (id: string, candidateData: Partial<CandidateFrontend>): Promise<CandidateFrontend> => {
    try {
      const backendData = frontendToBackend(candidateData);
      const response = await api.put(`/candidates/${id}`, backendData);
      return backendToFrontend(response.data[0]); // Backend retorna array
    } catch (error) {
      console.error('Erro ao atualizar candidato:', error);
      throw error;
    }
  },

  // Deletar candidato
  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/candidates/${id}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar candidato:', error);
      throw error;
    }
  },

  // Buscar candidatos
  search: async (query: string, status?: string): Promise<CandidateFrontend[]> => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (status) params.append('status', mapStatusToBackend(status as CandidateFrontend['status']));
      
      const response = await api.get(`/candidates/search?${params}`);
      return response.data.map(backendToFrontend);
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      throw error;
    }
  }
};

export default candidatesApi;