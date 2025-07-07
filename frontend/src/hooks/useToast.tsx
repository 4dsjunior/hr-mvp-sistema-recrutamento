import { useState, useCallback } from 'react';
import { ToastProps } from '../components/UI/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString();
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast,
    };
    setToasts((prev) => [...prev, newToast]);
  }, [removeToast]);

  const showSuccess = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const showError = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  }, [addToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  // Função legacy para compatibilidade (se necessário)
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      showSuccess(message);
    } else {
      showError(message);
    }
  }, [showSuccess, showError]);

  return {
    toasts,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast, // Para compatibilidade
  };
};