
import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

type AnalysisStep = 'IDLE' | 'IDENTIFYING' | 'ANALYZING';

interface LoaderProps {
  analysisStep: AnalysisStep;
  contractType: string | null;
}

export const Loader: React.FC<LoaderProps> = ({ analysisStep, contractType }) => {
  const { t } = useTranslation();
  
  const messages: Record<AnalysisStep, string> = {
    IDLE: t('loader.waiting'),
    IDENTIFYING: t('loader.identifying'),
    ANALYZING: t('loader.analyzing', { contractType: contractType || t('loader.contractsFallback') }),
  };

  const message = messages[analysisStep] || messages.IDENTIFYING;

  return (
    <div
      className="flex flex-col justify-center items-center p-8 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-6"></div>
      <p className="text-lg font-semibold text-gray-700">{message}</p>
      <p className="text-sm text-gray-500 mt-2">{t('loader.takeMoments')}</p>
    </div>
  );
};
