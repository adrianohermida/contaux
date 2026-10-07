import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MobileBackButton() {
  const navigate = useNavigate();
  const [showBack, setShowBack] = React.useState(false);

  React.useEffect(() => {
    // Show back button if user can go back
    setShowBack(window.history.length > 1);
  }, []);

  if (!showBack) return null;

  return (
    <button
      onClick={() => navigate(-1)}
      className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
    </button>
  );
}