import api from '../lib/api';
import { Candidate, PaginatedResponse, ApiResponse } from '../types';

export interface CandidateFilters {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const candidateService = {
  // Get all candidates with filters
  async getCandidates(filters: CandidateFilters = {}): Promise<PaginatedResponse<Candidate>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('q', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);

    const response = await api.get(`/api/candidates?${params.toString()}`);
    return response.data;
  },

  // Get candidate by ID
  async getCandidateById(id: string): Promise<Candidate> {
    const response = await api.get(`/api/candidates/${id}`);
    return response.data;
  },

  // Create new candidate
  async createCandidate(candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>): Promise<Candidate> {
    const response = await api.post('/api/candidates', candidate);
    return response.data;
  },

  // Update candidate
  async updateCandidate(id: string, candidate: Partial<Candidate>): Promise<Candidate> {
    const response = await api.put(`/api/candidates/${id}`, candidate);
    return response.data;
  },

  // Delete candidate
  async deleteCandidate(id: string): Promise<void> {
    await api.delete(`/api/candidates/${id}`);
  },

  // Search candidates
  async searchCandidates(query: string, status?: string): Promise<Candidate[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (status) params.append('status', status);

    const response = await api.get(`/api/candidates/search?${params.toString()}`);
    return response.data;
  },

  // Export candidates
  async exportCandidates(filters: CandidateFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('q', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);

    const response = await api.get(`/api/candidates/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};