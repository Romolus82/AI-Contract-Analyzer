import React, { useState } from 'react';
import { AnalysisResult, AnalysisPoint } from '../types';
import { Icon } from './Icon';
import { SourceModal } from './SourceModal';

interface ResultsDisplayProps {
  analysisResult: AnalysisResult;
  contractType: string;
  onAskAboutPoint: (text: string) => void;
}

const AnalysisSection: React.FC<{ title: string; points: AnalysisPoint[]; icon: 'thumbsUp' | 'thumbsDown'; color: 'green' | 'red'; onAskAboutPoint: (text: string) => void; }> = ({ title, points, icon, color, onAskAboutPoint }) => {
  const [modalContent, setModalContent] = useState<string | null>(null);

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
                <div className="flex items-center flex-shrink-0 ml-2 space-x-2">
                    {point.source && (
                       <button onClick={() => setModalContent(point.source)} className="text-gray-400 hover:text-indigo-600 transition-colors" aria-label="Mostra fonte">
                         <Icon name="info" className="h-5 w-5"/>
                       </button>
                    )}
                    <button onClick={() => onAskAboutPoint(point.description)} className="text-gray-400 hover:text-indigo-600 transition-colors" aria-label="Chiedi approfondimenti">
                        <Icon name="chatBubble" className="h-5 w-5"/>
                    </button>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="mt-4 text-gray-500">{`Nessun ${title.toLowerCase()} specifico è stato identificato.`}</p>}
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
  const { pros, cons } = analysisResult;

  return (
    <div>
       <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Risultati dell'Analisi per: <span className="text-indigo-600">{contractType}</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <AnalysisSection title="Punti a Favore (Pro)" points={pros} icon="thumbsUp" color="green" onAskAboutPoint={onAskAboutPoint} />
        <div className="py-4 md:border-l md:pl-8 border-gray-200">
          <AnalysisSection title="Punti di Attenzione (Contro)" points={cons} icon="thumbsDown" color="red" onAskAboutPoint={onAskAboutPoint} />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
         <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <Icon name="warning" className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Disclaimer</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Questa analisi è generata da un'intelligenza artificiale e deve essere considerata come un supporto informativo, non come una consulenza legale. Si consiglia vivamente di consultare un avvocato qualificato per una revisione completa e professionale del contratto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
