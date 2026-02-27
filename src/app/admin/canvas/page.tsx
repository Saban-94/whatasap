'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, Database, Zap, Globe, Sparkles, 
  Sun, Moon, MessageCircle, Calculator, Info, RotateCcw, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { processSmartOrder } from '@/lib/dataEngine'; // המנוע עם לוגיקת החיזוי

export default function SabanAICanvas() {
  const [query, setQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false); // ברירת מחדל בהירה
  const [isThinking, setIsThinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chat, setChat] = useState<{role: 'user' | 'ai', content: string, data?: any, forecast?: any[]}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // מילות מפתח מהדאטה המקצועי
  const quickKeywords = [
    { label: "חישוב ריצוף 60/60", query: "כמה קרטונים ל-40 מטר ריצוף?" },
    { label: "מלאי סיקה 107", query: "מה מצב המלאי של סיקה 107?" },
    { label: "חישוב בלוק 10", query: "חשב לי בלוקים לקיר 5x3" },
    { label: "דבק תרמוקיר מומלץ", query: "איזה דבק תרמוקיר הכי מתאים?" }
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!isThinking) inputRef.current?.focus();
  }, [chat, isThinking]);

  const handleAction = async (inputQuery?: string) => {
    const finalQuery = inputQuery || query;
    if (!finalQuery.trim()) return;
    
    setChat(prev => [...prev, { role: 'user', content: finalQuery }]);
    setQuery('');
    setIsThinking(true);
    setIsTyping(false);

    // שליפה מהמוח המאוחד כולל חיזוי (Forecast)
    const result = await processSmartOrder("ADMIN", finalQuery);
    
    // סימולציית חשיבה אנושית
    setTimeout(() => {
      setChat(prev => [...prev, { 
        role: 'ai', 
        content: result.text, 
        data: result.orderList,
        forecast: result.predictionList // הוספת נתוני החיזוי
      }]);
      setIsThinking(false);
    }, 1800);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 font-sans ${isDarkMode ? 'bg-[#0b141a] text-white' : 'bg-[#fdfcf5] text-[#002e5d]'}`} dir="rtl">
      
      {/* Header יוקרתי (לבן/כחול סבן) */}
      <header className={`h-20 border-b flex items-center justify-between px-6 md:px-10 backdrop-blur-xl sticky top-0 z-[100] ${isDarkMode ? 'border-white/5 bg-[#111b21]/80' : 'border-[#002e5d]/5 bg-white/95'}`}>
        <div className="flex items-center gap-4">
          <img src="/1000211660.jpg" className="w-12 h-12 rounded-xl shadow-inner border border-[#002e5d]/10" alt="Saban Logo" />
          <div>
            <h1 className="font-black text-xl tracking-tighter leading-none">AI-סבן קנבס Pro</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-2 h-2 bg-[#00a884] rounded-full animate-ping" />
              <span className="text-[10px] text-[#00a884] font-bold uppercase tracking-widest">Master Brain Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setChat([])} className="p-2.5 rounded-xl hover:bg-gray-500/10 text-gray-400 transition-all"><RotateCcw size={20} /></button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-[#00a884]/10 text-[#00a884]' : 'bg-[#002e5d]/10 text-[#002e5d]'}`}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full p-4 md:p-8 flex flex-col min-h-[calc(100vh-80px)] pb-40">
        
        {/* אזור הדיאלוג והכדור הנושם המרכזי */}
        <div className="flex-1 space-y-12 py-10">
          {chat.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 md:py-20 text-center">
              
              {/* כדור נושם, זז ומגיב ויזואלית (כחול סבן/ירוק) */}
              <div className="relative w-64 h-64 flex items-center justify-center mb-16 transition-all duration-500">
                {/* הילת נשימה היקפית */}
                <div className={`absolute inset-0 rounded-full blur-[100px] transition-all duration-1000 ${
                  isThinking ? 'bg-[#00a884] opacity-30 animate-pulse' : 
                  isTyping ? 'bg-[#00a884] opacity-20 animate-[pulse_2s_linear_infinite]' : 
                  'bg-[#002e5d] opacity-10 animate-[pulse_5s_ease-in-out_infinite]'
                }`} />
                
                {/* הכדור המרכזי שנע ויזואלית */}
                <div className={`relative z-10 w-48 h-48 rounded-full border-4 p-2 transition-all duration-500 transform ${
                  isThinking ? 'border-[#00a884] scale-110 rotate-[360deg] animate-[spin_10s_linear_infinite]' : 
                  isTyping ? 'border-[#00a884]/60 scale-105 shadow-[0_0_60px_rgba(0,168,132,0.3)]' : 
                  'border-[#002e5d]/20 scale-100 shadow-2xl'
                }`}>
                  <img src="/1000211661.jpg" className="w-full h-full rounded-full object-cover shadow-inner" alt="AI Avatar" />
                </div>
              </div>
              
              <div className="space-y-4 mb-16 max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">היועץ ההנדסי שלך <br/> מבית ח. סבן</h2>
                <p className="text-gray-600 font-medium text-lg">המערכת מחוברת למאגר הנתונים המאוחד, מלאי חי ומחשבוני פחת</p>
              </div>

              {/* מילות מפתח - גישה מהירה (כחול סבן) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl px-4">
                {quickKeywords.map((kw, i) => (
                  <button 
                    key={i} onClick={() => handleAction(kw.query)}
                    className={`flex items-center justify-between p-6 rounded-3xl border transition-all active:scale-95 group shadow-sm ${isDarkMode ? 'bg-[#1c272d] border-white/5 hover:border-[#00a884]/40' : 'bg-white border-[#002e5d]/5 hover:border-[#002e5d]/30 hover:shadow-xl'}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl transition-colors ${isDarkMode ? 'bg-[#00a884]/10 text-[#00a884]' : 'bg-[#002e5d]/5 text-[#002e5d]'} group-hover:bg-[#00a884] group-hover:text-white`}>
                        <Calculator size={22} />
                      </div>
                      <span className="font-bold text-sm md:text-base">{kw.label}</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-[#00a884] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* הודעות צ'אט */}
          {chat.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'} space-y-5 animate-in fade-in slide-in-from-bottom-5 duration-300`}>
              <div className={`max-w-[85%] p-6 md:p-8 rounded-[2.5rem] shadow-xl ${
                msg.role === 'user' 
                ? (isDarkMode ? 'bg-[#202c33] border border-white/5' : 'bg-white border border-[#002e5d]/5 text-[#002e5d]') 
                : 'bg-[#00a884] text-white rounded-tr-none'
              }`}>
                <p className="text-base md:text-lg leading-relaxed font-semibold whitespace-pre-wrap">{msg.content}</p>
              </div>

              {/* כרטיסי חיזוי (AI Forecast) - ברירת מחדל בהירה */}
              {msg.forecast && msg.forecast.length > 0 && (
                <div className="w-full max-w-3xl mt-6 space-y-4 animate-in fade-in slide-in-from-right duration-500">
                  <h4 className="text-[#00a884] text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-3 px-4">
                    <Zap size={16} /> תחזית חומרים משלימים והנחיות (AI Forecast)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {msg.forecast.map((p: any, idx: number) => (
                      <div key={idx} className={`p-5 rounded-3xl border flex gap-4 items-start ${isDarkMode ? 'bg-[#1c272d] border-white/5' : 'bg-white border-[#00a884]/20 shadow-md'}`}>
                        <CheckCircle2 size={20} className="text-[#00a884] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-[#002e5d]'}`}>{p.item}</p>
                          <p className="text-[10px] text-gray-500 mt-2 font-medium italic">{p.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* כרטיסי מוצר ויזואליים */}
              {msg.data && msg.data.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl mt-6">
                  {msg.data.map((item: any, idx: number) => (
                    <div key={idx} className={`flex gap-5 p-6 rounded-3xl border transition-all ${isDarkMode ? 'bg-[#1c272d] border-white/5 hover:border-[#00a884]' : 'bg-white border-[#002e5d]/5 shadow-lg hover:border-[#002e5d]/20'}`}>
                      <img src={item.image || "/avattar.png"} className="w-24 h-24 object-contain bg-black/5 rounded-2xl p-2" alt={item.name} />
                      <div className="flex-1 space-y-2.5">
                        <h4 className={`font-black text-lg ${isDarkMode ? 'text-[#00a884]' : 'text-[#002e5d]'}`}>{item.name}</h4>
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">SKU: {item.sku}</p>
                        <div className="flex justify-between items-end pt-3">
                          <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-[#002e5d]'}`}>₪{item.price}</span>
                          <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${isDarkMode ? 'bg-[#00a884]/10 text-[#00a884]' : 'bg-[#002e5d]/5 text-[#002e5d]'}`}>זמין במלאי: {item.available}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* אפקט חשיבה אקטיבי (מרכז המסך) */}
          {isThinking && (
            <div className="flex justify-center items-center gap-5 animate-pulse py-10">
              <span className="text-sm font-black text-[#00a884] uppercase tracking-[0.2em]">מבצע חישוב וסורק מלאי...</span>
              <div className="w-14 h-14 rounded-full border-4 border-[#00a884] p-1.5 shadow-[0_0_30px_rgba(0,168,132,0.3)]">
                <img src="/1000211661.jpg" className="rounded-full animate-[spin_3s_linear_infinite]" alt="AI Thinking" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* שורת קלט מעוצבת כאפליקציה (כחול סבן/ירוק) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 md:px-6 z-[100]">
          <div className={`p-3 rounded-[3rem] border shadow-[0_25px_70px_-10px_rgba(0,0,0,0.4)] flex items-center gap-3 backdrop-blur-2xl transition-all duration-300 ${isDarkMode ? 'bg-[#1c272d]/95 border-white/10 focus-within:border-[#00a884]' : 'bg-white/95 border-[#002e5d]/10 focus-within:border-[#00a884] focus-within:shadow-2xl'}`}>
            <div className={`p-5 rounded-full transition-all duration-300 ${isTyping ? 'bg-[#00a884] text-white shadow-lg' : 'bg-transparent text-gray-400'}`}>
              <MessageCircle size={26} />
            </div>
            <input 
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setIsTyping(e.target.value.length > 0); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAction()}
              placeholder="שאל את היועץ על חישובי ריצוף, בלוקים או מלאי חי..." 
              className={`flex-1 bg-transparent outline-none text-base md:text-lg font-semibold py-4 px-2 placeholder:font-medium ${isDarkMode ? 'placeholder:text-gray-600' : 'placeholder:text-gray-400'}`}
              disabled={isThinking}
            />
            <button 
              onClick={() => handleAction()}
              disabled={isThinking || !query.trim()}
              className="bg-[#00a884] hover:bg-[#06cf9c] p-5 rounded-full text-white shadow-xl transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
            >
              <Send size={26} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
