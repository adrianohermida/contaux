import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Logo() {
  return (
    <Link to={createPageUrl('Home')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
      <img 
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ff672740bf3d542ac6481/ea8575016_contaux_blue.png" 
        alt="Contaux" 
        className="w-10 h-10" 
      />
      <div className="flex flex-col">
        <span className="text-blue-600 font-bold text-lg leading-none">Contaux</span>
        <span className="text-blue-600 text-xs font-semibold leading-none">Contabilidade</span>
      </div>
    </Link>
  );
}