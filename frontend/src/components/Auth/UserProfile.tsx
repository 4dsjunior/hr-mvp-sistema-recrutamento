// 👤 NOVO: UserProfile.tsx - Componente de Perfil do Usuário
// Arquivo: frontend/src/components/Auth/UserProfile.tsx

import React from 'react';
import { useAuthContext } from '../../hooks/useAuth';
import { User, Mail, Calendar, Shield } from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthContext();

  if (!isOpen || !user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Perfil do Usuário</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-4 flex items-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">
                {user.user_metadata?.full_name || 'Usuário'}
              </h3>
              <p className="text-blue-100 text-sm">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Email */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          {/* Nome */}
          {user.user_metadata?.full_name && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Nome Completo</p>
                <p className="font-medium">{user.user_metadata.full_name}</p>
              </div>
            </div>
          )}

          {/* Data de Criação */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Membro desde</p>
              <p className="font-medium">{formatDate(user.created_at)}</p>
            </div>
          </div>

          {/* ID do Usuário */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <p className="font-medium text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                {user.id.substring(0, 8)}...
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Última atualização: {formatDate(user.updated_at)}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;