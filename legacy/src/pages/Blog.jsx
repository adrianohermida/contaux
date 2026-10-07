import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Calendar, MessageCircle, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const postsPerPage = 6;

  useEffect(() => {
    // SEO Meta Tags
    document.title = 'Blog Contaux - Conteúdo em Contabilidade e Gestão';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = 'Artigos especializados em contabilidade, jurídico e gestão empresarial. Fique por dentro das novidades do setor.';
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Artigos especializados em contabilidade, jurídico e gestão empresarial. Fique por dentro das novidades do setor.';
      document.head.appendChild(meta);
    }

    // Add schema.org for Blog listing
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      'name': 'Blog Contaux',
      'description': 'Artigos especializados em contabilidade, jurídico e gestão empresarial',
      'url': 'https://hermidamaia.adv.br/blog'
    });
    document.head.appendChild(schemaScript);
  }, []);

  // Query para posts publicados
  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ['blog-posts-published'],
    queryFn: () => base44.entities.BlogPost.filter(
      { status: 'published' },
      '-publish_date',
      50
    ),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Query para categorias
  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => base44.entities.BlogCategory.list(),
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Extrair tags únicas
  const tags = useMemo(() => {
    const allTags = blogPosts.flatMap(p => p.tags || []);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.slice(0, 12);
  }, [blogPosts]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await base44.functions.invoke('subscribeNewsletter', {
        email: newsletterEmail,
        source: 'blog'
      });
      setNewsletterStatus('success');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterStatus(''), 3000);
    } catch (error) {
      setNewsletterStatus('error');
      setTimeout(() => setNewsletterStatus(''), 3000);
    }
  };

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || post.category_id === selectedCategory;
    
    const matchesTag = !selectedTag || (post.tags || []).includes(selectedTag);
    
    return matchesSearch && matchesCategory && matchesTag;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIdx = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIdx, startIdx + postsPerPage);

  // Posts mais populares (ordenados por visualizações)
  const popularPosts = [...blogPosts]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-interactive-default)] mx-auto mb-[var(--spacing-md)]"></div>
          <p className="text-[var(--color-foreground-secondary)]">Carregando blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background-primary)]">
      {/* Breadcrumbs */}
       <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-[var(--spacing-lg)] sm:py-[var(--spacing-xl)] md:py-[var(--spacing-2xl)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
         <div>
           <h1 className="text-[var(--font-size-2xl)] sm:text-[var(--font-size-3xl)] md:text-[var(--font-size-4xl)] font-bold mb-[var(--spacing-xs)] sm:mb-[var(--spacing-md)]">Blog Contaux</h1>
           <p className="text-blue-100 mb-[var(--spacing-md)] sm:mb-[var(--spacing-lg)] text-[var(--font-size-sm)] sm:text-[var(--font-size-base)]">Conteúdo especializado em contabilidade, jurídico e gestão empresarial</p>
           <div className="flex gap-[var(--spacing-sm)] text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)] flex-wrap">
             <a href="/" className="hover:underline">Home</a>
             <span>/</span>
             <span>Blog</span>
           </div>
         </div>
       </section>

       {/* Search & Filters */}
       <section className="bg-[var(--color-background-secondary)] py-[var(--spacing-lg)] sm:py-[var(--spacing-xl)] md:py-[var(--spacing-2xl)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
         <div>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-[var(--spacing-sm)] sm:gap-[var(--spacing-md)] mb-[var(--spacing-md)]">
            {/* Search */}
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="Buscar artigos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-[var(--spacing-sm)] sm:px-[var(--spacing-md)] py-[var(--spacing-xs)] sm:py-[var(--spacing-sm)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)] text-[var(--font-size-sm)]"
              />
            </div>
            {/* Category Filter */}
            <select
              value={selectedCategory || ''}
              onChange={(e) => {
                setSelectedCategory(e.target.value || null);
                setCurrentPage(1);
              }}
              className="px-[var(--spacing-sm)] sm:px-[var(--spacing-md)] py-[var(--spacing-xs)] sm:py-[var(--spacing-sm)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)] text-[var(--font-size-sm)]"
            >
              <option value="">Todas categorias</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          {/* Tags Filter */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-[var(--spacing-sm)]">
              <span className="text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)]">Tags:</span>
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTag(selectedTag === tag ? null : tag);
                    setCurrentPage(1);
                  }}
                  className={`px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-[var(--font-size-xs)] rounded-full transition-colors ${
                    selectedTag === tag
                      ? 'bg-[var(--color-interactive-default)] text-white'
                      : 'bg-[var(--color-background-secondary)] text-[var(--color-foreground-secondary)] hover:bg-[var(--color-border-default)]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-[var(--spacing-lg)] sm:py-[var(--spacing-xl)] md:py-[var(--spacing-2xl)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--spacing-md)] sm:gap-[var(--spacing-lg)] lg:gap-[var(--spacing-xl)]">
            {/* Posts */}
            <div className="lg:col-span-2">
              {/* Results count */}
              <div className="mb-[var(--spacing-md)] sm:mb-[var(--spacing-lg)] text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)]">
                {filteredPosts.length === 0 ? (
                  <p>Nenhum resultado encontrado</p>
                ) : (
                  <p>
                    Mostrando {startIdx + 1}-{Math.min(startIdx + postsPerPage, filteredPosts.length)} de {filteredPosts.length} artigos
                  </p>
                )}
              </div>

              {paginatedPosts.length === 0 ? (
                <div className="text-center py-[var(--spacing-2xl)] bg-[var(--color-background-secondary)] rounded-lg">
                  <p className="text-[var(--color-foreground-secondary)] mb-[var(--spacing-md)]">Nenhum post encontrado com os filtros aplicados.</p>
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory(null);
                      setSelectedTag(null);
                      setCurrentPage(1);
                    }}
                    className="text-[var(--color-interactive-default)] hover:text-[var(--color-interactive-hover)] underline"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-[var(--spacing-md)] sm:gap-[var(--spacing-lg)] mb-[var(--spacing-lg)] sm:mb-[var(--spacing-2xl)]">
                  {paginatedPosts.map(post => (
                    <Link key={post.id} to={`${createPageUrl('BlogSingle')}?id=${post.id}`}>
                      <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-default)] rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 flex gap-[var(--spacing-md)]">
                        {post.featured_image && (
                          <img 
                            src={post.featured_image} 
                            alt={post.title} 
                            className="w-24 h-24 sm:w-32 sm:h-32 object-cover flex-shrink-0 rounded-lg" 
                            loading="lazy" 
                          />
                        )}
                        <div className="p-[var(--spacing-sm)] sm:p-[var(--spacing-md)] flex-1 min-w-0">
                          <h4 className="font-bold text-[var(--font-size-sm)] sm:text-[var(--font-size-base)] text-[var(--color-foreground-primary)] mb-[var(--spacing-xs)] hover:text-[var(--color-interactive-default)] line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="text-[var(--color-foreground-secondary)] text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)] mb-[var(--spacing-xs)] line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-[var(--font-size-xs)] text-[var(--color-foreground-secondary)]">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-5 h-5 rounded-full bg-[var(--color-background-secondary)] flex items-center justify-center flex-shrink-0">
                                  <span className="text-[10px] font-bold text-[var(--color-interactive-default)]">
                                  {post.author?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                              <span className="truncate">{post.author}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Eye className="w-3 h-3" />
                              <span>{post.views || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="flex justify-center gap-[var(--spacing-xs)] sm:gap-[var(--spacing-sm)] mb-[var(--spacing-lg)] flex-wrap">
                <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className="px-[var(--spacing-xs)] sm:px-[var(--spacing-sm)] py-[var(--spacing-xs)] sm:py-[var(--spacing-xs)] border border-[var(--color-border-default)] rounded hover:bg-[var(--color-background-secondary)] text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)]">Anterior</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`px-[var(--spacing-xs)] sm:px-[var(--spacing-sm)] py-[var(--spacing-xs)] sm:py-[var(--spacing-xs)] rounded text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)] ${currentPage === i + 1 ? 'bg-[var(--color-interactive-default)] text-white' : 'border border-[var(--color-border-default)] hover:bg-[var(--color-background-secondary)]'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className="px-[var(--spacing-xs)] sm:px-[var(--spacing-sm)] py-[var(--spacing-xs)] sm:py-[var(--spacing-xs)] border border-[var(--color-border-default)] rounded hover:bg-[var(--color-background-secondary)] text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)]">Próxima</button>
              </div>
            </div>

            {/* Sidebar */}
             <div className="space-y-[var(--spacing-md)] sm:space-y-[var(--spacing-lg)]">
              {/* Search */}
              <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-default)] p-[var(--spacing-sm)] sm:p-[var(--spacing-md)] rounded-lg">
                <h5 className="font-bold mb-[var(--spacing-md)] text-[var(--font-size-sm)] text-[var(--color-foreground-primary)]">Filtros</h5>
                <div className="flex gap-[var(--spacing-sm)]">
                  <input 
                    type="text" 
                    placeholder="Buscar..." 
                    value={searchTerm} 
                    onChange={(e) => {
                      setSearchTerm(e.target.value); 
                      setCurrentPage(1);
                    }} 
                    className="flex-1 px-[var(--spacing-xs)] sm:px-[var(--spacing-sm)] py-[var(--spacing-xs)] sm:py-[var(--spacing-xs)] border border-[var(--color-border-default)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)] text-[var(--font-size-xs)]" 
                  />
                  <button className="px-[var(--spacing-xs)] py-[var(--spacing-xs)] sm:py-[var(--spacing-xs)] bg-[var(--color-interactive-default)] text-white rounded hover:bg-[var(--color-interactive-hover)] text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)]">
                    <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
                
                {/* Active filters */}
                {(selectedCategory || selectedTag || searchTerm) && (
                  <div className="mt-[var(--spacing-sm)] flex flex-wrap gap-[var(--spacing-xs)]">
                    {searchTerm && (
                      <span className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-sm)] py-[var(--spacing-xs)] bg-blue-100 text-blue-700 text-[var(--font-size-xs)] rounded">
                        Busca: "{searchTerm}"
                        <button onClick={() => {setSearchTerm(''); setCurrentPage(1);}} className="hover:font-bold">×</button>
                      </span>
                    )}
                    {selectedCategory && (
                      <span className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-sm)] py-[var(--spacing-xs)] bg-blue-100 text-blue-700 text-[var(--font-size-xs)] rounded">
                        Categoria
                        <button onClick={() => {setSelectedCategory(null); setCurrentPage(1);}} className="hover:font-bold">×</button>
                      </span>
                    )}
                    {selectedTag && (
                      <span className="inline-flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-sm)] py-[var(--spacing-xs)] bg-blue-100 text-blue-700 text-[var(--font-size-xs)] rounded">
                        {selectedTag}
                        <button onClick={() => {setSelectedTag(null); setCurrentPage(1);}} className="hover:font-bold">×</button>
                      </span>
                    )}
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory(null);
                        setSelectedTag(null);
                        setCurrentPage(1);
                      }}
                      className="text-[var(--font-size-xs)] text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground-primary)] underline"
                    >
                      Limpar
                    </button>
                  </div>
                )}
              </div>

              {/* Popular Posts */}
              <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-default)] p-[var(--spacing-sm)] sm:p-[var(--spacing-md)] rounded-lg">
                <h5 className="font-bold mb-[var(--spacing-sm)] text-[var(--font-size-sm)] text-[var(--color-foreground-primary)]">Posts Populares</h5>
                <div className="space-y-[var(--spacing-sm)]">
                  {popularPosts.length === 0 ? (
                    <p className="text-[var(--font-size-xs)] text-[var(--color-foreground-secondary)]">Nenhum post ainda</p>
                  ) : (
                    popularPosts.map(post => (
                      <Link key={post.id} to={`${createPageUrl('BlogSingle')}?id=${post.id}`}>
                        <div className="pb-[var(--spacing-sm)] border-b border-[var(--color-border-default)] last:border-0">
                          <h6 className="font-semibold text-[var(--font-size-xs)] hover:text-[var(--color-interactive-default)] mb-[var(--spacing-xs)] line-clamp-2 text-[var(--color-foreground-primary)]">
                            {post.title}
                          </h6>
                          <span className="text-[var(--font-size-xs)] text-[var(--color-foreground-secondary)] flex items-center gap-[var(--spacing-xs)]">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.publish_date || post.created_date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-default)] p-[var(--spacing-sm)] sm:p-[var(--spacing-md)] rounded-lg">
                <h5 className="font-bold mb-[var(--spacing-sm)] text-[var(--font-size-sm)] text-[var(--color-foreground-primary)]">Categorias</h5>
                <ul className="space-y-[var(--spacing-xs)]">
                  {categories.length === 0 ? (
                    <li className="text-[var(--font-size-xs)] text-[var(--color-foreground-secondary)]">Nenhuma categoria</li>
                  ) : (
                    categories.map((cat) => {
                      const count = blogPosts.filter(p => p.category_id === cat.id).length;
                      const isActive = selectedCategory === cat.id;
                      return (
                        <li key={cat.id}>
                          <button 
                            onClick={() => {
                              setSelectedCategory(isActive ? null : cat.id);
                              setCurrentPage(1);
                            }}
                            className={`w-full text-left text-[var(--font-size-xs)] flex justify-between items-center hover:text-[var(--color-interactive-default)] ${isActive ? 'text-[var(--color-interactive-default)] font-semibold' : 'text-[var(--color-foreground-primary)]'}`}
                          >
                            <span className="truncate">{cat.name}</span>
                            <span className="text-[var(--font-size-xs)] text-[var(--color-foreground-secondary)] flex-shrink-0 ml-[var(--spacing-xs)]">({count})</span>
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>

              {/* Tags */}
              <div className="bg-[var(--color-background-primary)] border border-[var(--color-border-default)] p-[var(--spacing-sm)] sm:p-[var(--spacing-md)] rounded-lg">
                <h5 className="font-bold mb-[var(--spacing-sm)] text-[var(--font-size-sm)] text-[var(--color-foreground-primary)]">Tags Populares</h5>
                <div className="flex flex-wrap gap-[var(--spacing-xs)]">
                  {tags.length === 0 ? (
                    <p className="text-[var(--font-size-xs)] text-[var(--color-foreground-secondary)]">Nenhuma tag ainda</p>
                  ) : (
                    tags.map((tag, idx) => {
                      const isActive = selectedTag === tag;
                      return (
                        <button 
                          key={idx} 
                          onClick={() => {
                            setSelectedTag(isActive ? null : tag);
                            setCurrentPage(1);
                          }}
                          className={`px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-[var(--font-size-xs)] rounded transition-colors ${
                            isActive 
                              ? 'bg-[var(--color-interactive-default)] text-white' 
                              : 'bg-[var(--color-background-secondary)] text-[var(--color-foreground-secondary)] hover:bg-[var(--color-interactive-default)] hover:text-white'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-[var(--spacing-2xl)] sm:py-[var(--spacing-2xl)] md:py-[var(--spacing-2xl)] bg-[var(--color-background-secondary)] px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] max-w-7xl mx-auto">
        <div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-[var(--spacing-lg)] sm:gap-[var(--spacing-xl)] lg:gap-[var(--spacing-2xl)]">
            <div>
              <h3 className="text-[var(--font-size-xl)] sm:text-[var(--font-size-2xl)] font-bold mb-[var(--spacing-sm)] sm:mb-[var(--spacing-md)] text-[var(--color-foreground-primary)]">Inscreva-se na Newsletter</h3>
              <p className="text-[var(--color-foreground-secondary)] mb-[var(--spacing-md)] sm:mb-[var(--spacing-lg)] text-[var(--font-size-sm)] sm:text-[var(--font-size-base)]">Registre-se e receba conteúdo exclusivo sobre contabilidade de empresas</p>
              {newsletterStatus === 'success' && (
                <div className="mb-[var(--spacing-md)] p-[var(--spacing-sm)] bg-green-100 text-green-700 rounded-lg text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)]">Inscrição realizada com sucesso!</div>
              )}
              {newsletterStatus === 'error' && (
                <div className="mb-[var(--spacing-md)] p-[var(--spacing-sm)] bg-red-100 text-red-700 rounded-lg text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)]">Erro ao inscrever. Tente novamente.</div>
              )}
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-[var(--spacing-sm)]">
                <input 
                  type="email" 
                  placeholder="Seu endereço de e-mail" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="flex-1 px-[var(--spacing-sm)] sm:px-[var(--spacing-md)] py-[var(--spacing-xs)] sm:py-[var(--spacing-sm)] border border-[var(--color-border-default)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-interactive-default)] text-[var(--font-size-sm)]" 
                />
                <button type="submit" className="px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] py-[var(--spacing-xs)] sm:py-[var(--spacing-sm)] bg-[var(--color-interactive-default)] text-white rounded-lg hover:bg-[var(--color-interactive-hover)] transition-colors text-[var(--font-size-sm)] sm:text-[var(--font-size-base)] whitespace-nowrap">Registre-se</button>
              </form>
            </div>
            <div className="bg-[var(--color-background-primary)] p-[var(--spacing-md)] sm:p-[var(--spacing-xl)] rounded-lg border border-[var(--color-border-default)]">
              <h4 className="text-[var(--font-size-xl)] sm:text-[var(--font-size-2xl)] font-bold mb-[var(--spacing-xs)] sm:mb-[var(--spacing-sm)] text-[var(--color-foreground-primary)]">Quer abrir sua empresa grátis?</h4>
              <p className="text-[var(--color-foreground-secondary)] mb-[var(--spacing-md)] sm:mb-[var(--spacing-lg)] text-[var(--font-size-sm)] sm:text-[var(--font-size-base)]">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
              <button className="w-full sm:w-auto px-[var(--spacing-md)] sm:px-[var(--spacing-lg)] py-[var(--spacing-xs)] sm:py-[var(--spacing-sm)] bg-[var(--color-interactive-default)] text-white rounded-lg hover:bg-[var(--color-interactive-hover)] transition-colors text-[var(--font-size-sm)] sm:text-[var(--font-size-base)]">Fale com um especialista</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}