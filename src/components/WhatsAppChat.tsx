'use client';
import React, { useState, useRef } from 'react';
import { processSmartOrder } from '@/lib/dataEngine';
import { CheckCheck, Send } from 'lucide-react';
import OrderSidebar from '@/app/shahar/components/OrderSidebar';

// הגדרת סוג גנרי כדי למנוע שגיאות Build
const OrderSidebarAny = OrderSidebar as any;

export default function WhatsAppGroupView({ initialClientId = "+972526458899" }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [currentOrder, setCurrentOrder] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { 
      id: Date.now().toString(), 
      text: input, 
      sender: 'user', 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const result = await processSmartOrder(initialClientId, input);
    
    if (result.orderList && result.orderList.length > 0) {
      setCurrentOrder(prev => [...prev, ...result.orderList]);
    }

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: result.text,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    }, 800);
  };

  return (
    <div className="flex h-[80vh] bg-[#0b141a] text-white gap-4" dir="rtl">
      {/* Sidebar - הזמנה חיה */}
      <div className="w-80 h-full">
        <OrderSidebarAny 
          orderItems={currentOrder} 
          onUpdateQty={(id: string, delta: number) => {
            setCurrentOrder(prev => prev.map(item => 
              item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
            ));
          }}
        />
      </div>

      {/* חלון הצ'אט */}
      <div className="flex-1 flex flex-col bg-[#111b21] rounded-xl border border-gray-800 overflow-hidden">
        <div className="bg-[#202c33] p-3 flex items-center gap-3 border-b border-[#00a884]/30">
          <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center font-bold text-xs">ס</div>
          <span className="text-sm font-bold">הזמנות ח. סבן</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-opacity-5 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-2 rounded-lg text-sm max-w-[80%] shadow-md ${m.sender === 'user' ? 'bg-[#005c4b]' : 'bg-[#202c33] border-r-2 border-[#00a884]'}`}>
                {m.text}
                <div className="text-[9px] opacity-50 text-left mt-1 flex justify-end gap-1">
                  {m.time}
                  <CheckCheck size={10} className="text-[#53bdeb]" />
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <div className="p-3 bg-[#202c33] flex gap-2">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-sm outline-none border border-transparent focus:border-[#00a884]/50 transition-all"
            placeholder="הקלד הודעה לקבוצה..."
          />
          <button 
            onClick={handleSend} 
            className="bg-[#00a884] p-2 rounded-full hover:scale-105 active:scale-95 transition-all"
          >
            <Send size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
}
