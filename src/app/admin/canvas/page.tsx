'use client';

import React, { useState, useEffect } from 'react';
import { Search, Send, Database, Zap, Globe, Loader2, Image as ImageIcon } from 'lucide-react';
import { processSmartOrder } from '@/lib/dataEngine'; // המנוע שסורק את ה-JSON וה-Supabase

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
      
      {/* סרגל עליון - סטטוס מערכת ח. סבן */}
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
          <span className="flex items-center gap-1"><Database size={12} className="text-[#00a884]"/> נתונים: SUPABASE</span>
        </div>
      </header>

      {/* מרכז הדף - ה-3D AI Orb (הנשמה) */}
      <main className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center relative p-6">
        
        {/* אפקטים של תאורה ברקע */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00a884]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className={`relative transition-all duration-700 ${response ? 'scale-50 h-32 opacity-50' : 'h-64 mb-12'}`}>
          
          {/* הילה נושמת מסביב לאווטאר - ה"נשמה הויזואלית" */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00a884] opacity-20 blur-[100px] rounded-full animate-[pulse_4s_ease-in-out_infinite]"
            style={{ width: 400, height: 400 }}
          />

          {/* האווטאר המרכזי מ-avattar.png */}
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
            {/* טבעת חיצונית מסתובבת 720 מעלות */}
            <div className={`absolute inset-0 border-2 border-dashed border-[#00a884]/30 rounded-full animate-[spin-720_4s_linear_infinite]`} />
            
            {/* ה-Orb הנושם ב-3D */}
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-tr from-[#00a884] to-[#005c4b] rounded-full shadow-[0_0_80px_rgba(0,168,132,0.4)] animate-[pulse_6s_ease-in-out_infinite] flex items-center justify-center overflow-hidden border-4 border-[#111b21]">
                <img 
                  src="/avattar.png" 
                  alt="Saban AI" 
                  className="object-contain w-full h-full p-4"
                />
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
                <Zap size={14} /> בינה מלאכותית מבוססת מלאי
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
          <div className="bg-[#1c272d]/90 backdrop-blur-2xl p-2 rounded-[2.5rem] border border-gray-700/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] flex items-center gap-3 group focus-within:border-[#00a884]/50">
            <div className="p-4 text-gray-500 group-focus-within:text-[#00a884]">
              {loading ? <Loader2 className="animate-spin text-[#00a884]" size={24} /> : <Search size={24} strokeWidth={2.5} />}
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
              className="bg-[#00a884] hover:bg-[#06cf9c] p-4 rounded-full text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 group-hover:shadow-[#00a884]/20"
            >
              <Send size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}    setQuery('');
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
