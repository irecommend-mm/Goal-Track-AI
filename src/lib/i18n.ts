'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import en from '@/locales/en.json';
import my from '@/locales/my.json';

// Define the structure of your translations
type Translations = typeof en;

const translations = {
  en,
  my,
};

type Language = keyof typeof translations;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // This check ensures we only access localStorage on the client side.
    if (typeof window === 'undefined') {
      return;
    }
    const storedLang = localStorage.getItem('goal-track-ai-lang') as Language;
    if (storedLang && translations[storedLang]) {
      setLanguageState(storedLang);
      document.documentElement.lang = storedLang;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('goal-track-ai-lang', lang);
    setLanguageState(lang);
    document.documentElement.lang = lang;
  };

  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let result: any = translations[language];

    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing
        let fallbackResult: any = translations.en;
        for (const fk of keys) {
          fallbackResult = fallbackResult?.[fk];
        }
        result = fallbackResult !== undefined ? fallbackResult : key;
        break;
      }
    }
    
    let strResult = String(result);

    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            strResult = strResult.replace(`{${rKey}}`, String(replacements[rKey]));
        });
    }

    return strResult;
  }, [language]);

  const value = { language, setLanguage, t };

  return React.createElement(LanguageContext.Provider, { value }, children);
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
