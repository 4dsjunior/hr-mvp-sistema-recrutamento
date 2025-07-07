import React from 'react';
import { Briefcase, MapPin, Clock, Users, Edit, Trash2, Eye, DollarSign } from 'lucide-react';
import { JobFrontend } from '../../services/jobsApi';

interface JobCardProps {
  job: JobFrontend;
  onView: (job: JobFrontend) => void;
  onEdit: (job: JobFrontend) => void;
  onDelete: (job: JobFrontend) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onView, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'paused': return 'Pausada';
      case 'closed': return 'Fechada';
      case 'draft': return 'Rascunho';
      default: return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'full-time': return 'CLT';
      case 'part-time': return 'Meio Período';
      case 'contract': return 'Contrato';
      case 'freelance': return 'Freelance';
      default: return type;
    }
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'A combinar';
    if (min && max) return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`;
    if (min) return `A partir de R$ ${min.toLocaleString()}`;
    return `Até R$ ${max?.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Briefcase className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
            {job.department && <p className="text-sm text-gray-600">{job.department}</p>}
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
          {getStatusText(job.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          {job.location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          {getTypeText(job.employment_type)}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          {job.candidates_count || 0} candidatos
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="h-4 w-4 mr-2" />
          {formatSalary(job.salary_min, job.salary_max)}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700 line-clamp-3">
          {job.description.substring(0, 150)}...
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-right">
          <p className="text-sm text-gray-600">Criada em</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date(job.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => onView(job)}
          className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center justify-center space-x-1"
        >
          <Eye className="h-4 w-4" />
          <span>Ver Detalhes</span>
        </button>
        <button
          onClick={() => onEdit(job)}
          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(job)}
          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default JobCard;