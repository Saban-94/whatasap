'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Search, CheckCheck, ShoppingCart, Package, Plus } from 'lucide-react';
import OrderSidebar from './components/OrderSidebar';

const SHAHAR_PROFILE_PIC = "https://api.dicebear.com/7.x/pixel-art/svg?seed=ShaharShaul";
const SABAN_AI_PROFILE_PIC = "https://api.dicebear.com/7.x/bottts/svg?seed=SabanAI";

export default function ShaharChatPage() {
  const [messages, setMessages] = useState<any[]>([
    { id: 1, text: "אהלן שחר! כאן גימני מסבן לוגיסטיקה. אני מכיר את כל הפרויקטים שלך. במה אוכל לעזור היום?", sender: 'ai', time: '08:00' }
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
      if (existing) {
        return prev.map(item => 
          item.sku === product.sku ? {...item, qty: item.qty + (product.qty || 1)} : item
        );
      }
      return [...prev, { ...product, qty: product.qty || 1 }];
    });
    setIsOrderOpen(true);
  };

  return (
    <div className="flex w-full h-full relative bg-[#0b141a]">
      {/* Sidebar - Desktop Only */}
      <div className="w-80 border-l border-[#202c33] hidden md:flex flex-col bg-[#111b21]">
        <header className="h-16 bg-[#202c33] p-4 flex items-center justify-between">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700">
             <img src={SHAHAR_PROFILE_PIC} alt="Shahar Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-4 text-[#aebac1]"><MoreVertical size={20}/></div>
        </header>
        <div className="p-3 bg-[#111b21]">
          <div className="bg-[#2a3942] flex items-center p-2 rounded-xl">
            <Search size={16} className="text-[#8696a0] mx-2" />
            <input placeholder="חפש פרויקט..." className="bg-transparent text-sm outline-none w-full text-right" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {['כללי', 'אבן יהודה', 'כפר מונש', 'ת"א'].map((site) => (
            <div key={site} className="p-4 border-b border-[#202c33] hover:bg-[#202c33] cursor-pointer">
              <p className="font-bold text-sm">פרויקט {site}</p>
              <p className="text-xs text-[#8696a0]">שחר שאול - ניהול אתר</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative border-r border-[#202c33]">
        <header className="h-16 bg-[#202c33] px-4 flex items-center justify-between z-20 shadow-lg">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full overflow-hidden border border-[#00a884]">
               <img src={SABAN_AI_PROFILE_PIC} alt="Saban AI" className="w-full h-full object-cover" />
             </div>
             <div className="flex flex-col">
               <span className="text-sm font-bold">סבן לוגיסטיקה - גימני</span>
               <span className="text-[10px] text-[#00a884] font-medium">מחובר | שחר שאול</span>
             </div>
          </div>
          <div className="flex items-center gap-4 text-[#aebac1]">
            <button onClick={() => setIsOrderOpen(true)} className="relative p-2 hover:bg-[#2a3942] rounded-full transition-colors">
              <ShoppingCart size={22} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#00a884] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-[#202c33]">
                  {cart.length}
                </span>
              )}
            </button>
            <MoreVertical size={22} className="cursor-pointer" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-5">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] md:max-w-[65%] p-3 rounded-2xl shadow-sm relative ${msg.sender === 'ai' ? 'bg-[#202c33] rounded-tr-none' : 'bg-[#005c4b] rounded-tl-none'}`}>
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-right">{msg.text}</p>
                
                {msg.products?.map((p: any) => (
                  <div key={p.sku} className="mt-3 bg-[#111b21] rounded-2xl p-4 border border-[#C9A227]/30 shadow-inner group transition-all hover:border-[#C9A227]">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2 text-right">
                        <div className="bg-[#C9A227]/10 p-2 rounded-lg text-[#C9A227]">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{p.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono">מק"ט: {p.sku}</p>
                        </div>
                      </div>
                      <button onClick={() => alert(`פרטי מוצר: ${p.name}`)} className="text-[#C9A227] hover:bg-[#C9A227]/10 p-1.5 rounded-full">
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-4 border-t border-gray-800 pt-3">
                      <div className="flex items-center gap-2 bg-[#202c33] rounded-xl p-1">
                        <button className="w-8 h-8 flex items-center justify-center text-white" onClick={() => { p.tempQty = Math.max(1, (p.tempQty || 1) - 1); setMessages([...messages]); }}>-</button>
                        <span className="text-xs font-bold w-6 text-center">{p.tempQty || 1}</span>
                        <button className="w-8 h-8 flex items-center justify-center text-white" onClick={() => { p.tempQty = (p.tempQty || 1) + 1; setMessages([...messages]); }}>+</button>
                      </div>
                      <button 
                        onClick={() => addToCart({ ...p, qty: p.tempQty || 1 })}
                        className="flex-1 bg-[#C9A227] text-black text-[11px] font-black py-2.5 rounded-xl flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={14} /> הוסף להזמנה
                      </button>
                    </div>
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

      {/* Sidebar Component */}
      <OrderSidebar 
        isOpen={isOrderOpen} 
        setIsOpen={setIsOrderOpen} 
        cart={cart} 
        setCart={setCart} 
      />
    </div>
  );
}
