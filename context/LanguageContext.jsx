"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { content } from '../translations';
export { content };

const SUPPORTED_LANGUAGES = new Set(['en', 'pt', 'fr']);

function detectBrowserLanguage() {
  if (typeof navigator === 'undefined') return null;

  const candidates = [];

  if (Array.isArray(navigator.languages) && navigator.languages.length) {
    candidates.push(...navigator.languages);
  }

  if (navigator.language) {
    candidates.push(navigator.language);
  }

  for (const candidate of candidates) {
    const normalized = candidate?.toLowerCase?.();
    if (!normalized) continue;
    const base = normalized.split('-')[0];
    if (SUPPORTED_LANGUAGES.has(base)) return base;
  }

  return null;
}

function getDefaultLanguage() {
  try {
    return detectBrowserLanguage() ?? 'en';
  } catch {
    return 'en';
  }
}

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('language');
      if (SUPPORTED_LANGUAGES.has(stored)) return stored;
    }
    return getDefaultLanguage();
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('language', language);
      }
    } catch {/* ignore persistence errors */}
  }, [language]);

  const toggleLanguage = () =>
    setLanguage((prev) => {
      if (prev === 'en') return 'pt';
      if (prev === 'pt') return 'fr';
      return 'en';
    });

  const value = { language, setLanguage, toggleLanguage, content };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}

export default LanguageProvider;
