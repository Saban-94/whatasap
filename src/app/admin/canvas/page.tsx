'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Zap, 
  Loader2, 
  MessageSquare, 
  Database, 
  RefreshCw, 
  Info, 
  Smartphone,
  ChevronLeft
} from 'lucide-react';
import CanvasRenderer from '@/components/CanvasRenderer'; // הרכיב שמרנדר את ה-UIBlueprint

export default function SabanAICanvasMobile() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // הגדרת חוויית Mobile-First: מניעת גלילה של הרקע
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  // גלילה אוטומטית לכרטיס החדש
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
      // קריאה ל-Route החדש שכולל Supabase + Gemini 3.1
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: activeQuery }),
      });
      
      const blueprint = await res.json();
      setResponse(blueprint);
    } catch (e) {
      console.error("AI Canvas Error:", e);
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 bg-[#030a16] text-white flex flex-col font-sans overflow-hidden select-none" dir="rtl">
      
      {/* Header - Saban Branding [cite: 2026-02-27] */}
      <header className="h-20 border-b border-white/10 flex items-center justify-between px-6 bg-[#0B2C63]/40 backdrop-blur-2xl z-[100] shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#0B2C63] to-[#10B981] rounded-2xl flex items-center justify-center shadow-lg shadow-[#10B981]/20 border border-white/10">
            <span className="font-black text-xl text-white">ס</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-black tracking-tight leading-none uppercase italic">Saban AI</h1>
            <span className="text-[9px] text-[#10B981] font-bold tracking-[0.2em] mt-1.5 uppercase">Generative Canvas</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           {response && (
             <motion.button 
               whileTap={{ scale: 0.9 }}
               onClick={() => setResponse(null)}
               className="p-2.5 bg-white/5 rounded-full text-gray-400 border border-white/10"
             >
               <RefreshCw size={16} />
             </motion.button>
           )}
           <div className="flex items-center gap-2 bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/30">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[10px] font-black text-[#10B981] uppercase tracking-tighter">System Active</span>
           </div>
        </div>
      </header>

      {/* Main Canvas Area [cite: 2026-02-27] */}
      <main className="flex-1 relative overflow-y-auto p-5 pb-40 touch-pan-y custom-scrollbar">
        
        {/* The 720° Rotating Orb - Idle State [cite: 2026-02-27] */}
        {!response && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="relative w-72 h-72 flex items-center justify-center">
              <div className="absolute inset-0 border-[2px] border-dashed border-[#10B981]/20 rounded-full animate-spin-720" />
              <div className="absolute inset-8 border border-[#0B2C63]/30 rounded-full animate-pulse" />
              
              <div className="w-48 h-48 bg-gradient-to-tr from-[#0B2C63] via-[#030a16] to-[#10B981] rounded-full shadow-[0_0_80px_rgba(16,185,129,0.2)] flex items-center justify-center border-2 border-white/5 animate-pulse">
                <img src="/avattar.png" className="w-32 h-32 object-contain drop-shadow-2xl opacity-80" alt="Saban AI" />
              </div>
            </div>
            <div className="mt-12 text-center space-y-3">
              <h2 className="text-2xl font-black text-white tracking-tight">היועץ של סבן קשוב</h2>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.4em]">Ready for Calculation or Search</p>
            </div>
          </div>
        )}

        {/* AI Generative UI Output [cite: 2026-02-27] */}
        {response && (
          <div className="w-full max-w-2xl mx-auto space-y-6 pb-10">
            <CanvasRenderer data={response} />
            <div ref={scrollRef} className="h-4" />
          </div>
        )}

        {/* Loading State [cite: 2026-02-27] */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
             <div className="relative w-16 h-16 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#10B981]" size={40} strokeWidth={3} />
                <div className="absolute inset-0 border-4 border-[#10B981]/10 rounded-full" />
             </div>
             <p className="text-[11px] font-black text-[#10B981] animate-pulse uppercase tracking-[0.2em]">שולף נתונים ממאגר ח. סבן וגוגל...</p>
          </div>
        )}
      </main>

      {/* Floating Bottom Bar - One-Thumb UX [cite: 2026-02-27] */}
      <div className="p-6 bg-gradient-to-t from-[#030a16] via-[#030a16] to-transparent absolute bottom-0 w-full z-[200]">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-2 flex items-center shadow-[0_-20px_50px_rgba(0,0,0,0.5)] focus-within:border-[#10B981]/50 transition-all duration-500">
          <div className="p-4 text-gray-500">
            <MessageSquare size={24} strokeWidth={2} />
          </div>
          
          <input 
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction()}
            placeholder="חשב לי 30 מ״ר קרמיקה..." 
            className="flex-1 bg-transparent outline-none py-5 text-base placeholder:text-gray-600 font-medium"
          />
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAction()}
            disabled={loading}
            className={`p-5 rounded-full transition-all shadow-2xl flex items-center justify-center ml-1 ${
              loading ? 'bg-white/5 text-gray-700' : 'bg-[#10B981] text-white shadow-[#10B981]/20'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} strokeWidth={2.5} />}
          </motion.button>
        </div>
        
        {/* Quick Suggestion Chips */}
        <div className="flex justify-center gap-3 mt-5 overflow-x-auto no-scrollbar px-2 pb-2">
          {['סיקה 107', 'חישוב מ״ר', 'יוטיוב הדרכה', 'מלאי דבקים'].map(tag => (
            <button 
              key={tag}
              onClick={() => handleAction(tag)}
              className="whitespace-nowrap bg-white/5 border border-white/5 text-gray-500 text-[10px] font-black px-5 py-2.5 rounded-full active:bg-[#10B981]/20 active:text-[#10B981] transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-720 {
          from { transform: rotate(0deg) rotateX(45deg); }
          to { transform: rotate(720deg) rotateX(45deg); }
        }
        .animate-spin-720 {
          animation: spin-720 5s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
