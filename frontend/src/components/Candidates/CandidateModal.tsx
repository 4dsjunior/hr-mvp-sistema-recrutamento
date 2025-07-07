// frontend/src/components/Candidates/CandidateModal.tsx - CÓDIGO COMPLETO CORRIGIDO
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
  console.log('👁️ CandidateModal - Exibindo candidato:', candidate);

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
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('❌ Erro ao formatar data:', dateString);
      return 'Data inválida';
    }
  };

  // CORREÇÃO: Histórico de ações baseado em dados reais do candidato
  const generateActionHistory = () => {
    const actions = [];
    
    // Ação 1: Candidato cadastrado (sempre existe)
    actions.push({
      id: '1',
      action: 'Candidato cadastrado no sistema',
      user: 'Sistema',
      date: candidate.created_at,
      type: 'create',
      description: 'Perfil criado e dados iniciais inseridos'
    });

    // Ação 2: Se foi atualizado (diferente da criação)
    if (candidate.updated_at !== candidate.created_at) {
      const updateDate = new Date(candidate.updated_at);
      const createDate = new Date(candidate.created_at);
      
      if (updateDate.getTime() > createDate.getTime()) {
        actions.push({
          id: '2',
          action: 'Perfil atualizado',
          user: 'Recrutador',
          date: candidate.updated_at,
          type: 'update',
          description: 'Informações do candidato foram modificadas'
        });
      }
    }

    // Ação 3: Status atual (baseado no status real)
    const statusActions = {
      'pending': {
        action: 'Status definido como Ativo',
        description: 'Candidato está disponível para processo seletivo'
      },
      'interviewed': {
        action: 'Status alterado para Entrevistado',
        description: 'Candidato passou pela etapa de entrevista'
      },
      'approved': {
        action: 'Candidato aprovado/contratado',
        description: 'Processo seletivo finalizado com sucesso'
      },
      'rejected': {
        action: 'Status alterado para Inativo',
        description: 'Candidato não está mais em processo seletivo'
      }
    };

    const statusAction = statusActions[candidate.status];
    if (statusAction) {
      actions.push({
        id: '3',
        action: statusAction.action,
        user: 'Recrutador',
        date: candidate.updated_at,
        type: 'status',
        description: statusAction.description
      });
    }

    // Ação 4: Se tem LinkedIn (indica que candidato fez networking)
    if (candidate.linkedin) {
      actions.push({
        id: '4',
        action: 'LinkedIn vinculado ao perfil',
        user: 'Sistema',
        date: candidate.updated_at,
        type: 'info',
        description: 'Link do LinkedIn adicionado para networking'
      });
    }

    // Ordenar por data (mais recente primeiro)
    return actions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const actionHistory = generateActionHistory();

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'create':
        return 'bg-green-100 text-green-600';
      case 'update':
        return 'bg-blue-100 text-blue-600';
      case 'status':
        return 'bg-yellow-100 text-yellow-600';
      case 'info':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffDays > 0) {
        return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
      } else if (diffHours > 0) {
        return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''} atrás`;
      } else {
        return 'Agora mesmo';
      }
    } catch (error) {
      return 'Tempo indeterminado';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Perfil do Candidato
          </h2>
          <button
            onClick={() => {
              console.log('❌ Fechando modal do candidato');
              onClose();
            }}
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
                    onError={(e) => {
                      console.warn('⚠️ Erro ao carregar foto do candidato');
                      e.currentTarget.style.display = 'none';
                    }}
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
              onClick={() => {
                console.log('✏️ Abrindo edição do candidato via modal');
                onEdit(candidate);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
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
                        onClick={() => console.log('🔗 Abrindo LinkedIn do candidato')}
                      >
                        Perfil no LinkedIn
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
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-600">Tempo no sistema:</span>
                      <span className="ml-2 text-gray-900">{formatTimeAgo(candidate.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action History Sidebar */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Histórico de Ações
              </h4>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {actionHistory.map((action) => (
                  <div key={action.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getActionIcon(action.type)}`}>
                        <Clock className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {action.action}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {action.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {action.user} • {formatTimeAgo(action.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-3">
                  Ações Rápidas
                </h5>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      console.log('📝 Ação: Agendar entrevista');
                      // TODO: Implementar agendamento
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded transition-colors"
                  >
                    📅 Agendar Entrevista
                  </button>
                  <button 
                    onClick={() => {
                      console.log('📧 Ação: Enviar email');
                      window.open(`mailto:${candidate.email}`, '_blank');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded transition-colors"
                  >
                    📧 Enviar Email
                  </button>
                  <button 
                    onClick={() => {
                      console.log('📋 Ação: Adicionar nota');
                      // TODO: Implementar sistema de notas
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded transition-colors"
                  >
                    📋 Adicionar Nota
                  </button>
                  <button 
                    onClick={() => {
                      console.log('📱 Ação: Ligar para candidato');
                      if (candidate.phone) {
                        window.open(`tel:${candidate.phone}`, '_blank');
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded transition-colors"
                    disabled={!candidate.phone}
                  >
                    📱 Ligar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateModal;