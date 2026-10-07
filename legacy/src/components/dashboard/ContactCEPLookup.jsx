import React, { useEffect, useState } from 'react';
import { Search, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/components/hooks/useDebounce';
import { useCEPCache } from '@/components/hooks/useCEPCache';

export default function ContactCEPLookup({ cep, onAddressFound, disabled }) {
  const debouncedCEP = useDebounce(cep, 800);
  const { lookupCEP, loading, error } = useCEPCache();
  const [autoLookupDone, setAutoLookupDone] = useState(false);

  // Auto-lookup when CEP is complete
  useEffect(() => {
    const performAutoLookup = async () => {
      if (debouncedCEP && debouncedCEP.replace(/\D/g, '').length === 8 && !autoLookupDone) {
        const result = await lookupCEP(debouncedCEP);
        if (result) {
          onAddressFound(result);
          setAutoLookupDone(true);
        }
      }
      if (debouncedCEP && debouncedCEP.replace(/\D/g, '').length !== 8) {
        setAutoLookupDone(false);
      }
    };

    if (!disabled) {
      performAutoLookup();
    }
  }, [debouncedCEP, disabled, onAddressFound, lookupCEP, autoLookupDone]);

  const handleManualLookup = async () => {
    setAutoLookupDone(false);
    const result = await lookupCEP(cep);
    if (result) {
      onAddressFound(result);
      setAutoLookupDone(true);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <Button
          type="button"
          onClick={handleManualLookup}
          disabled={disabled || loading || !cep}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Buscando...
            </>
          ) : autoLookupDone ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              CEP Encontrado
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Buscar CEP
            </>
          )}
        </Button>
        {loading && <span className="text-xs text-slate-500">Consultando ViaCEP...</span>}
      </div>
      {error && <p className="text-red-500 text-xs" role="alert">{error}</p>}
    </div>
  );
}