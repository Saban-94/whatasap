'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, HardHat, MessageCircle, User } from 'lucide-react';

// קומפוננטת הקלדה אנושית עם תמיכה בעיצוב עשיר
const Typewriter = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
      }, 10); // מהירות הקלדה מקצועית
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return (
    <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base prose prose-invert prose-saban">
      {displayedText}
      {index < text.length && <span className="inline-block w-1.5 h-4 bg-[#C9A227] animate-pulse ml-1" />}
    </div>
  );
};

export default function CustomerAiPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'שלום רמי אחי! כאן המומחה של ח. סבן. איך אני יכול לעזור לך עם הפרויקט היום?' }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  // רפרנס לגלילה אוטומטית
  const scrollRef = useRef<HTMLDivElement>(null);

  // פונקציית גלילה לתחתית הצ'אט
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // גלילה בכל פעם שהודעה מתווספת או שה-AI חושב
  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'מצטער אחי, יש תקלה בחיבור. נסה שוב.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b141a] text-right" dir="rtl">
      
      {/* Header יוקרתי - ח. סבן */}
      <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-gray-700 shadow-2xl z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C9A227] rounded-full flex items-center justify-center text-black font-black text-xl shadow-inner border border-yellow-600">
            ח
          </div>
          <div>
            <h1 className="font-bold text-white text-sm md:text-base tracking-tight">ח. סבן - ייעוץ הנדסי AI</h1>
            <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest">זמין כעת | VIP SERVICE</p>
            </div>
          </div>
        </div>
      </div>

      {/* אזור הצ'אט עם גלילה אוטומטית */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcd2de8.png')] bg-repeat opacity-95"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`flex gap-3 max-w-[90%] md:max-w-[75%]`}>
              
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-[#202c33] border border-gray-600 flex items-center justify-center text-[#C9A227] shrink-0 shadow-md">
                    <HardHat size={16} />
                </div>
              )}

              <div className={`p-4 rounded-2xl shadow-xl ${
                m.role === 'user' 
                ? 'bg-[#005c4b] text-white rounded-tr-none border-l-4 border-[#C9A227]' 
                : 'bg-[#202c33] text-white rounded-tl-none border border-gray-700'
              }`}>
                {m.role === 'assistant' && i === messages.length - 1 ? (
                  <Typewriter text={m.content} />
                ) : (
                  <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed prose prose-invert">
                    {m.content}
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#005c4b] flex items-center justify-center text-white shrink-0 shadow-md">
                    <User size={16} />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-[#202c33] px-4 py-2 rounded-full border border-gray-700 text-[10px] text-gray-400 font-bold flex items-center gap-2">
                <span className="w-1 h-1 bg-[#C9A227] rounded-full animate-bounce"></span>
                סבן בודק במפרט הטכני...
            </div>
          </div>
        )}
      </div>

      {/* שורת כתיבה תחתונה */}
      <div className="p-4 bg-[#202c33] border-t border-gray-700 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
            placeholder="איך אפשר לעזור אחי?" 
            className="flex-1 p-3 md:p-4 rounded-2xl bg-[#2a3942] text-white outline-none border border-transparent focus:border-[#C9A227] transition-all text-sm md:text-base" 
          />
          <button 
            onClick={handleSend} 
            disabled={isThinking}
            className="bg-[#C9A227] p-3 md:p-4 rounded-2xl text-black hover:bg-[#e0b52d] active:scale-95 transition-all shadow-lg disabled:opacity-50"
          >
            <Send size={24} />
          </button>
        </div>
      </div>

      {/* עיצוב CSS פנימי לכותרות בזהב */}
      <style jsx global>{`
        .prose strong { color: #C9A227 !important; }
        .prose h1, .prose h2, .prose h3 { color: #C9A227 !important; font-weight: 800; }
        .prose hr { border-color: #374151; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
      `}</style>
    </div>
  );
}
