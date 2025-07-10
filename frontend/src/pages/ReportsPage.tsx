// 🚨 CORREÇÃO: ReportsPage.tsx - Arquivo Limpo
// Arquivo: frontend/src/pages/ReportsPage.tsx

import React from 'react';
import { BarChart3, TrendingUp, Users, Briefcase, Download, Calendar } from 'lucide-react';

const ReportsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Análises e métricas do sistema de RH
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Em desenvolvimento */}
        <div className="text-center py-12">
          <BarChart3 className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Relatórios em Desenvolvimento
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Esta seção será implementada nas <strong>Semanas 9-10</strong> com gráficos interativos, 
            métricas avançadas e relatórios exportáveis.
          </p>

          {/* Preview dos relatórios futuros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <TrendingUp className="h-8 w-8 text-blue-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Funil de Conversão</h4>
              <p className="text-sm text-gray-600">
                Análise das taxas de conversão por etapa do processo
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Users className="h-8 w-8 text-green-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Performance RH</h4>
              <p className="text-sm text-gray-600">
                Métricas de desempenho da equipe de recrutamento
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Briefcase className="h-8 w-8 text-purple-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Análise de Vagas</h4>
              <p className="text-sm text-gray-600">
                Estatísticas detalhadas das vagas publicadas
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Calendar className="h-8 w-8 text-orange-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Relatórios Temporais</h4>
              <p className="text-sm text-gray-600">
                Análises de tendências ao longo do tempo
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <BarChart3 className="h-8 w-8 text-red-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Dashboards Interativos</h4>
              <p className="text-sm text-gray-600">
                Visualizações dinâmicas dos dados de RH
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <Download className="h-8 w-8 text-indigo-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Exportação Automática</h4>
              <p className="text-sm text-gray-600">
                Relatórios em PDF, Excel e outros formatos
              </p>
            </div>
          </div>
        </div>

        {/* Timeline de desenvolvimento */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cronograma de Desenvolvimento</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Semanas 1-8: Base do Sistema</p>
                <p className="text-xs text-gray-500">CRUD de candidatos, vagas e pipeline - Concluído</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✅ Completo</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Semanas 9-10: Relatórios Avançados</p>
                <p className="text-xs text-gray-500">Gráficos interativos, métricas detalhadas</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">🔄 Próximo</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Semanas 11-12: Sistema Avançado</p>
                <p className="text-xs text-gray-500">Roles, permissões, notificações</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">⏳ Planejado</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Semanas 13-16: Deploy e Produção</p>
                <p className="text-xs text-gray-500">VPS, SSL, monitoramento</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">⏳ Planejado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;