'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Send, 
  Database, 
  Info, 
  Package, 
  Zap,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';

export default function SabanAICanvas() {
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // גלילה אוטומטית לסוף השיחה
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleAsk = async () => {
    if (!query.trim()) return;

    const userMsg = { role: 'user' as const, content: query };
    setChat(prev => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    // כאן תבוא הפנייה ל-dataEngine שיסרוק את products.json ו-technical_knowledge.json
    setTimeout(() => {
      setChat(prev => [...prev, { 
        role: 'ai', 
        content: `על פי המלאי והידע הטכני של סבן הנדסה: המוצר שביקשת קיים במלאי (סניף בני ברק). מומלץ ליישם עם רשת פיברגלס לתוצאה מקסימלית.` 
      }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0b141a] text-white font-sans flex flex-col" dir="rtl">
      
      {/* Header - עיצוב נקי ויוקרתי */}
      <header className="h-20 border-b border-gray-800 flex items-center justify-between px-8 bg-[#111b21]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#00a884] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00a884]/20">
            <Brain size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">AI-ח.סבן CANVAS</h1>
            <p className="text-[10px] text-[#00a884] font-bold uppercase tracking-widest">Knowledge & Inventory Engine</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-gray-400 text-xs font-bold">
          <div className="flex items-center gap-2"><Database size={14} /> סריקת מלאי פעילה</div>
          <div className="flex items-center gap-2"><Zap size={14} /> זמן תגובה: 0.8ms</div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 flex flex-col">
        
        <div className="flex-1 space-y-6 mb-24">
          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40 py-20">
              <MessageSquare size={64} className="text-gray-600" />
              <h2 className="text-2xl font-bold italic">שאל אותי על כל מוצר, מלאי או מפרט טכני...</h2>
              <div className="grid grid-cols-2 gap-3 max-w-md mt-6">
                <button className="bg-[#111b21] border border-gray-800 p-3 rounded-xl text-[10px] hover:border-[#00a884]">"כמה שקי סיקה 107 נשארו במלאי?"</button>
                <button className="bg-[#111b21] border border-gray-800 p-3 rounded-xl text-[10px] hover:border-[#00a884]">"איזה חומר מתאים לאיטום גג רטוב?"</button>
              </div>
            </div>
          )}

          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] p-5 rounded-3xl shadow-2xl transition-all ${
                msg.role === 'user' 
                ? 'bg-[#202c33] border border-gray-700 rounded-tr-none' 
                : 'bg-[#005c4b] text-white rounded-tl-none border-b-4 border-emerald-400/30'
              }`}>
                <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] font-bold">
                  {msg.role === 'user' ? <Users size={12} /> : <Zap size={12} />}
                  {msg.role === 'user' ? 'ראמי' : 'גימני AI'}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-end italic text-xs text-[#00a884] animate-pulse">גימני סורק את המוח הלוגיסטי...</div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Bar - עיצוב צף */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="bg-[#202c33] p-2 rounded-3xl border border-gray-700 shadow-2xl flex items-center gap-2 backdrop-blur-md">
            <div className="p-3 text-gray-500"><Info size={20} /></div>
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="שאל את ה-AI על מוצרים, מלאי או ידע טכני..." 
              className="flex-1 bg-transparent outline-none text-sm py-3 px-2"
            />
            <button 
              onClick={handleAsk}
              className="bg-[#00a884] hover:bg-[#06cf9c] p-4 rounded-2xl text-white transition-all shadow-lg active:scale-95"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-center text-[9px] text-gray-600 mt-3 font-medium">מופעל על ידי Saban Master Brain v2.0</p>
        </div>
      </main>
    </div>
  );
}

// קומפוננטת אייקון עזר
function Brain({ size, className }: { size: number, className: string }) {
  return <MessageSquare size={size} className={className} />;
}
function Users({ size, className }: { size: number, className: string }) {
  return <Package size={size} className={className} />;
}
