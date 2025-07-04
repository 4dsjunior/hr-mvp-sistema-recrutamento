import React, { useState, useEffect } from 'react';
import { Users, Briefcase, TrendingUp, Clock } from 'lucide-react';
import MetricCard from '../components/Dashboard/MetricCard';
import RecentActivity from '../components/Dashboard/RecentActivity';
import { DashboardMetrics } from '../types';
import api from '../lib/api';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulated API call - replace with real API
        const mockData: DashboardMetrics = {
          total_candidates: 156,
          open_positions: 8,
          monthly_hires: 12,
          conversion_rate: 23.5,
          pending_interviews: 5,
          recent_activity: [
            {
              id: '1',
              type: 'candidate_applied',
              message: 'Maria Silva se candidatou para Desenvolvedor Frontend',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              user: 'Sistema',
            },
            {
              id: '2',
              type: 'interview_scheduled',
              message: 'Entrevista agendada com João Santos',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              user: 'Ana Carolina',
            },
            {
              id: '3',
              type: 'candidate_hired',
              message: 'Pedro Oliveira foi contratado como Designer UX',
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              user: 'Roberto Lima',
            },
            {
              id: '4',
              type: 'position_created',
              message: 'Nova vaga criada: Analista de Dados',
              timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
              user: 'Carla Mendes',
            },
          ],
        };

        // Simulate API delay
        setTimeout(() => {
          setMetrics(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Visão geral das atividades de recrutamento
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Candidatos"
          value={metrics?.total_candidates || 0}
          icon={Users}
          change="+8% este mês"
          changeType="increase"
          loading={loading}
        />
        <MetricCard
          title="Vagas Abertas"
          value={metrics?.open_positions || 0}
          icon={Briefcase}
          change="2 novas esta semana"
          changeType="increase"
          loading={loading}
        />
        <MetricCard
          title="Contratações do Mês"
          value={metrics?.monthly_hires || 0}
          icon={TrendingUp}
          change="+15% vs mês anterior"
          changeType="increase"
          loading={loading}
        />
        <MetricCard
          title="Entrevistas Pendentes"
          value={metrics?.pending_interviews || 0}
          icon={Clock}
          change="Para esta semana"
          changeType="neutral"
          loading={loading}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity
          activities={metrics?.recent_activity || []}
          loading={loading}
        />
        
        <div className="bg-white rounded-xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Taxa de Conversão
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Candidatos → Entrevistas</span>
              <span className="text-sm font-semibold text-gray-900">32%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full w-8/12"></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Entrevistas → Contratações</span>
              <span className="text-sm font-semibold text-gray-900">28%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full w-7/12"></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taxa Global</span>
              <span className="text-sm font-semibold text-primary-600">
                {metrics?.conversion_rate || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full w-6/12"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;