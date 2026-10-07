/**
 * Language Switcher
 * Dropdown to switch app language (pt-BR, en-US, es-ES)
 */

import React from 'react';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/components/hooks/useTranslation';
import { LANGUAGES } from '@/components/i18n/translations';

export default function LanguageSwitcher({ compact = false }) {
  const { language, changeLanguage } = useTranslation();
  const current = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? 'icon' : 'sm'}
          className={`gap-2 min-h-[40px] ${compact ? 'w-10 p-0' : ''}`}
          aria-label={`Idioma atual: ${current.label}`}
        >
          <Globe className="w-4 h-4" aria-hidden="true" />
          {!compact && (
            <span className="text-sm hidden sm:inline">{current.label}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`gap-2 cursor-pointer ${language === lang.code ? 'bg-blue-50 dark:bg-blue-900/20 font-medium' : ''}`}
          >
            <span aria-hidden="true">{lang.flag}</span>
            <span>{lang.label}</span>
            {language === lang.code && (
              <span className="ml-auto text-blue-600 dark:text-blue-400 text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}