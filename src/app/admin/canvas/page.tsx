'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Zap, Loader2, MessageSquare, Database, RefreshCw } from 'lucide-react';
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

  const handleAction = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    
    // סגירת מקלדת במובייל
    if (inputRef.current) inputRef.current.blur();

    try {
      const result = await processSmartOrder(query);
      setResponse(result);
    } catch (e) {
      console.error("AI Interface Error:", e);
      setResponse({
        text: "משהו השתבש בחיבור למוח של סבן. נסה שוב בעוד רגע.",
        orderList: [],
        source: "error"
      });
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 bg-[#0b141a] text-white flex flex-col font-sans overflow-hidden select-none" dir="rtl">
      
      {/* Header - Saban Branding */}
      <header className="h-16 border-b border-gray-800/60 flex items-center justify-between px-6 bg-[#111b21]/95 backdrop-blur-2xl z-[100] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#00a884] to-[#005c4b] rounded-xl flex items-center justify-center shadow-lg">
            <span className="font-black text-lg">ס</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tighter leading-none uppercase italic">Saban AI</h1>
            <span className="text-[8px] text-[#00a884] font-bold tracking-[0.2em] mt-1 uppercase">Knowledge Engine</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {response && (
             <button 
               onClick={() => setResponse(null)}
               className="p-2 bg-gray-800/50 rounded-full text-gray-400 active:scale-90 transition-transform"
             >
               <RefreshCw size={16} />
             </button>
           )}
           <div className="flex items-center gap-1.5 bg-[#00a884]/10 px-2 py-1 rounded-md border border-[#00a884]/20">
              <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-[#00a884]'}`} />
              <span className="text-[9px] font-black text-[#00a884] uppercase tracking-tighter">Live</span>
           </div>
        </div>
      </header>

      {/* Main UI Area */}
      <main className="flex-1 relative overflow-y-auto p-5 pb-36 touch-pan-y">
        
        {/* The 720° Rotating Orb */}
        {!response && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-80 pointer-events-none">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div className="absolute inset-0 border-[2px] border-dashed border-[#00a884]/30 rounded-full animate-spin-custom" />
              <div className="w-44 h-44 bg-gradient-to-tr from-[#00a884] via-[#005c4b] to-[#0b141a] rounded-full shadow-[0_0_70px_rgba(0,168,132,0.3)] flex items-center justify-center border-4 border-[#111b21] animate-pulse">
                <img src="/avattar.png" className="w-28 h-28 object-contain drop-shadow-2xl" alt="Saban AI" />
              </div>
            </div>
            <div className="mt-10 text-center space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">היועץ של סבן קשוב</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">ממתין לשאלה או חישוב</p>
            </div>
          </div>
        )}

        {/* AI Response Display */}
        {response && (
          <div className="w-full space-y-5 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-[#1c272d]/80 backdrop-blur-xl border border-gray-800 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00a884]/5 blur-3xl rounded-full" />
              <div className="flex items-center gap-2 text-[#00a884] mb-4 text-[9px] font-black uppercase tracking-widest">
                <Database size={12} /> מקור: {response.source || 'Saban Intelligence'}
              </div>
              <p className="text-xl leading-relaxed font-medium text-gray-100 italic">
                "{response.text}"
              </p>
            </div>

            {/* Product Cards */}
            {response.orderList?.map((item: any) => (
              <div key={item.id} className="bg-[#111b21] rounded-[2.5rem] border border-gray-800 overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-500">
                <div className="h-56 bg-white flex items-center justify-center p-8 relative">
                   <img src={item.image || "/avattar.png"} className="h-full object-contain" alt={item.name} />
                   <div className="absolute top-4 right-4 bg-[#00a884] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">במלאי</div>
                </div>
                <div className="p-6 bg-[#1c272d] flex justify-between items-center border-t border-gray-800">
                  <div className="space-y-1">
                    <h3 className="font-black text-base">{item.name}</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">SKU: {item.sku}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-[#00a884] text-xl font-black tracking-tighter">₪{item.price}</p>
                    <button className="mt-2 bg-[#00a884] text-white text-[10px] font-black px-5 py-2 rounded-full active:scale-90 transition-transform shadow-lg shadow-[#00a884]/20">
                      הוסף להזמנה
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div ref={scrollRef} className="h-4" />
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
             <Loader2 className="animate-spin text-[#00a884]" size={32} />
             <p className="text-[10px] font-black text-[#00a884] animate-pulse uppercase tracking-widest">סורק נתונים ומחשב...</p>
          </div>
        )}
      </main>

      {/* Floating Mobile Input */}
      <div className="p-5 bg-gradient-to-t from-[#0b141a] via-[#0b141a] to-transparent absolute bottom-0 w-full z-[200]">
        <div className="bg-[#1c272d] border border-gray-700/50 rounded-[2.5rem] p-1.5 flex items-center shadow-2xl focus-within:border-[#00a884] transition-all duration-300">
          <div className="p-4 text-gray-500">
            <MessageSquare size={22} strokeWidth={2.5} />
          </div>
          
          <input 
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction()}
            placeholder="חשב לי 20 מ״ר או שאל שאלה..." 
            className="flex-1 bg-transparent outline-none py-4 text-[16px] font-medium placeholder:text-gray-600"
          />
          
          <button 
            onClick={handleAction}
            disabled={loading}
            className={`p-4 rounded-full transition-all shadow-xl active:scale-90 flex items-center justify-center ml-1 ${
              loading ? 'bg-gray-800 text-gray-600' : 'bg-[#00a884] text-white'
            }`}
          >
            <Send size={22} strokeWidth={3} />
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
