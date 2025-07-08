import { useState, useEffect } from 'react';
import { Users, Briefcase, Calendar, TrendingUp, Clock, LucideIcon } from 'lucide-react';
import axios from 'axios';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface DashboardMetrics {
  total_candidates: number;
  active_jobs: number;
  monthly_applications: number;
  conversion_rate: number;
  pending_interviews: number;
  status_breakdown?: Record<string, number>;
  last_updated?: string;
}

interface MetricsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  loading?: boolean;
}

// ============================================================================
// COMPONENTE METRICS CARD
// ============================================================================

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  red: 'bg-red-50 text-red-600 border-red-200',
};

function MetricsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  loading = false,
}: MetricsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
            </>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HOOK PARA MÉTRICAS
// ============================================================================

function useDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchMetrics = async () => {
    try {
      // console.log('🔄 Buscando métricas do dashboard...');
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/dashboard/metrics`, {
        timeout: 10000,
      });

      // console.log('✅ Métricas recebidas:', response.data);
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
}

// ============================================================================
// COMPONENTE PRINCIPAL DO DASHBOARD
// ============================================================================

function Dashboard() {
  const { metrics, loading, error, refetch } = useDashboard();

  const handleRefresh = () => {
    // console.log('🔄 Atualizando métricas...');
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral das atividades de recrutamento</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro ao carregar métricas</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricsCard
          title="Total de Candidatos"
          value={metrics?.total_candidates || 0}
          subtitle="+8% esta semana"
          icon={Users}
          color="blue"
          loading={loading}
        />
        
        <MetricsCard
          title="Vagas Abertas"
          value={metrics?.active_jobs || 0}
          subtitle="2 novas esta semana"
          icon={Briefcase}
          color="green"
          loading={loading}
        />
        
        <MetricsCard
          title="Candidaturas do Mês"
          value={metrics?.monthly_applications || 0}
          subtitle="Para esta semana"
          icon={Calendar}
          color="purple"
          loading={loading}
        />
        
        <MetricsCard
          title="Entrevistas Pendentes"
          value={metrics?.pending_interviews || 0}
          subtitle="Para esta semana"
          icon={Clock}
          color="orange"
          loading={loading}
        />
        
        <MetricsCard
          title="Taxa de Conversão"
          value={`${metrics?.conversion_rate || 0}%`}
          subtitle="Candidatos → Contratações"
          icon={TrendingUp}
          color="red"
          loading={loading}
        />
      </div>

      {/* Debug Info - removido da produção */}
      {false && import.meta.env.DEV && metrics && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
          <h4 className="font-medium text-gray-900 mb-2">Debug Info:</h4>
          <pre className="text-gray-600 overflow-auto text-xs">
            {JSON.stringify(metrics, null, 2)}
          </pre>
        </div>
      )}

      {/* Recent Activity & Conversion Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividades Recentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  Novo candidato cadastrado
                </p>
                <p className="text-xs text-gray-500">2 minutos atrás</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  Entrevista agendada com João Silva
                </p>
                <p className="text-xs text-gray-500">1 hora atrás</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  Nova vaga criada: Analista de Dados
                </p>
                <p className="text-xs text-gray-500">2 horas atrás</p>
              </div>
            </div>
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Taxa de Conversão</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Candidatos → Entrevistas</span>
                <span className="font-medium">32%</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: '32%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Entrevistas → Contratações</span>
                <span className="font-medium">28%</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full transition-all duration-500" style={{ width: '28%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Taxa Global</span>
                <span className="font-medium text-lg">{metrics?.conversion_rate || 0}%</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(metrics?.conversion_rate || 0, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;