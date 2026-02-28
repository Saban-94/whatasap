'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Zap, Loader2, MessageSquare, Database, RefreshCw, Info, ExternalLink } from 'lucide-react';
import { processSmartOrder } from '@/lib/dataEngine';

export default function SabanAICanvasMobile() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    if (response) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [response]);

  const handleAction = async (forcedQuery?: string) => {
    const activeQuery = forcedQuery || query;
    if (!activeQuery.trim() || loading) return;
    
    setLoading(true);
    if (inputRef.current) inputRef.current.blur();

    try {
      const result = await processSmartOrder(activeQuery);
      setResponse(result);
    } catch (e) {
      console.error("AI Interface Error:", e);
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 bg-[#0b141a] text-white flex flex-col font-sans overflow-hidden select-none" dir="rtl">
      
      {/* Header */}
      <header className="h-16 border-b border-gray-800/60 flex items-center justify-between px-6 bg-[#111b21]/95 backdrop-blur-2xl z-[100] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#00a884] to-[#005c4b] rounded-xl flex items-center justify-center font-black text-lg shadow-lg">ס</div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tighter leading-none uppercase italic">Saban AI</h1>
            <span className="text-[8px] text-[#00a884] font-bold tracking-[0.2em] mt-1 uppercase">Advanced Knowledge</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {response && (
             <button onClick={() => setResponse(null)} className="p-2 bg-gray-800/50 rounded-full active:scale-90 transition-transform">
               <RefreshCw size={14} />
             </button>
           )}
           <span className="flex items-center gap-1.5 font-bold text-[10px] text-gray-500">
             <div className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-pulse" /> LIVE
           </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto p-5 pb-36 touch-pan-y">
        
        {/* Orb Visualization */}
        {!response && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-60">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-dashed border-[#00a884]/30 rounded-full animate-spin-custom" />
              <div className="w-40 h-40 bg-gradient-to-tr from-[#00a884] to-[#0b141a] rounded-full shadow-[0_0_60px_rgba(0,168,132,0.3)] flex items-center justify-center border-4 border-[#111b21] animate-pulse">
                <img src="/avattar.png" className="w-24 h-24 object-contain" alt="Saban" />
              </div>
            </div>
            <p className="mt-8 text-gray-500 font-bold text-xs tracking-widest animate-pulse uppercase">Saban Brain Active</p>
          </div>
        )}

        {/* AI Responses */}
        {response && (
          <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`bg-[#1c272d] border ${response.type === 'extended' ? 'border-[#00a884]/50' : 'border-gray-800'} p-6 rounded-[2rem] shadow-xl relative overflow-hidden`}>
              <div className="flex items-center gap-2 text-[#00a884] mb-3 text-[10px] font-black uppercase tracking-wider">
                <Zap size={12} /> {response.source}
              </div>
              <p className="text-lg leading-relaxed font-medium text-gray-100 whitespace-pre-wrap">{response.text}</p>
              
              {/* כפתור "פרטים נוספים" חכם */}
              {response.source !== 'Gemini 3.1 Pro + Google Search' && (
                <button 
                  onClick={() => handleAction(`פרטים נוספים על השאלה האחרונה`)}
                  className="mt-4 flex items-center gap-2 bg-[#00a884]/10 text-[#00a884] px-4 py-2 rounded-full text-xs font-black hover:bg-[#00a884]/20 transition-all border border-[#00a884]/30"
                >
                  <Info size={14} /> לחץ לקבלת פרטים נוספים ומדיה
                </button>
              )}
            </div>

            {/* Product List */}
            {response.orderList?.map((item: any) => (
              <div key={item.id} className="bg-[#111b21] rounded-3xl border border-gray-800 overflow-hidden flex flex-col shadow-lg">
                <div className="h-48 bg-white p-4 flex items-center justify-center relative">
                  <img src={item.image || "/avattar.png"} className="h-full object-contain" alt={item.name} />
                  <div className="absolute top-3 right-3 bg-[#00a884] text-white text-[9px] font-black px-2 py-1 rounded-md">מלאי זמין</div>
                </div>
                <div className="p-4 flex justify-between items-center bg-[#1c272d]">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-white">{item.name}</h3>
                    <p className="text-[10px] text-gray-500 font-mono uppercase">SKU: {item.sku}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-[#00a884] font-black text-lg">₪{item.price}</p>
                    <button className="text-[10px] bg-[#00a884] text-white px-4 py-2 rounded-full font-black mt-1 active:scale-90 transition-transform shadow-lg shadow-[#00a884]/20">הוסף</button>
                  </div>
                </div>
              </div>
            ))}
            <div ref={scrollRef} className="h-10" />
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 className="animate-spin text-[#00a884] mb-4" size={32} />
            <p className="text-[10px] font-black text-[#00a884] uppercase tracking-widest">מתחבר למקורות מידע וגוגל...</p>
          </div>
        )}
      </main>

      {/* Floating Input */}
      <div className="p-4 bg-gradient-to-t from-[#0b141a] via-[#0b141a] to-transparent absolute bottom-0 w-full z-[200]">
        <div className="bg-[#1c272d] border border-gray-700/50 rounded-[2rem] p-1 flex items-center shadow-2xl focus-within:border-[#00a884] transition-all">
          <div className="p-4 text-gray-500">
            <MessageSquare size={20} />
          </div>
          <input 
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction()}
            placeholder="שאל שאלה או בקש חישוב..." 
            className="flex-1 bg-transparent outline-none py-4 text-base placeholder:text-gray-600 font-medium"
          />
          <button 
            onClick={() => handleAction()}
            disabled={loading}
            className="bg-[#00a884] p-4 rounded-full text-white active:scale-90 transition-all shadow-lg ml-1"
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-720 {
          from { transform: rotate(0deg) rotateX(45deg); }
          to { transform: rotate(720deg) rotateX(45deg); }
        }
        .animate-spin-custom {
          animation: spin-720 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
