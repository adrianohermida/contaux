/**
 * useTranslation Hook
 * Provides translation function reactive to language changes
 */

import { useState, useEffect, useCallback } from 'react';
import { t, getLanguage, setLanguage, LANGUAGES } from '@/components/i18n/translations';

export function useTranslation() {
  const [language, setLang] = useState(getLanguage);

  useEffect(() => {
    const handleChange = (e) => {
      setLang(e.detail?.code || getLanguage());
    };
    window.addEventListener('languagechange', handleChange);
    return () => window.removeEventListener('languagechange', handleChange);
  }, []);

  const translate = useCallback(
    (key) => t(key, language),
    [language]
  );

  const changeLanguage = useCallback((code) => {
    setLanguage(code);
    setLang(code);
  }, []);

  return {
    t: translate,
    language,
    changeLanguage,
    languages: LANGUAGES,
  };
}