import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 text-left"
      >
        <div className="flex items-start gap-4 flex-1">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-sm">
            ?
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">{question}</h3>
        </div>
        <ChevronDown 
          size={20} 
          className={`flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      
      {open && (
        <p className="mt-4 ml-12 text-slate-600 text-sm">{answer}</p>
      )}
    </div>
  );
}