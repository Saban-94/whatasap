'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Send, 
  Database, 
  Info, 
  Package, 
  Zap,
  MessageSquare
} from 'lucide-react';

export default function SabanAICanvas() {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleAsk = async () => {
    if (!query.trim()) return;

    const userMsg = { role: 'user' as const, content: query };
    setChat(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    // סימולציית תגובה מהמלאי
    setTimeout(() => {
      setChat(prev => [...prev, { 
        role: 'ai', 
        content: `על פי המלאי של סבן הנדסה: סיקה 107 קיים במלאי (42 יחידות). מחירון VIP שלך: 85 ש"ח לשק. האם תרצה להוסיף להזמנה?` 
      }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-white font-sans flex flex-col" dir="rtl">
      
      {/* Header */}
      <header className="h-20 border-b border-gray-800 flex items-center justify-between px-8 bg-[#111b21]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#00a884] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00a884]/20">
            <MessageSquare size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">AI-ח.סבן CANVAS</h1>
            <p className="text-[10px] text-[#00a884] font-bold tracking-widest">Knowledge Engine v2.0</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-gray-400 text-[10px] font-bold uppercase">
          <div className="flex items-center gap-2"><Database size={14} /> Database Sync: OK</div>
          <div className="flex items-center gap-2 text-[#00a884]"><Zap size={14} /> AI Processing: Active</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col relative">
        <div className="flex-1 space-y-6 mb-32 pt-4">
          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30 py-24 border-2 border-dashed border-gray-800 rounded-3xl">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                 <Search size={40} className="text-gray-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold italic mb-2 text-white">שאל את גימני הכל על המלאי והידע של סבן</h2>
                <p className="text-xs max-w-xs mx-auto">חיפוש חכם ב-products.json, inventory.json ו-technical_knowledge.json</p>
              </div>
            </div>
          )}

          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] p-5 rounded-3xl shadow-2xl ${
                msg.role === 'user' 
                ? 'bg-[#202c33] border border-gray-700 rounded-tr-none' 
                : 'bg-[#005c4b] text-white rounded-tl-none border-b-4 border-emerald-400/30'
              }`}>
                <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] font-bold">
                  {msg.role === 'user' ? <Users size={12} /> : <Zap size={12} />}
                  {msg.role === 'user' ? 'ראמי' : 'גימני AI'}
                </div>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-end items-center gap-2 italic text-[10px] text-[#00a884] font-bold animate-pulse">
              גימני סורק את המוח הלוגיסטי... <Zap size={12} />
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Floating Input */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
          <div className="bg-[#1c272d] p-2 rounded-[2.5rem] border border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-2">
            <div className="p-4 text-gray-500"><Info size={20} /></div>
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="שאל אותי על סיקה, מחירים, או כמה נשאר במלאי..." 
              className="flex-1 bg-transparent outline-none text-sm py-4 px-2 placeholder:text-gray-600"
            />
            <button 
              onClick={handleAsk}
              className="bg-[#00a884] hover:bg-[#06cf9c] p-4 rounded-full text-white transition-all shadow-lg active:scale-95"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// תיקון ה-Props לגרסת ה-Build
function Users({ size, className }: { size: number, className?: string }) {
  return <Package size={size} className={className} />;
}

function ZapIconCustom({ size, className }: { size: number, className?: string }) {
  return <Zap size={size} className={className} />;
}
