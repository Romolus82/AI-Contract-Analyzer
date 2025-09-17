import React, { useRef } from 'react';
import { Icon } from './Icon';
import { useTranslation } from '../i18n/LanguageContext';

interface ContractInputProps {
  contractText: string;
  setContractText: (text: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  file: File | null;
  setFile: (file: File | null) => void;
  clearFile: () => void;
}

export const ContractInput: React.FC<ContractInputProps> = ({ contractText, setContractText, onAnalyze, isLoading, file, setFile, clearFile }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label
        htmlFor="file-upload"
        className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer transition-colors duration-200"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Icon name="upload" className="mx-auto h-12 w-12 text-gray-400" />
        <span className="mt-2 block text-sm font-semibold text-gray-900">
          {t('contractInput.dropzoneTitle')}
        </span>
        <span className="block text-xs text-gray-500">{t('contractInput.dropzoneSubtitle')}</span>
        <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.docx,.png,.jpg,.jpeg"/>
      </label>
      
       {file && (
        <div className="mt-4 rounded-md bg-indigo-50 p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Icon name="file" className="h-5 w-5 text-indigo-500" aria-hidden="true" />
              <p className="ml-3 text-sm font-medium text-indigo-800 truncate">{file.name}</p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
            >
              {t('contractInput.removeFile')}
            </button>
          </div>
        </div>
      )}

      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-slate-50 px-2 text-sm text-gray-500">{t('contractInput.or')}</span>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="contract-text" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
          {t('contractInput.pasteLabel')}
        </label>
        <textarea
          id="contract-text"
          rows={8}
          className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-200"
          placeholder={t('contractInput.pastePlaceholder')}
          value={contractText}
          onChange={(e) => setContractText(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading || (!contractText.trim() && !file)}
          className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? t('contractInput.analyzingButton') : t('contractInput.analyzeButton')}
        </button>
      </div>
    </div>
  );
};
