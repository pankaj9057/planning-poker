import { useState, useEffect, useCallback } from 'react';
import { LANGUAGES } from '../constants';
import { translations, type Language, type TranslationKey } from '../i18n/translations';

export const useLanguage = () => {
  const [lang, setLang] = useState<Language>('en'); // Default to English

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang && savedLang in LANGUAGES) {
      setLang(savedLang as Language);
    } else {
      // Simple browser language detection
      const browserLang = navigator.language.split('-')[0];
      if (browserLang in LANGUAGES) {
        setLang(browserLang as Language);
      }
    }
  }, []);

  const t = useCallback((key: string): string => {
    const typedKey = key as TranslationKey;
    return translations[lang]?.[typedKey] || translations['en'][typedKey] || key;
  }, [lang]);

  const setLanguage = (newLang: string) => {
    if (newLang in LANGUAGES) {
      setLang(newLang as Language);
      localStorage.setItem('language', newLang);
    }
  };

  return { lang, t, setLanguage };
};
