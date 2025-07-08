export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'hr' | 'manager';
  avatar?: string;
  created_at: string;
}

export interface Candidate {
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

export interface Job {
  id: string;
  title: string;
  department: string;
  status: 'open' | 'closed' | 'draft';
  description: string;
  requirements: string[];
  location: string;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  salary_min?: number;
  salary_max?: number;
  created_at: string;
  updated_at: string;
  candidates_count?: number;
}

export interface DashboardMetrics {
  total_candidates: number;
  active_jobs: number;
  monthly_applications: number;
  conversion_rate: number;
  pending_interviews: number;
  recent_activity?: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'candidate_applied' | 'interview_scheduled' | 'candidate_hired' | 'position_created';
  message: string;
  timestamp: string;
  user: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface CandidateFilters {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface JobFilters {
  search?: string;
  status?: string;
  department?: string;
  employment_type?: string;
  page?: number;
  per_page?: number;
}