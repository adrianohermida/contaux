/**
 * Sistema de logging para Voximplant
 * Facilita debugging e monitoramento
 */

export class VoxLogger {
  constructor(moduleName = 'Voximplant') {
    this.moduleName = moduleName;
    this.isDev = import.meta.env.DEV;
    this.logs = [];
    this.maxLogs = 500;
  }

  /**
   * Formatar mensagem com timestamp e módulo
   */
  _format(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.moduleName}] [${level}]`;
    return { prefix, message, data };
  }

  /**
   * Armazenar log
   */
  _store(level, message, data) {
    const log = {
      level,
      timestamp: new Date(),
      module: this.moduleName,
      message,
      data,
    };

    this.logs.push(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove o mais antigo
    }
  }

  /**
   * Log de informação
   */
  info(message, data = null) {
    const { prefix } = this._format('INFO', message, data);
    if (this.isDev) console.log(`${prefix} ${message}`, data || '');
    this._store('INFO', message, data);
  }

  /**
   * Log de sucesso
   */
  success(message, data = null) {
    const { prefix } = this._format('SUCCESS', message, data);
    if (this.isDev) console.log(`%c${prefix} ${message}`, 'color: #16a34a; font-weight: bold;', data || '');
    this._store('SUCCESS', message, data);
  }

  /**
   * Log de aviso
   */
  warn(message, data = null) {
    const { prefix } = this._format('WARN', message, data);
    if (this.isDev) console.warn(`${prefix} ${message}`, data || '');
    this._store('WARN', message, data);
  }

  /**
   * Log de erro
   */
  error(message, error = null) {
    const { prefix } = this._format('ERROR', message, error);
    if (this.isDev) console.error(`%c${prefix} ${message}`, 'color: #dc2626; font-weight: bold;', error || '');
    this._store('ERROR', message, error);
  }

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug(message, data = null) {
    if (!this.isDev) return;
    const { prefix } = this._format('DEBUG', message, data);
    console.debug(`${prefix} ${message}`, data || '');
    this._store('DEBUG', message, data);
  }

  /**
   * Traçar evento
   */
  trace(eventName, eventData = {}) {
    const msg = `EVENT: ${eventName}`;
    if (this.isDev) console.log(`%c${msg}`, 'color: #0284c7; font-weight: bold;', eventData);
    this._store('TRACE', msg, eventData);
  }

  /**
   * Obter histórico de logs
   */
  getHistory(filter = null) {
    if (!filter) return this.logs;
    return this.logs.filter(log => {
      if (filter.level && log.level !== filter.level) return false;
      if (filter.module && log.module !== filter.module) return false;
      if (filter.message && !log.message.includes(filter.message)) return false;
      return true;
    });
  }

  /**
   * Limpar histórico
   */
  clear() {
    this.logs = [];
  }

  /**
   * Exportar logs em JSON
   */
  export() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Fazer download de logs
   */
  downloadLogs() {
    const content = this.export();
    const blob = new Blob([content], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vox-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Medir performance de uma operação
   */
  measurePerformance(operationName, fn) {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    this.info(`${operationName} levou ${duration.toFixed(2)}ms`);
    return result;
  }

  /**
   * Medir performance async
   */
  async measurePerformanceAsync(operationName, fn) {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    this.info(`${operationName} levou ${duration.toFixed(2)}ms`);
    return result;
  }
}

/**
 * Instância singleton do logger global
 */
export const globalLogger = new VoxLogger('Global');

/**
 * Hook para usar logger
 */
export function useVoxLogger(moduleName) {
  return new VoxLogger(moduleName);
}

export default VoxLogger;