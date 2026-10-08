/**
 * Utilitário de tema — converte cor primária (hex) em cadência completa
 * de variáveis CSS (HSL) para os modos claro e escuro, e aplica ao documento.
 *
 * "Expandir a cadência de cores" = a partir de uma única cor primária,
 * derivar todas as vars relacionadas (primary, ring, accent, sidebar-*)
 * em ambos os temas, mantendo coerência visual.
 */

/** Converte hex (#RRGGBB) para HSL [H, S, L] (0-360, 0-100, 0-100) */
function hexToHsl(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }

  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

const hsl = (h, s, l) => `${h} ${s}% ${l}%`;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/**
 * Gera todas as CSS vars derivadas da cor primária para um modo.
 * @param {string} hex — cor primária em hex (#RRGGBB)
 * @param {'light'|'dark'} mode
 * @returns {Record<string, string>} mapa var → valor HSL
 */
export function generateThemeVars(hex, mode) {
  const [h, s, l] = hexToHsl(hex);

  if (mode === 'dark') {
    const dPrimary = hsl(h, s, clamp(l + 8, 35, 72));
    const dPrimaryFg = hsl(h, s, clamp(l - 32, 8, 16));
    const dAccent = hsl(h, Math.round(s * 0.3), clamp(l - 28, 14, 24));
    const dAccentFg = hsl(h, s, clamp(l + 14, 60, 80));
    return {
      '--primary': dPrimary,
      '--primary-foreground': dPrimaryFg,
      '--ring': dPrimary,
      '--accent': dAccent,
      '--accent-foreground': dAccentFg,
      '--sidebar-primary': dPrimary,
      '--sidebar-primary-foreground': dPrimaryFg,
      '--sidebar-accent': dAccent,
      '--sidebar-accent-foreground': dAccentFg,
      '--sidebar-ring': dPrimary,
    };
  }

  // Modo claro
  const primary = hsl(h, s, l);
  const primaryFg = l > 58 ? hsl(h, s, clamp(l - 42, 8, 20)) : '0 0% 100%';
  const accent = hsl(h, Math.round(s * 0.55), clamp(l + 42, 90, 97));
  const accentFg = hsl(h, s, clamp(l - 14, 25, 48));
  return {
    '--primary': primary,
    '--primary-foreground': primaryFg,
    '--ring': primary,
    '--accent': accent,
    '--accent-foreground': accentFg,
    '--sidebar-primary': primary,
    '--sidebar-primary-foreground': primaryFg,
    '--sidebar-accent': accent,
    '--sidebar-accent-foreground': accentFg,
    '--sidebar-ring': primary,
  };
}

/**
 * Aplica a cadência completa de cores da marca ao documento.
 * Usa uma <style> dinâmica com seletores :root e .dark para que
 * a cascata funcione naturalmente com o modo escuro.
 *
 * @param {string} hex — cor primária (#RRGGBB)
 */
export function applyBrandTheme(hex) {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return;

  const lightVars = generateThemeVars(hex, 'light');
  const darkVars = generateThemeVars(hex, 'dark');

  let style = document.getElementById('brand-theme');
  if (!style) {
    style = document.createElement('style');
    style.id = 'brand-theme';
    document.head.appendChild(style);
  }

  const lightRules = Object.entries(lightVars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  const darkRules = Object.entries(darkVars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');

  style.textContent = `:root {\n${lightRules}\n}\n.dark {\n${darkRules}\n}`;
}
