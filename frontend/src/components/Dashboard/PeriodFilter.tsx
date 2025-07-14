// 📅 PERIOD FILTER COMPONENT - Filtros Avançados
// Arquivo: frontend/src/components/Dashboard/PeriodFilter.tsx

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, BarChart3, Filter } from 'lucide-react';

interface PeriodOption {
  label: string;
  value: string;
  days: number;
  icon: React.ReactNode;
  description: string;
}

interface PeriodFilterProps {
  value: string;
  onChange: (period: string, customRange?: { start: string; end: string }) => void;
  className?: string;
  showComparison?: boolean;
}

const PERIOD_OPTIONS: PeriodOption[] = [
  {
    label: 'Últimos 7 dias',
    value: '7d',
    days: 7,
    icon: <Clock className="h-4 w-4" />,
    description: 'Semana atual'
  },
  {
    label: 'Últimos 30 dias',
    value: '30d',
    days: 30,
    icon: <Calendar className="h-4 w-4" />,
    description: 'Mês atual'
  },
  {
    label: 'Últimos 90 dias',
    value: '90d',
    days: 90,
    icon: <TrendingUp className="h-4 w-4" />,
    description: 'Trimestre atual'
  },
  {
    label: 'Últimos 365 dias',
    value: '365d',
    days: 365,
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'Ano atual'
  },
  {
    label: 'Período customizado',
    value: 'custom',
    days: 0,
    icon: <Filter className="h-4 w-4" />,
    description: 'Escolher datas'
  }
];

const PeriodFilter: React.FC<PeriodFilterProps> = ({ 
  value, 
  onChange, 
  className = '',
  showComparison = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustomInputs, setShowCustomInputs] = useState(false);

  // Calcular datas baseadas no período selecionado
  const calculateDateRange = (periodValue: string) => {
    const today = new Date();
    const option = PERIOD_OPTIONS.find(opt => opt.value === periodValue);
    
    if (!option || option.value === 'custom') return null;
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - option.days);
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
      label: option.label
    };
  };

  // Obter opção atual
  const getCurrentOption = () => {
    return PERIOD_OPTIONS.find(opt => opt.value === value) || PERIOD_OPTIONS[1]; // Default: 30d
  };

  // Formatar datas para exibição
  const formatDateRange = (periodValue: string): string => {
    if (periodValue === 'custom' && customStart && customEnd) {
      const start = new Date(customStart).toLocaleDateString('pt-BR');
      const end = new Date(customEnd).toLocaleDateString('pt-BR');
      return `${start} - ${end}`;
    }
    
    const range = calculateDateRange(periodValue);
    if (!range) return '';
    
    const start = new Date(range.start).toLocaleDateString('pt-BR');
    const end = new Date(range.end).toLocaleDateString('pt-BR');
    return `${start} - ${end}`;
  };

  // Handle period change
  const handlePeriodChange = (periodValue: string) => {
    if (periodValue === 'custom') {
      setShowCustomInputs(true);
      setShowDropdown(false);
      return;
    }
    
    setShowCustomInputs(false);
    setShowDropdown(false);
    onChange(periodValue);
    
    console.log(`📅 Período alterado: ${getCurrentOption().label}`);
  };

  // Handle custom date range
  const handleCustomDateChange = () => {
    if (!customStart || !customEnd) return;
    
    if (new Date(customStart) > new Date(customEnd)) {
      alert('Data inicial deve ser anterior à data final');
      return;
    }
    
    onChange('custom', { start: customStart, end: customEnd });
    setShowCustomInputs(false);
    
    console.log(`📅 Período customizado: ${customStart} até ${customEnd}`);
  };

  // Calcular comparação com período anterior
  const getComparisonData = () => {
    if (!showComparison) return null;
    
    const current = calculateDateRange(value);
    if (!current) return null;
    
    const daysDiff = Math.ceil((new Date(current.end).getTime() - new Date(current.start).getTime()) / (1000 * 60 * 60 * 24));
    const previousStart = new Date(current.start);
    previousStart.setDate(previousStart.getDate() - daysDiff);
    
    const previousEnd = new Date(current.start);
    previousEnd.setDate(previousEnd.getDate() - 1);
    
    return {
      start: previousStart.toISOString().split('T')[0],
      end: previousEnd.toISOString().split('T')[0],
      label: `Período anterior (${daysDiff} dias)`
    };
  };

  // Set default dates for custom range
  useEffect(() => {
    if (value === 'custom' && !customStart && !customEnd) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      setCustomStart(thirtyDaysAgo.toISOString().split('T')[0]);
      setCustomEnd(today.toISOString().split('T')[0]);
    }
  }, [value, customStart, customEnd]);

  const currentOption = getCurrentOption();
  const comparisonData = getComparisonData();

  return (
    <div className={`relative ${className}`}>
      {/* Main Period Selector */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 shadow-sm"
          title="Filtrar por período"
        >
          {currentOption.icon}
          <span className="ml-2 mr-1">{currentOption.label}</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Quick Period Buttons (Mobile Friendly) */}
        <div className="hidden lg:flex items-center space-x-1">
          {PERIOD_OPTIONS.slice(0, 3).map((option) => (
            <button
              key={option.value}
              onClick={() => handlePeriodChange(option.value)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                value === option.value
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={option.description}
            >
              {option.days}d
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Display */}
      <div className="mt-2 text-sm text-gray-500">
        <span>📅 {formatDateRange(value)}</span>
        {comparisonData && (
          <span className="ml-4 text-gray-400">
            vs. {comparisonData.label}
          </span>
        )}
      </div>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
              Selecionar Período
            </div>
            
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePeriodChange(option.value)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between ${
                  value === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {option.icon}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </div>
                {value === option.value && (
                  <span className="text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Date Range Inputs */}
      {showCustomInputs && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4">
          <div className="space-y-4">
            <div className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">
              Período Customizado
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Data Final
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowCustomInputs(false)}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleCustomDateChange}
                disabled={!customStart || !customEnd}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {(showDropdown || showCustomInputs) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowDropdown(false);
            setShowCustomInputs(false);
          }}
        />
      )}
    </div>
  );
};

export default PeriodFilter;