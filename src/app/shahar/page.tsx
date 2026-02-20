'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, ShoppingCart, Truck, Loader2, Moon, Sun } from 'lucide-react';

// הגדרת סוגים כדי למנוע Type Error ב-Vercel
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

      // אם יש חריגת מנוף (למשל 15 מטר) - Ai-ח.סבן מעדכן שזה עובר לראמי
      if (data.status === 'WAITING_FOR_RAMI') {
        setTimeout(() => {
          addBotMessage("**ראמי מסארוה** בודק עכשיו את זמינות המנוף הארוך... תשובה תופיע כאן מיד. ⏳");
        }, 1500);
      }
    } catch (e) {
      addBotMessage("**אחי, יש תקלה בתקשורת מול החמ"ל. שלח שוב.**");
    }
  };

  return (
    <div className={`${isDarkMode ? 'bg-[#0b141a] text-[#e9edef]' : 'bg-[#f0f2f5] text-black'} flex flex-col h-screen w-full font-sans overflow-hidden`} dir="rtl">
      
      <header className={`${isDarkMode ? 'bg-[#202c33]' : 'bg-white'} p-4 flex items-center justify-between border-b border-white/5`}>
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 bg-[#00a884] rounded-full flex items-center justify-center font-black text-white shadow-lg">Ai</div>
           <div>
              <h1 className="text-lg font-black tracking-tight">Ai-ח.סבן</h1>
              <span className="text-[10px] text-[#00a884] font-bold uppercase">סדרן: ראמי מסארוה</span>
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
                {/* התיקון ל-Type Error כאן: הגדרת part כ-string */}
                {msg.text.split('**').map((part: string, i: number) => 
                  i % 2 === 1 ? <strong key={i} className="font-black text-[#C9A227]">{part}</strong> : part
                )}
              </p>
            </div>
          </div>
        ))}
        {isThinking && <div className="text-[10px] font-bold animate-pulse text-[#00a884]">Ai-ח.סבן מעבד נתונים...</div>}
        <div ref={scrollRef} />
      </div>

      <footer className="p-4 bg-[#0b141a] pb-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-[#2a3942] p-2 rounded-[2rem]">
          <input 
            value={input} onChange={(e)=>setInput(e.target.value)} 
            onKeyDown={(e)=>e.key==='Enter' && handleSend()}
            placeholder="שאל את Ai-ח.סבן (מנוף, דבק, מצע...)" 
            className="flex-1 bg-transparent p-4 outline-none text-white text-sm font-bold" 
          />
          <button onClick={handleSend} className="bg-[#00a884] p-4 rounded-full text-white">
              <Send size={24} />
          </button>
        </div>
      </footer>
    </div>
  );
}  }, [messages, isThinking]);

  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now(), text, sender: 'ai' }]);
    setIsThinking(false);
  };

  const handleFinalOrder = () => {
    const whatsappMsg = `*הזמנה דחופה - Ai-ח.סבן*\n━━━━━━━━━━━━━━━━━━\n👤 *לקוח:* שחר שאול\n🏗️ *אתר:* ${selectedProject.name}\n📦 *פריטים:* ${cart.length}\n🚨 *סטטוס:* ממתין לאישור ראמי מסארוה\n━━━━━━━━━━━━━━━━━━`;
    window.open(`https://wa.me/972508860896?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
    setCart([]);
    addBotMessage("**ההזמנה בטיפול! ראמי קיבל התראה, הנהג כבר מחמם מנוע. אש!** 🔥");
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/shahar/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, context: { selectedProject } }),
      });
      const data = await res.json();
      addBotMessage(data.reply);
    } catch (e) {
      addBotMessage("**ראמי אומר שיש תקלה ברשת. נסה שוב אחי.**");
    }
  };

  return (
    <div className={`${isDarkMode ? 'bg-[#0b141a] text-[#e9edef]' : 'bg-[#f0f2f5] text-black'} flex flex-col h-screen w-full font-sans overflow-hidden`} dir="rtl">
      
      {/* Mobile Header */}
      <header className={`${isDarkMode ? 'bg-[#202c33]' : 'bg-white'} p-4 flex items-center justify-between shadow-lg z-30 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3">
           <img src={SABAN_LOGO} className="w-12 h-12 rounded-full border-2 border-[#00a884] shadow-inner" />
           <div>
              <h1 className="text-lg font-black tracking-tight">Ai-ח.סבן</h1>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[#00a884] font-bold uppercase tracking-widest">סדרן: ראמי מסארוה</span>
              </div>
           </div>
        </div>
        <div className="flex gap-3">
            <button onClick={() => setIsOrderOpen(true)} className="relative p-2 bg-white/5 rounded-full"><ShoppingCart size={24} />{cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#C9A227] text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">{cart.length}</span>}</button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-white/5 rounded-full">{isDarkMode ? <Sun size={24} /> : <Moon size={24} />}</button>
        </div>
      </header>

      {/* Chat Space */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'} items-end gap-2`}>
            <div className={`max-w-[88%] p-4 rounded-2xl shadow-md ${msg.sender === 'ai' ? (isDarkMode ? 'bg-[#202c33] border border-white/5' : 'bg-white') : 'bg-[#005c4b] text-white'} transition-all duration-300`}>
              <p className="text-[15px] text-right whitespace-pre-line leading-relaxed">
                {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="font-black text-[#C9A227]">{part}</strong> : part)}
              </p>
            </div>
          </div>
        ))}
        {isThinking && <div className="flex justify-start animate-pulse"><div className="bg-[#202c33] px-4 py-2 rounded-full text-[10px] font-bold">Ai-ח.סבן בודק מול ראמי...</div></div>}
        <div ref={scrollRef} />
      </div>

      {/* Sticky Mobile Order Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 p-4 pointer-events-none">
          <button onClick={handleFinalOrder} className="w-full bg-[#00a884] text-white py-5 rounded-2xl font-black shadow-[0_10px_40px_rgba(0,168,132,0.4)] flex items-center justify-center gap-3 pointer-events-auto active:scale-95 transition-all">
            <Truck size={24} /> שלח הזמנה לראמי (אש 🔥)
          </button>
        </div>
      )}

      {/* Input Area */}
      <footer className={`p-4 ${isDarkMode ? 'bg-[#202c33]' : 'bg-white border-t'} pb-8`}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input 
            value={input} onChange={(e)=>setInput(e.target.value)} 
            onKeyDown={(e)=>e.key==='Enter' && handleSend()}
            placeholder="דבר עם Ai-ח.סבן..." 
            className={`flex-1 p-5 rounded-2xl text-sm font-medium outline-none ${isDarkMode ? 'bg-[#2a3942] text-white' : 'bg-gray-100 text-black'}`} 
          />
          <button onClick={handleSend} className="bg-[#00a884] p-5 rounded-2xl text-white shadow-lg active:rotate-12 transition-transform">
              <Send size={24} />
          </button>
        </div>
      </footer>

      <OrderSidebar isOpen={isOrderOpen} setIsOpen={setIsOrderOpen} cart={cart} setCart={setCart} />
    </div>
  );
}
