import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import JobCard from '../components/Jobs/JobCard';
import { jobsApi, JobFrontend } from '../services/jobsApi';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/UI/ToastContainer';

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<JobFrontend[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando vagas...');
      const data = await jobsApi.getAll();
      console.log('✅ Vagas carregadas:', data.length);
      setJobs(data);
    } catch (error: any) {
      console.error('❌ Erro ao carregar vagas:', error);
      showError('Erro ao carregar vagas', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleViewJob = (job: JobFrontend) => {
    console.log('👁️ Ver vaga:', job.title);
  };

  const handleEditJob = (job: JobFrontend) => {
    console.log('✏️ Editar vaga:', job.title);
  };

  const handleDeleteJob = async (job: JobFrontend) => {
    if (window.confirm(`Tem certeza que deseja excluir a vaga "${job.title}"?`)) {
      try {
        console.log('🗑️ Excluindo vaga:', job.title);
        await jobsApi.delete(job.id);
        showSuccess('Vaga excluída', `${job.title} foi removida com sucesso.`);
        fetchJobs();
      } catch (error: any) {
        console.error('❌ Erro ao excluir vaga:', error);
        showError('Erro ao excluir vaga', error.message);
      }
    }
  };

  const createTestJob = async () => {
    try {
      console.log('➕ Criando vaga de teste...');
      const testJob = {
        title: 'Desenvolvedor React Senior',
        description: 'Vaga para desenvolvedor frontend com experiência em React, TypeScript e Node.js. Trabalho remoto com equipe internacional.',
        requirements: [
          'Experiência com React 18+',
          'TypeScript avançado', 
          'Node.js e APIs REST',
          'Git e metodologias ágeis',
          'Inglês intermediário'
        ],
        department: 'Tecnologia',
        location: 'São Paulo, SP (Remoto)',
        employment_type: 'full-time' as const,
        salary_min: 8000,
        salary_max: 12000,
        status: 'active' as const,
      };

      await jobsApi.create(testJob);
      showSuccess('Vaga criada', 'Vaga de teste criada com sucesso!');
      fetchJobs();
    } catch (error: any) {
      console.error('❌ Erro ao criar vaga:', error);
      showError('Erro ao criar vaga', error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vagas</h1>
          <p className="text-gray-600">Gerencie as vagas disponíveis na empresa</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={createTestJob}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Criar Teste</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
              <div className="h-8 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma vaga cadastrada</h3>
          <p className="text-gray-600 mb-4">Comece criando sua primeira vaga</p>
          <button
            onClick={createTestJob}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Criar Primeira Vaga
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onView={handleViewJob}
              onEdit={handleEditJob}
              onDelete={handleDeleteJob}
            />
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default Jobs;