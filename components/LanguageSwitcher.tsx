import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { Icon } from './Icon';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', icon: 'flagUk' as const },
    { code: 'it', name: 'Italiano', icon: 'flagIt' as const },
  ];

  return (
    <div className="flex items-center space-x-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity ${
            language === lang.code ? 'opacity-100 ring-2 ring-indigo-500' : 'opacity-50 hover:opacity-100'
          }`}
          aria-label={`Switch to ${lang.name}`}
        >
          <Icon name={lang.icon} className="h-6 w-6 rounded-full" />
        </button>
      ))}
    </div>
  );
};
