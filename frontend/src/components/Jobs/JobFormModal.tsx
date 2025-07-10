// 🎯 SEMANA 5-6: CRUD de Vagas - Modal de Formulário
// Arquivo: frontend/src/components/Jobs/JobFormModal.tsx

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Building, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar,
  FileText,
  Star,
  AlertCircle
} from 'lucide-react';
import { 
  Job,
  JobFormData,
  JobOptions,
  jobsApi
} from '../../services/jobsApi';

interface JobFormModalProps {
  job?: Job | null;
  onClose: () => void;
  onSave: (job: Job) => void;
}

const JobFormModal: React.FC<JobFormModalProps> = ({ job, onClose, onSave }) => {
  const isEditing = !!job;
  
  // Estado do formulário
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    company: '',
    location: '',
    salary_min: null,
    salary_max: null,
    employment_type: 'full-time',
    experience_level: 'mid-level',
    status: 'active',
    requirements: '',
    benefits: '',
    application_deadline: null
  });

  // Estados da UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [jobOptions, setJobOptions] = useState<JobOptions | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadJobOptions();
    
    if (job) {
      setFormData({
        title: job.title || '',
        description: job.description || '',
        company: job.company || '',
        location: job.location || '',
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        employment_type: job.employment_type || 'full-time',
        experience_level: job.experience_level || 'mid-level',
        status: job.status || 'active',
        requirements: job.requirements || '',
        benefits: job.benefits || '',
        application_deadline: job.application_deadline ? job.application_deadline.split('T')[0] : null
      });
    }
  }, [job]);

  // Carregar opções
  const loadJobOptions = async () => {
    try {
      const options = await jobsApi.getJobOptions();
      setJobOptions(options);
    } catch (err) {
      console.error('Erro ao carregar opções:', err);
    }
  };

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Campos obrigatórios
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Empresa é obrigatória';
    }

    // Validar salários
    if (formData.salary_min && formData.salary_max) {
      if (formData.salary_min > formData.salary_max) {
        newErrors.salary_min = 'Salário mínimo deve ser menor que o máximo';
      }
    }

    // Validar data de prazo
    if (formData.application_deadline) {
      const deadline = new Date(formData.application_deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadline < today) {
        newErrors.application_deadline = 'Data de prazo deve ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Atualizar campo do formulário
  const handleInputChange = (field: keyof JobFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Salvar vaga
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let savedJob: Job;
      
      if (isEditing && job) {
        savedJob = await jobsApi.updateJob(job.id, formData);
      } else {
        savedJob = await jobsApi.createJob(formData);
      }

      onSave(savedJob);
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar vaga:', err);
      
      // Tratar erros específicos
      if (err.response?.data?.error) {
        setErrors({ general: err.response.data.error });
      } else {
        setErrors({ general: 'Erro ao salvar vaga. Tente novamente.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fechar modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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
              {isEditing ? 'Editar Vaga' : 'Nova Vaga'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-6 space-y-6">
          {/* Erro geral */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-700">{errors.general}</span>
            </div>
          )}

          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Vaga *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: Desenvolvedor Full Stack"
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.company ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Nome da empresa"
                required
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company}</p>
              )}
            </div>

            {/* Localização */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: São Paulo, SP ou Remoto"
              />
            </div>

            {/* Salário mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salário Mínimo (R$)
              </label>
              <input
                type="number"
                value={formData.salary_min || ''}
                onChange={(e) => handleInputChange('salary_min', e.target.value ? parseFloat(e.target.value) : null)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.salary_min ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: 5000"
                min="0"
                step="0.01"
              />
              {errors.salary_min && (
                <p className="mt-1 text-sm text-red-600">{errors.salary_min}</p>
              )}
            </div>

            {/* Salário máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salário Máximo (R$)
              </label>
              <input
                type="number"
                value={formData.salary_max || ''}
                onChange={(e) => handleInputChange('salary_max', e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 8000"
                min="0"
                step="0.01"
              />
            </div>

            {/* Tipo de emprego */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Emprego
              </label>
              <select
                value={formData.employment_type}
                onChange={(e) => handleInputChange('employment_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {jobOptions?.employment_types.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nível de experiência */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível de Experiência
              </label>
              <select
                value={formData.experience_level}
                onChange={(e) => handleInputChange('experience_level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {jobOptions?.experience_levels.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {jobOptions?.status_options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Prazo de candidatura */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prazo de Candidatura
              </label>
              <input
                type="date"
                value={formData.application_deadline || ''}
                onChange={(e) => handleInputChange('application_deadline', e.target.value || null)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.application_deadline ? 'border-red-300' : 'border-gray-300'
                }`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.application_deadline && (
                <p className="mt-1 text-sm text-red-600">{errors.application_deadline}</p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição da Vaga
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descreva a vaga, responsabilidades e o que a empresa oferece..."
            />
          </div>

          {/* Requisitos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requisitos
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Liste os requisitos obrigatórios e desejáveis..."
            />
          </div>

          {/* Benefícios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefícios
            </label>
            <textarea
              value={formData.benefits}
              onChange={(e) => handleInputChange('benefits', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Liste os benefícios oferecidos pela empresa..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Atualizar Vaga' : 'Criar Vaga'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobFormModal;