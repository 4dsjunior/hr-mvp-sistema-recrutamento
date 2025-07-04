import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, User, Save, ArrowRight } from 'lucide-react';
import { Candidate } from '../../types';

interface CandidateFormProps {
  candidate?: Candidate;
  onSubmit: (data: Partial<Candidate>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  linkedin: string;
  status: Candidate['status'];
}

const CandidateForm: React.FC<CandidateFormProps> = ({
  candidate,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [saveAndContinue, setSaveAndContinue] = useState(false);
  const isEditing = !!candidate;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: candidate ? {
      first_name: candidate.name.split(' ')[0] || '',
      last_name: candidate.name.split(' ').slice(1).join(' ') || '',
      email: candidate.email,
      phone: candidate.phone || '',
      address: candidate.address || '',
      summary: candidate.summary || '',
      linkedin: candidate.linkedin || '',
      status: candidate.status,
    } : {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      summary: '',
      linkedin: '',
      status: 'pending',
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const onFormSubmit = async (data: FormData) => {
    const formData = {
      ...data,
      name: `${data.first_name} ${data.last_name}`.trim(),
      photo_url: uploadedFile ? URL.createObjectURL(uploadedFile) : candidate?.photo_url,
    };
    
    await onSubmit(formData);
    
    if (saveAndContinue && !isEditing) {
      // Reset form for new candidate
      window.location.reload();
    }
  };

  const handleSaveAndContinue = () => {
    setSaveAndContinue(true);
    handleSubmit(onFormSubmit)();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Candidato' : 'Novo Candidato'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* Photo Upload */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {uploadedFile ? (
                  <img
                    src={URL.createObjectURL(uploadedFile)}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : candidate?.photo_url ? (
                  <img
                    src={candidate.photo_url}
                    alt={candidate.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="photo"
                className="absolute bottom-0 right-0 bg-primary-600 text-white p-1 rounded-full cursor-pointer hover:bg-primary-700 transition-colors"
              >
                <Upload className="h-3 w-3" />
              </label>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700">Foto do Candidato</h3>
              <p className="text-xs text-gray-500">JPG, PNG até 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                id="first_name"
                {...register('first_name', { required: 'Nome é obrigatório' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="João"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                Sobrenome *
              </label>
              <input
                type="text"
                id="last_name"
                {...register('last_name', { required: 'Sobrenome é obrigatório' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Silva"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="joao@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                id="phone"
                {...register('phone', {
                  required: 'Telefone é obrigatório',
                  pattern: {
                    value: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
                    message: 'Formato: (11) 99999-9999',
                  },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="(11) 99999-9999"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <input
                type="text"
                id="address"
                {...register('address')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Rua das Flores, 123 - São Paulo, SP"
              />
            </div>

            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                id="linkedin"
                {...register('linkedin', {
                  pattern: {
                    value: /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
                    message: 'URL do LinkedIn inválida',
                  },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="https://linkedin.com/in/joaosilva"
              />
              {errors.linkedin && (
                <p className="mt-1 text-sm text-red-600">{errors.linkedin.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="pending">Ativo</option>
                <option value="interviewed">Entrevistado</option>
                <option value="approved">Contratado</option>
                <option value="rejected">Inativo</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
              Resumo Profissional
            </label>
            <textarea
              id="summary"
              {...register('summary')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Descreva a experiência e habilidades do candidato..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            {!isEditing && (
              <button
                type="button"
                onClick={handleSaveAndContinue}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Salvar e Continuar</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isEditing ? 'Atualizar' : 'Salvar'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateForm;