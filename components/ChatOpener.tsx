import React from 'react';
import { Icon } from './Icon';
import { useTranslation } from '../i18n/LanguageContext';

interface ChatOpenerProps {
  onClick: () => void;
}

export const ChatOpener: React.FC<ChatOpenerProps> = ({ onClick }) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-110"
      aria-label={t('chat.openAria')}
    >
      <Icon name="chatBubble" className="h-8 w-8" />
    </button>
  );
};
