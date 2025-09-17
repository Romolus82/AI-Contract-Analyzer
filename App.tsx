import React, { useState, useCallback } from 'react';
import type { Chat } from "@google/genai";
import { ContractInput } from './components/ContractInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Loader } from './components/Loader';
import { ErrorMessage } from './components/ErrorMessage';
import { ChatBox } from './components/ChatBox';
import { ChatOpener } from './components/ChatOpener';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { identifyContractType, analyzeContract, startChatWithDocument, performWebSearchForQuery } from './services/geminiService';
import { fileToGenerativePart, extractTextFromDocx } from './utils';
import { AnalysisResult, ChatMessage } from './types';
import { Icon } from './components/Icon';
import { useTranslation } from './i18n/LanguageContext';

type AnalysisStep = 'IDLE' | 'IDENTIFYING' | 'ANALYZING';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [contractText, setContractText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('IDLE');
  const [contractType, setContractType] = useState<string | null>(null);
  const [documentLanguage, setDocumentLanguage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [permissionRequest, setPermissionRequest] = useState<{ originalQuery: string } | null>(null);


  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setContractType(null);
    setDocumentLanguage(null);
    setChatSession(null);
    setChatHistory([]);

    try {
      let content: any;
      if (file) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (fileExtension === 'docx') {
          content = await extractTextFromDocx(file);
        } else if (['png', 'jpg', 'jpeg', 'pdf'].includes(fileExtension || '')) {
           const filePart = await fileToGenerativePart(file);
           content = { parts: [filePart] };
        } else {
          throw new Error("Unsupported file type. Please upload a DOCX, PDF, PNG, or JPG file.");
        }
      } else if (contractText.trim()) {
        content = contractText;
      } else {
        throw new Error("Please provide a contract by uploading a file or pasting the text.");
      }

      setAnalysisStep('IDENTIFYING');
      const identification = await identifyContractType(content);

      if (!identification.isContract) {
        throw new Error(`The provided document does not appear to be a contract. The AI classified it as: "${identification.contractType}".`);
      }
      setContractType(identification.contractType);
      setDocumentLanguage(identification.language);

      setAnalysisStep('ANALYZING');
      const result = await analyzeContract(content, identification.contractType, identification.language);
      setAnalysisResult(result);
      
      // Start chat session after successful analysis
      const chat = startChatWithDocument(content, identification.contractType, identification.language);
      setChatSession(chat);
      setChatHistory([{ role: 'model', text: t('app.initialChatMessage') }]);


    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setAnalysisStep('IDLE');
    }
  }, [contractText, file, t]);
  
  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim() || !chatSession || isChatLoading) return;

    const userQuery = chatInput;
    const userMessage: ChatMessage = { role: 'user', text: userQuery };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userQuery });
      
      if (response.text.trim() === '[PERFORM_WEB_SEARCH]') {
        setPermissionRequest({ originalQuery: userQuery });
        const permissionMessage: ChatMessage = {
          role: 'model',
          text: "I couldn't find an answer in the document. Can I search the web for you?",
          isPermissionRequest: true,
        };
        setChatHistory(prev => [...prev, permissionMessage]);
      } else {
        const modelMessage: ChatMessage = { role: 'model', text: response.text };
        setChatHistory(prev => [...prev, modelMessage]);
      }
    } catch (e) {
      console.error("Error sending chat message:", e);
      const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, an error occurred. Please try again.' };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatInput, chatSession, isChatLoading]);
  
  const handlePermissionResponse = useCallback(async (granted: boolean) => {
    if (!permissionRequest || !documentLanguage) return;

    // Remove the permission request message
    setChatHistory(prev => prev.filter(msg => !msg.isPermissionRequest));

    if (!granted) {
      const denialMessage: ChatMessage = {
        role: 'model',
        text: "Understood. I will not perform the search. Is there anything else I can look for in the document for you?",
      };
      setChatHistory(prev => [...prev, denialMessage]);
      setPermissionRequest(null);
      return;
    }

    setIsChatLoading(true);
    setPermissionRequest(null);
    try {
      const { text, sources } = await performWebSearchForQuery(permissionRequest.originalQuery, chatHistory, documentLanguage);
      const webResponseMessage: ChatMessage = {
        role: 'model',
        text: text,
        sources: sources,
      };
      setChatHistory(prev => [...prev, webResponseMessage]);
    } catch (e) {
        console.error("Error handling permission response:", e);
        const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, an error occurred during the web search.' };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsChatLoading(false);
    }

  }, [permissionRequest, chatHistory, documentLanguage]);

  const askAboutPoint = (text: string) => {
    setChatInput(`Can you give me more details about this point? "${text}"`);
    setIsChatOpen(true);
  };

  const resetState = () => {
    setContractText('');
    setFile(null);
    setIsLoading(false);
    setError(null);
    setAnalysisResult(null);
    setAnalysisStep('IDLE');
    setContractType(null);
    setDocumentLanguage(null);
    setChatSession(null);
    setChatHistory([]);
    setChatInput('');
    setIsChatLoading(false);
    setPermissionRequest(null);
    setIsChatOpen(false);
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
       <div className="absolute top-4 right-4 z-10 no-print">
          <LanguageSwitcher />
        </div>
      <div className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-10 no-print">
          <Icon name="document" className="mx-auto h-12 w-12 text-indigo-600"/>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {t('app.title')}
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            {t('app.subtitle')}
          </p>
        </header>

        <main className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          {!analysisResult && !isLoading && !error && (
            <ContractInput
              contractText={contractText}
              setContractText={setContractText}
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              file={file}
              setFile={setFile}
              clearFile={() => setFile(null)}
            />
          )}

          {isLoading && <Loader analysisStep={analysisStep} contractType={contractType} />}

          {error && !isLoading && (
            <>
              <ErrorMessage message={error} />
              <div className="mt-6 flex justify-end">
                 <button
                  type="button"
                  onClick={resetState}
                  className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {t('app.tryAgain')}
                </button>
              </div>
            </>
          )}

          {analysisResult && !isLoading && !error && contractType && (
            <div>
              <ResultsDisplay analysisResult={analysisResult} contractType={contractType} onAskAboutPoint={askAboutPoint}/>
               <div className="mt-8 border-t pt-6 flex justify-end no-print">
                 <button
                  type="button"
                  onClick={resetState}
                  className="rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  {t('app.analyzeAnother')}
                </button>
              </div>
            </div>
          )}
        </main>
        
        <footer className="text-center mt-12 text-sm text-gray-500 no-print">
          <p>{t('app.footer', { year: new Date().getFullYear() })}</p>
          <p className="mt-1">{t('app.poweredBy')}</p>
        </footer>
      </div>

      {analysisResult && !error && chatSession && !isChatOpen && (
        <ChatOpener onClick={() => setIsChatOpen(true)} />
      )}

      {analysisResult && !error && chatSession && (
        <ChatBox
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          history={chatHistory}
          isLoading={isChatLoading}
          input={chatInput}
          setInput={setChatInput}
          onSendMessage={handleSendMessage}
          onPermissionResponse={handlePermissionResponse}
        />
      )}
    </div>
  );
};

export default App;