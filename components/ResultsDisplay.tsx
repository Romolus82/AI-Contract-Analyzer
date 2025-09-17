import React, { useState } from 'react';
import { AnalysisResult, AnalysisPoint } from '../types';
import { Icon } from './Icon';
import { SourceModal } from './SourceModal';
import { useTranslation } from '../i18n/LanguageContext';

interface ResultsDisplayProps {
  analysisResult: AnalysisResult;
  contractType: string;
  onAskAboutPoint: (text: string) => void;
}

const AnalysisSection: React.FC<{ title: string; points: AnalysisPoint[]; icon: 'thumbsUp' | 'thumbsDown'; color: 'green' | 'red'; onAskAboutPoint: (text: string) => void; noPointsText: string; }> = ({ title, points, icon, color, onAskAboutPoint, noPointsText }) => {
  const [modalContent, setModalContent] = useState<string | null>(null);
  const { t } = useTranslation();

  const hasPoints = points && points.length > 0;
  const textColor = `text-${color}-700`;
  const iconColor = `text-${color}-500`;

  return (
    <>
      <div className="py-4">
        <h3 className={`text-lg font-semibold leading-6 ${textColor} flex items-center`}>
          <Icon name={icon} className="h-6 w-6 mr-2 flex-shrink-0" />
          {title}
        </h3>
        {hasPoints ? (
          <ul role="list" className="mt-4 space-y-3 text-gray-700">
            {points.map((point, index) => (
              <li key={`${color}-${index}`} className="flex items-start">
                <span className={`${iconColor} mr-3 mt-1 text-xl flex-shrink-0`} aria-hidden="true">{icon === 'thumbsUp' ? '+' : '-'}</span>
                <span className="flex-grow">{point.description}</span>
                <div className="flex items-center flex-shrink-0 ml-2 space-x-2 no-print">
                    {point.source && (
                       <button onClick={() => setModalContent(point.source)} className="text-gray-400 hover:text-indigo-600 transition-colors" aria-label={t('results.showSourceAria')}>
                         <Icon name="info" className="h-5 w-5"/>
                       </button>
                    )}
                    <button onClick={() => onAskAboutPoint(point.description)} className="text-gray-400 hover:text-indigo-600 transition-colors" aria-label={t('results.askDetailsAria')}>
                        <Icon name="chatBubble" className="h-5 w-5"/>
                    </button>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="mt-4 text-gray-500">{noPointsText}</p>}
      </div>
      <SourceModal 
        isOpen={!!modalContent}
        onClose={() => setModalContent(null)}
        content={modalContent || ''}
      />
    </>
  );
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ analysisResult, contractType, onAskAboutPoint }) => {
  const { t } = useTranslation();
  const { summary, evaluation, pros, cons } = analysisResult;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="printable-area">
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('results.title')}<span className="text-indigo-600">{contractType}</span>
          </h2>
          <button
            onClick={handlePrint}
            className="no-print flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
            aria-label={t('results.printReport')}
          >
            <Icon name="print" className="h-5 w-5" />
            <span>{t('results.printReport')}</span>
          </button>
       </div>

      <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('results.summaryTitle')}</h3>
          <p className="text-sm text-gray-600">{summary}</p>
      </div>

      <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('results.evaluationTitle')}</h3>
          <blockquote className="border-l-4 border-indigo-500 bg-indigo-50 p-4">
            <p className="font-medium text-indigo-800">{evaluation}</p>
          </blockquote>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <AnalysisSection 
            title={t('results.prosTitle')} 
            points={pros} 
            icon="thumbsUp" 
            color="green" 
            onAskAboutPoint={onAskAboutPoint} 
            noPointsText={t('results.noPoints', { pointsType: t('results.prosTitleSimple')})}
        />
        <div className="py-4 md:border-l md:pl-8 border-gray-200">
          <AnalysisSection 
            title={t('results.consTitle')} 
            points={cons} 
            icon="thumbsDown" 
            color="red" 
            onAskAboutPoint={onAskAboutPoint} 
            noPointsText={t('results.noPoints', { pointsType: t('results.consTitleSimple')})}
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 pt-6 border-t border-gray-200 no-print">
         <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <Icon name="warning" className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">{t('results.disclaimerTitle')}</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  {t('results.disclaimerText')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};