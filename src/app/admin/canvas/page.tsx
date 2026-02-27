'use client';

import React, { useState, useEffect } from 'react';
import { Search, Send, Database, Zap, Info, MessageSquare, ShieldCheck, Globe } from 'lucide-react';

export default function SabanAICanvas() {
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0b141a] text-white flex flex-col items-center font-sans overflow-hidden selection:bg-[#00a884]/30" dir="rtl">
      
      {/* סרגל עליון - סטטוס מערכת ח. סבן */}
      <header className="w-full h-20 border-b border-gray-800/50 flex items-center justify-between px-8 bg-[#111b21]/30 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00a884] to-[#005c4b] rounded-xl flex items-center justify-center shadow-lg shadow-[#00a884]/20">
            <span className="font-black text-xl">ס</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tighter leading-none">AI-ח.סבן CANVAS</h1>
            <span className="text-[9px] text-[#00a884] font-bold uppercase tracking-[0.2em] mt-1">Saban Engineering Intelligence</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
            <Database size={14} className="text-[#00a884]" /> מסד נתונים מסונכרן
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
            <ShieldCheck size={14} className="text-[#00a884]" /> גישה מאובטחת לנציגים
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#00a884] animate-pulse">
            <Zap size={14} /> AI מחובר למלאי
          </div>
        </div>
      </header>

      {/* מרכז הדף - ה-Orb הויזואלי (בלי התקנות, רק CSS) */}
      <main className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center relative p-6">
        
        {/* אפקטים של תאורה ברקע */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00a884]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative mb-12">
          {/* ה-Orb של גימני - אנימציה ויזואלית טהורה */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            {/* טבעת חיצונית מסתובבת */}
            <div className="absolute inset-0 border-2 border-dashed border-[#00a884]/30 rounded-full animate-[spin_20s_linear_infinite]" />
            
            {/* ליבה פועמת */}
            <div className="w-48 h-48 md:w-56 md:h-56 bg-gradient-to-tr from-[#00a884] via-[#005c4b] to-[#53bdeb] rounded-full shadow-[0_0_80px_rgba(0,168,132,0.4)] animate-[pulse_4s_ease-in-out_infinite] flex items-center justify-center overflow-hidden">
                {/* השתקפות פנימית */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
                <div className="relative z-10 text-white opacity-90">
                   <Globe size={80} className="animate-[pulse_6s_ease-in-out_infinite]" strokeWidth={1} />
                </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4 max-w-2xl z-10 mb-12">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            איך אוכל לעזור היום?
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-medium">
            אני מחובר למלאי, לידע הטכני ולהיסטוריית הלקוחות של ח. סבן הנדסה. 
            <br className="hidden md:block"/> שאל אותי על כל מוצר או פרויקט.
          </p>
        </div>

        {/* שורת חיפוש צפה (Canvas Style) */}
        <div className="w-full max-w-3xl sticky bottom-10 px-4">
          <div className="bg-[#1c272d]/90 backdrop-blur-xl p-2 rounded-[2.5rem] border border-gray-700/50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] flex items-center gap-3 group transition-all focus-within:border-[#00a884]/50">
            <div className="p-4 text-gray-500 group-focus-within:text-[#00a884] transition-colors">
              <Search size={24} strokeWidth={2.5} />
            </div>
            
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חפש מוצר, מלאי, מפרט טכני או יתרת לקוח..." 
              className="flex-1 bg-transparent outline-none text-base md:text-lg py-4 px-2 placeholder:text-gray-600 font-medium"
            />
            
            <button className="bg-[#00a884] hover:bg-[#06cf9c] p-4 rounded-full text-white shadow-lg transition-all active:scale-95 group-hover:shadow-[#00a884]/20">
              <Send size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* הצעות מהירות לגישה קלה */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['יתרת מלאי סיקה', 'מפרט שפכטל אמריקאי', 'מחירון מנופים', 'זמינות משלוח'].map((tag) => (
              <button 
                key={tag}
                onClick={() => setQuery(tag)}
                className="bg-[#111b21] hover:bg-[#202c33] border border-gray-800 text-gray-400 text-[11px] font-bold px-4 py-2 rounded-full transition-all hover:text-[#00a884] hover:border-[#00a884]/50"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

      </main>

      {/* Footer קרדיט קטן */}
      <footer className="py-6 opacity-30">
        <p className="text-[10px] font-bold tracking-widest uppercase">Powered by Saban Master Brain v2.0</p>
      </footer>
    </div>
  );
}
