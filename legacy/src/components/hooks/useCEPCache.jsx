import { useState, useCallback } from 'react';

const cepCache = new Map();

export function useCEPCache() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lookupCEP = useCallback(async (cep) => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      setError('CEP inválido');
      return null;
    }

    const cleanCEP = cep.replace(/\D/g, '');

    // Check cache first
    if (cepCache.has(cleanCEP)) {
      return cepCache.get(cleanCEP);
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError('CEP não encontrado');
        return null;
      }

      const addressData = {
        endereco: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf,
      };

      // Cache the result
      cepCache.set(cleanCEP, addressData);

      return addressData;
    } catch (err) {
      setError('Erro ao buscar CEP');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { lookupCEP, loading, error };
}