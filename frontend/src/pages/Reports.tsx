import React from 'react';
import { BarChart3, TrendingUp, Users, Target, Download } from 'lucide-react';

const Reports: React.FC = () => {
  const reportCards = [
    {
      title: 'Relatório de Candidatos',
      description: 'Análise completa dos candidatos por período',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      count: '156 candidatos',
    },
    {
      title: 'Taxa de Conversão',
      description: 'Funil de conversão do processo seletivo',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
      count: '23.5% média',
    },
    {
      title: 'Desempenho por Vaga',
      description: 'Métricas detalhadas por posição',
      icon: Target,
      color: 'bg-purple-100 text-purple-600',
      count: '8 vagas ativas',
    },
    {
      title: 'Análise Temporal',
      description: 'Tendências ao longo do tempo',
      icon: BarChart3,
      color: 'bg-orange-100 text-orange-600',
      count: 'Últimos 12 meses',
    },
  ];

  const quickStats = [
    { label: 'Candidatos este mês', value: 42, change: '+12%' },
    { label: 'Entrevistas realizadas', value: 18, change: '+8%' },
    { label: 'Contratações', value: 5, change: '+25%' },
    { label: 'Tempo médio de contratação', value: '15 dias', change: '-2 dias' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Relatórios</h1>
          <p className="text-gray-600">
            Análises e insights sobre o processo de recrutamento
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          <Download className="h-4 w-4" />
          <span>Exportar Relatório</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCards.map((report, index) => (
          <div key={index} className="bg-white rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${report.color}`}>
                <report.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {report.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {report.description}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {report.count}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full bg-gray-50 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                Visualizar Relatório
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Candidatos por Mês
          </h3>
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>Últimos 6 meses</option>
            <option>Últimos 12 meses</option>
            <option>Este ano</option>
          </select>
        </div>
        
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Gráfico de candidatos por mês</p>
            <p className="text-sm text-gray-500">Dados em tempo real</p>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Funil de Conversão
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Candidatos</span>
            <span className="text-sm font-semibold text-gray-900">156</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-primary-500 h-3 rounded-full w-full"></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Triagem</span>
            <span className="text-sm font-semibold text-gray-900">89</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-primary-500 h-3 rounded-full w-3/5"></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Entrevistas</span>
            <span className="text-sm font-semibold text-gray-900">34</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-primary-500 h-3 rounded-full w-2/5"></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Contratações</span>
            <span className="text-sm font-semibold text-gray-900">12</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full w-1/5"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;