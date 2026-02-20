'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Paperclip, MoreVertical, Search, Smile, 
  CheckCheck, ShoppingCart, Plus, X, Package, 
  ChevronRight, Info, Loader2, CheckCircle2 // הוספתי את האייקון החסר כאן
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function WhatsAppOrderApp() {
  const [messages, setMessages] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // סימולציה של הודעות - כאן זה יתחבר ל-Supabase שלך
  useEffect(() => {
    const mockMessages = [
      { id: 1, text: "אהלן סבן, יש לך סרם 255?", sender: 'customer', time: '09:00' },
      { id: 2, text: "כרגע חסר במלאי אחי, אבל יש לי סיקה 107 במק״ט 19107 שזה איטום פגז. עוזר לך?", sender: 'me', time: '09:05' },
      { id: 3, text: "וואלה מתאים. תביא לי 5 שקים מה-107 וגם 2 דליי פריימר 004.", sender: 'customer', time: '09:10' },
    ];
    setMessages(mockMessages);
    setActiveChat({ name: "קבלן יוסי", phone: "050-1234567" });
  }, []);

  // הוספת מוצר לסל מתוך השיחה (לחיצה על המק"ט)
  const addToCartFromChat = (name: string, sku: string, price: number = 0) => {
    const newItem = { id: Date.now(), name, sku, qty: 1, price };
    setCart([...cart, newItem]);
    setIsOrderOpen(true);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg = { id: Date.now(), text: inputText, sender: 'me', time: '09:15' };
    setMessages([...messages, newMsg]);
    setInputText('');
  };

  return (
    <div className="flex h-screen bg-[#0b141a] text-[#e9edef] font-sans overflow-hidden" dir="rtl">
      
      {/* 1. Sidebar - רשימת שיחות */}
      <div className="w-1/4 border-l border-[#202c33] flex flex-col bg-[#111b21]">
        <header className="h-[60px] bg-[#202c33] p-3 flex justify-between items-center">
          <div className="w-10 h-10 rounded-full bg-gray-500 overflow-hidden">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Saban" alt="avatar" />
          </div>
          <div className="flex gap-4 text-[#aebac1]">
            <Plus size={22} className="cursor-pointer" />
            <MoreVertical size={22} className="cursor-pointer" />
          </div>
        </header>
        <div className="p-2 bg-[#111b21]">
          <div className="bg-[#202c33] flex items-center p-2 rounded-xl">
            <Search size={18} className="text-[#8696a0] mx-2" />
            <input placeholder="חפש שיחה..." className="bg-transparent border-none focus:outline-none text-sm w-full" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-[#202c33] ${activeChat ? 'bg-[#2a3942]' : ''}`}>
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center font-bold">י</div>
            <div className="flex-1 border-b border-[#202c33] pb-3 text-right">
              <div className="flex justify-between">
                <span className="font-semibold">{activeChat?.name}</span>
                <span className="text-xs text-[#8696a0]">09:10</span>
              </div>
              <p className="text-sm text-[#8696a0] truncate">וואלה מתאים. תביא לי 5 שקים...</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Chat - הבמה של WhatsApp */}
      <div className="flex-1 flex flex-col relative bg-[#0b141a]">
        {/* Chat Header */}
        <header className="h-[60px] bg-[#202c33] p-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm">י</div>
            <div>
              <p className="text-sm font-semibold">{activeChat?.name}</p>
              <p className="text-[11px] text-[#8696a0]">מחובר</p>
            </div>
          </div>
          <div className="flex gap-5 text-[#aebac1]">
            <Search size={20} />
            <MoreVertical size={20} />
          </div>
        </header>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-5">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[65%] p-2 rounded-xl shadow-sm relative group ${msg.sender === 'me' ? 'bg-[#005c4b] rounded-tr-none' : 'bg-[#202c33] rounded-tl-none'}`}>
                <p className="text-sm ml-8 leading-relaxed text-right">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-[#8696a0]">{msg.time}</span>
                  {msg.sender === 'me' && <CheckCheck size={14} className="text-[#53bdeb]" />}
                </div>
                {/* כלי ליקוט מהיר למוצרים שמוזכרים בהודעה */}
                {(msg.text.includes('107') || msg.text.includes('004')) && (
                  <button 
                    onClick={() => addToCartFromChat(msg.text.includes('107') ? "סיקה 107" : "פריימר 004", msg.text.includes('107') ? "19107" : "14004")}
                    className="hidden group-hover:flex absolute -left-12 top-0 bg-[#C9A227] text-black p-1.5 rounded-full shadow-lg items-center gap-1 text-[10px] font-bold"
                  >
                    <Plus size={14}/> לקט
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Chat Input */}
        <footer className="h-[62px] bg-[#202c33] p-2 flex items-center gap-3">
          <Smile className="text-[#8696a0] cursor-pointer" />
          <Paperclip className="text-[#8696a0] cursor-pointer" />
          <input 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="הקלד הודעה..." 
            className="flex-1 bg-[#2a3942] border-none rounded-xl py-2.5 px-4 text-sm focus:outline-none text-right"
          />
          <button onClick={handleSend} className="bg-[#00a884] p-2.5 rounded-full text-white">
            <Send size={20} />
          </button>
        </footer>
      </div>

      {/* 3. Order Panel - טופס הזמנה צדדי */}
      <div className={`transition-all duration-300 border-r border-[#202c33] bg-[#111b21] flex flex-col ${isOrderOpen ? 'w-1/4' : 'w-0'}`}>
        {isOrderOpen && (
          <>
            <header className="h-[60px] bg-[#202c33] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#C9A227]">
                <ShoppingCart size={20} />
                <span className="font-black text-sm uppercase">הזמנה חדשה</span>
              </div>
              <X size={20} className="cursor-pointer text-gray-400" onClick={() => setIsOrderOpen(false)} />
            </header>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="text-center mt-10 text-gray-500">
                  <Package size={40} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">הסל ריק, לקט מוצרים מהצ'אט</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-[#202c33] p-3 rounded-xl border border-gray-800 text-right">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-sm">{item.name}</p>
                      <button onClick={() => setCart(cart.filter(c => c.id !== item.id))}><X size={14} className="text-red-500"/></button>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-2 bg-[#111b21] rounded-lg p-1">
                        <button className="px-2" onClick={() => {
                           setCart(cart.map(c => c.id === item.id ? {...c, qty: c.qty + 1} : c))
                        }}>+</button>
                        <span className="text-xs font-bold">{item.qty} יח'</span>
                        <button className="px-2" onClick={() => {
                           if(item.qty > 1) setCart(cart.map(c => c.id === item.id ? {...c, qty: c.qty - 1} : c))
                        }}>-</button>
                      </div>
                      <span className="text-[10px] text-gray-500">מק"ט: {item.sku}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-[#202c33] border-t border-gray-800 text-right">
              <div className="flex justify-between mb-4">
                <span className="text-sm">סה"כ פריטים:</span>
                <span className="font-bold text-[#C9A227]">{cart.reduce((acc, curr) => acc + curr.qty, 0)}</span>
              </div>
              <button className="w-full bg-[#C9A227] text-black font-black py-4 rounded-xl hover:scale-95 transition-transform flex items-center justify-center gap-2">
                <CheckCircle2 size={18} /> סגור הזמנה ושלח
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
