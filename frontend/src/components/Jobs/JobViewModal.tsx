// 🎯 SEMANA 5-6: CRUD de Vagas - Modal de Visualização
// Arquivo: frontend/src/components/Jobs/JobViewModal.tsx

import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building, 
  Users, 
  Clock,
  FileText,
  Star,
  Edit
} from 'lucide-react';
import { 
  Job,
  formatSalary,
  formatEmploymentType,
  formatExperienceLevel,
  formatStatus,
  getStatusColor,
  getEmploymentTypeColor
} from '../../services/jobsApi';

interface JobViewModalProps {
  job: Job;
  onClose: () => void;
  onEdit?: (job: Job) => void;
}

const JobViewModal: React.FC<JobViewModalProps> = ({ job, onClose, onEdit }) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Detalhes da Vaga
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(job)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Informações básicas */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                <div className="flex items-center text-lg text-gray-600 mb-3">
                  <Building className="h-5 w-5 mr-2" />
                  {job.company}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                  {formatStatus(job.status)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEmploymentTypeColor(job.employment_type)}`}>
                  {formatEmploymentType(job.employment_type)}
                </span>
              </div>
            </div>

            {/* Informações principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {job.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{job.location}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                <span>{formatSalary(job.salary_min, job.salary_max)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2 text-gray-400" />
                <span>{formatExperienceLevel(job.experience_level)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span>Criado em {formatDate(job.created_at)}</span>
              </div>
              
              {job.application_deadline && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Prazo: {formatDate(job.application_deadline)}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="h-4 w-4 mr-2 text-gray-400" />
                <span>Atualizado: {formatDateTime(job.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Descrição */}
          {job.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Descrição da Vaga
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            </div>
          )}

          {/* Requisitos */}
          {job.requirements && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Requisitos
              </h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {job.requirements}
                </div>
              </div>
            </div>
          )}

          {/* Benefícios */}
          {job.benefits && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Star className="h-5 w-5 mr-2 text-green-600" />
                Benefícios
              </h3>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {job.benefits}
                </div>
              </div>
            </div>
          )}

          {/* Informações detalhadas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Informações Detalhadas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">ID da Vaga:</span>
                <span className="ml-2 text-gray-600">#{job.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Tipo de Emprego:</span>
                <span className="ml-2 text-gray-600">{formatEmploymentType(job.employment_type)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Nível de Experiência:</span>
                <span className="ml-2 text-gray-600">{formatExperienceLevel(job.experience_level)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className="ml-2 text-gray-600">{formatStatus(job.status)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Data de Criação:</span>
                <span className="ml-2 text-gray-600">{formatDateTime(job.created_at)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Última Atualização:</span>
                <span className="ml-2 text-gray-600">{formatDateTime(job.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
          {onEdit && (
            <button
              onClick={() => onEdit(job)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Vaga
            </button>
          )}
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobViewModal;