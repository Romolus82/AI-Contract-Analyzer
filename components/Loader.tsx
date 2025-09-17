import React from 'react';

type AnalysisStep = 'IDLE' | 'IDENTIFYING' | 'ANALYZING';

interface LoaderProps {
  analysisStep: AnalysisStep;
  contractType: string | null;
}

export const Loader: React.FC<LoaderProps> = ({ analysisStep, contractType }) => {
  const messages: Record<AnalysisStep, string> = {
    IDLE: 'In attesa...',
    IDENTIFYING: 'Identificazione del tipo di contratto in corso...',
    ANALYZING: `L'IA sta diventando un esperto di ${contractType || 'contratti'} e sta analizzando il documento...`,
  };

  const message = messages[analysisStep] || messages.IDENTIFYING;

  return (
    <div className="flex flex-col justify-center items-center p-8 text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-6"></div>
      <p className="text-lg font-semibold text-gray-700">{message}</p>
      <p className="text-sm text-gray-500 mt-2">Questa operazione potrebbe richiedere alcuni istanti.</p>
    </div>
  );
};
