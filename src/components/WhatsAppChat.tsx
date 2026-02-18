'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Paperclip, Smile } from 'lucide-react';
import { getSabanSmartResponse } from '@/app/actions/gemini-brain';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function WhatsAppChat({ customerId = "guest_saban" }) {
  const [messages, setMessages] = useState<Message[]>([]);
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
      // קריאה למנוע של גימני עם רוטציית המפתחות
      const response = await getSabanSmartResponse(input, customerId);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response || "אחי, יש רגע עומס. תנסה שוב בעוד כמה שניות.",
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
    <div className="flex flex-col h-[600px] w-full max-w-md mx-auto bg-[#0b141a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl font-sans" dir="rtl">
      {/* Header */}
      <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#075e54] flex items-center justify-center border border-gray-600">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">גימני - ח. סבן</h2>
            <p className="text-[#8696a0] text-xs font-medium">מחובר (AI המחסן)</p>
          </div>
        </div>
      </div>

      {/* Messages Area - תיקון הסטייל כדי למנוע שגיאת Build */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a] relative"
      >
        {/* שכבת רקע עם שקיפות תקינה */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none" 
          style={{ 
            backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, 
            backgroundRepeat: 'repeat' 
          }}
        />
        
        <div className="relative z-10 flex flex-col gap-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`relative max-w-[85%] p-2 px-3 rounded-lg text-[14.2px] shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-[#005c4b] text-[#e9edef] rounded-tl-none' 
                  : 'bg-[#202c33] text-[#e9edef] rounded-tr-none'
              }`}>
                {msg.text}
                <div className="text-[10px] text-[#8696a0] mt-1 text-left">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-end relative z-10">
              <div className="bg-[#202c33] text-[#e9edef] p-2 px-3 rounded-lg animate-pulse text-xs font-medium border border-gray-700">
                גימני מקליד...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-[#202c33] p-2 px-3 flex items-center gap-2 relative z-20">
        <div className="flex gap-3 text-[#8696a0]">
          <Smile size={24} className="cursor-pointer hover:text-white transition-colors" />
          <Paperclip size={24} className="cursor-pointer hover:text-white transition-colors rotate-45" />
        </div>
        
        <div className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2 flex items-center shadow-inner">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="כתוב הודעה לגימני..."
            className="w-full bg-transparent text-[#e9edef] outline-none text-sm placeholder-[#8696a0]"
          />
        </div>

        <button 
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={`p-2.5 rounded-full flex items-center justify-center transition-all shadow-md ${
            input.trim() ? 'bg-[#00a884] text-white' : 'text-[#8696a0]'
          }`}
        >
          <Send size={20} className={input.trim() ? "fill-current" : ""} />
        </button>
      </div>
    </div>
  );
}
