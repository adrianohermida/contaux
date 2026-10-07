/**
 * Carrega o Voximplant SDK via CDN
 * Injeta o script no documento antes de usar o SDK
 */

import { VoxLogger } from './logger';

const logger = new VoxLogger('VoxImplantLoader');

const VOX_SDK_URL = 'https://cdn.voximplant.com/releases/latest/voximplant-sdk.min.js';

export async function loadVoxImplantSDK() {
  return new Promise((resolve, reject) => {
    // Se já está carregado, retornar
    if (typeof window !== 'undefined' && window.VoxImplant) {
      logger.info('Voximplant SDK já está carregado');
      resolve(window.VoxImplant);
      return;
    }

    logger.info(`Carregando Voximplant SDK de: ${VOX_SDK_URL}`);

    const script = document.createElement('script');
    script.src = VOX_SDK_URL;
    script.async = true;
    script.onload = () => {
      if (window.VoxImplant) {
        logger.success('Voximplant SDK carregado com sucesso');
        resolve(window.VoxImplant);
      } else {
        reject(new Error('VoxImplant não está disponível após carregar o script'));
      }
    };
    script.onerror = () => {
      logger.error('Erro ao carregar Voximplant SDK');
      reject(new Error('Falha ao carregar Voximplant SDK'));
    };

    document.head.appendChild(script);
  });
}

export default loadVoxImplantSDK;