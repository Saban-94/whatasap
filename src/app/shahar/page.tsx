'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, ShoppingCart, Package, Plus, Bell, ShieldCheck, CreditCard } from 'lucide-react';
import OrderSidebar from './components/OrderSidebar';

const SHAHAR_PROFILE_PIC = "https://api.dicebear.com/7.x/pixel-art/svg?seed=ShaharShaul";
const SABAN_AI_PROFILE_PIC = "https://api.dicebear.com/7.x/bottts/svg?seed=SabanAI";

export default function ShaharChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // התקנת OneSignal והתראות
  useEffect(() => {
    // שליפת הודעה ראשונית
    setMessages([{ id: 1, text: "שלום שחר, מערכת ההתראות הופעלה. תקבל עדכון על כל שינוי בסטטוס ההזמנה.", sender: 'ai', time: '09:00' }]);
    
    // סימולציית OneSignal (בהנחה והסקריפט ב-layout)
    if (typeof window !== 'undefined' && (window as any).OneSignal) {
      (window as any).OneSignal.push(() => {
        (window as any).OneSignal.showNativePrompt();
      });
    }
  }, []);

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
      
      // השמעת צליל התראה (WhatsApp Web style)
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.play().catch(() => {});
      
    } catch (e) { console.error(e); }
  };

  const addToCart = (product: any) => {
    setCart(prev => [...prev, { ...product, qty: product.tempQty || 1 }]);
    setIsOrderOpen(true);
  };

  return (
    <div className="flex w-full h-screen relative bg-[#0b141a] overflow-hidden text-right" dir="rtl">
      
      {/* Sidebar - ID Card Section */}
      <div className="w-80 border-l border-[#202c33] hidden lg:flex flex-col bg-[#111b21]">
        <div className="p-6 space-y-6">
          {/* תעודת זהות אפליקטיבית */}
          <div className="bg-gradient-to-br from-[#C9A227] to-[#8e721b] p-4 rounded-2xl shadow-xl relative overflow-hidden text-black">
            <div className="absolute top-[-10px] right-[-10px] opacity-10"><CreditCard size={100} /></div>
            <div className="flex justify-between items-start mb-8">
              <ShieldCheck size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Saban Logistics VIP</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase opacity-80">שם הלקוח</p>
              <p className="font-bold text-lg">שחר שאול</p>
            </div>
            <div className="mt-4 flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase opacity-80">מספר לקוח</p>
                <p className="font-mono font-bold">#621100</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <img src={SHAHAR_PROFILE_PIC} alt="Avatar" className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
             <h3 className="text-[#8696a0] text-xs font-bold px-2">פרויקטים פעילים</h3>
             {['אבן יהודה', 'כפר מונש'].map(p => (
               <div key={p} className="bg-[#202c33] p-3 rounded-xl flex items-center gap-3 border border-transparent hover:border-[#00a884] cursor-pointer transition-all">
                 <div className="w-2 h-2 rounded-full bg-[#00a884]" />
                 <span className="text-sm font-medium text-white">{p}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <header className="h-16 bg-[#202c33] px-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
             <img src={SABAN_AI_PROFILE_PIC} className="w-10 h-10 rounded-full border border-[#00a884]" />
             <div>
               <p className="text-sm font-bold">גימני - שירות אישי</p>
               <div className="flex items-center gap-1">
                 <div className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-pulse" />
                 <p className="text-[10px] text-[#8696a0]">שחר שאול מחובר</p>
               </div>
             </div>
          </div>
          <div className="flex gap-4 text-[#aebac1]">
            <Bell size={20} className="cursor-pointer hover:text-white" />
            <div className="relative cursor-pointer" onClick={() => setIsOrderOpen(true)}>
              <ShoppingCart size={22} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[#C9A227] text-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://i.ibb.co/S6mXvY7/whatsapp-bg.png')]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] md:max-w-[60%] p-3 rounded-2xl shadow-lg relative ${msg.sender === 'ai' ? 'bg-[#202c33]' : 'bg-[#005c4b]'}`}>
                <p className="text-sm">{msg.text}</p>
                
                {/* הצגת מוצרים עם תמונות */}
                {msg.products?.map((p: any) => (
                  <div key={p.sku} className="mt-4 bg-[#111b21] rounded-xl overflow-hidden border border-[#C9A227]/20">
                    <img 
                      src={`https://saban-logistics.vercel.app/api/products/image?sku=${p.sku}`} 
                      alt={p.name}
                      className="w-full h-32 object-cover bg-[#2a3942]"
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300x150?text=Product+Image')}
                    />
                    <div className="p-3">
                      <p className="text-xs font-bold text-[#C9A227]">{p.name}</p>
                      <div className="flex justify-between items-center mt-3">
                         <div className="flex items-center gap-2 bg-[#202c33] rounded-lg px-2 py-1">
                            <button onClick={() => { p.tempQty = (p.tempQty || 1) + 1; setMessages([...messages]); }} className="text-white">+</button>
                            <span className="text-xs">{p.tempQty || 1}</span>
                            <button onClick={() => { p.tempQty = Math.max(1, (p.tempQty || 1) - 1); setMessages([...messages]); }} className="text-white">-</button>
                         </div>
                         <button onClick={() => addToCart(p)} className="bg-[#C9A227] text-black text-[10px] font-bold px-3 py-2 rounded-lg">הוסף לסל</button>
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-[9px] text-gray-400 mt-1 text-left">{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <footer className="bg-[#202c33] p-3 flex items-center gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="שלח הודעה לגימני..." 
            className="flex-1 bg-[#2a3942] rounded-full py-2 px-4 outline-none text-sm text-white"
          />
          <button onClick={handleSendMessage} className="bg-[#00a884] p-3 rounded-full text-white shadow-lg"><Send size={18} /></button>
        </footer>
      </div>

      <OrderSidebar isOpen={isOrderOpen} setIsOpen={setIsOrderOpen} cart={cart} setCart={setCart} />
    </div>
  );
}
