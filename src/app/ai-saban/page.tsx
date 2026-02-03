'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, HardHat, MessageCircle } from 'lucide-react';

const Typewriter = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
      }, 15);
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return (
    <div className="whitespace-pre-wrap text-white leading-relaxed text-sm md:text-base">
      {displayedText}
      {index < text.length && <span className="inline-block w-1.5 h-4 bg-[#C9A227] animate-pulse ml-1" />}
    </div>
  );
};

export default function CustomerAiPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'שלום! אני היועץ ההנדסי של ח. סבן. צריך עזרה בחישוב כמויות סיקה או פתרון לאיטום? אני פה בשבילך אחי.' }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
      setMessages(prev => [...prev, { role: 'assistant', content: 'סליחה אחי, הייתה שגיאה בחיבור.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b141a] rtl">
      <div className="bg-[#202c33] p-4 flex items-center justify-between border-b border-gray-700 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C9A227] rounded-full flex items-center justify-center text-black font-black text-xl shadow-inner">ח</div>
          <div>
            <h1 className="font-bold text-white text-sm md:text-base">ח. סבן - ייעוץ הנדסי AI</h1>
            <p className="text-[9px] text-green-500 font-bold tracking-widest uppercase">זמין כעת | VIP Service</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcd2de8.png')] bg-repeat opacity-90">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-md ${m.role === 'user' ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#202c33] text-white rounded-tl-none border border-gray-700'}`}>
              {m.role === 'assistant' && i === messages.length - 1 ? <Typewriter text={m.content} /> : <div className="whitespace-pre-wrap text-sm md:text-base">{m.content}</div>}
            </div>
          </div>
        ))}
        {isThinking && <div className="flex items-center gap-2 text-gray-500 text-xs italic animate-pulse p-2"><span className="w-1.5 h-1.5 bg-[#C9A227] rounded-full animate-bounce"></span> סבן מעבד נתונים...</div>}
      </div>

      <div className="p-4 bg-[#202c33] border-t border-gray-700">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="איך אפשר לעזור אחי?" className="flex-1 p-3 md:p-4 rounded-xl bg-[#2a3942] text-white outline-none border border-transparent focus:border-[#C9A227] transition-all" />
          <button onClick={handleSend} className="bg-[#C9A227] p-3 md:p-4 rounded-xl text-black hover:bg-[#e0b52d] transition-all shadow-lg"><Send size={24} /></button>
        </div>
      </div>
    </div>
  );
}
