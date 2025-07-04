import React from 'react';
import { Plus, Briefcase, MapPin, Clock } from 'lucide-react';

const Jobs: React.FC = () => {
  const jobs = [
    {
      id: '1',
      title: 'Desenvolvedor Frontend React',
      department: 'Tecnologia',
      location: 'São Paulo, SP',
      type: 'CLT',
      status: 'open',
      candidates: 23,
      created_at: '2024-01-15',
    },
    {
      id: '2',
      title: 'Designer UX/UI',
      department: 'Design',
      location: 'Remote',
      type: 'PJ',
      status: 'open',
      candidates: 15,
      created_at: '2024-01-10',
    },
    {
      id: '3',
      title: 'Analista de Dados',
      department: 'Analytics',
      location: 'Rio de Janeiro, RJ',
      type: 'CLT',
      status: 'closed',
      candidates: 8,
      created_at: '2024-01-05',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberta';
      case 'closed':
        return 'Fechada';
      case 'draft':
        return 'Rascunho';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vagas</h1>
          <p className="text-gray-600">
            Gerencie as vagas disponíveis na empresa
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Nova Vaga</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.department}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
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
                {job.type}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-600">Candidatos</p>
                <p className="text-lg font-semibold text-gray-900">{job.candidates}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Criada em</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(job.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm">
                Ver Detalhes
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-card p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Crie sua primeira vaga
          </h3>
          <p className="text-gray-600 mb-4">
            Comece publicando uma vaga para atrair os melhores talentos
          </p>
          <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            Criar Vaga
          </button>
        </div>
      </div>
    </div>
  );
};

export default Jobs;