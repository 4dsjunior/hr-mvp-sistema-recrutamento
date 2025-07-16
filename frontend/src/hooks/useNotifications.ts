// 🔔 Hook para Sistema de Notificações
// Arquivo: frontend/src/hooks/useNotifications.ts

import { useState, useEffect, useCallback } from 'react';

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

interface NotificationOptions {
  actionUrl?: string;
  actionLabel?: string;
  category?: 'candidate' | 'job' | 'system' | 'pipeline';
  metadata?: Notification['metadata'];
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // 🔄 CARREGAR NOTIFICAÇÕES INICIAIS
  useEffect(() => {
    loadNotifications();
    connectToNotifications();
  }, []);

  // 📡 CONECTAR AO SISTEMA DE NOTIFICAÇÕES (WebSocket em produção)
  const connectToNotifications = useCallback(() => {
    // Em produção, implementar WebSocket aqui
    // Por enquanto, simulamos com polling
    setIsConnected(true);
    
    const pollInterval = setInterval(() => {
      // Simular recebimento de notificações
      const shouldReceive = Math.random() > 0.8; // 20% chance
      
      if (shouldReceive) {
        const notification: Notification = {
          id: Date.now().toString(),
          type: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)] as any,
          title: 'Nova Atividade',
          message: getRandomMessage(),
          timestamp: new Date(),
          read: false,
          category: ['candidate', 'job', 'pipeline'][Math.floor(Math.random() * 3)] as any,
          actionUrl: '/dashboard',
          actionLabel: 'Ver Detalhes'
        };
        
        addNotification(notification);
      }
    }, 45000); // A cada 45 segundos

    return () => clearInterval(pollInterval);
  }, []);

  // 📥 CARREGAR NOTIFICAÇÕES
  const loadNotifications = async () => {
    try {
      // Em produção, fazer chamada para API
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'info',
          title: 'Novo Candidato',
          message: 'João Silva aplicou para a vaga de Desenvolvedor Frontend',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          read: false,
          category: 'candidate',
          actionUrl: '/candidates',
          actionLabel: 'Ver Candidato',
          metadata: { candidateId: 1, jobId: 1 }
        },
        {
          id: '2',
          type: 'success',
          title: 'Candidato Aprovado',
          message: 'Maria Santos foi aprovada para a etapa de entrevista técnica',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          read: false,
          category: 'pipeline',
          actionUrl: '/pipeline',
          actionLabel: 'Ver Pipeline',
          metadata: { candidateId: 2, applicationId: 5 }
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  // ➕ ADICIONAR NOTIFICAÇÃO
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Manter apenas 50
    setUnreadCount(prev => prev + 1);
  }, []);

  // ➕ CRIAR NOTIFICAÇÃO
  const createNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    options?: NotificationOptions
  ) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      category: options?.category || 'system',
      actionUrl: options?.actionUrl,
      actionLabel: options?.actionLabel,
      metadata: options?.metadata
    };

    addNotification(notification);
  }, [addNotification]);

  // ✅ MARCAR COMO LIDA
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // ✅ MARCAR TODAS COMO LIDAS
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // 🗑️ REMOVER NOTIFICAÇÃO
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  // 🧹 LIMPAR TODAS AS NOTIFICAÇÕES
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // 🔍 FILTRAR NOTIFICAÇÕES
  const getNotificationsByCategory = useCallback((category: Notification['category']) => {
    return notifications.filter(n => n.category === category);
  }, [notifications]);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  // 📊 FUNÇÕES UTILITÁRIAS
  const getRandomMessage = () => {
    const messages = [
      'Nova candidatura recebida',
      'Candidato movido no pipeline',
      'Entrevista agendada',
      'Vaga atualizada',
      'Sistema atualizado'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // 🎯 AÇÕES ESPECÍFICAS DO SISTEMA
  const notifyNewCandidate = useCallback((candidateName: string, jobTitle: string) => {
    createNotification(
      'info',
      'Novo Candidato',
      `${candidateName} aplicou para a vaga de ${jobTitle}`,
      {
        category: 'candidate',
        actionUrl: '/candidates',
        actionLabel: 'Ver Candidato'
      }
    );
  }, [createNotification]);

  const notifyStageChange = useCallback((candidateName: string, stageName: string) => {
    createNotification(
      'success',
      'Candidato Avançou',
      `${candidateName} foi movido para ${stageName}`,
      {
        category: 'pipeline',
        actionUrl: '/pipeline',
        actionLabel: 'Ver Pipeline'
      }
    );
  }, [createNotification]);

  const notifyJobCreated = useCallback((jobTitle: string) => {
    createNotification(
      'info',
      'Nova Vaga',
      `Vaga "${jobTitle}" foi criada com sucesso`,
      {
        category: 'job',
        actionUrl: '/jobs',
        actionLabel: 'Ver Vagas'
      }
    );
  }, [createNotification]);

  const notifyError = useCallback((title: string, message: string) => {
    createNotification(
      'error',
      title,
      message,
      {
        category: 'system',
        actionUrl: '/dashboard',
        actionLabel: 'Ver Dashboard'
      }
    );
  }, [createNotification]);

  return {
    // Estado
    notifications,
    unreadCount,
    isConnected,
    
    // Ações básicas
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    
    // Filtros
    getNotificationsByCategory,
    getUnreadNotifications,
    
    // Criação manual
    createNotification,
    
    // Ações específicas
    notifyNewCandidate,
    notifyStageChange,
    notifyJobCreated,
    notifyError
  };
};

export default useNotifications;