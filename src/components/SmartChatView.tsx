'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Minus, RefreshCw, Bot, User } from 'lucide-react';
import { processSmartOrder } from '@/lib/dataEngine';

// --- קומפוננטת משנה: רשימת מצרכים מצד ימין ---
const OrderSidebar = ({ items, onUpdate, onReplace }: any) => (
  <div className="w-80 bg-[#202c33] border-l border-gray-700 p-4 flex flex-col h-full shadow-2xl z-20">
    <h3 className="text-xl font-bold text-[#e9edef] mb-6 flex items-center gap-2">
      <span className="bg-[#00a884] w-2 h-6 rounded-full"></span>
      רשימת מצרכים
    </h3>
    
    <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
      {items.length === 0 ? (
        <div className="text-gray-500 text-center mt-10 text-sm italic">
          המוצרים שגימני יזהה יופיעו כאן...
        </div>
      ) : (
        items.map((item: any) => (
          <div key={item.id} 
               className="bg-[#2a3942] rounded-xl p-4 border-r-4 shadow-md transition-all hover:scale-[1.02]"
               style={{ borderColor: item.color || '#00a884' }}>
            <div className="flex justify-between items-start mb-3">
              <span className="font-bold text-sm text-gray-100 leading-tight">{item.name}</span>
              <button onClick={() => onReplace(item.id)} className="text-[#00a884] text-[10px] font-bold flex items-center gap-1 hover:underline uppercase tracking-wider">
                <RefreshCw size={10} /> החלף
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center bg-[#202c33] rounded-lg p-1 border border-gray-700">
                <button onClick={() => onUpdate(item.id, -1)} className="p-1 hover:text-red-400 text-gray-400 transition-colors">
                  <Minus size={14}/>
                </button>
                <span className="px-4 font-mono text-lg text-white">{item.qty}</span>
                <button onClick={() => onUpdate(item.id, 1)} className="p-1 hover:text-green-400 text-gray-400 transition-colors">
                  <Plus size={14}/>
                </button>
              </div>
              <span className="text-xs text-[#00a884] font-bold">{item.price}</span>
            </div>
          </div>
        ))
      )}
    </div>

    {items.length > 0 && (
      <button className="mt-6 bg-[#00a884] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[#06cf9c] transition-all transform active:scale-95 flex items-center justify-center gap-2">
        <Send size={20} /> שליחה להזמנות
      </button>
    )}
  </div>
);

// --- הקומפוננטה הראשית ---
export default function SmartChatView({ customerId = "guest_saban" }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await processSmartOrder(customerId, input);
      
      const botMsg = { 
        text: result.text, 
        sender: 'bot', 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, botMsg]);
      
      // עדכון רשימת המוצרים אם נמצאו חדשים
      if (result.orderList && result.orderList.length > 0) {
        setCurrentOrder(prev => {
          const newItems = result.orderList.filter((newItem: any) => 
            !prev.some(oldItem => oldItem.id === newItem.id)
          );
          return [...prev, ...newItems];
        });
      }
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCurrentOrder(prev => prev.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const handleReplace = (id: string) => {
    console.log("Replace requested for:", id);
    // כאן אפשר להוסיף לוגיקה לפתיחת חיפוש מוצרים חלופיים
  };

  return (
    <div className="flex h-screen w-full bg-[#0b141a] overflow-hidden font-sans" dir="rtl">
      {/* רשימת מצרכים צדדית */}
      <OrderSidebar items={currentOrder} onUpdate={updateQty} onReplace={handleReplace} />

      {/* אזור הצ'אט המרכזי */}
      <div className="flex-1 flex flex-col relative bg-[#0b141a]">
        <div className="bg-[#202c33] p-4 flex items-center gap-3 border-b border-gray-700 shadow-md z-10">
          <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">גימני - ח. סבן</h2>
            <p className="text-[#00a884] text-[10px] font-bold animate-pulse">מומחה בנייה זמין</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 relative">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl shadow-lg text-[15px] leading-relaxed ${
                m.sender === 'user' 
                ? 'bg-[#005c4b] text-white rounded-tl-none' 
                : 'bg-[#202c33] text-[#e9edef] rounded-tr-none border border-gray-700'
              }`}>
                {m.text}
                <div className="text-[10px] opacity-50 mt-2 text-left">
                  {m.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-end animate-in fade-in duration-300">
              <div className="bg-[#202c33] text-[#00a884] px-4 py-2 rounded-full text-xs font-bold border border-[#00a884]/30 shadow-[0_0_10px_rgba(0,168,132,0.2)]">
                גימני בודק במלאי...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#202c33] border-t border-gray-700 flex gap-3 items-center">
          <div className="flex-1 bg-[#2a3942] rounded-xl px-4 py-3 shadow-inner">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="w-full bg-transparent text-white outline-none text-sm placeholder-gray-500"
              placeholder="שאל את גימני על מוצרים, כמויות או הובלה..."
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-xl transition-all ${
              input.trim() ? 'bg-[#00a884] text-white shadow-lg rotate-0' : 'bg-gray-700 text-gray-500 -rotate-12'
            }`}
          >
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
