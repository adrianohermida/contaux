import React, { useState, useEffect } from 'react';
import { List } from 'lucide-react';

export default function TableOfContents({ content }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (!content) return;

    // Extrair headings do HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const h2Elements = doc.querySelectorAll('h2, h3');
    
    const extractedHeadings = Array.from(h2Elements).map((heading, index) => {
      const id = `heading-${index}`;
      const text = heading.textContent;
      const level = heading.tagName.toLowerCase();
      
      return { id, text, level };
    });

    setHeadings(extractedHeadings);

    // Adicionar IDs aos headings reais na página
    setTimeout(() => {
      const realHeadings = document.querySelectorAll('.prose h2, .prose h3');
      realHeadings.forEach((heading, index) => {
        heading.id = `heading-${index}`;
      });
    }, 100);

    // Observar scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    setTimeout(() => {
      const elements = document.querySelectorAll('.prose h2, .prose h3');
      elements.forEach((el) => observer.observe(el));
    }, 200);

    return () => observer.disconnect();
  }, [content]);

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="hidden lg:block sticky top-24 bg-white rounded-lg border border-slate-200 p-6 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <List className="w-5 h-5 text-blue-600" />
        <h4 className="font-bold text-slate-900">Índice</h4>
      </div>
      <nav>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={`text-left text-sm transition-colors ${
                  heading.level === 'h3' ? 'pl-4' : ''
                } ${
                  activeId === heading.id
                    ? 'text-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}