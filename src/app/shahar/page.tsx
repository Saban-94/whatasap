'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, ShoppingCart, Truck, Loader2, Moon, Sun } from 'lucide-react';

// הגדרת סוגים למניעת Type Errors
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export default function ShaharHyperApp() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedProject = { name: 'אבן יהודה', address: 'האתרוג 44' };

  useEffect(() => {
    if (messages.length === 0) {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? "**בוקר אור שחר אחי! הקפה מוכן? בוא נתחיל להעמיס.** ☕" : "**צהריים טובים שחר יא תותח. השמש בשיא, אבל אנחנו לא עוצרים!** ☀️";
      addBotMessage(`${greeting} \n\n **Ai-ח.סבן** כאן. ראמי מסארוה כבר בלוח השיבוצים, מה חסר לך ב${selectedProject.name}?`);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now(), text, sender: 'ai' }]);
    setIsThinking(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/shahar/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });
      const data = await res.json();
      
      addBotMessage(data.reply);

      if (data.status === 'WAITING_FOR_RAMI') {
        setTimeout(() => {
          addBotMessage("**ראמי מסארוה** בודק עכשיו את זמינות המנוף הארוך... תשובה תופיע כאן מיד. ⏳");
        }, 1500);
      }
    } catch (e) {
      // התיקון הקריטי כאן: שימוש ב-Backticks כדי למנוע שבירת קוד בגלל הגרשיים במילה חמ"ל
      addBotMessage(`**אחי, יש תקלה בתקשורת מול החמ"ל. שלח שוב.**`);
    }
  };

  return (
    <div className={`${isDarkMode ? 'bg-[#0b141a] text-[#e9edef]' : 'bg-[#f0f2f5] text-black'} flex flex-col h-screen w-full font-sans overflow-hidden`} dir="rtl">
      
      <header className={`${isDarkMode ? 'bg-[#202c33]' : 'bg-white'} p-4 flex items-center justify-between border-b border-white/5`}>
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 bg-[#00a884] rounded-full flex items-center justify-center font-black text-white shadow-lg">Ai</div>
           <div>
              <h1 className="text-lg font-black tracking-tight">Ai-ח.סבן</h1>
              <span className="text-[10px] text-[#00a884] font-bold uppercase tracking-widest">סדרן: ראמי מסארוה</span>
           </div>
        </div>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-white/5 rounded-full">
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'} items-end gap-2`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-md ${msg.sender === 'ai' ? (isDarkMode ? 'bg-[#202c33] border border-white/5' : 'bg-white') : 'bg-[#005c4b] text-white'}`}>
              <p className="text-[15px] text-right whitespace-pre-line leading-relaxed">
                {msg.text.split('**').map((part: string, i: number) => 
                  i % 2 === 1 ? <strong key={i} className="font-black text-[#C9A227]">{part}</strong> : part
                )}
              </p>
            </div>
          </div>
        ))}
        {isThinking && <div className="text-[10px] font-bold animate-pulse text-[#00a884] px-4">Ai-ח.סבן מעדכן את המשרד...</div>}
        <div ref={scrollRef} />
      </div>

      <footer className="fixed bottom-0 w-full p-4 bg-[#0b141a] pb-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-[#2a3942] p-2 rounded-[2rem] border border-white/5 shadow-2xl">
          <input 
            value={input} onChange={(e)=>setInput(e.target.value)} 
            onKeyDown={(e)=>e.key==='Enter' && handleSend()}
            placeholder="דבר עם Ai-ח.סבן (מנוף, דבקים, פינוי...)" 
            className="flex-1 bg-transparent p-4 outline-none text-white text-sm font-bold placeholder:text-gray-500" 
          />
          <button onClick={handleSend} className="bg-[#00a884] p-4 rounded-full text-white hover:bg-[#00c99d] transition-all active:scale-90">
              <Send size={24} />
          </button>
        </div>
      </footer>
    </div>
  );
}
