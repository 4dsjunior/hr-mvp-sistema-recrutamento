// 🎯 DASHBOARD PROFISSIONAL COMPLETO - VERSÃO LIMPA
// Arquivo: frontend/src/pages/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  TrendingUp,
  Target,
  Calendar,
  Clock,
  Eye,
  RefreshCw,
  AlertCircle,
  Award,
  Activity,
  FileText,
  BarChart3
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';

// 🚀 IMPORTAÇÕES DOS COMPONENTES AVANÇADOS
import AutoRefresh from '../components/Dashboard/AutoRefresh';
import PeriodFilter from '../components/Dashboard/PeriodFilter';

// ============================================================================
// INTERFACES
// ============================================================================

interface DashboardMetrics {
  total_candidates: number;
  active_jobs: number;
  monthly_applications: number;
  conversion_rate: number;
  pending_interviews: number;
  hired_count: number;
  status_distribution: Record<string, number>;
  stage_distribution: Record<string, number>;
  monthly_trend: Array<{
    month: string;
    count: number;
  }>;
  top_jobs: Array<{
    job_title: string;
    company: string;
    applications_count: number;
  }>;
  recent_activities: Array<{
    id: number;
    candidate_name: string;
    candidate_email: string;
    job_title: string;
    stage: number;
    status: string;
    applied_at: string;
  }>;
  last_updated: string;
  total_applications: number;
}

// ============================================================================
// API CALLS
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const dashboardApi = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const response = await axios.get(`${API_BASE_URL}/dashboard/metrics`, {
      timeout: 15000
    });
    return response.data;
  }
};

// ============================================================================
// COMPONENTES
// ============================================================================

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  change, 
  changeType = 'neutral' 
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${color} mt-2`}>{value}</p>
        {change && (
          <p className={`text-sm mt-1 ${
            changeType === 'positive' ? 'text-green-600' : 
            changeType === 'negative' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {change}
          </p>
        )}
      </div>
      <div className={`${color.replace('text-', 'text-').replace('-900', '-600')} opacity-80`}>
        {icon}
      </div>
    </div>
  </div>
);

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🚀 ESTADOS PARA FUNCIONALIDADES AVANÇADAS
  const [autoRefresh, setAutoRefresh] = useState({
    enabled: false,
    interval: 60000,
    nextRefreshIn: 0
  });
  
  const [periodFilter, setPeriodFilter] = useState<{
    value: string;
    customRange?: { start: string; end: string };
  }>({
    value: '30d'
  });

  const [metricsCache, setMetricsCache] = useState<{
    data: DashboardMetrics | null;
    timestamp: number;
  }>({ data: null, timestamp: 0 });

  const CACHE_DURATION = 5 * 60 * 1000;

  // 🔄 FUNÇÃO DE CARREGAMENTO
  const loadMetrics = async (forceRefresh = false) => {
    if (!forceRefresh && metricsCache.data) {
      const now = Date.now();
      if (now - metricsCache.timestamp < CACHE_DURATION) {
        console.log('📦 Usando dados do cache');
        setMetrics(metricsCache.data);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Carregando métricas do dashboard...');
      const data = await dashboardApi.getMetrics();
      setMetrics(data);
      
      setMetricsCache({
        data,
        timestamp: Date.now()
      });
      
      console.log('✅ Métricas carregadas:', data);
    } catch (err: any) {
      console.error('❌ Erro ao carregar métricas:', err);
      setError(err.response?.data?.error || err.message || 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  // 🔄 AUTO-REFRESH
  useEffect(() => {
    if (!autoRefresh.enabled || autoRefresh.interval === 0) return;

    const interval = setInterval(() => {
      loadMetrics(true);
    }, autoRefresh.interval);

    return () => clearInterval(interval);
  }, [autoRefresh.enabled, autoRefresh.interval]);

  // 🎯 CARREGAMENTO INICIAL
  useEffect(() => {
    loadMetrics();
  }, []);

  // 🔄 FUNÇÕES PARA COMPONENTES
  const handlePeriodChange = (period: string, customRange?: { start: string; end: string }) => {
    setPeriodFilter({ value: period, customRange });
  };

  // Preparar dados para gráficos
  const prepareChartData = () => {
    if (!metrics) return { statusData: [], stageData: [], trendData: [] };

    const stageNames: Record<number, string> = {
      1: 'Candidatura Recebida',
      2: 'Triagem de Currículo', 
      3: 'Validação Telefônica',
      4: 'Teste Técnico',
      5: 'Entrevista RH',
      6: 'Entrevista Técnica',
      7: 'Verificação de Referências',
      8: 'Proposta Enviada',
      9: 'Contratado'
    };

    const statusData = Object.entries(metrics.status_distribution).map(([status, count]) => ({
      name: status === 'applied' ? 'Candidatura' : 
            status === 'in_progress' ? 'Em Processo' : 
            status === 'hired' ? 'Contratado' : 
            status === 'rejected' ? 'Rejeitado' : status,
      value: count,
      color: status === 'applied' ? '#3b82f6' : 
             status === 'in_progress' ? '#f59e0b' : 
             status === 'hired' ? '#10b981' : 
             status === 'rejected' ? '#ef4444' : '#6b7280'
    }));

    const stageData = Object.entries(metrics.stage_distribution).map(([stage, count]) => {
      const stageNum = parseInt(stage.replace('stage_', ''));
      return {
        name: stageNames[stageNum] || `Etapa ${stageNum}`,
        value: count,
        stage: stageNum
      };
    }).sort((a, b) => a.stage - b.stage);

    const trendData = metrics.monthly_trend;

    return { statusData, stageData, trendData };
  };

  const { statusData, stageData, trendData } = prepareChartData();
  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
              <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-red-800 font-medium">Erro ao carregar dashboard</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={() => loadMetrics(true)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Dados não disponíveis</h3>
        <p className="text-gray-600">Não foi possível carregar as métricas do dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Avançado */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema de recrutamento e métricas em tempo real</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <PeriodFilter
            value={periodFilter.value}
            onChange={handlePeriodChange}
            className="w-full sm:w-auto"
          />
          
          <AutoRefresh
            onRefresh={() => loadMetrics(true)}
            loading={loading}
            className="w-full sm:w-auto"
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-gray-500">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              Date.now() - metricsCache.timestamp < CACHE_DURATION ? 'bg-green-400' : 'bg-yellow-400'
            }`} />
            <span>
              {Date.now() - metricsCache.timestamp < CACHE_DURATION ? 'Cache ativo' : 'Cache expirado'}
            </span>
          </div>
          
          {metrics?.last_updated && (
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Última atualização: {formatDate(metrics.last_updated)}</span>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-400">
          Período: Últimos {periodFilter.value.replace('d', ' dias')}
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Candidatos"
          value={metrics.total_candidates}
          icon={<Users className="h-8 w-8" />}
          color="text-blue-900"
          change="Crescimento mensal"
          changeType="positive"
        />
        
        <MetricCard
          title="Vagas Ativas"
          value={metrics.active_jobs}
          icon={<Briefcase className="h-8 w-8" />}
          color="text-green-900"
          change="Oportunidades abertas"
          changeType="neutral"
        />
        
        <MetricCard
          title="Candidaturas do Mês"
          value={metrics.monthly_applications}
          icon={<TrendingUp className="h-8 w-8" />}
          color="text-purple-900"
          change="Este mês"
          changeType="positive"
        />
        
        <MetricCard
          title="Taxa de Conversão"
          value={`${metrics.conversion_rate}%`}
          icon={<Target className="h-8 w-8" />}
          color="text-orange-900"
          change="Eficiência do processo"
          changeType="positive"
        />
      </div>

      {/* Cards Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Contratados"
          value={metrics.hired_count}
          icon={<Award className="h-6 w-6" />}
          color="text-green-700"
        />
        
        <MetricCard
          title="Entrevistas Pendentes"
          value={metrics.pending_interviews}
          icon={<Calendar className="h-6 w-6" />}
          color="text-blue-700"
        />
        
        <MetricCard
          title="Total de Candidaturas"
          value={metrics.total_applications}
          icon={<FileText className="h-6 w-6" />}
          color="text-gray-700"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Gráfico de Tendência */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 xl:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base xl:text-lg font-semibold text-gray-900">
              Tendência de Candidaturas
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                fontSize={12}
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 xl:p-6">
          <h3 className="text-base xl:text-lg font-semibold text-gray-900 mb-4">
            Distribuição por Status
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} candidatos`, name]} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) => value}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico Pipeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 xl:p-6">
        <h3 className="text-base xl:text-lg font-semibold text-gray-900 mb-4">
          Candidatos por Etapa do Pipeline
        </h3>
        <div className="overflow-x-auto">
          <ResponsiveContainer width="100%" height={380} minWidth={800}>
            <BarChart 
              data={stageData}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={11}
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={120}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value) => [`${value} candidatos`, 'Quantidade']}
                labelFormatter={(label) => `Etapa: ${label}`}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Seções Lado a Lado */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Vagas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 xl:p-6">
          <h3 className="text-base xl:text-lg font-semibold text-gray-900 mb-4">
            Top Vagas com Mais Candidatos
          </h3>
          {metrics.top_jobs && metrics.top_jobs.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {metrics.top_jobs.map((job, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{job.job_title}</h4>
                    <p className="text-xs text-gray-600 truncate">{job.company}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <span className="font-bold text-blue-600 text-lg">{job.applications_count}</span>
                    <p className="text-xs text-gray-500">candidatos</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-8 w-8 mx-auto mb-2" />
              <p>Nenhuma vaga com candidatos ainda</p>
            </div>
          )}
        </div>

        {/* Atividades Recentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 xl:p-6">
          <h3 className="text-base xl:text-lg font-semibold text-gray-900 mb-4">
            Candidaturas Recentes
          </h3>
          {metrics.recent_activities && metrics.recent_activities.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {metrics.recent_activities.slice(0, 8).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {activity.candidate_name}
                    </h4>
                    <p className="text-xs text-gray-600 truncate">{activity.job_title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Etapa {activity.stage} • {formatDate(activity.applied_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => console.log('Ver candidato', activity.id)}
                    className="p-1 text-blue-600 hover:text-blue-800 flex-shrink-0"
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p>Nenhuma atividade recente</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Última atualização: {formatDate(metrics.last_updated)}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
            <span>Total de {metrics.total_applications} candidaturas processadas</span>
            <span className="hidden sm:inline">•</span>
            <span>{metrics.active_jobs} vagas ativas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;