import { useState, useEffect } from 'react';
import { translationsData, Language, TranslationKeys } from '../data/translations';

export const useTranslations = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('portugal');
  const [translations, setTranslations] = useState(translationsData.portugal);

  // Detectar idioma do browser
  const detectBrowserLanguage = (): Language => {
    if (typeof window === 'undefined') return 'portugal';
    
    const browserLang = navigator.language.toLowerCase();
    
    if (browserLang.startsWith('en')) return 'england';
    if (browserLang.startsWith('es')) return 'spain';
    if (browserLang.startsWith('fr')) return 'france';
    
    return 'portugal'; // Default
  };

  // Carregar idioma salvo ou detectar automaticamente
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage') as Language;
    
    if (savedLanguage && translationsData[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
      setTranslations(translationsData[savedLanguage]);
    } else {
      // Sempre usar português como padrão, não detectar automaticamente
      setCurrentLanguage('portugal');
      setTranslations(translationsData.portugal);
      localStorage.setItem('selectedLanguage', 'portugal');
    }
  }, []);

  // Função para mudar idioma
  const changeLanguage = (language: Language) => {
    if (translationsData[language]) {
      setCurrentLanguage(language);
      setTranslations(translationsData[language]);
      localStorage.setItem('selectedLanguage', language);
    }
  };

  // Função para obter tradução
  const t = (key: TranslationKeys): string => {
    return translations[key] || translationsData.portugal[key] || key;
  };

  return {
    currentLanguage,
    translations,
    changeLanguage,
    t
  };
};
