import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Icon } from './Icon';

interface ChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  history: ChatMessage[];
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  onPermissionResponse: (granted: boolean) => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ isOpen, onClose, history, isLoading, input, setInput, onSendMessage, onPermissionResponse }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [history, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 w-full max-w-md h-[500px] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 z-50 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
      {/* Header */}
      <div className="relative flex-shrink-0 p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg flex items-center justify-center">
        <h3 className="text-lg font-semibold text-gray-800">Chat con il Documento</h3>
         <button
          onClick={onClose}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          aria-label="Chiudi chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>


      {/* Messages */}
      <div className="flex-grow p-4 overflow-y-auto bg-gray-100/50">
        <div className="space-y-4">
          {history.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'model' && (
                <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100">
                  <Icon name="document" className="h-5 w-5 text-indigo-600" />
                </span>
              )}
               {msg.role === 'user' && (
                 <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-slate-600">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                    </svg>
                 </span>
              )}
              <div className={`p-3 rounded-lg max-w-xs md:max-w-sm ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-800 border'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                {msg.isPermissionRequest && !isLoading && (
                   <div className="mt-3 flex gap-2">
                     <button onClick={() => onPermissionResponse(true)} className="flex-1 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-indigo-200 transition-colors">
                       Sì, cerca sul web
                     </button>
                     <button onClick={() => onPermissionResponse(false)} className="flex-1 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors">
                       No, grazie
                     </button>
                   </div>
                )}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-500 mb-2">Fonti:</h4>
                      <ul className="space-y-1.5">
                        {msg.sources.map((source, i) => (
                           <li key={i} className="flex items-start">
                             <span className="text-gray-400 mr-2 text-xs">&#8226;</span>
                             <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline truncate">
                               {source.title || source.uri}
                             </a>
                           </li>
                        ))}
                      </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-3">
                <span className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100">
                  <Icon name="document" className="h-5 w-5 text-indigo-600" />
                </span>
                <div className="p-3 rounded-lg bg-white text-gray-800 border">
                    <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
	                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
	                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-3 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Chiedi qualcosa sul contratto..."
            className="w-full p-2 pr-12 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition"
            rows={2}
            disabled={isLoading || !!history.find(m => m.isPermissionRequest)}
          />
          <button
            onClick={onSendMessage}
            disabled={isLoading || !input.trim() || !!history.find(m => m.isPermissionRequest)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
            aria-label="Invia messaggio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 3.105a.75.75 0 0 1 .842-.292l12.5 5a.75.75 0 0 1 0 1.374l-12.5 5A.75.75 0 0 1 3 14.5V4.25a.75.75 0 0 1 .105-.345Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};