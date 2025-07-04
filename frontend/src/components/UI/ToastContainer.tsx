import React from 'react';
<<<<<<< HEAD

const ToastContainer = () => {
  // Placeholder ToastContainer
  return null;
};

export default ToastContainer;
=======
import Toast, { ToastProps } from './Toast';

interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};

export default ToastContainer;
>>>>>>> 7f531d6f5fd857414939463899b888cc5aefc78f
