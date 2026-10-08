import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function FormFeedback({ type, message, onClose }) {
  const isSuccess = type === 'success';

  return (
    <div className={`p-4 rounded-lg flex items-start gap-3 ${
      isSuccess 
        ? 'bg-green-50 border border-green-200' 
        : 'bg-red-50 border border-red-200'
    }`}>
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      )}
      <p className={`text-sm ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
        {message}
      </p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </div>
  );
}