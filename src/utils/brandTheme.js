// src/utils/brandTheme.js
// Utility to apply whitelabel brand theme with light/dark mode
import { clientConfigs } from '../config/clientConfig';
// Lazy JSON palette (will be replaced by remote fetch later)
let jsonPaletteCache = null;
async function loadJsonPalette() {
  if (jsonPaletteCache) return jsonPaletteCache;
  try {
    const mod = await import('../config/brandColors.json');
    jsonPaletteCache = mod.default || mod; // ESM/CJS interop
    return jsonPaletteCache;
  } catch (e) {
    console.warn('[brandTheme] Unable to load brandColors.json, falling back to clientConfigs', e);
    jsonPaletteCache = {};
    return jsonPaletteCache;
  }
}

export function resolveBrand(host) {
  const lower = host?.toLowerCase() || '';
  if (lower.includes('kikkin')) return 'kikkin';
  return 'mateo';
}

export async function applyBrandTheme(host, mode = 'light') {
  if (typeof document === 'undefined') return; // SSR safeguard
  const brandKey = resolveBrand(host);
  const jsonPalette = await loadJsonPalette();
  const sourceConfig = jsonPalette[brandKey]?.modes || clientConfigs[brandKey]?.modes;
  const config = sourceConfig?.[mode] || sourceConfig?.light;
  if (!config) return;
  const APPLY_KEYS = [
    ['--brand-primary', config.primaryColor],
    ['--brand-secondary', config.secondaryColor],
    ['--brand-background', config.backgroundColor],
    ['--brand-third', config.thirdColor],
    ['--brand-text-color', config.textColor],
    ['--brand-text-secondary', config.textSecondaryColor],
    ['--brand-accent', config.accentColor],
    ['--brand-border', config.borderColor || '#e2e8f0'],
    ['--brand-sidebar-bg', config.sidebarBg || config.backgroundColor],
    ['--brand-navbar', (config.navbarBg || config.backgroundColor)],
    ['--brand-hover', config.hover || '#f3f4f6'],
    ['--brand-button', config.button || '#A160E8'],
  ];

  const root = document.documentElement;
  APPLY_KEYS.forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute('data-theme-mode', mode);
  root.setAttribute('data-brand', brandKey);

  // Also override on any existing brand-scoped containers (.kikkin / .mateo) so their class CSS doesn't shadow root vars
  document.querySelectorAll('.kikkin, .mateo').forEach(el => {
    APPLY_KEYS.forEach(([k, v]) => el.style.setProperty(k, v));
  });
}

// Retrieve palette (sync wrapper with promise when preloaded) for components that need colors
export async function getBrandPalette(host, mode = 'light') {
  const brandKey = resolveBrand(host);
  const jsonPalette = await loadJsonPalette();
  const sourceConfig = jsonPalette[brandKey]?.modes || clientConfigs[brandKey]?.modes;
  const config = sourceConfig?.[mode] || sourceConfig?.light;
  if (!config) return {};
  // Ensure all expected keys exist
  const {
    primaryColor = '#6366f1',
    secondaryColor = '#ffffff',
    backgroundColor = '#ffffff',
    thirdColor = '#ffffff',
    textColor = '#1f2937',
    textSecondaryColor = 'rgba(0,0,0,0.55)',
    accentColor = '#fbb040',
    borderColor = '#1F3340',
    sidebarBg = backgroundColor,
    navbarBg = backgroundColor,
    hover = '#f3f4f6',
    button = '#A160E8',
    logoUrl = ''
  } = config;
  return { primaryColor, secondaryColor, backgroundColor, thirdColor, textColor, textSecondaryColor, accentColor, borderColor, sidebarBg, navbarBg, logoUrl, brandKey, mode };
}

export function getInitialMode() {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('ui.mode');
  if (stored === 'light' || stored === 'dark') return stored;
  // Use prefers-color-scheme as fallback
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'light' : 'dark';
}

export function toggleMode(current) {
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('ui.mode', next);
  // Broadcast a custom event so other components (e.g., sidebar Menu) can sync
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ui-mode-changed', { detail: next }));
    }
  } catch (e) {
    // noop
  }
  return next;
}
