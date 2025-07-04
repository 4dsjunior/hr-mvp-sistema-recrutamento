import { useState, useEffect } from 'react';
import { candidatesApi } from '../services/candidatesApi';

export const useCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carregar todos candidatos
  const loadCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await candidatesApi.getAll();
      setCandidates(data);
    } catch (err) {
      setError('Erro ao carregar candidatos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Buscar candidatos
  const searchCandidates = async (query, status) => {
    setLoading(true);
    setError(null);
    try {
      const data = await candidatesApi.search(query, status);
      setCandidates(data);
    } catch (err) {
      setError('Erro ao buscar candidatos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Criar candidato
  const createCandidate = async (candidateData) => {
    try {
      await candidatesApi.create(candidateData);
      await loadCandidates(); // Recarregar lista
      return true;
    } catch (err) {
      setError('Erro ao criar candidato');
      console.error(err);
      return false;
    }
  };

  // Atualizar candidato
  const updateCandidate = async (id, candidateData) => {
    try {
      await candidatesApi.update(id, candidateData);
      await loadCandidates(); // Recarregar lista
      return true;
    } catch (err) {
      setError('Erro ao atualizar candidato');
      console.error(err);
      return false;
    }
  };

  // Deletar candidato
  const deleteCandidate = async (id) => {
    try {
      await candidatesApi.delete(id);
      await loadCandidates(); // Recarregar lista
      return true;
    } catch (err) {
      setError('Erro ao deletar candidato');
      console.error(err);
      return false;
    }
  };

  // Carregar na inicialização
  useEffect(() => {
    loadCandidates();
  }, []);

  return {
    candidates,
    loading,
    error,
    loadCandidates,
    searchCandidates,
    createCandidate,
    updateCandidate,
    deleteCandidate
  };
};