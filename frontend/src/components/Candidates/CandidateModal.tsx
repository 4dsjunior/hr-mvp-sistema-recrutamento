import React from 'react';
import { X, Mail, Phone, Calendar, MapPin, Edit, User, ExternalLink, Clock } from 'lucide-react';
import { Candidate } from '../../types';

interface CandidateModalProps {
  candidate: Candidate;
  onClose: () => void;
  onEdit: (candidate: Candidate) => void;
}

const CandidateModal: React.FC<CandidateModalProps> = ({
  candidate,
  onClose,
  onEdit,
}) => {
  const getStatusColor = (status: Candidate['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-green-100 text-green-800';
      case 'interviewed':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Candidate['status']) => {
    switch (status) {
      case 'pending':
        return 'Ativo';
      case 'interviewed':
        return 'Entrevistado';
      case 'approved':
        return 'Contratado';
      case 'rejected':
        return 'Inativo';
      default:
        return 'Desconhecido';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Mock action history
  const actionHistory = [
    {
      id: '1',
      action: 'Candidato cadastrado',
      user: 'Sistema',
      date: candidate.created_at,
      type: 'create'
    },
    {
      id: '2',
      action: 'Perfil atualizado',
      user: 'Ana Carolina',
      date: candidate.updated_at,
      type: 'update'
    },
    {
      id: '3',
      action: 'Status alterado para Entrevistado',
      user: 'Roberto Lima',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'status'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Perfil do Candidato
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Header with photo and basic info */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {candidate.photo_url ? (
                  <img
                    src={candidate.photo_url}
                    alt={candidate.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {candidate.name}
                </h3>
                <p className="text-lg text-gray-600 mb-2">{candidate.position}</p>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                  {getStatusText(candidate.status)}
                </span>
              </div>
            </div>
            <button
              onClick={() => onEdit(candidate)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Informações de Contato
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{candidate.phone}</span>
                    </div>
                  )}
                  {candidate.address && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-900">{candidate.address}</span>
                    </div>
                  )}
                  {candidate.linkedin && (
                    <div className="flex items-center space-x-3">
                      <ExternalLink className="h-5 w-5 text-gray-400" />
                      <a
                        href={candidate.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {candidate.summary && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Resumo Profissional
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {candidate.summary}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Datas Importantes
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-600">Cadastrado em:</span>
                      <span className="ml-2 text-gray-900">{formatDate(candidate.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-600">Última atualização:</span>
                      <span className="ml-2 text-gray-900">{formatDate(candidate.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action History */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Histórico de Ações
              </h4>
              <div className="space-y-4">
                {actionHistory.map((action) => (
                  <div key={action.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        action.type === 'create' ? 'bg-green-100' :
                        action.type === 'update' ? 'bg-blue-100' :
                        'bg-yellow-100'
                      }`}>
                        <Clock className={`h-3 w-3 ${
                          action.type === 'create' ? 'text-green-600' :
                          action.type === 'update' ? 'text-blue-600' :
                          'text-yellow-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {action.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {action.user} • {formatDate(action.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateModal;