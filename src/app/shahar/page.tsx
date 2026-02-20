'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, ShoppingCart, Package, Plus, Bell, ShieldCheck, CreditCard, CheckCircle2 } from 'lucide-react';
import OrderSidebar from './components/OrderSidebar';

const SHAHAR_PROFILE_PIC = "https://media-mrs2-1.cdn.whatsapp.net/v/t61.24694-24/524989315_1073256511118475_7315275522833323073_n.jpg?stp=dst-jpg_s96x96_tt6&ccb=11-4&oh=01_Q5Aa3wEdYEkQedjfHMyKEvUOGoJo1PSvWHB36kS9JNJ-FcMWOg&oe=69A5059E&_nc_sid=5e03e0&_nc_cat=111";
const SABAN_AI_PROFILE_PIC = "https://api.dicebear.com/7.x/bottts/svg?seed=SabanAI";

export default function ShaharChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [context, setContext] = useState({ project: 'אבן יהודה' });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ id: 1, text: "אהלן שחר אחי, גימני כאן. ראיתי שאתה באבן יהודה היום, מה חסר לך במחסן?", sender: 'ai', time: '09:00' }]);
  }, []);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
        body: JSON.stringify({ message: currentInput, currentContext: context }),
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, text: data.reply, sender: 'ai', 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        products: data.detectedProducts 
      }]);

      if (data.newContext) setContext(data.newContext);
      if (data.action === 'show_summary') setShowSummary(true);

      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.play().catch(() => {});
    } catch (e) { console.error(e); }
  };

  const addToCart = (product: any) => {
    setCart(prev => [...prev, { ...product, qty: product.tempQty || 1 }]);
    setIsOrderOpen(true);
  };

  return (
    <div className="flex w-full h-screen bg-[#0b141a] overflow-hidden text-right" dir="rtl">
      
      {/* Sidebar - ID Card */}
      <div className="w-80 border-l border-[#202c33] hidden lg:flex flex-col bg-[#111b21] p-6 space-y-6">
        <div className="bg-gradient-to-br from-[#C9A227] to-[#8e721b] p-5 rounded-3xl shadow-2xl text-black relative">
          <CreditCard className="absolute -top-4 -left-4 opacity-10 w-32 h-32" />
          <div className="flex justify-between items-start mb-10">
            <ShieldCheck size={28} />
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-2 py-1 rounded">VIP CUSTOMER</span>
          </div>
          <p className="text-[10px] uppercase opacity-70">שם הלקוח</p>
          <p className="font-black text-xl mb-4">שחר שאול</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] opacity-70">פרויקט פעיל</p>
              <p className="font-bold text-sm">{context.project}</p>
            </div>
            <img src={SHAHAR_PROFILE_PIC} className="w-12 h-12 bg-white/20 rounded-full border-2 border-black/10" />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative border-r border-[#202c33]">
        <header className="h-16 bg-[#202c33] px-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
             <img src={SABAN_AI_PROFILE_PIC} className="w-10 h-10 rounded-full border border-[#00a884]" />
             <div>
               <p className="text-sm font-bold">גימני - סבן לוגיסטיקה</p>
               <p className="text-[10px] text-[#00a884] animate-pulse">שחר שאול מחובר כעת</p>
             </div>
          </div>
          <div className="flex gap-4 text-[#aebac1]">
            <div className="relative cursor-pointer" onClick={() => setIsOrderOpen(true)}>
              <ShoppingCart size={22} />
              {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-[#C9A227] text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-[#202c33]">{cart.length}</span>}
            </div>
            <MoreVertical size={22} />
          </div>
        </header>

        {/* Messages with WhatsApp Wallpaper */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-5">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl shadow-md relative ${msg.sender === 'ai' ? 'bg-[#202c33]' : 'bg-[#005c4b]'}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {msg.products?.map((p: any) => (
                  <div key={p.sku} className="mt-3 bg-[#111b21] rounded-2xl border border-[#C9A227]/30 overflow-hidden">
                    <img src={`/api/products/image?sku=${p.sku}`} className="w-full h-24 object-cover opacity-80" onError={(e) => e.currentTarget.src="https://via.placeholder.com/150"} />
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-[10px] font-bold">{p.name}</span>
                      <button onClick={() => addToCart(p)} className="bg-[#C9A227] text-black text-[10px] font-bold px-3 py-1 rounded-lg">הוסף</button>
                    </div>
                  </div>
                ))}
                <span className="text-[9px] text-gray-400 block mt-1">{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <footer className="bg-[#202c33] p-3 flex items-center gap-2">
          <input 
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="דבר עם גימני..." 
            className="flex-1 bg-[#2a3942] rounded-full py-2.5 px-5 outline-none text-sm"
          />
          <button onClick={handleSendMessage} className="bg-[#00a884] p-3 rounded-full text-white shadow-lg"><Send size={18} /></button>
        </footer>
      </div>

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#202c33] w-full max-w-sm rounded-3xl border border-[#C9A227] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="bg-[#C9A227] p-4 text-black text-center font-black flex items-center justify-center gap-2">
              <CheckCircle2 size={20} /> סיכום הזמנה לשחר שאול
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">אתר אספקה:</span>
                <span className="font-bold text-white">{context.project}</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {cart.map(item => (
                  <div key={item.sku} className="flex justify-between bg-black/20 p-2 rounded">
                    <span>{item.qty} x {item.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={() => setShowSummary(false)} className="flex-1 py-3 rounded-xl border border-gray-600 font-bold">תיקון</button>
                <button onClick={() => { alert("שולח לקבוצת הוואטסאפ..."); setShowSummary(false); setCart([]); }} className="flex-1 py-3 rounded-xl bg-[#00a884] text-white font-black">שלח לקבוצה</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <OrderSidebar isOpen={isOrderOpen} setIsOpen={setIsOrderOpen} cart={cart} setCart={setCart} />
    </div>
  );
}
