'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Minus, RefreshCw, Bot, ShoppingCart } from 'lucide-react';
import { processSmartOrder } from '@/lib/dataEngine';

// --- רשימת מצרכים מצד ימין ---
const OrderSidebar = ({ items, onUpdate, onReplace }: any) => (
  <div className="w-96 bg-[#202c33] border-l border-gray-700 p-5 flex flex-col h-full shadow-2xl" dir="rtl">
    <div className="flex items-center gap-3 mb-8 border-b border-gray-700 pb-4">
      <ShoppingCart className="text-[#00a884]" size={28} />
      <h3 className="text-2xl font-black text-white">רשימת מצרכים</h3>
    </div>
    
    <div className="flex-1 overflow-y-auto space-y-4 px-1">
      {items.length === 0 ? (
        <div className="text-gray-500 text-center mt-20 italic">ההזמנה תתמלא כאן...</div>
      ) : (
        items.map((item: any) => (
          <div key={item.id} className="bg-[#2a3942] rounded-2xl p-4 border-r-8 shadow-lg" style={{ borderColor: item.color }}>
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-xl bg-white overflow-hidden flex-shrink-0">
                <img src={item.image || 'https://via.placeholder.com/150?text=Saban'} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-sm text-white truncate">{item.name}</h4>
                  <button onClick={() => onReplace(item.id)} className="text-[#00a884]"><RefreshCw size={14} /></button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center bg-[#202c33] rounded-full px-2 py-1">
                    <button onClick={() => onUpdate(item.id, -1)} className="p-1 hover:text-red-400"><Minus size={14}/></button>
                    <span className="px-4 font-bold text-white">{item.qty}</span>
                    <button onClick={() => onUpdate(item.id, 1)} className="p-1 hover:text-green-400"><Plus size={14}/></button>
                  </div>
                  <span className="text-[#00a884] font-black text-sm">{item.price}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>

    {items.length > 0 && (
      <button className="mt-6 bg-[#00a884] text-white py-4 rounded-2xl font-black text-xl shadow-lg hover:bg-[#06cf9c] flex items-center justify-center gap-3">
        <Send size={24} /> שליחה להזמנות
      </button>
    )}
  </div>
);

export default function SmartChatView({ customerId = "guest_saban" }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [currentOrder, setCurrentOrder] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const result = await processSmartOrder(customerId, input);
    const botMsg = { text: result.text, sender: 'bot' };
    setMessages(prev => [...prev, botMsg]);
    
    // כאן קורה הקסם: המוצרים עוברים ל-Sidebar
    if (result.orderList?.length > 0) {
      setCurrentOrder(prev => {
        const existingIds = new Set(prev.map(i => i.id));
        const uniqueNewItems = result.orderList.filter((i: any) => !existingIds.has(i.id));
        return [...prev, ...uniqueNewItems];
      });
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCurrentOrder(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  };

  return (
    <div className="flex h-screen w-full bg-[#0b141a] overflow-hidden" dir="rtl">
      <OrderSidebar items={currentOrder} onUpdate={updateQty} onReplace={(id: any) => alert('מחפש חלופה...')} />
      <div className="flex-1 flex flex-col relative">
        <div className="bg-[#202c33] p-5 font-bold border-b border-gray-700 flex items-center gap-3">
          <Bot className="text-[#00a884]" /> גימני - ח. סבן
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[75%] p-4 rounded-2xl ${m.sender === 'user' ? 'bg-[#005c4b]' : 'bg-[#202c33] border border-gray-700'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-[#202c33] border-t border-gray-700 flex gap-4">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 bg-[#2a3942] rounded-xl px-4 py-3 outline-none text-white" placeholder="מה להעמיס לך, אחי?" />
          <button onClick={handleSend} className="bg-[#00a884] p-4 rounded-xl"><Send size={24} /></button>
        </div>
      </div>
    </div>
  );
}
