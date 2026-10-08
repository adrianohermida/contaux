import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Componente para gerenciar atalhos/favoritos no sidebar
 */
export default function SidebarShortcuts() {
  const [favorites, setFavorites] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarFavorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {
        // Ignore JSON parse errors
      }
    }
  }, []);

  const toggleFavorite = (page) => {
    const updated = favorites.includes(page)
      ? favorites.filter(f => f !== page)
      : [...favorites, page];
    
    setFavorites(updated);
    localStorage.setItem('sidebarFavorites', JSON.stringify(updated));
  };

  if (favorites.length === 0) return null;

  return (
    <div className="px-2 py-2 border-t border-slate-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
      >
        <span>Favoritos</span>
        <Star className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <div className="mt-1 space-y-1">
          {favorites.map(page => (
            <a
              key={page}
              href={`/${page.toLowerCase()}`}
              className="block px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 rounded transition-colors"
            >
              ⭐ {page}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}