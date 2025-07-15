import { useState, useEffect } from 'react';
// ✅ CORREÇÃO: Usar API centralizada com interceptors
import api from '../lib/api';

interface DashboardMetrics {
  total_candidates: number;
  active_jobs: number;
  monthly_applications: number;
  conversion_rate: number;
  pending_interviews: number;
  status_breakdown?: Record<string, number>;
  last_updated?: string;
}

export const useDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      console.log('🔄 Buscando métricas do dashboard...');
      setLoading(true);
      setError(null);

      const response = await api.get('/api/dashboard/metrics');

      console.log('✅ Métricas recebidas:', response.data);
      setMetrics(response.data);
    } catch (err: any) {
      console.error('❌ Erro ao buscar métricas:', err);
      setError(err.response?.data?.error || err.message || 'Erro ao carregar métricas');
      
      // Fallback para dados básicos em caso de erro
      setMetrics({
        total_candidates: 0,
        active_jobs: 0,
        monthly_applications: 0,
        conversion_rate: 0,
        pending_interviews: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics,
  };
};