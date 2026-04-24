'use client';

import { useState, useEffect } from 'react';
import { translations, Locale } from '@/lib/translations';

export function useI18n() {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    // Détection de la langue du navigateur
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'fr') {
      setLocale('fr');
    } else {
      setLocale('en'); // Par défaut anglais pour tout le reste
    }
  }, []);

  const t = (key: keyof typeof translations['en']) => {
    return translations[locale][key] || translations['en'][key];
  };

  return { t, locale };
}
