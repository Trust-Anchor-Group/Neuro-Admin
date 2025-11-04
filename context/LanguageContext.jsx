"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { content } from '../translations';
export { content };

function getDefaultLanguage() {
  try {
    const lang = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : '';
    if (lang.startsWith('pt')) return 'pt';
    if (lang.startsWith('fr')) return 'fr';
    return 'en';
  } catch {
    return 'en';
  }
}

export const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // Initialize from localStorage if available to preserve selection across full reloads
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('language');
      if (stored) return stored;
    }
    return getDefaultLanguage();
  });

  // Persist changes
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

