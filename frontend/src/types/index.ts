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
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  total_candidates: number;
  open_positions: number;
  monthly_hires: number;
  conversion_rate: number;
  pending_interviews: number;
  recent_activity: ActivityItem[];
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