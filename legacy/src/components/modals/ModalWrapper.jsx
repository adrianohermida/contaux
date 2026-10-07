import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ModalWrapper - Componente padrão para todos os modais
 * Garante consistência visual, acessibilidade e UX
 * ✅ Focus trap, Escape key, dark mode, backdrop click
 */
export default function ModalWrapper({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showBackdrop = true
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Tamanhos padronizados
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  // Focus trap - gerenciar foco dentro do modal
  const handleFocusTrap = useCallback((e) => {
    if (!modalRef.current) return;
    
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Shift + Tab em primeiro elemento → último elemento
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
    // Tab em último elemento → primeiro elemento
    else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Salvar elemento com foco anterior
    previousFocusRef.current = document.activeElement;

    // Focar no primeiro elemento focável ou no modal
    const focusFirstElement = () => {
      const focusableElement = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElement) {
        focusableElement.focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }
    };

    // Pequeno delay para garantir renderização
    setTimeout(focusFirstElement, 50);

    // Prevenir scroll do body
    document.body.style.overflow = 'hidden';

    // Handler para Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Handler para click no backdrop
    const handleBackdropClick = (e) => {
      if (e.target === modalRef.current?.parentElement) {
        onClose();
      }
    };

    // Handler para Tab (focus trap)
    const handleTab = (e) => {
      if (e.key === 'Tab') {
        handleFocusTrap(e);
      }
    };

    // Handler para Enter (submit form)
    const handleEnter = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const form = modalRef.current?.querySelector('form');
        if (form) {
          e.preventDefault();
          form.requestSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);
    document.addEventListener('keydown', handleEnter);
    if (showBackdrop) {
      modalRef.current?.parentElement?.addEventListener('click', handleBackdropClick);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('keydown', handleEnter);
      if (showBackdrop) {
        modalRef.current?.parentElement?.removeEventListener('click', handleBackdropClick);
      }
      document.body.style.overflow = 'unset';
      // Retornar foco ao elemento anterior
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose, showBackdrop, handleFocusTrap]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        showBackdrop ? 'bg-black/50 dark:bg-black/60' : ''
      }`}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full ${sizeClasses[size]} p-6 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 transition-colors`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <h2 
            id="modal-title"
            className="text-xl font-semibold text-slate-900 dark:text-slate-100"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
            aria-label="Fechar modal (Esc)"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
          </button>
        </div>

        {/* Conteúdo */}
        {children}
      </div>
    </div>
  );
}