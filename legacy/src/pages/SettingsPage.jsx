/**
 * Settings Page
 * Unified settings: Branding, Language, Theme, Notifications, Security
 */

import React, { useState } from 'react';
import {
  Palette, Globe, Bell, Shield, User, ChevronRight, Sun, Moon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import BrandingSettings from '@/components/settings/BrandingSettings';
import LanguageSwitcher from '@/components/settings/LanguageSwitcher';
import { useGlobalAuth } from '@/components/auth/useGlobalAuth';
import { useTranslation } from '@/components/hooks/useTranslation';
import { LANGUAGES } from '@/components/i18n/translations';

export default function SettingsPage() {
  const { user, workspaceId } = useGlobalAuth();
  const { t, language, changeLanguage } = useTranslation();
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const handleThemeToggle = (enabled) => {
    setDarkMode(enabled);
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="p-[var(--spacing-md)] sm:p-[var(--spacing-lg)] max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[var(--font-size-2xl)] font-bold text-[var(--color-foreground-primary)]">
          {t('settings.title')}
        </h1>
        <p className="text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)] mt-[var(--spacing-sm)]">
          Gerencie as preferências do seu workspace
        </p>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1 mb-[var(--spacing-lg)]">
          <TabsTrigger value="branding" className="gap-2 py-[var(--spacing-sm)] text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)]">
            <Palette className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('settings.branding')}</span>
            <span className="sm:hidden">Marca</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="gap-2 py-[var(--spacing-sm)] text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)]">
            <Globe className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('settings.language')}</span>
            <span className="sm:hidden">Idioma</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 py-[var(--spacing-sm)] text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)]">
            <Sun className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('settings.theme')}</span>
            <span className="sm:hidden">Tema</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2 py-[var(--spacing-sm)] text-[var(--font-size-xs)] sm:text-[var(--font-size-sm)]">
            <User className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Conta</span>
            <span className="sm:hidden">Conta</span>
          </TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <div className="bg-[var(--color-background-secondary)] dark:bg-slate-800 rounded-xl border border-[var(--color-border-default)] p-[var(--spacing-md)] sm:p-[var(--spacing-lg)]">
            <BrandingSettings workspaceId={workspaceId} />
          </div>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language">
          <div className="bg-[var(--color-background-secondary)] dark:bg-slate-800 rounded-xl border border-[var(--color-border-default)] p-[var(--spacing-md)] sm:p-[var(--spacing-lg)] space-y-[var(--spacing-md)]">
            <div>
              <h3 className="text-base font-semibold text-[var(--color-foreground-primary)] mb-[var(--spacing-xs)]">
                Idioma da Interface
              </h3>
              <p className="text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)]">
                Escolha o idioma preferido para navegação
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-[var(--spacing-md)]">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all min-h-[70px] text-left ${
                    language === lang.code
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                  }`}
                  aria-pressed={language === lang.code}
                  aria-label={`Selecionar idioma ${lang.label}`}
                >
                  <span className="text-2xl" aria-hidden="true">{lang.flag}</span>
                  <div>
                    <p className={`font-medium text-sm ${
                      language === lang.code
                        ? 'text-blue-900 dark:text-blue-200'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {lang.label}
                    </p>
                    {language === lang.code && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">Ativo</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <div className="bg-[var(--color-background-secondary)] dark:bg-slate-800 rounded-xl border border-[var(--color-border-default)] p-[var(--spacing-md)] sm:p-[var(--spacing-lg)] space-y-[var(--spacing-lg)]">
            <div>
              <h3 className="text-base font-semibold text-[var(--color-foreground-primary)] mb-[var(--spacing-xs)]">
                Aparência
              </h3>
              <p className="text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)]">
                Personalize a experiência visual
              </p>
            </div>

            {/* Dark mode */}
            <div className="flex items-center justify-between p-[var(--spacing-md)] rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-[var(--color-border-default)]">
              <div className="flex items-center gap-[var(--spacing-md)]">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-[var(--color-interactive-default)]" aria-hidden="true" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-500" aria-hidden="true" />
                )}
                <div>
                  <Label className="font-medium cursor-pointer text-[var(--color-foreground-primary)]" htmlFor="dark-mode">
                    Modo Escuro
                  </Label>
                  <p className="text-[var(--font-size-xs)] text-[var(--color-foreground-muted)]">
                    {darkMode ? 'Tema escuro ativo' : 'Tema claro ativo'}
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={handleThemeToggle}
                aria-label="Ativar modo escuro"
              />
            </div>

            {/* Preview */}
            <div className="grid grid-cols-2 gap-[var(--spacing-md)]">
              <div
                className={`p-[var(--spacing-md)] rounded-xl border-2 cursor-pointer transition-all ${!darkMode ? 'border-[var(--color-interactive-default)] bg-[var(--color-background-tertiary)]' : 'border-[var(--color-border-default)] hover:border-slate-300'}`}
                onClick={() => handleThemeToggle(false)}
                role="button"
                tabIndex={0}
                aria-label="Modo claro"
                onKeyDown={(e) => e.key === 'Enter' && handleThemeToggle(false)}
              >
                <div className="bg-white rounded-lg p-3 border border-[var(--color-border-default)] mb-2">
                  <div className="h-2 bg-slate-200 rounded w-3/4 mb-1" />
                  <div className="h-2 bg-slate-100 rounded w-1/2" />
                </div>
                <p className="text-[var(--font-size-xs)] font-medium text-center text-[var(--color-foreground-primary)]">
                  Claro {!darkMode && '✓'}
                </p>
              </div>
              <div
                className={`p-[var(--spacing-md)] rounded-xl border-2 cursor-pointer transition-all ${darkMode ? 'border-[var(--color-interactive-default)] bg-slate-800' : 'border-[var(--color-border-default)] hover:border-slate-300'}`}
                onClick={() => handleThemeToggle(true)}
                role="button"
                tabIndex={0}
                aria-label="Modo escuro"
                onKeyDown={(e) => e.key === 'Enter' && handleThemeToggle(true)}
              >
                <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 mb-2">
                  <div className="h-2 bg-slate-700 rounded w-3/4 mb-1" />
                  <div className="h-2 bg-slate-800 rounded w-1/2" />
                </div>
                <p className="text-[var(--font-size-xs)] font-medium text-center text-slate-300">
                  Escuro {darkMode && '✓'}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <div className="bg-[var(--color-background-secondary)] dark:bg-slate-800 rounded-xl border border-[var(--color-border-default)] p-[var(--spacing-md)] sm:p-[var(--spacing-lg)] space-y-[var(--spacing-md)]">
            <div>
              <h3 className="text-base font-semibold text-[var(--color-foreground-primary)] mb-[var(--spacing-xs)]">
                Informações da Conta
              </h3>
            </div>
            <div className="space-y-[var(--spacing-md)]">
              <div className="flex items-center justify-between p-[var(--spacing-sm)] rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-[var(--color-border-default)]">
                <div>
                  <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-foreground-primary)]">Nome</p>
                  <p className="text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)]">{user?.full_name || '—'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-[var(--spacing-sm)] rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-[var(--color-border-default)]">
                <div>
                  <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-foreground-primary)]">Email</p>
                  <p className="text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)]">{user?.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-[var(--spacing-sm)] rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-[var(--color-border-default)]">
                <div>
                  <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-foreground-primary)]">Workspace</p>
                  <p className="text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)] font-mono text-[var(--font-size-xs)]">{workspaceId || '—'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-[var(--spacing-sm)] rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-[var(--color-border-default)]">
                <div>
                  <p className="text-[var(--font-size-sm)] font-medium text-[var(--color-foreground-primary)]">Role</p>
                  <p className="text-[var(--font-size-sm)] text-[var(--color-foreground-secondary)] capitalize">{user?.role || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}