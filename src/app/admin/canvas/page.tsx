'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Database, Zap, Globe, Sparkles, Sun, Moon, MessageCircle } from 'lucide-react';
import { processSmartOrder } from '@/lib/dataEngine';

export default function SabanAICanvas() {
  const [query, setQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chat, setChat] = useState<{role: 'user' | 'ai', content: string, data?: any}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isThinking]);

  const handleAction = async () => {
    if (!query.trim()) return;
    
    const userMsg = query;
    setChat(prev => [...prev, { role: 'user', content: userMsg }]);
    setQuery('');
    setIsThinking(true);
    setIsTyping(false);

    // שליפה חכמה: קובץ מקומי -> רשת (Gemini API)
    const result = await processSmartOrder("ADMIN", userMsg);
    
    // סימולציית "חשיבה" אנושית
    setTimeout(() => {
      setChat(prev => [...prev, { 
        role: 'ai', 
        content: result.text, 
        data: result.orderList 
      }]);
      setIsThinking(false);
    }, 1500);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#0b141a] text-white' : 'bg-gray-50 text-gray-900'}`} dir="rtl">
      
      {/* Header ממותג */}
      <header className={`h-16 border-b flex items-center justify-between px-6 backdrop-blur-md sticky top-0 z-50 ${isDarkMode ? 'border-gray-800 bg-[#111b21]/80' : 'border-gray-200 bg-white/80'}`}>
        <div className="flex items-center gap-3">
          <img src="/1000211660.jpg" className="w-8 h-8 rounded shadow-sm" alt="Logo" />
          <span className="font-black tracking-tighter text-sm uppercase">Saban AI Intelligence</span>
        </div>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-gray-500/10 transition-all">
          {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600" />}
        </button>
      </header>

      {/* אזור הדיאלוג */}
      <main className="max-w-4xl mx-auto w-full p-4 flex flex-col min-h-[calc(100vh-64px)]">
        
        <div className="flex-1 space-y-8 py-8">
          {chat.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <div className={`w-32 h-32 rounded-full mb-6 relative ${isTyping ? 'animate-pulse' : ''}`}>
                 <img src="/1000211661.jpg" className="rounded-full border-2 border-[#00a884] shadow-[0_0_50px_rgba(0,168,132,0.2)]" />
              </div>
              <h2 className="text-2xl font-black italic">היי ראמי, במה המוח של סבן יכול לעזור?</h2>
              <p className="text-xs mt-2 uppercase tracking-widest">Local Knowledge • AI Calculations • Global Search</p>
            </div>
          )}

          {chat.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-4`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                ? (isDarkMode ? 'bg-[#202c33]' : 'bg-white border border-gray-200') 
                : 'bg-[#00a884] text-white'
              }`}>
                <p className="text-md leading-relaxed">{msg.content}</p>
              </div>
              
              {/* כרטיסי נתונים - שליפה מהקובץ המאוחד */}
              {msg.data && msg.data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 w-full max-w-md">
                  {msg.data.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20 flex items-center gap-3">
                      <img src={item.image || "/avattar.png"} className="w-12 h-12 object-contain rounded-lg bg-black/20" />
                      <div>
                        <p className="text-xs font-bold leading-none">{item.name}</p>
                        <p className="text-[10px] opacity-70 mt-1">₪{item.price} | מלאי: {item.available}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* אפקט חושב (Thinking Indicator) */}
          {isThinking && (
            <div className="flex justify-end items-center gap-3 animate-pulse">
              <span className="text-[10px] font-bold text-[#00a884] uppercase tracking-tighter">היועץ מעבד נתונים מהמלאי...</span>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#00a884]">
                <img src="/1000211661.jpg" className="animate-spin-slow" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* שורת קלט חכמה */}
        <div className="sticky bottom-6 w-full pt-4">
          <div className={`p-2 rounded-full border shadow-2xl flex items-center gap-2 transition-all ${isDarkMode ? 'bg-[#1c272d] border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`p-3 rounded-full transition-colors ${isTyping ? 'text-[#00a884]' : 'text-gray-500'}`}>
              <MessageCircle size={24} />
            </div>
            <input 
              value={query}
              onChange={(e) => { setQuery(e.target.value); setIsTyping(e.target.value.length > 0); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAction()}
              placeholder="שאל אותי הכל... 'כמה קרטונים ל-20 מטר?' או 'מידע על סיקה'"
              className="flex-1 bg-transparent outline-none text-md py-3 px-2"
            />
            <button onClick={handleAction} className="bg-[#00a884] hover:bg-[#06cf9c] p-4 rounded-full text-white transition-all active:scale-95 shadow-lg">
              <Send size={24} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
