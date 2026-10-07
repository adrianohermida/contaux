import React from 'react';

export default function NewsCard({ image, title, link }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 text-sm line-clamp-2">
          <a href={link} className="hover:text-blue-600">{title}</a>
        </h3>
      </div>
    </div>
  );
}