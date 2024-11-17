import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '@/utils/api-client';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Message, SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent, Voice } from './types';
import { languages, adjustTextAreaHeight, findVoiceForLanguage } from './utils';

const AIchatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = selectedLanguage;
  
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setInput(transcript);
        };
  
        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error', event.error);
        };
  
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
  
      synthRef.current = window.speechSynthesis;
      const loadVoices = () => {
        const availableVoices = synthRef.current?.getVoices() || [];
        setVoices(availableVoices);
        setSelectedVoice(findVoiceForLanguage(availableVoices, selectedLanguage));
      };
  
      if (synthRef.current?.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
  
      loadVoices();
    }
  }, [selectedLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;
  
    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
  
    try {
      const response = await sendChatMessage(input);
      const botMessage: Message = { text: response, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, botMessage]);
      if (isSpeaking) {
        speakMessage(response, messages.length + 1);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { text: 'Sorry, there was an error processing your request.', sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextAreaHeight(textAreaRef);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang;
    }
    setSelectedVoice(findVoiceForLanguage(voices, newLang));
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVoice = voices.find(voice => voice.name === e.target.value);
    setSelectedVoice(newVoice || null);
  };

  const speakMessage = (text: string, messageId: number) => {
    if (synthRef.current && selectedVoice) {
      if (speakingMessageId !== null) {
        synthRef.current.cancel();
      }
      if (speakingMessageId === messageId) {
        setSpeakingMessageId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.lang = selectedLanguage;

      utterance.onend = () => {
        console.log('Speech finished');
        setSpeakingMessageId(null);
      };

      synthRef.current.speak(utterance);
      setSpeakingMessageId(messageId);
    }
  };

  return (
    <div className="fixed bottom-[10vh] right-4 z-50">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
          aria-label="Open chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-xl w-96 h-[32rem] flex flex-col">
          <div className="flex justify-between items-center p-3 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">AI Chatbot</h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-200 transition-colors duration-200" aria-label="Close chat">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-grow overflow-y-auto p-3 bg-gray-900">
            {messages.map((message, index) => (
              <div key={index} className={`mb-3 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                  {message.text}
                  {message.sender === 'bot' && (
                    <button
                      onClick={() => speakMessage(message.text, index)}
                      className={`ml-2 text-gray-400 hover:text-gray-200 transition-colors duration-200 ${speakingMessageId === index ? 'text-blue-400' : ''}`}
                      aria-label={speakingMessageId === index ? "Stop speaking" : "Speak message"}
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t border-gray-700">
            <div className="flex mb-2">
              <select
                value={selectedLanguage}
                onChange={handleLanguageChange}
                className="bg-gray-700 text-white p-2 rounded mr-2 flex-grow"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <div className="relative flex-grow">
                <select
                  value={selectedVoice?.name}
                  onChange={handleVoiceChange}
                  className="bg-gray-700 text-white p-2 rounded w-full appearance-none"
                >
                  {voices.filter(voice => voice.lang.startsWith(selectedLanguage.split('-')[0])).map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col">
                <textarea
                  ref={textAreaRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask a question..."
                  className="w-full bg-gray-700 text-white border border-gray-600 p-2 mb-2 rounded placeholder-gray-400 resize-none overflow-hidden"
                  disabled={isLoading}
                  rows={1}
                />
                <div className="flex justify-between items-center">
                  <div>
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`bg-gray-700 text-white p-2 rounded hover:bg-gray-600 transition-colors duration-200 mr-2 ${isListening ? 'bg-red-600 hover:bg-red-700' : ''}`}
                      aria-label={isListening ? "Stop listening" : "Start listening"}
                    >
                      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIchatbot;