/**
 * Gerencia cache offline usando IndexedDB
 * Persiste contatos, histórico e mensagens para acesso offline
 */
export class OfflineCache {
  constructor(dbName = 'ContauxVoIP') {
    this.dbName = dbName;
    this.db = null;
    this.ready = false;
  }

  /**
   * Inicializar banco de dados IndexedDB
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.ready = true;
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Armazenamento de contatos
        if (!db.objectStoreNames.contains('contacts')) {
          db.createObjectStore('contacts', { keyPath: 'id' });
        }

        // Armazenamento de histórico
        if (!db.objectStoreNames.contains('callHistory')) {
          db.createObjectStore('callHistory', { keyPath: 'id' });
        }

        // Armazenamento de mensagens
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Salvar contatos no cache
   */
  async saveContacts(contacts) {
    if (!this.ready) return;
    
    const tx = this.db.transaction('contacts', 'readwrite');
    const store = tx.objectStore('contacts');
    
    contacts.forEach(contact => {
      store.put(contact);
    });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Obter contatos do cache
   */
  async getContacts() {
    if (!this.ready) return [];
    
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('contacts', 'readonly');
      const store = tx.objectStore('contacts');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Salvar histórico de chamadas
   */
  async saveCallHistory(callRecord) {
    if (!this.ready) return;
    
    const tx = this.db.transaction('callHistory', 'readwrite');
    const store = tx.objectStore('callHistory');
    store.put({ ...callRecord, id: callRecord.id || Date.now() });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Obter histórico de chamadas
   */
  async getCallHistory() {
    if (!this.ready) return [];
    
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('callHistory', 'readonly');
      const store = tx.objectStore('callHistory');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Salvar mensagem
   */
  async saveMessage(message) {
    if (!this.ready) return;
    
    const tx = this.db.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');
    store.put({ ...message, id: message.id || Date.now() });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Obter mensagens
   */
  async getMessages() {
    if (!this.ready) return [];
    
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('messages', 'readonly');
      const store = tx.objectStore('messages');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Limpar todo cache
   */
  async clear() {
    if (!this.ready) return;
    
    const tx = this.db.transaction(['contacts', 'callHistory', 'messages'], 'readwrite');
    tx.objectStore('contacts').clear();
    tx.objectStore('callHistory').clear();
    tx.objectStore('messages').clear();

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.ready = false;
    }
  }
}

export default OfflineCache;