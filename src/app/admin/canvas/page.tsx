'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, Database, Zap, Globe, Sparkles, 
  Sun, Moon, MessageCircle, Calculator, Info, RotateCcw, ChevronRight 
} from 'lucide-react';
import { processSmartOrder } from '@/lib/dataEngine';

export default function SabanAICanvas() {
  const [query, setQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chat, setChat] = useState<{role: 'user' | 'ai', content: string, data?: any}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // מילות מפתח ושאלות נפוצות שנשלפות מהדאטה
  const quickKeywords = [
    { label: "חישוב ריצוף", query: "כמה קרטונים ל-30 מטר ריצוף 60/60?" },
    { label: "בדיקת מלאי", query: "מה מצב המלאי של סיקה 107?" },
    { label: "חישוב בלוקים", query: "חשב לי בלוקים לקיר בגובה 3 מטר ואורך 10" },
    { label: "מדריך דבקים", query: "איזה דבק תרמוקיר הכי מומלץ?" }
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isThinking]);

  const handleAction = async (inputQuery?: string) => {
    const finalQuery = inputQuery || query;
    if (!finalQuery.trim()) return;
    
    setChat(prev => [...prev, { role: 'user', content: finalQuery }]);
    setQuery('');
    setIsThinking(true);
    setIsTyping(false);

    // שליפה מהמוח המאוחד
    const result = await processSmartOrder("ADMIN", finalQuery);
    
    setTimeout(() => {
      setChat(prev => [...prev, { role: 'ai', content: result.text, data: result.orderList }]);
      setIsThinking(false);
    }, 1500);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-[#0b141a] text-white' : 'bg-[#f0f2f5] text-gray-900'}`} dir="rtl">
      
      {/* Header יוקרתי עם לוגו ח.סבן */}
      <header className={`h-20 border-b flex items-center justify-between px-8 backdrop-blur-xl sticky top-0 z-[100] ${isDarkMode ? 'border-white/5 bg-[#111b21]/80' : 'border-black/5 bg-white/80'}`}>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#00a884] blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <img src="/1000211660.jpg" className="w-12 h-12 rounded-xl relative z-10 shadow-lg" alt="Saban Logo" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter leading-none">AI-סבן קנבס</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-[#00a884] rounded-full animate-ping" />
              <span className="text-[10px] text-[#00a884] font-bold uppercase tracking-widest">Master Brain Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setChat([])} className="p-2.5 rounded-xl hover:bg-gray-500/10 text-gray-400 transition-all"><RotateCcw size={20} /></button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-xl bg-[#00a884]/10 text-[#00a884] transition-all">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full p-6 flex flex-col min-h-[calc(100vh-80px)]">
        
        {/* אזור הדיאלוג והנשימה */}
        <div className="flex-1 space-y-10 py-10">
          {chat.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-56 h-56 flex items-center justify-center mb-10">
                {/* אפקט הנשימה המונפש */}
                <div className="absolute inset-0 bg-[#00a884] opacity-10 blur-[80px] animate-[pulse_4s_ease-in-out_infinite] rounded-full" />
                <div className="relative z-10 w-44 h-44 rounded-full border-4 border-[#00a884]/30 p-2 animate-[pulse_6s_ease-in-out_infinite]">
                  <img src="/1000211661.jpg" className={`w-full h-full rounded-full object-cover shadow-2xl transition-transform duration-700 ${isTyping ? 'scale-110' : 'scale-100'}`} alt="AI Avatar" />
                </div>
              </div>
              
              <div className="text-center space-y-3 mb-12">
                <h2 className="text-4xl font-black tracking-tight">איך אוכל לסייע לך הנדסית?</h2>
                <p className="text-gray-500 font-medium">המערכת מחוברת למחירוני ח. סבן, מלאי חי ומחשבוני פחת</p>
              </div>

              {/* מילות מפתח - כפתורים מעוצבים */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                {quickKeywords.map((kw, i) => (
                  <button 
                    key={i} onClick={() => handleAction(kw.query)}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all active:scale-95 group ${isDarkMode ? 'bg-[#1c272d] border-white/5 hover:border-[#00a884]/40' : 'bg-white border-black/5 hover:shadow-xl'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#00a884]/10 text-[#00a884] rounded-xl group-hover:bg-[#00a884] group-hover:text-white transition-colors">
                        <Calculator size={20} />
                      </div>
                      <span className="font-bold text-sm">{kw.label}</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* הודעות צ'אט */}
          {chat.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'} space-y-4 animate-in fade-in slide-in-from-bottom-5`}>
              <div className={`max-w-[80%] p-6 rounded-[2rem] shadow-xl ${
                msg.role === 'user' 
                ? (isDarkMode ? 'bg-[#202c33] border border-white/5' : 'bg-white border border-black/5') 
                : 'bg-[#00a884] text-white rounded-tr-none'
              }`}>
                <p className="text-lg leading-relaxed font-medium whitespace-pre-wrap">{msg.content}</p>
              </div>

              {/* כרטיסי מוצר מהנתונים */}
              {msg.data && msg.data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {msg.data.map((item: any, idx: number) => (
                    <div key={idx} className={`flex gap-5 p-5 rounded-3xl border ${isDarkMode ? 'bg-[#1c272d] border-white/5' : 'bg-white border-black/5 shadow-lg'}`}>
                      <img src={item.image || "/avattar.png"} className="w-20 h-20 object-contain bg-black/5 rounded-2xl" />
                      <div className="flex-1 space-y-2">
                        <h4 className="font-black text-[#00a884]">{item.name}</h4>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xl font-black">₪{item.price}</span>
                          <span className="text-[10px] font-bold px-2 py-1 bg-[#00a884]/10 rounded-md">זמין במלאי: {item.available}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* אפקט חשיבה מונפש */}
          {isThinking && (
            <div className="flex justify-end items-center gap-4 animate-pulse">
              <span className="text-xs font-black text-[#00a884] uppercase tracking-widest">מבצע חישוב וסורק מלאי...</span>
              <div className="w-12 h-12 rounded-full border-2 border-[#00a884] p-1">
                <img src="/1000211661.jpg" className="rounded-full animate-spin-slow" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* שורת קלט מעוצבת */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-[100]">
          <div className={`p-2.5 rounded-[3rem] border shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex items-center gap-3 backdrop-blur-2xl transition-all duration-300 ${isDarkMode ? 'bg-[#1c272d]/90 border-white/10 focus-within:border-[#00a884]' : 'bg-white/90 border-black/10 focus-within:border-[#00a884]'}`}>
            <div className={`p-4 rounded-full transition-all ${isTyping ? 'bg-[#00a884] text-white' : 'bg-transparent text-gray-500'}`}>
              <MessageCircle size={24} />
            </div>
            <input 
              value={query}
              onChange={(e) => { setQuery(e.target.value); setIsTyping(e.target.value.length > 0); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAction()}
              placeholder="שאל את גימני על חישובי ריצוף, בלוקים או מלאי..." 
              className="flex-1 bg-transparent outline-none text-base font-medium py-4 px-2"
            />
            <button 
              onClick={() => handleAction()}
              className="bg-[#00a884] hover:bg-[#06cf9c] p-5 rounded-full text-white shadow-xl transition-all active:scale-95"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
