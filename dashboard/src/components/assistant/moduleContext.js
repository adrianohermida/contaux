/**
 * PKG-1: compatibilidade — resolveModule e cobertura agora vêm do adaptador do host.
 * Este arquivo mantém as re-exports para compatibilidade com imports legados.
 * Novos componentes devem usar useShell() do assistantShell.js.
 */
export { resolveModule } from './contauxAdapter'
export { getModuleCoverage, DEFAULT_SUGGESTIONS as DEMO_SUGGESTIONS } from './moduleCoverage'
