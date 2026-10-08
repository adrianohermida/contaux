import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import FormFeedback from '../components/contact/FormFeedback';

export default function QuoteRequest() {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    plan_type: 'Profissional',
    company_type: 'Simples Nacional',
    description: ''
  });
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      await base44.functions.invoke('submitQuoteRequest', formData);
      setFeedback({ 
        type: 'success', 
        message: 'Solicitação recebida! Entraremos em contato em breve.' 
      });
      setFormData({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        plan_type: 'Profissional',
        company_type: 'Simples Nacional',
        description: ''
      });
      setTimeout(() => {
        window.location.href = createPageUrl('Home');
      }, 3000);
    } catch (error) {
      setFeedback({ 
        type: 'error', 
        message: 'Erro ao enviar solicitação. Tente novamente.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-[var(--spacing-lg)] px-[var(--spacing-md)] max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-[var(--spacing-xl)]">
        <Link to={createPageUrl('Pricing')} className="flex items-center gap-[var(--spacing-sm)] text-[var(--color-interactive-default)] hover:text-[var(--color-interactive-hover)] font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Voltar aos Planos
        </Link>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl">
        <div className="bg-[var(--color-background-primary)] rounded-lg shadow-lg p-[var(--spacing-xl)]">
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-foreground-primary)] mb-[var(--spacing-xs)]">Solicitar Orçamento</h1>
          <p className="text-[var(--color-foreground-secondary)] mb-[var(--spacing-xl)]">
            Preencha o formulário abaixo com suas informações. Nossa equipe analisará sua solicitação e entrará em contato com uma proposta personalizada.
          </p>

          <form onSubmit={handleSubmit} className="space-y-[var(--spacing-lg)]">
             {feedback && (
               <FormFeedback
                 type={feedback.type}
                 message={feedback.message}
                 onClose={() => setFeedback(null)}
               />
             )}

             {/* Empresa */}
             <div className="grid md:grid-cols-2 gap-[var(--spacing-md)]">
               <div>
                 <label className="block text-[var(--font-size-sm)] font-semibold text-[var(--color-foreground-primary)] mb-[var(--spacing-sm)]">
                  Nome da Empresa/Escritório *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-[var(--spacing-md)] py-[var(--spacing-sm)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)] disabled:bg-[var(--color-background-secondary)]"
                  placeholder="Ex: Silva & Associados"
                />
                </div>
                <div>
                <label className="block text-[var(--font-size-sm)] font-semibold text-[var(--color-foreground-primary)] mb-[var(--spacing-sm)]">
                  Tipo de Empresa *
                </label>
                <select
                  name="company_type"
                  value={formData.company_type}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-[var(--spacing-md)] py-[var(--spacing-sm)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)] disabled:bg-[var(--color-background-secondary)]"
                >
                  <option value="Simples Nacional">Simples Nacional</option>
                  <option value="Contabilidade">Empresa de Contabilidade</option>
                  <option value="Escritório de Advocacia">Escritório de Advocacia</option>
                </select>
              </div>
            </div>

            {/* Contato */}
            <div className="grid md:grid-cols-2 gap-[var(--spacing-md)]">
              <div>
                <label className="block text-[var(--font-size-sm)] font-semibold text-[var(--color-foreground-primary)] mb-[var(--spacing-sm)]">
                  Nome do Contato *
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-[var(--spacing-md)] py-[var(--spacing-sm)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)] disabled:bg-[var(--color-background-secondary)]"
                  placeholder="Seu nome completo"
                />
                </div>
                <div>
                <label className="block text-[var(--font-size-sm)] font-semibold text-[var(--color-foreground-primary)] mb-[var(--spacing-sm)]">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-[var(--spacing-md)] py-[var(--spacing-sm)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)] disabled:bg-[var(--color-background-secondary)]"
                  placeholder="seu@email.com"
                />
                </div>
                </div>

                {/* Telefone e Plano */}
                <div className="grid md:grid-cols-2 gap-[var(--spacing-md)]">
                <div>
                <label className="block text-[var(--font-size-sm)] font-semibold text-[var(--color-foreground-primary)] mb-[var(--spacing-sm)]">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-[var(--spacing-md)] py-[var(--spacing-sm)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)] disabled:bg-[var(--color-background-secondary)]"
                  placeholder="(11) 99999-9999"
                />
                </div>
                <div>
                <label className="block text-[var(--font-size-sm)] font-semibold text-[var(--color-foreground-primary)] mb-[var(--spacing-sm)]">
                  Plano de Interesse *
                </label>
                <select
                  name="plan_type"
                  value={formData.plan_type}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-[var(--spacing-md)] py-[var(--spacing-sm)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)] disabled:bg-[var(--color-background-secondary)]"
                >
                  <option value="Simples">Plano Simples</option>
                  <option value="Profissional">Plano Profissional</option>
                  <option value="Empresarial">Plano Empresarial</option>
                </select>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-[var(--font-size-sm)] font-semibold text-[var(--color-foreground-primary)] mb-[var(--spacing-sm)]">
                Descreva suas necessidades e escopo do projeto *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                rows="5"
                className="w-full px-[var(--spacing-md)] py-[var(--spacing-sm)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)] disabled:bg-[var(--color-background-secondary)]"
                placeholder="Ex: Precisamos de uma solução para gerenciar 50 processos por mês com integrações customizadas..."
              />
              </div>

              {/* Submit Button */}
              <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-[var(--spacing-lg)] py-[var(--spacing-md)] bg-[var(--color-interactive-default)] text-white font-semibold rounded-lg hover:bg-[var(--color-interactive-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-[var(--spacing-sm)]"
              >
              <CheckCircle2 className="w-5 h-5" />
              {isSubmitting ? 'Enviando...' : 'Solicitar Orçamento'}
            </button>

            <p className="text-[var(--font-size-xs)] text-[var(--color-foreground-secondary)] text-center">
              * Campos obrigatórios. Sua privacidade é importante para nós.
            </p>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-[var(--spacing-xl)] bg-blue-50 border border-blue-200 rounded-lg p-[var(--spacing-lg)]">
          <h3 className="font-semibold text-[var(--color-foreground-primary)] mb-[var(--spacing-md)]">Próximas Etapas</h3>
          <ul className="space-y-[var(--spacing-sm)] text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)]">
            <li className="flex gap-[var(--spacing-sm)]">
              <span className="text-[var(--color-interactive-default)] font-bold">1.</span>
              <span>Você receberá um email de confirmação do recebimento</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">2.</span>
              <span>Nossa equipe analisará sua solicitação (24-48 horas)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">3.</span>
              <span>Você receberá uma proposta detalhada e personalizada</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">4.</span>
              <span>Marcaremos uma reunião para discutir os próximos passos</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}