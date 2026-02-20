'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Search, CheckCheck, ShoppingCart, Plus, Package } from 'lucide-react';
import OrderSidebar from './components/OrderSidebar';

export default function ShaharChatPage() {
  const [messages, setMessages] = useState<any[]>([
    { id: 1, text: "אהלן שחר, גימני כאן. אני מכיר את כל הפרויקטים שלך (אבן יהודה, כפר מונש, תל אביב). מה נשלח היום לאתר?", sender: 'ai', time: '08:00' }
  ]);
  const [input, setInput] = useState('');
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), text: input, sender: 'user', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    try {
      const res = await fetch('/shahar/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
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

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.sku === product.sku);
      if (existing) return prev.map(item => item.sku === product.sku ? {...item, qty: item.qty + 1} : item);
      return [...prev, { ...product, qty: 1 }];
    });
    setIsOrderOpen(true);
  };

  return (
    <div className="flex w-full h-full relative bg-[#0b141a]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative border-r border-[#202c33]">
        <header className="h-16 bg-[#202c33] px-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#C9A227] flex items-center justify-center font-bold text-black text-sm">ש</div>
             <div>
               <p className="text-sm font-bold">שחר שאול - תכנון ובניה</p>
               <p className="text-[10px] text-[#00a884]">המוח של סבן מחובר</p>
             </div>
          </div>
          <div className="flex items-center gap-4 text-[#aebac1]">
            <button onClick={() => setIsOrderOpen(true)} className="relative p-2 hover:bg-[#2a3942] rounded-full transition-colors">
              <ShoppingCart size={22} />
              {cart.length > 0 && <span className="absolute top-0 right-0 bg-[#00a884] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cart.length}</span>}
            </button>
            <MoreVertical size={22} className="cursor-pointer" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-5">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] md:max-w-[65%] p-3 rounded-2xl shadow-sm relative ${msg.sender === 'ai' ? 'bg-[#202c33] rounded-tr-none' : 'bg-[#005c4b] rounded-tl-none'}`}>
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-right">{msg.text}</p>
                
                {msg.products?.map((p: any) => (
                  <div key={p.sku} className="mt-3 bg-[#111b21] rounded-xl p-3 border border-[#C9A227]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#C9A227]/10 p-2 rounded-lg text-[#C9A227]"><Package size={18} /></div>
                      <span className="text-xs font-bold">{p.name}</span>
                    </div>
                    <button onClick={() => addToCart(p)} className="text-[10px] bg-[#C9A227] text-black px-3 py-1.5 rounded-lg font-black hover:scale-105 active:scale-95 transition-all">הוסף</button>
                  </div>
                ))}

                <div className="flex justify-end mt-2 items-center gap-1">
                  <span className="text-[9px] text-[#8696a0]">{msg.time}</span>
                  {msg.sender === 'user' && <CheckCheck size={14} className="text-[#53bdeb]" />}
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <footer className="bg-[#202c33] p-3 flex items-center gap-2">
          <Smile className="text-[#8696a0] cursor-pointer" />
          <Paperclip className="text-[#8696a0] cursor-pointer" />
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="כתוב הודעה..." 
            className="flex-1 bg-[#2a3942] rounded-xl py-2.5 px-4 outline-none text-sm text-right"
          />
          <button onClick={handleSendMessage} className="bg-[#00a884] p-3 rounded-full text-white shadow-lg">
            <Send size={18} />
          </button>
        </footer>
      </div>

      <OrderSidebar isOpen={isOrderOpen} setIsOpen={setIsOrderOpen} cart={cart} setCart={setCart} />
    </div>
  );
}
