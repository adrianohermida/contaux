/**
 * Tema global para Contaux
 * Cores, tipografia, espaçamentos e breakpoints
 */

export const colors = {
  // Primary
  primary: '#2563eb',
  primaryDark: '#1e40af',
  primaryLight: '#3b82f6',

  // Neutrals
  white: '#ffffff',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',

  // Semantic
  success: '#16a34a',
  warning: '#ea580c',
  error: '#dc2626',
  info: '#0284c7',

  // Text
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textTertiary: '#94a3b8',

  // Background
  bgPrimary: '#ffffff',
  bgSecondary: '#f8fafc',
  bgTertiary: '#f1f5f9',
};

export const typography = {
  h1: 'text-5xl font-bold leading-tight',
  h2: 'text-4xl font-bold leading-snug',
  h3: 'text-3xl font-bold leading-snug',
  h4: 'text-2xl font-bold leading-relaxed',
  h5: 'text-xl font-semibold leading-relaxed',
  h6: 'text-lg font-semibold leading-relaxed',
  body: 'text-base font-normal leading-relaxed',
  bodySm: 'text-sm font-normal leading-relaxed',
  bodyXs: 'text-xs font-normal leading-relaxed',
  display: 'text-6xl font-bold leading-tight',
  label: 'text-sm font-semibold',
  labelSm: 'text-xs font-semibold uppercase tracking-wider',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

export const breakpoints = {
  mobile: 375,
  mobileLarge: 768,
  tablet: 1024,
  desktop: 1440,
  ultrawide: 1920,
};

export const accessibility = {
  tapTarget: '48px',
  focusOutline: '2px solid',
  focusOutlineOffset: '2px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
};

export const transitions = {
  fast: '150ms ease-in-out',
  base: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};

export default {
  colors,
  typography,
  spacing,
  breakpoints,
  accessibility,
  shadows,
  transitions,
};