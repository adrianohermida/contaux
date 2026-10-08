import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Calculator, FileSearch, Receipt, BarChart3 } from 'lucide-react';
import FloatingChatWidget from '../components/chat/FloatingChatWidget';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-background-primary)]">
      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-900 py-[var(--spacing-lg)] md:py-[var(--spacing-xl)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
        <div>
          <div className="max-w-3xl">
            <h1 className="text-[var(--font-size-3xl)] md:text-[var(--font-size-4xl)] lg:text-[var(--font-size-5xl)] font-bold text-[var(--color-foreground-primary)] mb-[var(--spacing-md)] leading-tight">
              Contabilidade Especializada para Advogados e Escritórios de Advocacia
            </h1>
            <p className="text-[var(--font-size-base)] md:text-[var(--font-size-lg)] text-[var(--color-foreground-secondary)] mb-[var(--spacing-lg)]">
              Serviços de cálculo, emissão de guias, pareceres e planos de pagamento.
            </p>
            <Link 
              to={createPageUrl('Contact')}
              className="inline-flex items-center gap-2 px-[var(--spacing-md)] md:px-[var(--spacing-lg)] py-[var(--spacing-sm)] bg-[var(--color-interactive-default)] text-white rounded-lg hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-2"
              aria-label="Criar conta grátis na Contaux"
            >
              Crie sua conta grátis
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-[var(--spacing-lg)] md:py-[var(--spacing-xl)] bg-[var(--color-background-primary)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
        <div>
          <div className="max-w-3xl mb-[var(--spacing-lg)] md:mb-[var(--spacing-xl)]">
            <p className="text-[var(--color-interactive-default)] font-semibold text-[var(--font-size-sm)]">Expertise</p>
             <h2 className="text-[var(--font-size-2xl)] md:text-[var(--font-size-4xl)] font-bold text-[var(--color-foreground-primary)] mb-[var(--spacing-md)]">Serviços Especializados.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-md)] md:gap-[var(--spacing-lg)]">
            {[
               {
                 icon: <Calculator className="w-10 h-10" aria-hidden="true" />,
                 title: 'Cálculos Judiciais',
                 desc: 'Garanta cálculos precisos e alinhados às normas dos Tribunais para atender às exigências processuais.'
               },
               {
                 icon: <FileSearch className="w-10 h-10" aria-hidden="true" />,
                 title: 'Parecer técnico e perícia contábil',
                 desc: 'Oferecemos suporte técnico especializado para análise financeira e perícia contábil em processos judiciais.'
               },
               {
                 icon: <Receipt className="w-10 h-10" aria-hidden="true" />,
                 title: 'Emissão de Guias de Custas',
                 desc: 'Simplifique o preenchimento e a emissão de guias judiciais com nosso serviço especializado.'
               },
               {
                 icon: <BarChart3 className="w-10 h-10" aria-hidden="true" />,
                 title: 'Planos de Pagamento e de Recuperação Judicial',
                 desc: 'Consultoria estratégica para criação de planos de pagamento e recuperação judicial.'
               }
             ].map((service) => (
               <article key={service.title} className="p-[var(--spacing-component-padding)] bg-[var(--color-background-secondary)] rounded-xl shadow-md hover:shadow-lg transition-shadow border border-transparent hover:border-[var(--color-border-default)]">
                 <div className="mb-[var(--spacing-md)] text-[var(--color-interactive-default)]">{service.icon}</div>
                 <h3 className="text-[var(--font-size-lg)] font-bold mb-[var(--spacing-sm)] text-[var(--color-foreground-primary)]">{service.title}</h3>
                 <p className="text-[var(--color-foreground-secondary)] text-[var(--font-size-sm)] leading-relaxed">{service.desc}</p>
               </article>
             ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-[var(--spacing-lg)] md:py-[var(--spacing-xl)] bg-[var(--color-background-secondary)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--spacing-md)] md:gap-[var(--spacing-xl)] items-center">
            <img 
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=400&fit=crop" 
              alt="Escritório de contabilidade jurídica Contaux" 
              className="rounded-xl w-full shadow-lg object-cover"
              loading="lazy"
            />
            <div>
               <p className="text-[var(--color-interactive-default)] font-semibold mb-[var(--spacing-sm)] text-[var(--font-size-sm)]">O que fazemos</p>
               <h2 className="text-[var(--font-size-2xl)] md:text-[var(--font-size-4xl)] font-bold text-[var(--color-foreground-primary)] mb-[var(--spacing-md)]">Simplificamos a Contadoria dos seus Processos</h2>
               <p className="text-[var(--color-foreground-secondary)] mb-[var(--spacing-lg)]">Conheça nossos serviços especializados e diferenciais que fazem da Contaux Contadoria a escolha ideal de contadoria em serviços de processos judiciais.</p>
              <div className="space-y-[var(--spacing-md)]">
                {[
                  { label: 'Personalizado', desc: 'Na Contaux, nossos clientes têm acesso a um atendimento personalizado e de qualidade, com profissionais capacitados e experientes em contabilidade do setor jurídico.' },
                  { label: 'Moderno', desc: 'Garantindo eficiência, segurança e conformidade nos padrões de cálculos judiciais com dados confiáveis.' },
                  { label: 'Acessível', desc: 'Oferecemos preços justos e transparentes em nossos serviços, sem taxas ocultas ou surpresas.' }
                ].map((item) => (
                  <div key={item.label} className="border-l-4 border-[var(--color-interactive-default)] pl-[var(--spacing-md)]">
                    <h3 className="font-bold text-[var(--color-foreground-primary)] mb-[var(--spacing-xs)]">{item.label}</h3>
                    <p className="text-[var(--color-foreground-secondary)] text-[var(--font-size-sm)] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-[var(--spacing-lg)] md:py-[var(--spacing-xl)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] bg-[var(--color-background-primary)] max-w-7xl mx-auto">
        <div className="text-center">
           <h2 className="text-[var(--font-size-2xl)] md:text-[var(--font-size-4xl)] font-bold text-[var(--color-foreground-primary)] mb-[var(--spacing-md)] md:mb-[var(--spacing-lg)]">Pronto para Começar?</h2>
           <p className="text-[var(--font-size-base)] md:text-[var(--font-size-lg)] text-[var(--color-foreground-secondary)] mb-[var(--spacing-lg)]">
            Crie sua conta grátis para solicitar serviços, acompanhar seus pedidos com transparência e facilidade.
          </p>
          <Link 
            to={createPageUrl('Contact')}
            className="inline-flex items-center justify-center bg-[var(--color-interactive-default)] text-white px-[var(--spacing-md)] md:px-[var(--spacing-lg)] py-[var(--spacing-sm)] md:py-[var(--spacing-md)] rounded-xl font-semibold hover:bg-[var(--color-interactive-hover)] active:bg-[var(--color-interactive-active)] transition-colors text-[var(--font-size-sm)] md:text-[var(--font-size-base)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-2"
            aria-label="Criar conta grátis"
          >
            Criar Conta Grátis <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Floating Chat Widget */}
      <FloatingChatWidget />
    </div>
  );
}