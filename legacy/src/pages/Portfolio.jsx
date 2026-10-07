import React, { useState } from 'react';

const portfolioItems = [
  { id: 1, category: 'marketing', title: 'Best Marketing tips & tricks' },
  { id: 2, category: 'marketing', title: 'Unique Marketing tips & tricks' },
  { id: 3, category: 'web', title: 'Best Web Design in 2023' },
  { id: 4, category: 'branding', title: 'Best Branding Solutions' },
  { id: 5, category: 'web', title: 'Best Web Design in 2023' },
  { id: 6, category: 'graphic', title: 'Best Graphic Design in 2023' },
  { id: 7, category: 'graphic', title: 'Best Graphic Design in 2023' },
];

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('all');

  const categories = ['all', 'branding', 'marketing', 'web', 'graphic'];

  const filtered = activeFilter === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeFilter);

  return (
    <div className="min-h-screen bg-[var(--color-background-primary)]">
      {/* Breadcrumbs */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-[var(--spacing-2xl)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
        <div>
          <h1 className="text-[var(--font-size-4xl)] font-bold mb-[var(--spacing-md)]">Portfolio</h1>
          <p className="text-blue-100 mb-[var(--spacing-lg)]">Business plan draws on a wide range of knowledge from different business disciplines.</p>
          <div className="flex gap-[var(--spacing-sm)] text-[var(--font-size-sm)]">
             <a href="/" className="hover:underline">Home</a>
             <span>/</span>
             <span>Portfolio</span>
           </div>
         </div>
       </section>

       {/* Portfolio Section */}
       <section className="py-[var(--spacing-2xl)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
         <div>
           <div className="grid lg:grid-cols-2 gap-[var(--spacing-2xl)] mb-[var(--spacing-2xl)]">
             {/* Left Content */}
             <div>
               <span className="text-[var(--color-interactive-default)] font-semibold">Latest Cases</span>
               <h2 className="text-[var(--font-size-4xl)] font-bold mt-[var(--spacing-sm)] mb-[var(--spacing-md)] text-[var(--color-foreground-primary)]">Our projects</h2>
               <p className="text-[var(--color-foreground-secondary)]">There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration.</p>
             </div>

             {/* Filters */}
             <div className="flex flex-wrap gap-[var(--spacing-sm)] items-end">
               {categories.map((cat) => (
                 <button
                   key={cat}
                   onClick={() => setActiveFilter(cat)}
                   className={`px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded transition-colors capitalize ${
                     activeFilter === cat
                       ? 'bg-[var(--color-interactive-default)] text-white'
                       : 'border border-[var(--color-border-default)] text-[var(--color-foreground-primary)] hover:border-[var(--color-interactive-default)]'
                   }`}
                 >
                   {cat === 'all' ? 'All' : cat}
                 </button>
               ))}
             </div>
           </div>

           {/* Portfolio Grid */}
           <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-[var(--spacing-xl)]">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-lg bg-gray-900 cursor-pointer"
              >
                <img
                   src={`/assets/images/portfolio-${(item.id % 3) + 1}.jpg`}
                   alt={item.title}
                   className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                 />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center text-white">
                    <span className="text-sm font-semibold text-blue-400">{item.category.toUpperCase()}</span>
                    <h4 className="text-lg font-bold mt-2">{item.title}</h4>
                  </div>
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
              <h3 className="text-[var(--font-size-2xl)] font-bold mb-[var(--spacing-md)] text-[var(--color-foreground-primary)]">Inscreva-se na Newsletter</h3>
              <p className="text-[var(--color-foreground-secondary)] mb-[var(--spacing-lg)]">Registre-se e receba conteúdo exclusivo sobre contabilidade de empresas</p>
              <form className="flex gap-[var(--spacing-sm)]">
                <input type="email" placeholder="Seu endereço de e-mail" className="flex-1 px-[var(--spacing-md)] py-[var(--spacing-sm)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)]" />
                <button className="px-[var(--spacing-lg)] py-[var(--spacing-sm)] bg-[var(--color-interactive-default)] text-white rounded-lg hover:bg-[var(--color-interactive-hover)]">Registre-se</button>
              </form>
            </div>
            <div className="bg-[var(--color-background-primary)] p-[var(--spacing-xl)] rounded-lg border border-[var(--color-border-default)]">
              <h4 className="text-[var(--font-size-2xl)] font-bold mb-[var(--spacing-sm)] text-[var(--color-foreground-primary)]">Quer abrir sua empresa grátis?</h4>
              <p className="text-[var(--color-foreground-secondary)] mb-[var(--spacing-lg)]">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
              <button className="px-[var(--spacing-lg)] py-[var(--spacing-sm)] bg-[var(--color-interactive-default)] text-white rounded-lg hover:bg-[var(--color-interactive-hover)]">Fale com um especialista</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}