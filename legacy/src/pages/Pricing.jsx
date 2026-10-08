import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const plans = [
  {
    title: 'Single use',
    price: 10,
    features: ['Up to 5 users', 'Basic support', 'Monthly updates', 'Free cancelation']
  },
  {
    title: 'Multiple use',
    price: 20,
    featured: true,
    features: ['Up to 10 users', 'Basic support', 'Monthly updates', 'Free cancelation']
  },
  {
    title: 'Extended use',
    price: 30,
    features: ['Up to 20 users', 'Basic support', 'Monthly updates', 'Free cancelation']
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[var(--color-background-primary)]">
      {/* Breadcrumbs */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-[var(--spacing-2xl)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
        <div>
          <h1 className="text-[var(--font-size-4xl)] font-bold mb-[var(--spacing-md)]">Pricing Table</h1>
          <p className="text-blue-100 mb-[var(--spacing-lg)]">Business plan draws on a wide range of knowledge from different business disciplines.</p>
          <div className="flex gap-[var(--spacing-sm)] text-[var(--font-size-sm)]">
             <a href="/" className="hover:underline">Home</a>
             <span>/</span>
             <span>Pricing</span>
           </div>
         </div>
       </section>

       {/* Pricing Section */}
       <section className="py-[var(--spacing-2xl)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
         <div>
           <div className="text-center mb-[var(--spacing-2xl)]">
             <span className="text-[var(--color-interactive-default)] font-semibold">Pricing Table</span>
             <h2 className="text-[var(--font-size-4xl)] font-bold mt-[var(--spacing-sm)] mb-[var(--spacing-md)] text-[var(--color-foreground-primary)]">Our Pricing Plan</h2>
             <p className="text-[var(--color-foreground-secondary)] max-w-2xl mx-auto">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form.</p>
           </div>

           <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-[var(--spacing-xl)]">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`border rounded-lg overflow-hidden transition-all ${
                  plan.featured 
                    ? 'border-[var(--color-interactive-default)] shadow-lg lg:scale-105' 
                    : 'border-[var(--color-border-default)] shadow'
                }`}
              >
                {/* Head */}
                <div className={`p-[var(--spacing-xl)] ${plan.featured ? 'bg-[var(--color-interactive-default)] text-white' : 'bg-[var(--color-background-secondary)]'}`}>
                  <h4 className={`text-[var(--font-size-xl)] font-bold mb-[var(--spacing-md)] ${plan.featured ? 'text-white' : 'text-[var(--color-foreground-primary)]'}`}>
                    {plan.title}
                  </h4>
                  <div className="flex items-baseline gap-[var(--spacing-xs)]">
                    <span className="text-[var(--font-size-4xl)] font-bold">${plan.price}</span>
                    <span className={`text-[var(--font-size-sm)] ${plan.featured ? 'text-blue-100' : 'text-[var(--color-foreground-secondary)]'}`}>
                      per month
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="p-[var(--spacing-xl)] space-y-[var(--spacing-md)]">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-center gap-[var(--spacing-sm)]">
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${
                        plan.featured ? 'text-[var(--color-interactive-default)]' : 'text-green-500'
                      }`} />
                      <span className="text-[var(--color-foreground-secondary)]">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <div className="p-[var(--spacing-xl)] border-t border-[var(--color-border-default)]">
                  <button className={`w-full py-[var(--spacing-sm)] rounded-lg font-semibold transition-colors ${
                    plan.featured
                      ? 'bg-[var(--color-interactive-default)] text-white hover:bg-[var(--color-interactive-hover)]'
                      : 'border-2 border-[var(--color-interactive-default)] text-[var(--color-interactive-default)] hover:bg-[var(--color-background-secondary)]'
                  }`}>
                    Start free trial
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-[var(--spacing-2xl)] bg-[var(--color-background-secondary)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
        <div>
          <div className="grid lg:grid-cols-2 gap-[var(--spacing-2xl)]">
            <div>
              <h3 className="text-[var(--font-size-2xl)] font-bold mb-[var(--spacing-md)] text-[var(--color-foreground-primary)]">Boletim Informativo</h3>
              <p className="text-[var(--color-foreground-secondary)] mb-[var(--spacing-lg)]">Registre-se e receba conteúdo exclusivo sobre contabilidade de empresas</p>
              <form className="flex gap-[var(--spacing-sm)]">
                <input 
                  type="email" 
                  placeholder="Seu endereço de e-mail"
                  className="flex-1 px-[var(--spacing-md)] py-[var(--spacing-sm)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)]"
                />
                <button className="px-[var(--spacing-lg)] py-[var(--spacing-sm)] bg-[var(--color-interactive-default)] text-white rounded-lg hover:bg-[var(--color-interactive-hover)] transition-colors">
                  Registre-se
                </button>
              </form>
            </div>

            <div className="bg-[var(--color-background-primary)] p-[var(--spacing-xl)] rounded-lg border border-[var(--color-border-default)]">
              <h4 className="text-[var(--font-size-2xl)] font-bold mb-[var(--spacing-sm)] text-[var(--color-foreground-primary)]">Quer abrir sua empresa grátis?</h4>
              <p className="text-[var(--color-foreground-secondary)] mb-[var(--spacing-lg)]">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
              <button className="px-[var(--spacing-lg)] py-[var(--spacing-sm)] bg-[var(--color-interactive-default)] text-white rounded-lg hover:bg-[var(--color-interactive-hover)] transition-colors">
                Fale com um especialista
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}