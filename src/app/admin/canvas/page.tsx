'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Database, Zap, Loader2, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { processSmartOrder } from '@/lib/dataEngine';

export default function SabanMobileAI() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleAction = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    inputRef.current?.blur();

    try {
      const result = await processSmartOrder("MOBILE_USER", query);
      setResponse(result);
    } catch (e) {
      console.error("Critical AI Error:", e);
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 bg-[#0b141a] text-white flex flex-col font-sans overflow-hidden select-none" dir="rtl">
      
      {/* Header */}
      <header className="h-16 border-b border-gray-800/50 flex items-center justify-between px-6 bg-[#111b21]/80 backdrop-blur-xl z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00a884] rounded-lg flex items-center justify-center shadow-lg">
            <span className="font-bold text-sm text-white">ס</span>
          </div>
          <h1 className="text-sm font-black tracking-tight uppercase">Saban AI Canvas</h1>
        </div>
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-[#00a884]'}`} />
           <span className="text-[10px] font-bold text-gray-500 uppercase">Live</span>
        </div>
      </header>

      {/* Main UI Area */}
      <main className="flex-1 relative overflow-y-auto p-4 pb-32 touch-pan-y">
        
        {/* The 720° Rotating & Breathing Orb */}
        {!response && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <div className="absolute inset-0 border-[3px] border-dashed border-[#00a884]/20 rounded-full animate-[spin_4s_linear_infinite]" 
                   style={{ animationDuration: '3s' }} />
              <div className="w-40 h-40 bg-gradient-to-tr from-[#00a884] to-[#005c4b] rounded-full shadow-[0_0_60px_rgba(0,168,132,0.3)] flex items-center justify-center border-4 border-[#111b21] animate-pulse">
                <img src="/avattar.png" className="w-24 h-24 object-contain opacity-90" alt="Saban AI" />
              </div>
            </div>
            <p className="mt-8 text-gray-500 font-bold text-xs tracking-widest animate-pulse uppercase">Saban Brain Active</p>
          </div>
        )}

        {/* AI Response Cards */}
        {response && (
          <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#1c272d] border border-gray-800 p-5 rounded-3xl shadow-xl">
              <div className="flex items-center gap-2 text-[#00a884] mb-3 text-[10px] font-bold uppercase tracking-wider">
                <Zap size={12} /> {response.source === 'cache' ? 'שליפה מהירה מהזיכרון' : 'מענה מומחה AI'}
              </div>
              <p className="text-lg leading-relaxed font-medium text-gray-100">{response.text}</p>
            </div>

            {response.orderList?.map((item: any) => (
              <div key={item.id} className="bg-[#111b21] rounded-3xl border border-gray-800 overflow-hidden flex flex-col shadow-lg">
                <div className="h-48 bg-[#0b141a] p-4 flex items-center justify-center">
                  <img src={item.image || "/avattar.png"} className="h-full object-contain" alt={item.name} />
                </div>
                <div className="p-4 flex justify-between items-center bg-[#1c272d]">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-white">{item.name}</h3>
                    <p className="text-[10px] text-gray-500 uppercase">מלאי: {item.available || 'זמין'}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-[#00a884] font-black text-lg">₪{item.price}</p>
                    <button className="text-[10px] bg-[#00a884]/10 text-[#00a884] px-4 py-2 rounded-full font-bold mt-1 active:bg-[#00a884] active:text-white transition-colors">
                      הוסף להזמנה
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Input Controller */}
      <div className="p-4 bg-gradient-to-t from-[#0b141a] via-[#0b141a] to-transparent absolute bottom-0 w-full z-[200]">
        <div className="bg-[#1c272d] border border-gray-700/50 rounded-[2rem] p-1 flex items-center shadow-2xl focus-within:border-[#00a884] transition-all">
          <div className="p-4 text-gray-500">
            {loading ? <Loader2 className="animate-spin text-[#00a884]" size={20} /> : <MessageSquare size={20} />}
          </div>
          <input 
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction()}
            placeholder="שאל את היועץ: 'חשב לי 20 מ״ר' או מוצר..." 
            className="flex-1 bg-transparent outline-none py-4 text-base placeholder:text-gray-600 font-medium"
          />
          <button 
            onClick={handleAction}
            disabled={loading}
            className="bg-[#00a884] p-4 rounded-full text-white active:scale-90 transition-all shadow-lg ml-1"
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 bg-[#0b141a] text-white flex flex-col font-sans overflow-hidden select-none touch-none" dir="rtl">
      
      {/* Header - Mobile Style */}
      <header className="h-16 border-b border-gray-800/50 flex items-center justify-between px-6 bg-[#111b21]/80 backdrop-blur-xl z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00a884] rounded-lg flex items-center justify-center shadow-lg">
            <span className="font-bold text-sm">ס</span>
          </div>
          <h1 className="text-sm font-black tracking-tight uppercase">Saban AI Canvas</h1>
        </div>
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-[#00a884]'}`} />
           <span className="text-[10px] font-bold text-gray-500 uppercase">Live</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto p-4 pb-32 touch-pan-y">
        
        {/* The 720° Rotating Orb - Breathing Logic */}
        {!response && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="relative w-56 h-56 flex items-center justify-center">
              {/* Outer Ring 720deg */}
              <div className="absolute inset-0 border-[3px] border-dashed border-[#00a884]/20 rounded-full animate-[spin_4s_linear_infinite]" 
                   style={{ animationDuration: '3s', transform: 'rotateX(45deg)' }} />
              
              {/* Core Avatar */}
              <div className="w-40 h-40 bg-gradient-to-tr from-[#00a884] to-[#005c4b] rounded-full shadow-[0_0_60px_rgba(0,168,132,0.3)] flex items-center justify-center border-4 border-[#111b21] animate-pulse">
                <img src="/avattar.png" className="w-24 h-24 object-contain opacity-90" alt="Saban AI" />
              </div>
            </div>
            <p className="mt-8 text-gray-500 font-bold text-xs tracking-widest animate-pulse">היועץ של ח. סבן קשוב...</p>
          </div>
        )}

        {/* AI Response Display */}
        {response && (
          <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#1c272d] border border-gray-800 p-5 rounded-3xl shadow-xl">
              <div className="flex items-center gap-2 text-[#00a884] mb-3 text-[10px] font-bold">
                <Zap size={12} /> מענה טכני מבוסס נתונים
              </div>
              <p className="text-lg leading-relaxed font-medium">{response.text}</p>
            </div>

            {/* Product Cards for Mobile */}
            {response.orderList?.map((item: any) => (
              <div key={item.id} className="bg-[#111b21] rounded-3xl border border-gray-800 overflow-hidden flex flex-col shadow-lg">
                <div className="h-48 bg-[#0b141a] p-4 flex items-center justify-center">
                  <img src={item.image || "/avattar.png"} className="h-full object-contain" alt={item.name} />
                </div>
                <div className="p-4 flex justify-between items-center bg-[#1c272d]">
                  <div>
                    <h3 className="font-bold text-sm">{item.name}</h3>
                    <p className="text-[10px] text-gray-500">מק"ט: {item.sku}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-[#00a884] font-black">₪{item.price}</p>
                    <button className="text-[10px] bg-[#00a884]/10 text-[#00a884] px-3 py-1 rounded-full font-bold mt-1">
                      בדוק מלאי
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Mobile Input - The Engine */}
      <div className="p-4 bg-gradient-to-t from-[#0b141a] via-[#0b141a] to-transparent absolute bottom-0 w-full z-[200]">
        <div className="bg-[#1c272d] border border-gray-700/50 rounded-[2rem] p-1 flex items-center shadow-2xl focus-within:border-[#00a884] transition-all">
          <div className="p-4 text-gray-500">
            {loading ? <Loader2 className="animate-spin text-[#00a884]" size={20} /> : <MessageSquare size={20} />}
          </div>
          
          <input 
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction()}
            placeholder="שאל את היועץ של סבן..." 
            className="flex-1 bg-transparent outline-none py-4 text-sm placeholder:text-gray-600 pointer-events-auto"
          />
          
          <button 
            onClick={handleAction}
            disabled={loading}
            className="bg-[#00a884] p-4 rounded-full text-white active:scale-90 transition-all shadow-lg pointer-events-auto ml-1"
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0b141a] text-white flex flex-col items-center font-sans overflow-hidden" dir="rtl">
      
      {/* Header - ח. סבן מיתוג */}
      <header className="w-full h-20 border-b border-gray-800/50 flex items-center justify-between px-8 bg-[#111b21]/30 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00a884] to-[#005c4b] rounded-xl flex items-center justify-center shadow-lg shadow-[#00a884]/20">
            <span className="font-black text-xl text-white">ס</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tighter leading-none">AI-ח.סבן CANVAS</h1>
            <span className="text-[9px] text-[#00a884] font-bold uppercase tracking-widest mt-1">Saban Engineering Intelligence</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
          <span className="flex items-center gap-1"><Database size={12} className="text-[#00a884]"/> 100% Secure Cache</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center relative p-6">
        
        {/* האפקט הויזואלי - Orb 3D בסיבוב 720 מעלות */}
        <div className={`relative transition-all duration-1000 ${response ? 'scale-50 h-32 opacity-50 translate-y-[-20px]' : 'h-64 mb-12'}`}>
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00a884] opacity-20 blur-[100px] rounded-full animate-pulse"
            style={{ width: 400, height: 400 }}
          />

          <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
            {/* טבעת חיצונית מסתובבת 720 מעלות (CSS Inline למניעת שגיאות Config) */}
            <div 
              className="absolute inset-0 border-2 border-dashed border-[#00a884]/40 rounded-full"
              style={{ 
                animation: loading ? 'spin 1s linear infinite' : 'spin 4s linear infinite',
                transform: loading ? 'rotate(720deg)' : 'none',
                transition: 'transform 2s ease-in-out'
              }} 
            />
            
            {/* האווטאר הנושם המרכזי */}
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-tr from-[#00a884] to-[#005c4b] rounded-full shadow-[0_0_80px_rgba(0,168,132,0.4)] flex items-center justify-center overflow-hidden border-4 border-[#111b21] animate-pulse">
                <img 
                  src="/avattar.png" 
                  alt="Saban AI" 
                  className="object-contain w-full h-full p-4"
                />
            </div>
          </div>
        </div>

        {/* הצגת התשובה החכמה - שליפה מהמאגר */}
        {response && (
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-10 duration-700 pb-40">
            <div className="bg-[#111b21] border border-gray-800 rounded-3xl p-8 mb-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 text-[#00a884] mb-6 text-xs font-black uppercase tracking-[0.2em]">
                <Zap size={14} /> מומחה הנדסי - ח. סבן
              </div>
              
              <div className="prose prose-invert max-w-none">
                <p className="text-xl text-gray-100 leading-relaxed font-medium mb-8 whitespace-pre-wrap">
                  {response.text}
                </p>
              </div>
              
              {/* הצגת חישובים ומוצרים */}
              {response.orderList?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-800 pt-8 mt-4">
                  {response.orderList.map((item: any) => (
                    <div key={item.id} className="bg-[#1c272d] rounded-2xl border border-gray-700/50 overflow-hidden hover:border-[#00a884]/50 transition-all group">
                      <div className="h-44 w-full bg-[#0b141a] relative flex items-center justify-center border-b border-gray-800">
                        {item.image || item.media_urls?.[0] ? (
                          <img 
                            src={item.image || item.media_urls[0]} 
                            alt={item.name} 
                            className="object-contain w-full h-full p-4 transition-transform group-hover:scale-110 duration-500"
                          />
                        ) : (
                          <ImageIcon size={40} className="text-gray-800" />
                        )}
                        <div className="absolute top-3 right-3 bg-[#00a884] text-white text-[9px] font-black px-2 py-1 rounded">
                           זמין במלאי
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-black text-white">{item.name}</p>
                            <p className="text-[10px] text-gray-500 font-mono tracking-widest">SKU: {item.sku || item.id}</p>
                          </div>
                          <p className="text-[#00a884] text-lg font-black tracking-tighter">₪{item.price}</p>
                        </div>
                        <button className="w-full bg-[#00a884]/10 hover:bg-[#00a884] text-[#00a884] hover:text-white py-2 rounded-xl text-xs font-bold transition-all border border-[#00a884]/20">
                          הוסף להזמנה
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </div>
        )}

        {/* שורת החיפוש הצפה - חזון ה-AI */}
        <div className={`w-full max-w-3xl fixed transition-all duration-700 z-50 ${response ? 'bottom-10' : 'relative mt-4'}`}>
          <div className="bg-[#1c272d]/95 backdrop-blur-2xl p-2 rounded-[2.5rem] border border-gray-700/50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex items-center gap-3">
            <div className="p-4 text-gray-500">
              {loading ? <Loader2 className="animate-spin text-[#00a884]" size={26} /> : <Calculator size={26} className="text-gray-600" />}
            </div>
            
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="שאל אותי 'כמה קרטונים צריך ל-30 מ''ר קרמיקה 60/60?'" 
              className="flex-1 bg-transparent outline-none text-base md:text-lg py-4 px-2 placeholder:text-gray-700"
            />
            
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#00a884] hover:bg-[#06cf9c] p-4 rounded-full text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              <Send size={26} strokeWidth={2.5} />
            </button>
          </div>
          <p className="text-center text-[9px] text-gray-700 mt-4 font-black tracking-[0.3em] uppercase">Saban Master Brain • local logic</p>
        </div>
      </main>
    </div>
  );
}
