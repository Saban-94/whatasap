'use client';
import React, { useState, useRef, useEffect } from 'react';
import { processSmartOrder } from '@/lib/dataEngine';
import { Send, CheckCheck } from 'lucide-react';
import OrderSidebar from '@/app/shahar/components/OrderSidebar';

export default function WhatsAppGroupView({ initialClientId = "+972526458899" }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [currentOrder, setCurrentOrder] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // גלילה אוטומטית למטה בהודעה חדשה
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), text: input, sender: 'user', time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const result = await processSmartOrder(initialClientId, input);
      if (result?.orderList && Array.isArray(result.orderList)) {
        setCurrentOrder(prev => [...prev, ...result.orderList]);
      }

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: result?.text || "בוקר טוב, רשמתי לפניי.",
          sender: 'ai',
          time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
        }]);
      }, 600);
    } catch (e) {
      console.error("AI Error:", e);
    }
  };

  return (
    <div className="flex h-full max-h-[85vh] bg-[#0b141a] text-white gap-4 p-2 lg:p-4" dir="rtl">
      {/* Sidebar - מוזרק בבטחה */}
      <div className="w-80 h-full hidden lg:block">
        <OrderSidebar 
          orderItems={currentOrder || []} 
          onUpdateQty={(id: string, delta: number) => {
            setCurrentOrder(prev => (prev || []).map(item => 
              item.id === id ? { ...item, qty: Math.max(1, (item.qty || 1) + delta) } : item
            ));
          }}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#111b21] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl relative">
        <div className="bg-[#202c33] p-4 flex items-center gap-3 border-b border-[#00a884]/20 z-10">
          <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-bold text-white shadow-inner">ח.ס</div>
          <div>
            <h2 className="text-white font-bold text-sm">הזמנות ח. סבן (Master Brain)</h2>
            <p className="text-[#00a884] text-[10px] tracking-widest font-bold">AI ACTIVE • LOGISTICS MOD</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-[0.03] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-3 rounded-2xl text-sm max-w-[85%] shadow-md relative ${
                m.sender === 'user' ? 'bg-[#005c4b] rounded-tr-none' : 'bg-[#202c33] border-r-4 border-[#00a884] rounded-tl-none'
              }`}>
                <p className="leading-relaxed">{m.text}</p>
                <div className="text-[9px] opacity-40 text-left mt-1 flex justify-end items-center gap-1">
                  {m.time}
                  {m.sender === 'ai' && <CheckCheck size={12} className="text-[#53bdeb]" />}
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <div className="p-4 bg-[#202c33] flex gap-3 items-center">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-[#2a3942] rounded-full px-6 py-3 text-sm outline-none border border-transparent focus:border-[#00a884]/30 transition-all text-white"
            placeholder="שלח הודעה (למשל: 10 באלות חול לבני ברק)"
          />
          <button 
            onClick={handleSend} 
            className="bg-[#00a884] p-3 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#00a884]/20"
          >
            <Send size={20} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
