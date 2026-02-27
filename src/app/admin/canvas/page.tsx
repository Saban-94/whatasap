'use client';

import React, { useState, useEffect } from 'react';
import { Search, Send, Database, Zap, Image as ImageIcon, Sparkles, Calculator } from 'lucide-react';
import { processSmartOrder } from '@/lib/dataEngine';

export default function SabanAICanvas() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const result = await processSmartOrder("ADMIN", query);
    setResponse(result);
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0b141a] text-white flex flex-col items-center p-6" dir="rtl">
      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center mb-12 opacity-80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00a884] rounded-lg flex items-center justify-center font-black">ס</div>
          <h1 className="text-sm font-bold tracking-widest uppercase">Saban AI Search Mode</h1>
        </div>
        <div className="text-[10px] font-bold text-[#00a884] flex items-center gap-2">
          <Database size={12}/> Local Brain: Active
        </div>
      </header>

      {/* האווטאר הנושם המרכזי */}
      <div className={`relative transition-all duration-700 ${response ? 'scale-50 opacity-40 h-20' : 'h-64 mb-12'}`}>
        <div className="absolute inset-0 bg-[#00a884] opacity-10 blur-[100px] animate-pulse rounded-full" />
        <div className="w-48 h-48 rounded-full border-4 border-[#111b21] shadow-[0_0_80px_rgba(0,168,132,0.3)] overflow-hidden animate-[pulse_6s_ease-in-out_infinite]">
          <img src="/avattar.png" className="w-full h-full object-contain p-4" alt="Saban AI" />
        </div>
      </div>

      {/* תוצאות החיפוש והחישוב */}
      {response && (
        <div className="w-full max-w-3xl space-y-6 pb-40 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-[#111b21] border border-gray-800 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center gap-2 text-[#00a884] mb-4 text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles size={14} /> Knowledge Match Found
            </div>
            <p className="text-xl leading-relaxed whitespace-pre-wrap">{response.text}</p>
            
            {/* כרטיס מוצר ויזואלי */}
            {response.orderList?.map((item: any) => (
              <div key={item.id} className="mt-8 bg-[#1c272d] rounded-2xl border border-gray-700 overflow-hidden flex flex-col md:flex-row shadow-xl">
                <div className="w-full md:w-1/3 h-48 bg-[#0b141a] flex items-center justify-center p-4">
                  {item.image ? <img src={item.image} className="max-h-full object-contain" /> : <ImageIcon className="text-gray-700" size={48}/>}
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-[#00a884] mb-1">{item.name}</h3>
                    <p className="text-[10px] text-gray-500 font-mono">מק"ט: {item.sku}</p>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex gap-4">
                       <div className="text-center">
                          <p className="text-[9px] text-gray-500 uppercase font-bold">מלאי זמין</p>
                          <p className="text-sm font-bold">{item.available}</p>
                       </div>
                       <div className="text-center">
                          <p className="text-[9px] text-gray-500 uppercase font-bold">מחיר</p>
                          <p className="text-sm font-bold text-[#00a884]">₪{item.price}</p>
                       </div>
                    </div>
                    <button className="bg-[#00a884] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#06cf9c] transition-all active:scale-95">
                      הוסף להזמנה
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* שורת חיפוש צפה */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
        <div className="bg-[#1c272d]/90 backdrop-blur-2xl p-2 rounded-[2.5rem] border border-gray-700 shadow-2xl flex items-center gap-3">
          <div className="p-4 text-gray-500"><Search size={22} /></div>
          <input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="חשב כמה קרטונים ל-20 מטר... או שאל על סיקה 107" 
            className="flex-1 bg-transparent outline-none text-sm py-4 px-2"
          />
          <button onClick={handleSearch} className="bg-[#00a884] p-4 rounded-full text-white shadow-lg active:scale-95 transition-all">
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
