'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { getSabanSmartResponse } from '@/app/actions/gemini-brain';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatWidget({ customerId = "guest_1" }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // גלילה אוטומטית לסוף הצ'אט בכל הודעה חדשה
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // קריאה למנוע של גימני (ח. סבן)
      const response = await getSabanSmartResponse(input, customerId);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto bg-[#0b141a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header - בסגנון ווטסאפ */}
      <div className="bg-[#202c33] p-4 flex items-center gap-3 border-b border-gray-700">
        <div className="w-10 h-10 rounded-full bg-[#075e54] flex items-center justify-center">
          <Bot className="text-white w-6 h-6" />
        </div>
        <div>
          <h2 className="text-white font-bold text-sm">גימני - ח. סבן</h2>
          <p className="text-green-400 text-xs">מחובר - מומחה לוגיסטי</p>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-90"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm shadow-md ${
              msg.sender === 'user' 
                ? 'bg-[#005c4b] text-white rounded-tr-none' 
                : 'bg-[#202c33] text-white rounded-tl-none'
            }`}>
              {msg.text}
              <div className="text-[10px] text-gray-400 mt-1 text-left">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#202c33] text-white p-3 rounded-lg animate-pulse text-xs">
              גימני מקליד...
            </div>
          </div>
        )}
      </div>

      {/* Input Area - השדה המעוגל של ווטסאפ */}
      <div className="bg-[#202c33] p-3 flex items-center gap-2">
        <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="כתוב הודעה..."
            className="w-full bg-transparent text-white outline-none text-sm placeholder-gray-500"
          />
        </div>
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={`p-3 rounded-full flex items-center justify-center transition-all ${
            input.trim() ? 'bg-[#00a884] hover:bg-[#008f72]' : 'bg-gray-600 opacity-50'
          }`}
        >
          <Send className="text-white w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
