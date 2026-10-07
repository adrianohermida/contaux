import React, { useState } from 'react';
import { CheckCircle2, Play, Users, BarChart3, Calculator, FileSearch, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import VirtualCounterWidget from '../components/dashboard/widgets/VirtualCounterWidget';

const teamMembers = [
  { name: 'Dr. Ricardo Silva', role: 'Contador Responsável' },
  { name: 'Fernanda Santos', role: 'Especialista em Contabilidade Judicial' },
  { name: 'João Pereira', role: 'Contador Sênior' },
  { name: 'Marina Costa', role: 'Especialista em Custas Judiciais' },
];

const services = [
  { icon: <BarChart3 className="w-10 h-10" />, title: 'Contabilidade Judicial', desc: 'Cálculos complexos de custas, honorários e planos de pagamento para processos judiciais' },
  { icon: <FileSearch className="w-10 h-10" />, title: 'Pareceres Técnicos', desc: 'Emissão de pareceres contábeis e técnicos para assessoria jurídica' },
  { icon: <Calculator className="w-10 h-10" />, title: 'Cálculos Especializados', desc: 'Revisão bancária, cálculos trabalhistas, pensão alimentícia e superendividamento' },
  { icon: <Receipt className="w-10 h-10" />, title: 'Guias de Recolhimento', desc: 'Geração automatizada de guias de recolhimento e documentação fiscal' },
];

export default function About() {
  const [activeTab, setActiveTab] = useState('missao');

  return (
    <div className="min-h-screen bg-[var(--color-background-primary)]">
      {/* Breadcrumbs */}
       <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-[var(--spacing-lg)] md:py-[var(--spacing-xl)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
         <div>
           <h1 className="text-[var(--font-size-3xl)] md:text-[var(--font-size-4xl)] font-bold mb-[var(--spacing-md)]">Sobre Contaux</h1>
           <p className="text-blue-100 mb-[var(--spacing-md)]">Escritório especializado em contabilidade judicial, custas processuais e cálculos especializados para advocacia.</p>
           <div className="flex gap-[var(--spacing-sm)] text-[var(--font-size-sm)]">
             <Link to={createPageUrl('Home')} className="hover:underline">Início</Link>
             <span>/</span>
             <span>Sobre Nós</span>
           </div>
         </div>
       </section>

       {/* About Section */}
        <section className="py-[var(--spacing-lg)] md:py-[var(--spacing-xl)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
           <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--spacing-md)] md:gap-[var(--spacing-xl)] items-center">
             {/* Left Content */}
             <div>
               <div className="mb-[var(--spacing-lg)]">
                 <span className="text-[var(--color-interactive-default)] font-semibold text-[var(--font-size-sm)]">Quem somos</span>
                 <h2 className="text-[var(--font-size-2xl)] md:text-[var(--font-size-4xl)] font-bold mt-[var(--spacing-sm)] mb-[var(--spacing-md)] text-[var(--color-foreground-primary)]">Especialistas em Contabilidade Judicial</h2>
                 <p className="text-[var(--color-foreground-secondary)] text-[var(--font-size-sm)] md:text-[var(--font-size-base)]">Contaux é um escritório de contabilidade especializado em contabilidade judicial, cálculos de custas processuais, pareceres técnicos e recolhimentos para escritórios de advocacia e empresas.</p>
               </div>

              {/* Tabs */}
                  <div className="border-b border-[var(--color-border-default)] mb-[var(--spacing-md)] overflow-x-auto">
                      <div className="flex gap-[var(--spacing-md)] md:gap-[var(--spacing-lg)]">
                        {['missao', 'visao', 'valores'].map(tab => {
                          const labels = { missao: 'Missão', visao: 'Visão', valores: 'Valores' };
                          return (
                            <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={`py-[var(--spacing-md)] font-semibold capitalize whitespace-nowrap text-[var(--font-size-sm)] md:text-[var(--font-size-base)] ${
                                activeTab === tab ? 'border-b-2 border-[var(--color-interactive-default)] text-[var(--color-interactive-default)]' : 'text-[var(--color-foreground-secondary)]'
                              }`}
                            >
                              {labels[tab]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

              {/* Tab Content */}
              <div className="space-y-[var(--spacing-md)]">
                {activeTab === 'missao' && (
                  <>
                    <p className="text-gray-600">Fornecer serviços especializados de contabilidade judicial, custas processuais e pareceres técnicos de excelência para escritórios de advocacia e empresas, otimizando custos e garantindo conformidade legal em todos os processos judiciais.</p>
                    <ul className="space-y-[var(--spacing-md)]">
                      <li className="flex gap-[var(--spacing-md)] items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">Calcular custas e honorários judiciais com precisão</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">Gerar pareceres técnicos para assessoria jurídica</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">Otimizar gestão de recolhimentos e planos de pagamento</span>
                      </li>
                    </ul>
                  </>
                )}
                {activeTab === 'visao' && (
                  <>
                    <p className="text-gray-600">Ser referência nacional em contabilidade judicial, oferecendo soluções inovadoras que combinam expertise contábil com tecnologia avançada para simplificar processos judiciais complexos.</p>
                    <p className="text-gray-600 mt-4">Expandir para integração com sistemas de tribunal eletrônico, automatizações baseadas em IA para cálculos judiciais e análise preditiva de custas processuais.</p>
                  </>
                )}
                {activeTab === 'valores' && (
                  <>
                    <ul className="space-y-3">
                      <li className="flex gap-3 items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600"><strong>Excelência:</strong> Qualidade e precisão em todos os cálculos</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600"><strong>Confiabilidade:</strong> Respeito absoluto aos prazos e conformidade legal</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600"><strong>Especialização:</strong> Expertise profunda em contabilidade judicial</span>
                      </li>
                      <li className="flex gap-3 items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600"><strong>Parceria:</strong> Atuamos como extensão do seu escritório</span>
                      </li>
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Right Image */}
            <div>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ff672740bf3d542ac6481/fc3eb6844_pf-single1.jpg"
                alt="Team working"
                className="rounded-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
       <section className="bg-[var(--color-background-secondary)] py-[var(--spacing-lg)] md:py-[var(--spacing-xl)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
         <div>
          <div className="text-center mb-[var(--spacing-lg)] md:mb-[var(--spacing-xl)]">
            <span className="text-[var(--color-interactive-default)] font-semibold text-[var(--font-size-sm)]">Serviços Principais</span>
            <h2 className="text-[var(--font-size-2xl)] md:text-[var(--font-size-4xl)] font-bold mt-[var(--spacing-sm)] mb-[var(--spacing-md)] text-[var(--color-foreground-primary)]">Especialidades Contaux</h2>
            <p className="text-[var(--color-foreground-secondary)] text-[var(--font-size-sm)] md:text-[var(--font-size-base)] max-w-2xl mx-auto">Somos especializados em contabilidade judicial com soluções integradas para escritórios de advocacia e empresas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-md)] md:gap-[var(--spacing-lg)]">
            {services.map((service, idx) => (
              <div key={idx} className="bg-[var(--color-background-primary)] p-[var(--spacing-component-padding)] rounded-lg text-center hover:shadow-lg transition-shadow border border-[var(--color-border-default)]">
                <div className="text-[var(--font-size-4xl)] mb-[var(--spacing-md)] text-[var(--color-interactive-default)]">{service.icon}</div>
                <h3 className="font-bold text-[var(--font-size-lg)] mb-[var(--spacing-sm)] text-[var(--color-foreground-primary)]">{service.title}</h3>
                <p className="text-[var(--color-foreground-secondary)] text-[var(--font-size-sm)]">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-[var(--spacing-lg)] md:py-[var(--spacing-xl)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
        <div>
          <div className="text-center mb-[var(--spacing-lg)] md:mb-[var(--spacing-xl)]">
            <span className="text-[var(--color-interactive-default)] font-semibold text-[var(--font-size-sm)]">Conheça Nossa Equipe</span>
            <h2 className="text-[var(--font-size-2xl)] md:text-[var(--font-size-4xl)] font-bold mt-[var(--spacing-sm)] text-[var(--color-foreground-primary)]">Profissionais Experientes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-md)] md:gap-[var(--spacing-lg)]">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-[var(--color-background-secondary)] p-[var(--spacing-md)] rounded-lg text-center hover:shadow-lg transition-shadow border border-[var(--color-border-default)]">
                <div className="w-16 h-16 bg-[var(--color-interactive-default)] rounded-full mx-auto mb-[var(--spacing-md)] flex items-center justify-center text-white text-[var(--font-size-2xl)] font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-bold text-[var(--font-size-lg)] mb-[var(--spacing-xs)] text-[var(--color-foreground-primary)]">{member.name}</h3>
                <p className="text-[var(--color-foreground-secondary)] text-[var(--font-size-sm)]">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Virtual Counter Widget */}
      <VirtualCounterWidget />

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-[var(--spacing-lg)] md:py-[var(--spacing-xl)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-[var(--font-size-2xl)] md:text-[var(--font-size-4xl)] font-bold mb-[var(--spacing-md)]">Pronto para Melhorar Seus Processos Judiciais?</h2>
          <p className="text-blue-100 mb-[var(--spacing-lg)] text-[var(--font-size-sm)] md:text-[var(--font-size-base)]">Trabalhe com especialistas em contabilidade judicial e otimize seus custos processuais.</p>
          <Link 
            to={createPageUrl('Contact')}
            className="inline-block bg-white text-blue-600 px-[var(--spacing-lg)] py-[var(--spacing-sm)] rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Fale Conosco
          </Link>
        </div>
      </section>
    </div>
  );
}