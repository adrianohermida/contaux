/**
 * useEncryption Hook
 * Encrypt and decrypt sensitive data
 */

import { useCallback } from 'react';

// Simple AES-256 encryption wrapper using Web Crypto API
export function useEncryption() {
  // Generate encryption key
  const generateKey = useCallback(async () => {
    return await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }, []);

  // Encrypt data
  const encrypt = useCallback(async (data, key = null) => {
    try {
      const key_ = key || await generateKey();
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(JSON.stringify(data));

      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key_,
        encodedData
      );

      // Return as base64
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return btoa(String.fromCharCode.apply(null, combined));
    } catch (err) {
      console.error('Encryption error:', err);
      return null;
    }
  }, [generateKey]);

  // Decrypt data
  const decrypt = useCallback(async (encryptedData, key) => {
    try {
      if (!encryptedData || !key) return null;

      // Decode from base64
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      const decryptedStr = decoder.decode(decrypted);
      return JSON.parse(decryptedStr);
    } catch (err) {
      console.error('Decryption error:', err);
      return null;
    }
  }, []);

  // Hash password using PBKDF2
  const hashPassword = useCallback(async (password, salt = null) => {
    try {
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);
      const saltBuffer = salt
        ? encoder.encode(salt)
        : window.crypto.getRandomValues(new Uint8Array(16));

      const key = await window.crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits']
      );

      const derived = await window.crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: saltBuffer, iterations: 100000, hash: 'SHA-256' },
        key,
        256
      );

      const saltStr = btoa(String.fromCharCode.apply(null, saltBuffer));
      const hashStr = btoa(String.fromCharCode.apply(null, new Uint8Array(derived)));

      return { hash: hashStr, salt: saltStr };
    } catch (err) {
      console.error('Password hashing error:', err);
      return null;
    }
  }, []);

  // Verify password
  const verifyPassword = useCallback(async (password, hash, salt) => {
    try {
      const result = await hashPassword(password, salt);
      return result?.hash === hash;
    } catch (err) {
      console.error('Password verification error:', err);
      return false;
    }
  }, [hashPassword]);

  // Export key for storage
  const exportKey = useCallback(async (key) => {
    try {
      const exported = await window.crypto.subtle.exportKey('raw', key);
      return btoa(String.fromCharCode.apply(null, new Uint8Array(exported)));
    } catch (err) {
      console.error('Key export error:', err);
      return null;
    }
  }, []);

  // Import key from storage
  const importKey = useCallback(async (keyStr) => {
    try {
      const binaryStr = atob(keyStr);
      const bytes = Uint8Array.from(binaryStr, c => c.charCodeAt(0));

      return await window.crypto.subtle.importKey(
        'raw',
        bytes,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (err) {
      console.error('Key import error:', err);
      return null;
    }
  }, []);

  return {
    generateKey,
    encrypt,
    decrypt,
    hashPassword,
    verifyPassword,
    exportKey,
    importKey,
  };
}

export default useEncryption;