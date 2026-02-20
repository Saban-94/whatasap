'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, ShoppingCart, Package, Plus, Moon, Sun, ShieldCheck, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import OrderSidebar from './components/OrderSidebar';

export default function ShaharFullApp() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [projects, setProjects] = useState(['אבן יהודה', 'כפר מונש']);
  const [cart, setCart] = useState<any[]>([]);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    addBotMessage("אהלן שחר אחי, גימני כאן. מוכן להעמיס היום? תגיד לי מה חסר או אם פתחנו אתר חדש.");
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const addBotMessage = (text: string, products: any[] = []) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), text, sender: 'ai', products, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }]);
      setIsTyping(false);
    }, 1200); // אפקט הקלדה
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), text: input, sender: 'user', time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    const res = await fetch('/shahar/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: currentInput, context: { cartCount: cart.length } }),
    });
    const data = await res.json();
    
    if (data.action === 'show_summary') setShowSummary(true);
    addBotMessage(data.reply, data.detectedProducts);
  };

  return (
    <div className={`${isDarkMode ? 'bg-[#0b141a] text-white' : 'bg-[#f0f2f5] text-black'} flex h-screen w-full transition-colors duration-300`} dir="rtl">
      
      {/* Sidebar פרויקטים */}
      <div className={`w-80 border-l ${isDarkMode ? 'border-[#202c33] bg-[#111b21]' : 'border-gray-200 bg-white'} hidden lg:flex flex-col p-6`}>
        <button onClick={() => setIsDarkMode(!isDarkMode)} className="mb-6 p-2 rounded-full self-start hover:bg-gray-500/20">
          {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
        </button>

        {/* תעודת זהות שחר */}
        <div className="bg-gradient-to-br from-[#C9A227] to-[#8e721b] p-5 rounded-3xl shadow-xl text-black mb-8 relative">
          <CreditCard className="absolute top-2 left-2 opacity-10 w-20 h-20" />
          <p className="text-[10px] font-black opacity-60">VIP CLIENT</p>
          <p className="text-xl font-black">שחר שאול</p>
          <div className="mt-4 flex justify-between items-end text-[10px] font-bold">
             <span>ח.סבן לוגיסטיקה</span>
             <span>ID: 621100</span>
          </div>
        </div>

        <h3 className="text-xs font-bold text-gray-500 mb-4 px-2 italic underline">פרויקטים אונליין</h3>
        <div className="space-y-2">
          {projects.map(p => (
            <div key={p} className={`p-4 rounded-2xl flex items-center gap-3 border ${isDarkMode ? 'bg-[#202c33] border-transparent' : 'bg-gray-100 border-gray-200'}`}>
              <div className="w-2 h-2 rounded-full bg-[#00a884] animate-pulse" />
              <span className="text-sm font-bold">{p}</span>
            </div>
          ))}
          <button onClick={() => setProjects([...projects, 'פרויקט חדש...'])} className="w-full p-3 rounded-2xl border-2 border-dashed border-gray-500 text-gray-500 flex items-center justify-center gap-2 hover:border-[#C9A227] hover:text-[#C9A227] transition-all">
            <Plus size={18} /> הוסף פרויקט
          </button>
        </div>
      </div>

      {/* אזור צ'אט */}
      <div className="flex-1 flex flex-col relative">
        <header className={`${isDarkMode ? 'bg-[#202c33]' : 'bg-white shadow-sm'} h-16 px-4 flex items-center justify-between z-10`}>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-black">S</div>
             <div>
               <p className="text-sm font-bold">גימני - ניהול רכש</p>
               <p className="text-[10px] text-[#00a884]">פעיל כעת</p>
             </div>
          </div>
          <div className="relative cursor-pointer" onClick={() => setIsOrderOpen(true)}>
             <ShoppingCart size={24} className={isDarkMode ? 'text-[#aebac1]' : 'text-gray-600'} />
             {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-[#C9A227] text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] p-4 rounded-3xl shadow-md ${msg.sender === 'ai' ? (isDarkMode ? 'bg-[#202c33] rounded-tr-none text-white' : 'bg-white rounded-tr-none') : 'bg-[#005c4b] rounded-tl-none text-white'}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {msg.products?.map((p: any) => (
                  <div key={p.sku} className="mt-4 bg-black/20 p-3 rounded-2xl border border-[#C9A227]/30 flex flex-col gap-3">
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#C9A227]">{p.name}</span>
                        <span className="text-[10px] opacity-50 font-mono">SKU: {p.sku}</span>
                     </div>
                     <button onClick={() => { setCart([...cart, p]); setIsOrderOpen(true); }} className="w-full bg-[#C9A227] text-black text-[10px] font-black py-2 rounded-xl">הוסף להזמנה</button>
                  </div>
                ))}
                <p className="text-[9px] mt-2 opacity-50">{msg.time}</p>
              </div>
            </div>
          ))}
          {isTyping && <div className="text-[10px] text-gray-500 animate-pulse italic">גימני מקליד...</div>}
          <div ref={scrollRef} />
        </div>

        <footer className={`p-4 ${isDarkMode ? 'bg-[#202c33]' : 'bg-white'}`}>
          <div className="flex items-center gap-3">
            <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&handleSend()} placeholder="כתוב לגימני..." className={`flex-1 p-3 rounded-2xl outline-none text-sm ${isDarkMode ? 'bg-[#2a3942]' : 'bg-gray-100'}`} />
            <button onClick={handleSend} className="bg-[#00a884] p-4 rounded-full text-white"><Send size={20} /></button>
          </div>
        </footer>
      </div>

      {/* מסך סיכום הזמנה */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
           <div className="bg-[#202c33] w-full max-w-md rounded-[40px] border-2 border-[#C9A227] overflow-hidden shadow-2xl p-8">
              <CheckCircle2 className="text-[#C9A227] mx-auto mb-4" size={50} />
              <h2 className="text-center text-xl font-black mb-6 text-white">סיכום הזמנה - ח.סבן</h2>
              <div className="space-y-4 text-sm text-gray-300 border-y border-gray-700 py-6">
                 <p>כמות מוצרים: <span className="text-white font-bold">{cart.length}</span></p>
                 <p>פרויקט: <span className="text-white font-bold">{projects[0]}</span></p>
              </div>
              <button onClick={() => setShowSummary(false)} className="w-full mt-8 bg-[#00a884] text-white font-black py-4 rounded-2xl">שלח לאישור מחלקת הזמנות</button>
           </div>
        </div>
      )}

      <OrderSidebar isOpen={isOrderOpen} setIsOpen={setIsOrderOpen} cart={cart} setCart={setCart} />
    </div>
  );
}
