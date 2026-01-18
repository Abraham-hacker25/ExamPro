
import React, { useState, useRef, useEffect } from 'react';
import { getTutorResponse } from '../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'USER' | 'AI';
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your ExamPro AI Tutor. Ask me anything about your subjects, or ask me to explain a topic in a simple way!",
      sender: 'AI',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'USER',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getTutorResponse(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response || "I'm sorry, I couldn't process that. Can you try again?",
        sender: 'AI',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Explain photosynthesis simply",
    "JAMB Math Trigonometry tips",
    "How to prepare for WAEC English",
    "Quiz me on Chemistry Acids"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-120px)] bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
      <div className="p-4 border-b bg-indigo-600 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
          <div>
            <h3 className="font-bold font-heading">AI Study Tutor</h3>
            <p className="text-[10px] uppercase tracking-widest opacity-80">Always Active</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              msg.sender === 'USER' 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-slate-100 text-slate-800 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <p className="text-[10px] mt-1 opacity-50 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex space-x-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {messages.length < 3 && !isLoading && (
        <div className="p-4 pt-0">
          <p className="text-xs text-slate-400 mb-2 px-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button 
                key={s} 
                onClick={() => setInput(s)}
                className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1.5 rounded-full border border-slate-200 transition-all font-medium"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t bg-slate-50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your question here..."
            className="flex-1 bg-white border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 text-white p-3 rounded-2xl disabled:opacity-50 transition-all shadow-lg hover:bg-indigo-700"
          >
            <svg className="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
