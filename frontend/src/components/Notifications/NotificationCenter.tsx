// 🔔 Sistema de Notificações em Tempo Real
// Arquivo: frontend/src/components/Notifications/NotificationCenter.tsx

import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  InfoCircle,
  Clock,
  User,
  Briefcase,
  MessageCircle,
  ArrowRight,
  Eye,
  Settings
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

// ============================================================================
// INTERFACES
// ============================================================================

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  category: 'candidate' | 'job' | 'system' | 'pipeline';
  metadata?: {
    candidateId?: number;
    jobId?: number;
    applicationId?: number;
    userId?: string;
  };
}

interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onNotificationClick,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'candidate' | 'job' | 'system'>('all');
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    getNotificationsByCategory,
    getUnreadNotifications
  } = useNotifications();

  // 🔔 FILTRAR NOTIFICAÇÕES
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'candidate':
        return notification.category === 'candidate';
      case 'job':
        return notification.category === 'job';
      case 'system':
        return notification.category === 'system';
      default:
        return true;
    }
  });


  // 🎨 ÍCONES E CORES
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <InfoCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  const getCategoryIcon = (category: Notification['category']) => {
    switch (category) {
      case 'candidate':
        return <User className="h-4 w-4" />;
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'pipeline':
        return <ArrowRight className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  // 📅 FORMATAÇÃO DE TEMPO
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'agora';
  };

  // 🎯 HANDLE CLICK
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Botão de Notificações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        title="Notificações"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de Notificações */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Notificações
                </h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex items-center space-x-2 mt-3">
                {['all', 'unread', 'candidate', 'job', 'system'].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType as any)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      filter === filterType
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filterType === 'all' ? 'Todas' : 
                     filterType === 'unread' ? 'Não lidas' :
                     filterType === 'candidate' ? 'Candidatos' :
                     filterType === 'job' ? 'Vagas' :
                     'Sistema'}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Notificações */}
            <div className="overflow-y-auto max-h-80">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Ícone */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {/* Categoria e Ação */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            {getCategoryIcon(notification.category)}
                            <span>{notification.category}</span>
                          </div>
                          {notification.actionLabel && (
                            <span className="text-xs text-blue-600 flex items-center">
                              {notification.actionLabel}
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma notificação
                  </h3>
                  <p className="text-gray-600">
                    {filter === 'all' 
                      ? 'Você está em dia com todas as notificações!'
                      : `Nenhuma notificação ${filter === 'unread' ? 'não lida' : `de ${filter}`} encontrada.`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
              >
                Ver todas as notificações
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;