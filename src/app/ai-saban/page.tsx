'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, ArrowRight, HardHat } from 'lucide-react';

export default function AiSabanPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'שלום רמי! כאן המומחה ההנדסי של ח. סבן. אני מחובר ומוכן לעזור לך עם כל שאלה על מוצרי Sika, חישובי כמויות או פתרונות איטום. מה על הפרק היום?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // גורם לצאט תמיד לקפוץ למטה להודעה האחרונה
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'אחי, יש תקלה בתקשורת. וודא שמפתח ה-API מוגדר ב-Vercel.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b141a] text-white font-sans overflow-hidden">
      
      {/* כותרת עליונה - סגנון WhatsApp מודרני */}
      <div className="bg-[#202c33] p-4 flex items-center justify-between shadow-lg border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#C9A227] rounded-full flex items-center justify-center text-black font-black text-xl shadow-inner">
            <HardHat size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">ח. סבן - חדר צ'אט הנדסי</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-xs text-green-500 font-medium">מומחה AI מחובר</p>
            </div>
          </div>
        </div>
      </div>

      {/* גוף הצ'אט - מסך מלא */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcd2de8.png')] bg-repeat opacity-95"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] md:max-w-[60%] p-4 rounded-2xl shadow-md text-base leading-relaxed ${
              m.role === 'user' 
              ? 'bg-[#005c4b] text-white rounded-tr-none' 
              : 'bg-[#202c33] text-white rounded-tl-none border border-gray-700'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#202c33] p-4 rounded-2xl text-sm animate-pulse text-gray-400">
              סבן מעבד נתונים הנדסיים...
            </div>
          </div>
        )}
      </div>

      {/* שורת כתיבה תחתונה - גדולה ולחיצה */}
      <div className="p-4 bg-[#202c33] border-t border-gray-700">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="שאל את המומחה של ח. סבן..."
            className="flex-1 p-4 rounded-xl bg-[#2a3942] text-white border-none focus:ring-2 focus:ring-[#C9A227] outline-none text-lg"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-[#C9A227] p-4 rounded-xl text-black hover:bg-[#e0b52d] transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
