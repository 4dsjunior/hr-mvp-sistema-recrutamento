// 🔧 CORREÇÃO: CandidateForm.tsx - Campos preenchidos na edição
// Arquivo: frontend/src/components/Candidates/CandidateForm.tsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, User, Upload, Camera } from 'lucide-react';

interface CandidateFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  summary?: string;
  linkedin?: string;
  status: 'pending' | 'interviewed' | 'approved' | 'rejected';
}

interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  position?: string;
  summary?: string;
  linkedin?: string;
  status: string;
  created_at: string;
  updated_at: string;
  name: string;
  photo_url?: string;
}

interface CandidateFormProps {
  candidate?: Candidate;
  onSubmit: (data: Partial<CandidateFormData>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CandidateForm: React.FC<CandidateFormProps> = ({
  candidate,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const isEditing = !!candidate;
  const [submitting, setSubmitting] = useState(false);
  const [saveAndContinue, setSaveAndContinue] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<CandidateFormData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      summary: '',
      linkedin: '',
      status: 'pending'
    }
  });

  // ✅ CORREÇÃO: Melhor carregamento de dados na edição
  useEffect(() => {
    if (candidate) {
      console.log('🔄 Carregando dados completos do candidato:', candidate);
      
      // ✅ Usar setTimeout para garantir que setValue funcione
      setTimeout(() => {
        setValue('first_name', candidate.first_name || '');
        setValue('last_name', candidate.last_name || '');
        setValue('email', candidate.email || '');
        setValue('phone', candidate.phone || '');
        setValue('address', candidate.address || '');
        setValue('summary', candidate.summary || '');
        setValue('linkedin', candidate.linkedin || '');
        setValue('status', candidate.status as CandidateFormData['status'] || 'pending');
        
        console.log('✅ Valores definidos:', {
          first_name: candidate.first_name,
          last_name: candidate.last_name,
          email: candidate.email
        });
      }, 100);
    }
  }, [candidate, setValue]);

  const onSubmitForm = async (data: CandidateFormData) => {
    console.log('📝 Dados do formulário:', data);
    
    try {
      setSubmitting(true);
      
      const formattedData = {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || '',
        address: data.address?.trim() || '',
        summary: data.summary?.trim() || '',
        linkedin: data.linkedin?.trim() || '',
        status: data.status,
      };
      
      console.log('💾 Enviando dados formatados:', formattedData);
      await onSubmit(formattedData);
      
      if (!isEditing && saveAndContinue) {
        reset();
        setSaveAndContinue(false);
      }
      
    } catch (error) {
      console.error('❌ Erro no submit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndContinue = async () => {
    setSaveAndContinue(true);
    handleSubmit(onSubmitForm)();
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? 'Editar Candidato' : 'Novo Candidato'}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Atualize as informações do candidato' : 'Adicione um novo candidato ao sistema'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            disabled={submitting || loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-6">
          {/* Upload de Foto - ✅ REMOVIDO "funcionar" do placeholder */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {candidate?.photo_url ? (
                  <img
                    src={candidate.photo_url}
                    alt="Foto do candidato"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
                onClick={() => {
                  console.log('📸 Upload de foto - Em desenvolvimento');
                }}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto do Candidato
              </label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    console.log('📁 Upload de foto - Em desenvolvimento');
                  }}
                >
                  <Upload className="h-4 w-4" />
                  <span>Enviar Foto</span>
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG ou GIF. Máximo 2MB. (Em desenvolvimento)
                </p>
              </div>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="(11) 99999-9999"
              />
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
                {...register('linkedin')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="https://linkedin.com/in/joaosilva"
              />
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
              onClick={handleCancel}
              disabled={submitting || loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            
            {!isEditing && (
              <button
                type="button"
                onClick={handleSaveAndContinue}
                disabled={submitting || loading}
                className="flex items-center space-x-2 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting && saveAndContinue ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Salvar e Continuar</span>
              </button>
            )}
            
            <button
              type="submit"
              disabled={submitting || loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting && !saveAndContinue ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isEditing ? 'Salvar Alterações' : 'Salvar Candidato'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateForm;