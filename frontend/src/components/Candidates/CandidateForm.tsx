// 🚨 CORREÇÃO: CandidateForm.tsx - Formulário SEM vinculação automática de vaga
// Arquivo: frontend/src/components/Candidates/CandidateForm.tsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, User, Mail, Phone, MapPin, FileText, Briefcase, AlertCircle } from 'lucide-react';

// Types
interface CandidateFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  position: string;
  summary?: string | null;
  linkedin?: string | null;
  status: 'pending' | 'interviewed' | 'approved' | 'rejected';
}

interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  position: string;
  summary?: string;
  linkedin?: string;
  status: string;
  created_at: string;
  updated_at: string;
  name: string; // computed field
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
      position: '',
      summary: '',
      linkedin: '',
      status: 'pending'
    }
  });

  // Carregar dados do candidato se estiver editando
  useEffect(() => {
    if (candidate) {
      setValue('first_name', candidate.first_name || '');
      setValue('last_name', candidate.last_name || '');
      setValue('email', candidate.email || '');
      setValue('phone', candidate.phone || '');
      setValue('address', candidate.address || '');
      setValue('position', candidate.position || '');
      setValue('summary', candidate.summary || '');
      setValue('linkedin', candidate.linkedin || '');
      setValue('status', candidate.status as CandidateFormData['status'] || 'pending');
    }
  }, [candidate, setValue]);

  const onSubmitForm = async (data: CandidateFormData) => {
    console.log('📝 Dados do formulário:', data);
    
    try {
      setSubmitting(true);
      
      // ✅ CORREÇÃO: Dados enviados SEM vinculação forçada de vaga
      const formattedData = {
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || undefined,
        address: data.address?.trim() || undefined,
        position: data.position.trim(),
        summary: data.summary?.trim() || undefined,
        linkedin: data.linkedin?.trim() || undefined,
        status: data.status,
        // ❌ REMOVIDO: job_id (será adicionado apenas via pipeline/candidaturas)
      };
      
      console.log('💾 Enviando dados formatados:', formattedData);
      await onSubmit(formattedData);
      
      // Se for criação e save & continue, limpar formulário
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
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
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
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Nome *
              </label>
              <input
                type="text"
                id="first_name"
                {...register('first_name', { required: 'Nome é obrigatório' })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.first_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="João"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.first_name.message}
                </p>
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.last_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Silva"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.last_name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="joao@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="h-4 w-4 inline mr-1" />
                Posição/Cargo *
              </label>
              <input
                type="text"
                id="position"
                {...register('position', { required: 'Posição é obrigatória' })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.position ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Desenvolvedor Frontend"
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.position.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="pending">Ativo</option>
                <option value="interviewed">Entrevistado</option>
                <option value="approved">Contratado</option>
                <option value="rejected">Inativo</option>
              </select>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Endereço
            </label>
            <input
              type="text"
              id="address"
              {...register('address')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Rua das Flores, 123 - São Paulo, SP"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              id="linkedin"
              {...register('linkedin')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="https://linkedin.com/in/joaosilva"
            />
          </div>

          {/* Resumo */}
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Resumo Profissional
            </label>
            <textarea
              id="summary"
              {...register('summary')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Descreva a experiência e habilidades do candidato..."
            />
          </div>

          {/* ✅ AVISO: Vinculação a vagas será feita via Pipeline */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Vinculação a Vagas</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Para vincular este candidato a uma vaga específica, acesse o 
                  <strong> Pipeline de Candidaturas</strong> após salvar o candidato.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting || loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          
          {!isEditing && (
            <button
              type="button"
              onClick={handleSaveAndContinue}
              disabled={submitting || loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            form="candidate-form"
            onClick={handleSubmit(onSubmitForm)}
            disabled={submitting || loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting && !saveAndContinue ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isEditing ? 'Salvar Alterações' : 'Salvar Candidato'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateForm;