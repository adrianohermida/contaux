import { useContext } from 'react';
import { VoxImplantContext } from '../voximplant/context';

/**
 * Hook para acessar contexto Voximplant globalmente
 * @returns {Object} Estado e métodos do Voximplant
 */
export function useVoxImplant() {
  const context = useContext(VoxImplantContext);

  if (!context) {
    throw new Error(
      'useVoxImplant deve ser usado dentro de <VoxImplantProvider>. ' +
      'Certifique-se que o Provider está no topo da aplicação (em Layout.js)'
    );
  }

  return context;
}

export default useVoxImplant;