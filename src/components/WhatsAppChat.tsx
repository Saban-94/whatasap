'use client';
import React, { useState, useEffect, useRef } from 'react';
import { processSmartOrder } from '@/lib/dataEngine';
import { CheckCheck, Send, Paperclip, Smile } from 'lucide-react';
import OrderSidebar from '@/app/shahar/components/OrderSidebar';

export default function WhatsAppGroupView({ initialClientId = "+972526458899" }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [currentOrder, setCurrentOrder] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { 
      id: Date.now(), 
      text: input, 
      sender: 'user', 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // שליחת ההודעה לניתוח ב"מוח" של גימני
    const result = await processSmartOrder(initialClientId, input);
    
    // עדכון ה-Sidebar במוצרים שנמצאו ב-CSV (כמו סיקה, באלות, שפכטל)
    if (result.orderList.length > 0) {
      setCurrentOrder(prev => [...prev, ...result.orderList]);
    }

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: result.text,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    }, 800);
  };

  return (
    <div className="flex h-screen bg-[#0b141a] text-white p-4 gap-4" dir="rtl">
      {/* Sidebar - רשימת הזמנה חיה */}
      <div className="w-80">
        <OrderSidebar 
          orderItems={currentOrder} 
          onUpdateQty={(id, delta) => {
            setCurrentOrder(prev => prev.map(item => 
              item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
            ));
          }}
        />
      </div>

      {/* חלון הצאט - קבוצת הווטסאפ */}
      <div className="flex-1 flex flex-col bg-[#0b141a] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="bg-[#202c33] p-4 flex items-center gap-3 border-b border-[#00a884]/30">
          <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-bold">ח.ס</div>
          <div>
            <h2 className="text-white font-bold text-sm">הזמנות ח. סבן ***</h2>
            <p className="text-[#00a884] text-[10px] animate-pulse">גימני סורק הודעות...</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-opacity-5">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-2 rounded-lg text-sm shadow-sm ${
                m.sender === 'user' ? 'bg-[#005c4b]' : 'bg-[#202c33] border-r-4 border-[#00a884]'
              }`}>
                {m.text}
                <div className="flex justify-end items-center gap-1 mt-1 opacity-50 text-[10px]">
                  <span>{m.time}</span>
                  <CheckCheck size={12} className="text-[#53bdeb]" />
                </div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <div className="p-3 bg-[#202c33] flex items-center gap-2">
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="כתוב הודעה לקבוצה..." 
            className="flex-1 bg-[#2a3942] text-white rounded-full px-4 py-2 text-sm outline-none"
          />
          <button onClick={handleSend} className="bg-[#00a884] p-2 rounded-full text-white hover:scale-110 transition-transform">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
