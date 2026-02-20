'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Search, CheckCheck, ShoppingCart, Package, Plus } from 'lucide-react';
import OrderSidebar from './components/OrderSidebar';

// לינק לתמונת פרופיל של שחר שאול
const SHAHAR_PROFILE_PIC = "https://api.dicebear.com/7.x/pixel-art/svg?seed=ShaharShaul";
// לינק לתמונת פרופיל של Saban AI
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
      {/* Sidebar - רשימת פרויקטים של שחר (לא הושלם - עדיין דינמי) */}
      <div className="w-80 border-l border-[#202c33] hidden md:flex flex-col bg-[#111b21]">
        <header className="h-16 bg-[#202c33] p-4 flex items-center justify-between">
          <div className="w-10 h-10 rounded-full overflow-hidden">
             <img src={SHAHAR_PROFILE_PIC} alt="Shahar Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-4 text-[#aebac1]"><MoreVertical size={20}/></div>
        </header>
        <div className="p-3 bg-[#111b21]">
          <div className="bg-[#2a3942] flex items-center p-2 rounded-xl"> {/* שיניתי את הרקע לבהיר יותר */}
            <Search size={16} className="text-[#8696a0] mx-2" />
            <input placeholder="חפש פרויקט..." className="bg-transparent text-sm outline-none w-full text-right" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {['כללי', 'אבן יהודה', 'כפר מונש', 'ת"א'].map((site) => (
            <div key={site} className="p-4 border-b border-[#202c33] hover:bg-[#202c33] cursor-pointer">
              <p className="font-bold text-sm">פרויקט {site}</p>
              <p className="text-xs text-[#8696a0]">כתובת: {site === 'אבן יהודה' ? 'הדקל 12' : site === 'כפר מונש' ? 'הרימון 5' : 'איילון 1'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative border-r border-[#202c33]">
        <header className="h-16 bg-[#202c33] px-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full overflow-hidden">
               <img src={SABAN_AI_PROFILE_PIC} alt="Saban AI Profile" className="w-full h-full object-cover" />
             </div>
             <div>
               <p className="text-sm font-bold">סבן לוגיסטיקה - גימני</p>
               <p className="text-[10px] text-[#00a884]">מחובר | שחר שאול</p>
             </div>
          </div>
          <div className="flex items-center gap-4 text-[#aebac1]">
            <button onClick={() => setIsOrderOpen(true)} className="relative p-2 hover:bg-[#2a3942] rounded-full transition-colors">
              <ShoppingCart size={22} />
              {cart.length > 0 && <span className="absolute top-0 right-0 bg-[#00a884] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center z-10">{cart.length}</span>}
            </button>
            <MoreVertical size={22} className="cursor-pointer" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-5">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender ===
