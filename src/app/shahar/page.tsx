'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Search, CheckCheck, ShoppingCart, Plus, Package, Clock, FileText } from 'lucide-react';
import OrderSidebar from './components/OrderSidebar';

export default function ShaharChatPage() {
  const [messages, setMessages] = useState<any[]>([
    { id: 1, text: "שלום שחר, כאן גימני מסבן לוגיסטיקה. איך אני יכול לעזור בפרויקטים שלך היום?", sender: 'ai', time: '08:00' }
  ]);
  const [input, setInput] = useState('');
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // גלילה אוטומטית להודעה אחרונה
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), text: input, sender: 'user', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // פנייה למוח של גימני (ה-API של שחר)
    try {
      const res = await fetch('/app/shahar/api/assistant', {
        method: 'POST',
        body: JSON.stringify({ message: input, customerId: '621100' }),
      });
      const data = await res.json();
      
      const aiMsg = { 
        id: Date.now() + 1, 
        text: data.reply, 
        sender: 'ai', 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        products: data.detectedProducts 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error("AI Error", e);
    }
  };

  return (
    <div className="flex w-full h-full relative">
      {/* Sidebar - רשימת פרויקטים של שחר */}
      <div className="w-80 border-l border-[#202c33] hidden md:flex flex-col bg-[#111b21]">
        <header className="h-16 bg-[#202c33] p-4 flex items-center justify-between">
          <div className="w-10 h-10 rounded-full bg-[#C9A227] flex items-center justify-center font-bold text-black">ש</div>
          <div className="flex gap-4 text-[#aebac1]"><MoreVertical size={20}/></div>
        </header>
        <div className="p-3 bg-[#111b21]">
          <div className="bg-[#202c33] flex items-center p-2 rounded-xl">
            <Search size={16} className="text-[#8696a0] mx-2" />
            <input placeholder="חפש פרויקט..." className="bg-transparent text-sm outline-none w-full" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {['כללי', 'אבן יהודה', 'כפר מונש', 'ת"א'].map((site) => (
            <div key={site} className="p-4 border-b border-[#202c33] hover:bg-[#202c33] cursor-pointer">
              <p className="font-bold text-sm">שחר שאול - {site}</p>
              <p className="text-xs text-[#8696a0]">לחץ לצפייה בהיסטוריה</p>
            </div>
          ))}
        </div>
      </div>

      {/* אזור הצ'אט המרכזי */}
      <div className="flex-1 flex flex-col bg-[#0b141a] relative">
        <header className="h-16 bg-[#202c33] px-4 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-bold">S</div>
             <div>
               <p className="text-sm font-bold">סבן לוגיסטיקה - שירות לקוחות</p>
               <p className="text-[10px] text-[#00a884]">גימני מחובר | שחר שאול</p>
             </div>
          </div>
          <button onClick={() => setIsOrderOpen(!isOrderOpen)} className="bg-[#C9A227]/20 p-2 rounded-full text-[#C9A227]">
            <ShoppingCart size={22} />
          </button>
        </header>

        {/* בועות צ'אט */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 bg-[url('https://i.ibb.co/S6mXvY7/whatsapp-bg.png')] bg-repeat">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] md:max-w-[60%] p-3 rounded-xl shadow-md relative ${msg.sender === 'ai' ? 'bg-[#202c33]' : 'bg-[#005c4b]'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                
                {/* הצגת כרטיסי מוצר בתוך הצ'אט אם גימני זיהה אותם */}
                {msg.products?.map((p: any) => (
                  <div key={p.sku} className="mt-3 bg-[#111b21] rounded-lg p-2 border border-[#C9A227]/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-[#C9A227]" />
                      <span className="text-xs font-bold">{p.name}</span>
                    </div>
                    <button 
                      onClick={() => {setCart([...cart, {...p, qty: 1}]); setIsOrderOpen(true)}}
                      className="text-[10px] bg-[#C9A227] text-black px-2 py-1 rounded font-black"
                    >הוסף לסל</button>
                  </div>
                ))}

                <div className="flex justify-end mt-1 items-center gap-1">
                  <span className="text-[10px] text-[#8696a0]">{msg.time}</span>
                  {msg.sender === 'user' && <CheckCheck size={14} className="text-[#53bdeb]" />}
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* תיבת קלט */}
        <footer className="bg-[#202c33] p-3 flex items-center gap-3">
          <Smile className="text-[#8696a0] cursor-pointer" />
          <Paperclip className="text-[#8696a0] cursor-pointer" />
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="כתוב הודעה לשירות לקוחות..." 
            className="flex-1 bg-[#2a3942] rounded-xl py-2 px-4 outline-none text-sm"
          />
          <button onClick={handleSendMessage} className="bg-[#00a884] p-3 rounded-full text-white hover:scale-110 transition-transform">
            <Send size={20} />
          </button>
        </footer>
      </div>

      {/* Order Sidebar */}
      <OrderSidebar isOpen={isOrderOpen} setIsOpen={setIsOrderOpen} cart={cart} setCart={setCart} />
    </div>
  );
}
