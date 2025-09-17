import React, { useState } from 'react';
import { AnalysisResult, AnalysisPoint, Score } from '../types';
import { Icon } from './Icon';
import { SourceModal } from './SourceModal';
import { useTranslation } from '../i18n/LanguageContext';

interface ResultsDisplayProps {
  analysisResult: AnalysisResult;
  contractType: string;
  onAskAboutPoint: (text: string) => void;
}

const ScoreBadge: React.FC<{ score: Score; type: 'pro' | 'con' }> = ({ score, type }) => {
  const { t } = useTranslation();
  const proColorMap: Record<Score, string> = {
    'Alto': 'bg-green-200 text-green-800 ring-green-600/20',
    'Medio': 'bg-green-100 text-green-700 ring-green-600/10',
    'Basso': 'bg-gray-100 text-gray-600 ring-gray-500/10',
  };
  const conColorMap: Record<Score, string> = {
    'Alto': 'bg-red-200 text-red-800 ring-red-600/20',
    'Medio': 'bg-orange-100 text-orange-800 ring-orange-600/20',
    'Basso': 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
  };
  const color = type === 'pro' ? proColorMap[score] : conColorMap[score];
  
  const scoreKey = `scores.${score.toLowerCase()}` as keyof typeof t;
  const translatedScore = t(scoreKey);

  return (
    <span className={`inline-flex flex-shrink-0 items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${color}`}>
      {translatedScore}
    </span>
  );
};

const AnalysisSection: React.FC<{ title: string; points: AnalysisPoint[]; icon: 'thumbsUp' | 'thumbsDown'; type: 'pro' | 'con'; onAskAboutPoint: (text: string) => void; noPointsText: string; }> = ({ title, points, icon, type, onAskAboutPoint, noPointsText }) => {
  const [modalContent, setModalContent] = useState<string | null>(null);
  const { t } = useTranslation();

  const hasPoints = points && points.length > 0;
  const textColor = type === 'pro' ? 'text-green-700' : 'text-red-700';

  return (
    <>
      <div className="py-4">
        <h3 className={`text-lg font-semibold leading-6 ${textColor} flex items-center`}>
          <Icon name={icon} className="h-6 w-6 mr-2 flex-shrink-0" />
          {title}
        </h3>
        {hasPoints ? (
          <ul role="list" className="mt-4 space-y-4 text-gray-700">
            {points.map((point, index) => (
              <li key={`${type}-${index}`} className="flex flex-col sm:flex-row sm:items-start">
                <div className="flex-grow">
                  <div className="flex items-center mb-1 sm:mb-0">
                     <ScoreBadge score={point.score} type={type} />
                  </div>
                  <p className="mt-1 sm:mt-2">{point.description}</p>
                </div>
                <div className="flex items-center flex-shrink-0 sm:ml-4 mt-2 sm:mt-0 space-x-2 no-print self-start">
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
  
  // Define score order and sort the points
  const scoreOrder: Record<Score, number> = { 'Alto': 3, 'Medio': 2, 'Basso': 1 };
  
  const sortedPros = [...pros].sort((a, b) => (scoreOrder[b.score] || 0) - (scoreOrder[a.score] || 0));
  const sortedCons = [...cons].sort((a, b) => (scoreOrder[b.score] || 0) - (scoreOrder[a.score] || 0));

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
            points={sortedPros} 
            icon="thumbsUp" 
            type="pro" 
            onAskAboutPoint={onAskAboutPoint} 
            noPointsText={t('results.noPoints', { pointsType: t('results.prosTitleSimple')})}
        />
        <div className="py-4 md:border-l md:pl-8 border-gray-200">
          <AnalysisSection 
            title={t('results.consTitle')} 
            points={sortedCons} 
            icon="thumbsDown" 
            type="con" 
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