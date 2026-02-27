'use client';
import React, { useState, useRef } from 'react';
import { processSmartOrder } from '@/lib/dataEngine';
import { Send, CheckCheck } from 'lucide-react';
import OrderSidebar from '@/app/shahar/components/OrderSidebar';

const OrderSidebarAny = OrderSidebar as any;

export default function WhatsAppGroupView({ initialClientId = "+972526458899" }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [currentOrder, setCurrentOrder] = useState<any[]>([]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), text: input, sender: 'user', time: 'עכשיו' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const result = await processSmartOrder(initialClientId, input);
    // בדיקת בטיחות: וודא שהמערך קיים לפני הוספה
    if (result?.orderList && Array.isArray(result.orderList)) {
      setCurrentOrder(prev => [...prev, ...result.orderList]);
    }

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: result?.text || "קיבלתי, בודק...",
        sender: 'ai',
        time: 'עכשיו'
      }]);
    }, 600);
  };

  return (
    <div className="flex h-full bg-[#0b141a] text-white gap-4 p-4" dir="rtl">
      <div className="w-80 h-full hidden lg:block">
        <OrderSidebarAny 
          orderItems={currentOrder || []} 
          onUpdateQty={(id: string, delta: number) => {
            setCurrentOrder(prev => (prev || []).map(item => 
              item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
            ));
          }}
        />
      </div>

      <div className="flex-1 flex flex-col bg-[#111b21] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
        {/* Header צ'אט */}
        <div className="bg-[#202c33] p-4 flex items-center gap-3 border-b border-[#00a884]/20">
          <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-bold">ח.ס</div>
          <div>
            <h2 className="text-white font-bold text-sm">הזמנות ח. סבן ***</h2>
            <p className="text-[#00a884] text-[10px] tracking-widest">AI LOGISTICS ACTIVE</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-5 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-3 rounded-2xl text-sm max-w-[85%] shadow-md ${
                m.sender === 'user' ? 'bg-[#005c4b] rounded-tr-none' : 'bg-[#202c33] border-r-4 border-[#00a884] rounded-tl-none'
              }`}>
                {m.text}
                <div className="text-[9px] opacity-40 text-left mt-1">{m.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#202c33] flex gap-3">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-[#2a3942] rounded-full px-6 py-2.5 text-sm outline-none border border-transparent focus:border-[#00a884]/30"
            placeholder="כתוב הודעה לקבוצה..."
          />
          <button onClick={handleSend} className="bg-[#00a884] p-3 rounded-full hover:scale-105 transition-transform">
            <Send size={20}/>
          </button>
        </div>
      </div>
    </div>
  );
}
