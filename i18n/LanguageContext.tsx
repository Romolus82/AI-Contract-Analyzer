import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Define the shape of the context
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define the provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(navigator.language.startsWith('it') ? 'it' : 'en');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch(`/i18n/locales/${language}.json`);
        if (!response.ok) {
          throw new Error(`Could not load ${language}.json`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Failed to fetch translations:", error);
        // Fallback to English if the selected language file is not found
        if (language !== 'en') {
          setLanguage('en');
        }
      }
    };

    fetchTranslations();
  }, [language]);

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let result = keys.reduce((acc, currentKey) => {
      // Ensure acc is an object before trying to access a property on it
      if (acc && typeof acc === 'object' && !Array.isArray(acc)) {
        return (acc as any)[currentKey];
      }
      return undefined;
    }, translations);
    
    if (result === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return the key itself as a fallback
    }

    if (options) {
      Object.keys(options).forEach(optionKey => {
        const regex = new RegExp(`{{${optionKey}}}`, 'g');
        result = result.replace(regex, String(options[optionKey]));
      });
    }

    return result;
  }, [translations]);
  
  const value = { language, setLanguage, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
