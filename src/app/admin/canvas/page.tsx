'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Database, Zap, Globe, Loader2, Sparkles } from 'lucide-react';
import { processSmartOrder } from '@/lib/dataEngine'; // המנוע שסורק את ה-JSON

export default function SabanAICanvas() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);

    try {
      // שליחת השאלה למנוע שמחבר בין המלאי לידע הטכני
      // השתמשנו ב-id כללי "ADMIN" לצורך השאילתה
      const result = await processSmartOrder("ADMIN", query);
      setResponse(result);
    } catch (e) {
      console.error("Search Error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0b141a] text-white flex flex-col items-center font-sans overflow-hidden" dir="rtl">
      
      {/* Header */}
      <header className="w-full h-20 border-b border-gray-800/50 flex items-center justify-between px-8 bg-[#111b21]/30 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00a884] to-[#005c4b] rounded-xl flex items-center justify-center shadow-lg">
            <span className="font-black text-xl">ס</span>
          </div>
          <h1 className="text-lg font-black tracking-tighter">AI-ח.סבן CANVAS</h1>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-[#00a884]">
          <Database size={14} /> המלאי מסונכרן: {new Date().toLocaleDateString()}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center relative p-6">
        
        {/* האנימציה המרכזית - משתנה בזמן טעינה */}
        <div className="relative mb-12">
          <div className={`relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center transition-all duration-700 ${response ? 'scale-75 -translate-y-10' : ''}`}>
            <div className={`absolute inset-0 border-2 border-dashed border-[#00a884]/30 rounded-full ${loading ? 'animate-spin' : 'animate-[spin_20s_linear_infinite]'}`} />
            <div className={`w-32 h-32 md:w-40 md:h-40 bg-gradient-to-tr from-[#00a884] to-[#53bdeb] rounded-full shadow-[0_0_80px_rgba(0,168,132,0.4)] flex items-center justify-center overflow-hidden ${loading ? 'animate-pulse' : ''}`}>
                <Globe size={60} className="text-white opacity-80" strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* הצגת התשובה המועשרת מהנתונים */}
        {response && (
          <div className="w-full max-w-2xl bg-[#111b21] border border-gray-800 rounded-3xl p-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 text-[#00a884] mb-4 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> תשובת המערכת מבוססת מלאי
            </div>
            <p className="text-lg text-gray-200 leading-relaxed mb-6">{response.text}</p>
            
            {/* הצגת מוצרים רלוונטיים שנמצאו במלאי */}
            {response.orderList?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {response.orderList.map((item: any) => (
                  <div key={item.id} className="bg-[#1c272d] p-4 rounded-2xl border border-gray-700 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold">{item.name}</p>
                      <p className="text-[10px] text-gray-500">מק"ט: {item.id}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-[#00a884] font-bold">₪{item.price}</p>
                      <p className="text-[10px] text-gray-500 italic">במלאי</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* שורת החיפוש */}
        <div className={`w-full max-w-3xl transition-all duration-500 ${response ? 'sticky bottom-10' : ''}`}>
          <div className="bg-[#1c272d]/90 backdrop-blur-xl p-2 rounded-[2.5rem] border border-gray-700/50 shadow-2xl flex items-center gap-3">
            <div className="p-4 text-gray-500">
              {loading ? <Loader2 className="animate-spin text-[#00a884]" size={24} /> : <Search size={24} />}
            </div>
            
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="חפש מוצר, מלאי או ידע טכני..." 
              className="flex-1 bg-transparent outline-none text-lg py-4 px-2"
            />
            
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#00a884] hover:bg-[#06cf9c] p-4 rounded-full text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
