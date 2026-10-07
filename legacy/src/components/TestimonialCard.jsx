import React from 'react';
import { Star } from 'lucide-react';

export default function TestimonialCard({ name, company, location, text, image }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      
      {/* Quote */}
      <p className="text-slate-600 text-sm mb-6">"{text}"</p>
      
      {/* Author */}
      <div className="border-t pt-4 flex items-center gap-3">
        {image && <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover" />}
        <div>
          <h4 className="font-bold text-slate-900">{name}</h4>
          <p className="text-slate-600 text-sm">{company} | {location}</p>
        </div>
      </div>
    </div>
  );
}