// 🔄 AUTO-REFRESH COMPONENT - Funcionalidade Avançada
// Arquivo: frontend/src/components/Dashboard/AutoRefresh.tsx

import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, Play, Pause, Settings } from 'lucide-react';

interface AutoRefreshProps {
  onRefresh: () => void;
  loading: boolean;
  className?: string;
}

interface RefreshOption {
  label: string;
  value: number;
  icon: string;
}

const REFRESH_OPTIONS: RefreshOption[] = [
  { label: 'Desativado', value: 0, icon: '⏸️' },
  { label: '30 segundos', value: 30000, icon: '⚡' },
  { label: '1 minuto', value: 60000, icon: '🕐' },
  { label: '5 minutos', value: 300000, icon: '🕔' },
  { label: '10 minutos', value: 600000, icon: '🕙' }
];

const AutoRefresh: React.FC<AutoRefreshProps> = ({ 
  onRefresh, 
  loading, 
  className = '' 
}) => {
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60000); // 1 minuto padrão
  const [nextRefreshIn, setNextRefreshIn] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // Timer para auto-refresh
  useEffect(() => {
    if (!isAutoRefreshEnabled || refreshInterval === 0) {
      setNextRefreshIn(0);
      return;
    }

    const interval = setInterval(() => {
      onRefresh();
      setNextRefreshIn(refreshInterval / 1000); // Reset timer
    }, refreshInterval);

    // Countdown timer
    setNextRefreshIn(refreshInterval / 1000);
    const countdown = setInterval(() => {
      setNextRefreshIn(prev => {
        if (prev <= 1) return refreshInterval / 1000;
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, [isAutoRefreshEnabled, refreshInterval, onRefresh]);

  // Pausar em background/tab inativa
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isAutoRefreshEnabled) {
        setIsAutoRefreshEnabled(false);
        console.log('🔄 Auto-refresh pausado: Tab inativa');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAutoRefreshEnabled]);

  const handleToggleAutoRefresh = () => {
    const newState = !isAutoRefreshEnabled;
    setIsAutoRefreshEnabled(newState);
    
    if (newState) {
      console.log(`🔄 Auto-refresh ativado: ${refreshInterval / 1000}s`);
      // Refresh imediato ao ativar
      onRefresh();
    } else {
      console.log('⏸️ Auto-refresh pausado');
      setNextRefreshIn(0);
    }
  };

  const handleIntervalChange = (newInterval: number) => {
    setRefreshInterval(newInterval);
    setShowDropdown(false);
    
    if (newInterval === 0) {
      setIsAutoRefreshEnabled(false);
      setNextRefreshIn(0);
    } else if (isAutoRefreshEnabled) {
      setNextRefreshIn(newInterval / 1000);
    }
    
    console.log(`⏱️ Intervalo alterado: ${newInterval === 0 ? 'Desativado' : newInterval / 1000 + 's'}`);
  };

  const handleManualRefresh = () => {
    onRefresh();
    if (isAutoRefreshEnabled) {
      setNextRefreshIn(refreshInterval / 1000); // Reset countdown
    }
  };

  const getCurrentOption = () => {
    return REFRESH_OPTIONS.find(opt => opt.value === refreshInterval) || REFRESH_OPTIONS[1];
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.ceil(seconds % 60);
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Manual Refresh Button */}
      <button
        onClick={handleManualRefresh}
        disabled={loading}
        className={`inline-flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
          loading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
        }`}
        title="Atualizar agora"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Atualizar</span>
      </button>

      {/* Auto-Refresh Toggle */}
      <button
        onClick={handleToggleAutoRefresh}
        className={`inline-flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
          isAutoRefreshEnabled
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={isAutoRefreshEnabled ? 'Pausar auto-refresh' : 'Ativar auto-refresh'}
      >
        {isAutoRefreshEnabled ? (
          <>
            <Pause className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Auto</span>
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Auto</span>
          </>
        )}
      </button>

      {/* Interval Selector */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          title="Configurar intervalo"
        >
          <Settings className="h-4 w-4 mr-2" />
          <span className="hidden lg:inline">{getCurrentOption().label}</span>
          <span className="lg:hidden">{getCurrentOption().icon}</span>
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                Intervalo de Atualização
              </div>
              {REFRESH_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleIntervalChange(option.value)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2 ${
                    refreshInterval === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                  {refreshInterval === option.value && (
                    <span className="ml-auto text-blue-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Countdown Timer */}
      {isAutoRefreshEnabled && nextRefreshIn > 0 && (
        <div className="hidden xl:flex items-center space-x-1 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
          <Clock className="h-4 w-4" />
          <span>Próxima: {formatTime(nextRefreshIn)}</span>
        </div>
      )}

      {/* Status Indicator */}
      <div className="hidden xl:flex items-center space-x-2">
        <div 
          className={`w-2 h-2 rounded-full transition-colors ${
            isAutoRefreshEnabled ? 'bg-green-400 animate-pulse' : 'bg-gray-300'
          }`} 
        />
        <span className="text-xs text-gray-500 font-medium">
          {isAutoRefreshEnabled ? 'Auto-ON' : 'Manual'}
        </span>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default AutoRefresh;