// 📊 PÁGINA DE RELATÓRIOS AVANÇADOS - VERSÃO COMPLETA
// Arquivo: frontend/src/pages/ReportsPage.tsx

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  Calendar,
  Filter,
  RefreshCw,
  AlertCircle,
  FileText,
  PieChart,
  Activity,
  Target,
  Clock,
  Download
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import ExportButton from '../components/Reports/ExportButton';
import api from '../lib/api';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interfaces
interface ReportMetrics {
  candidates: {
    total: number;
    by_status: Record<string, number>;
    recent: any[];
    monthly_growth: number;
  };
  jobs: {
    total: number;
    active: number;
    by_type: Record<string, number>;
    applications_per_job: any[];
  };
  applications: {
    total: number;
    by_stage: Record<string, number>;
    conversion_rate: number;
    monthly_trend: any[];
  };
  pipeline: {
    total_in_process: number;
    hired_count: number;
    rejected_count: number;
    stage_distribution: any[];
  };
}

interface ReportFilters {
  dateRange: 'week' | 'month' | '3months' | '6months' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  status?: string;
  jobType?: string;
  exportFormat?: 'pdf' | 'csv' | 'png';
}

const ReportsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: 'month',
  });
  const [selectedReport, setSelectedReport] = useState<string>('overview');

  // Cores para gráficos
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Carregar dados
  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Carregando métricas de relatórios...');
      
      // Fazer múltiplas chamadas para obter dados completos
      const [candidatesRes, jobsRes, applicationsRes, dashboardRes] = await Promise.all([
        api.get('/api/candidates'),
        api.get('/api/jobs'),
        api.get('/api/applications'),
        api.get('/api/dashboard/metrics')
      ]);

      // Processar dados dos candidatos
      const candidatesData = candidatesRes.data || [];
      const candidatesByStatus = candidatesData.reduce((acc: Record<string, number>, candidate: any) => {
        const status = candidate.status || 'active';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Processar dados das vagas
      const jobsData = jobsRes.data?.jobs || jobsRes.data || [];
      const activeJobs = jobsData.filter((job: any) => job.status === 'active').length;
      const jobsByType = jobsData.reduce((acc: Record<string, number>, job: any) => {
        const type = job.employment_type || 'full-time';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Processar dados das candidaturas
      const applicationsData = applicationsRes.data?.applications || applicationsRes.data || [];
      const applicationsByStage = applicationsData.reduce((acc: Record<string, number>, app: any) => {
        const stage = `stage_${app.stage || 1}`;
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {});

      // Calcular taxa de conversão
      const hiredCount = applicationsData.filter((app: any) => app.stage === 9).length;
      const conversionRate = applicationsData.length > 0 ? (hiredCount / applicationsData.length) * 100 : 0;

      // Dados do dashboard
      const dashboardData = dashboardRes.data || {};

      // Montar métricas
      const metricsData: ReportMetrics = {
        candidates: {
          total: candidatesData.length,
          by_status: candidatesByStatus,
          recent: candidatesData.slice(0, 10),
          monthly_growth: 15.2, // Placeholder
        },
        jobs: {
          total: jobsData.length,
          active: activeJobs,
          by_type: jobsByType,
          applications_per_job: jobsData.map((job: any) => ({
            title: job.title,
            company: job.company,
            applications: applicationsData.filter((app: any) => app.job_id === job.id).length
          })).sort((a: any, b: any) => b.applications - a.applications).slice(0, 10),
        },
        applications: {
          total: applicationsData.length,
          by_stage: applicationsByStage,
          conversion_rate: conversionRate,
          monthly_trend: dashboardData.monthly_trend || [],
        },
        pipeline: {
          total_in_process: applicationsData.filter((app: any) => app.stage > 1 && app.stage < 9).length,
          hired_count: hiredCount,
          rejected_count: applicationsData.filter((app: any) => app.status === 'rejected').length,
          stage_distribution: Object.entries(applicationsByStage).map(([stage, count]) => ({
            name: getStageLabel(parseInt(stage.replace('stage_', ''))),
            value: count,
            stage: parseInt(stage.replace('stage_', ''))
          }))
        }
      };

      setMetrics(metricsData);
      console.log('✅ Métricas carregadas:', metricsData);
      
    } catch (error: any) {
      console.error('❌ Erro ao carregar métricas:', error);
      setError(error.response?.data?.error || error.message || 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const getStageLabel = (stage: number): string => {
    const labels: Record<number, string> = {
      1: 'Candidatura',
      2: 'Triagem',
      3: 'Telefônica',
      4: 'Teste Técnico',
      5: 'Entrevista RH',
      6: 'Entrevista Técnica',
      7: 'Referências',
      8: 'Proposta',
      9: 'Contratado'
    };
    return labels[stage] || `Etapa ${stage}`;
  };

  const handleFilterChange = (newFilters: Partial<ReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleRefresh = () => {
    loadMetrics();
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadMetrics();
  }, [filters.dateRange]);

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
              <h3 className="text-red-800 font-medium">Erro ao carregar relatórios</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
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
        <p className="text-gray-600">Não foi possível carregar os dados dos relatórios.</p>
      </div>
    );
  }

  const statusData = Object.entries(metrics.candidates.by_status).map(([status, count]) => ({
    name: status === 'active' ? 'Ativo' : 
          status === 'inactive' ? 'Inativo' : 
          status === 'pending' ? 'Pendente' : status,
    value: count,
    color: status === 'active' ? '#10b981' : 
           status === 'inactive' ? '#ef4444' : 
           status === 'pending' ? '#f59e0b' : '#6b7280'
  }));

  const jobTypeData = Object.entries(metrics.jobs.by_type).map(([type, count]) => ({
    name: type === 'full-time' ? 'Tempo Integral' : 
          type === 'part-time' ? 'Meio Período' : 
          type === 'contract' ? 'Contrato' : type,
    value: count
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Avançados</h1>
          <p className="text-gray-600">Análises detalhadas e métricas do sistema de recrutamento</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Filtro de período */}
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange({ dateRange: e.target.value as any })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
            <option value="3months">Últimos 3 meses</option>
            <option value="6months">Últimos 6 meses</option>
            <option value="year">Último ano</option>
          </select>

          {/* Botão de refresh */}
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar</span>
          </button>

          {/* Export completo */}
          <ExportButton
            data={[
              ...metrics.candidates.recent,
              ...metrics.jobs.applications_per_job,
              ...metrics.applications.monthly_trend
            ]}
            title="Relatório Completo"
            subtitle={`Período: ${filters.dateRange}`}
            type="dashboard"
            filters={filters}
            variant="primary"
          />
        </div>
      </div>

      {/* Tabs de relatórios */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'candidates', label: 'Candidatos', icon: Users },
            { id: 'jobs', label: 'Vagas', icon: Briefcase },
            { id: 'pipeline', label: 'Pipeline', icon: Activity },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedReport === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo dos relatórios */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          {/* Cards de métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Candidatos</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.candidates.total}</p>
                  <p className="text-sm text-green-600">+{metrics.candidates.monthly_growth}% este mês</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vagas Ativas</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.jobs.active}</p>
                  <p className="text-sm text-gray-600">de {metrics.jobs.total} total</p>
                </div>
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Candidaturas</p>
                  <p className="text-2xl font-bold text-purple-600">{metrics.applications.total}</p>
                  <p className="text-sm text-gray-600">processo ativo</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.applications.conversion_rate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">candidatos contratados</p>
                </div>
                <Target className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Gráficos principais */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Tendência mensal */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tendência de Candidaturas</h3>
                <ExportButton
                  data={metrics.applications.monthly_trend}
                  title="Tendência Mensal"
                  type="dashboard"
                  chartElementId="trend-chart"
                  variant="outline"
                  size="sm"
                />
              </div>
              <div id="trend-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.applications.monthly_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status dos candidatos */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Status dos Candidatos</h3>
                <ExportButton
                  data={statusData}
                  title="Status dos Candidatos"
                  type="dashboard"
                  chartElementId="status-chart"
                  variant="outline"
                  size="sm"
                />
              </div>
              <div id="status-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'candidates' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Distribuição por Status</h3>
              <ExportButton
                data={metrics.candidates.recent}
                title="Relatório de Candidatos"
                type="candidates"
                variant="outline"
                size="sm"
              />
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedReport === 'jobs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Tipos de vaga */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tipos de Vaga</h3>
                <ExportButton
                  data={jobTypeData}
                  title="Tipos de Vaga"
                  type="dashboard"
                  chartElementId="job-types-chart"
                  variant="outline"
                  size="sm"
                />
              </div>
              <div id="job-types-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={jobTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {jobTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top vagas */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Vagas com Mais Candidaturas</h3>
                <ExportButton
                  data={metrics.jobs.applications_per_job}
                  title="Vagas por Candidaturas"
                  type="jobs"
                  variant="outline"
                  size="sm"
                />
              </div>
              <div className="space-y-3">
                {metrics.jobs.applications_per_job.slice(0, 8).map((job, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{job.title}</p>
                      <p className="text-xs text-gray-600">{job.company}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-600">{job.applications}</span>
                      <p className="text-xs text-gray-500">candidaturas</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'pipeline' && (
        <div className="space-y-6">
          {/* Cards do pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Processo</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.pipeline.total_in_process}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contratados</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.pipeline.hired_count}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejeitados</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.pipeline.rejected_count}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Distribuição por etapa */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Distribuição por Etapa</h3>
              <ExportButton
                data={metrics.pipeline.stage_distribution}
                title="Pipeline por Etapa"
                type="applications"
                chartElementId="pipeline-chart"
                variant="outline"
                size="sm"
              />
            </div>
            <div id="pipeline-chart">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={metrics.pipeline.stage_distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Última atualização: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Período: {filters.dateRange}</span>
            <span>•</span>
            <span>{metrics.applications.total} candidaturas analisadas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;