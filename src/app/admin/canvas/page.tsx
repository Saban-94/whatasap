'use client';

import React, { useState, useEffect } from 'react';
import { Search, Send, Database, Zap, Globe, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
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
    setResponse(null);

    try {
      // שליחת השאילתה למנוע הנתונים המאוחד
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
          <div className="w-10 h-10 bg-gradient-to-br from-[#00a884] to-[#005c4b] rounded-xl flex items-center justify-center shadow-lg shadow-[#00a884]/20">
            <span className="font-black text-xl text-white">ס</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tighter leading-none">AI-ח.סבן CANVAS</h1>
            <span className="text-[9px] text-[#00a884] font-bold uppercase tracking-widest mt-1">Product Visual Engine</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
          <span className="flex items-center gap-1"><Database size={12} className="text-[#00a884]"/> נתונים: SUPABASE</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center relative p-6">
        
        {/* האנימציה המרכזית (מתכווצת כשיש תוצאה) */}
        <div className={`relative transition-all duration-700 ${response ? 'scale-50 h-32 opacity-50' : 'h-64 mb-12'}`}>
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
            <div className={`absolute inset-0 border-2 border-dashed border-[#00a884]/30 rounded-full ${loading ? 'animate-spin' : 'animate-[spin_20s_linear_infinite]'}`} />
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-tr from-[#00a884] to-[#005c4b] rounded-full shadow-[0_0_80px_rgba(0,168,132,0.3)] flex items-center justify-center">
                <Globe size={60} className="text-white opacity-80" strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* הצגת התשובה והמוצרים */}
        {response && (
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32">
            <div className="bg-[#111b21] border border-gray-800 rounded-3xl p-6 mb-6 shadow-2xl relative overflow-hidden">
               {/* הילה דקורטיבית */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#00a884]/5 blur-3xl rounded-full" />
               
              <div className="flex items-center gap-2 text-[#00a884] mb-4 text-xs font-black uppercase tracking-widest">
                <Sparkles size={14} /> בינה מלאכותית מבוססת מלאי
              </div>
              <p className="text-xl text-gray-100 leading-relaxed font-medium mb-8">{response.text}</p>
              
              {/* כרטיסי מוצר עם תמונות */}
              {response.orderList?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {response.orderList.map((item: any) => (
                    <div key={item.id} className="bg-[#1c272d] rounded-2xl border border-gray-700/50 overflow-hidden hover:border-[#00a884]/50 transition-all group shadow-lg">
                      {/* תמונת המוצר */}
                      <div className="h-40 w-full bg-[#0b141a] relative flex items-center justify-center overflow-hidden border-b border-gray-800">
                        {item.image || item.media_urls?.[0] ? (
                          <img 
                            src={item.image || item.media_urls[0]} 
                            alt={item.name} 
                            className="object-contain w-full h-full p-4 transition-transform group-hover:scale-110 duration-500"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-600">
                            <ImageIcon size={32} />
                            <span className="text-[10px] font-bold">אין תמונה זמינה</span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-[#00a884] text-white text-[9px] font-black px-2 py-1 rounded-md shadow-md">
                           במלאי
                        </div>
                      </div>

                      {/* פרטי המוצר */}
                      <div className="p-4 flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-sm font-black text-white">{item.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono tracking-tighter">מק"ט: {item.sku || item.id}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-[#00a884] text-lg font-black tracking-tighter">₪{item.price}</p>
                          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">מחיר מחירון</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* שורת החיפוש הצפה */}
        <div className={`w-full max-w-3xl fixed transition-all duration-500 z-50 ${response ? 'bottom-8' : 'relative mt-4'}`}>
          <div className="bg-[#1c272d]/90 backdrop-blur-2xl p-2 rounded-[2.5rem] border border-gray-700/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] flex items-center gap-3 group">
            <div className="p-4 text-gray-500">
              {loading ? <Loader2 className="animate-spin text-[#00a884]" size={24} /> : <Search size={24} />}
            </div>
            
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="חפש מוצר לדוגמה 'סיקה' או 'חומר איטום'..." 
              className="flex-1 bg-transparent outline-none text-base md:text-lg py-4 px-2"
            />
            
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#00a884] hover:bg-[#06cf9c] p-4 rounded-full text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <Send size={24} strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex justify-center gap-4 mt-4 opacity-30 text-[9px] font-black tracking-[0.3em] uppercase">
             Inventory • Technical • Logistics
          </div>
        </div>
      </main>
    </div>
  );
}

function Sparkles({ size, className }: { size: number, className?: string }) {
  return <Zap size={size} className={className} />;
}
