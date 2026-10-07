import { useState, useCallback } from 'react';

export function useViaCEP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAddress = useCallback(async (cep) => {
    // Remover caracteres não-numéricos
    const cleanCep = cep.replace(/\D/g, '');

    // Validar formato
    if (cleanCep.length !== 8) {
      setError('CEP deve conter 8 dígitos');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError('CEP não encontrado');
        return null;
      }

      return {
        cep: formatCEP(data.cep),
        endereco: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf,
        complemento: data.complemento || ''
      };
    } catch (err) {
      setError('Erro ao buscar CEP. Tente novamente.');
      console.error('ViaCEP error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    fetchAddress,
    loading,
    error,
    clearError
  };
}

export function formatCEP(cep) {
  const clean = cep.replace(/\D/g, '');
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
}

export function validateCEP(cep) {
  const clean = cep.replace(/\D/g, '');
  return clean.length === 8;
}