import React from 'react';
import { Clock } from 'lucide-react';

export default function ReadingTime({ content }) {
  const calculateReadingTime = () => {
    if (!content) return 0;
    
    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, '');
    
    // Conta palavras
    const words = text.trim().split(/\s+/).length;
    
    // Média de 200 palavras por minuto
    const minutes = Math.ceil(words / 200);
    
    return minutes;
  };

  const minutes = calculateReadingTime();

  if (minutes === 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <Clock className="w-4 h-4" />
      <span>{minutes} min de leitura</span>
    </div>
  );
}