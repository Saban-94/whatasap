'use client';
import React, { useState } from 'react';
import { processSmartOrder } from '@/lib/dataEngine';

export default function WhatsAppChat({ customerId = "guest" }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [currentOrder, setCurrentOrder] = useState<any[]>([]);

  const handleSend = async () => {
    const userMsg = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const result = await processSmartOrder(customerId, input);
    
    const botMsg = { 
      text: result.text, 
      sender: 'bot',
      orderData: result.orderList 
    };
    
    setMessages(prev => [...prev, botMsg]);
    if (result.orderList.length > 0) setCurrentOrder(result.orderList);
  };

  const updateQty = (id: string, delta: number) => {
    setCurrentOrder(prev => prev.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  return (
    <div className="flex h-screen bg-[#0b141a] text-white p-4 gap-4" dir="rtl">
      {/* צד ימין: רשימת הזמנה (Order Summary) */}
      <div className="w-80 bg-[#202c33] rounded-xl p-4 flex flex-col border border-gray-700">
        <h3 className="text-lg font-bold mb-4 border-b border-gray-600 pb-2">🛒 רשימת מצרכים</h3>
        <div className="flex-1 overflow-y-auto space-y-3">
          {currentOrder.length === 0 ? (
            <p className="text-gray-500 text-sm">אין מוצרים בהזמנה עדיין...</p>
          ) : (
            currentOrder.map(item => (
              <div key={item.id} className="bg-[#2a3942] p-3 rounded-lg border-r-4" style={{ borderColor: item.color }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium">{item.name}</span>
                  <button className="text-xs text-red-400">החלף</button>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQty(item.id, -1)} className="bg-gray-700 px-2 rounded">-</button>
                  <span className="font-bold">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="bg-gray-700 px-2 rounded">+</button>
                  <span className="text-xs mr-auto text-gray-400">{item.price}</span>
                </div>
              </div>
            ))
          )}
        </div>
        <button className="mt-4 bg-[#00a884] py-2 rounded-lg font-bold hover:bg-[#008f6f]">
          שליחה למחלקת הזמנות 🚀
        </button>
      </div>

      {/* צד שמאל: צ'אט ווטסאפ */}
      <div className="flex-1 flex flex-col bg-[#0b141a] rounded-xl border border-gray-800 overflow-hidden">
        <div className="bg-[#202c33] p-4 font-bold border-b border-gray-700">גימני - ח. סבן</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-3 rounded-lg max-w-md ${m.sender === 'user' ? 'bg-[#005c4b]' : 'bg-[#202c33]'}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-[#202c33] flex gap-2">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            className="flex-1 bg-[#2a3942] rounded-lg p-2 outline-none"
            placeholder="כתוב הודעה..."
          />
          <button onClick={handleSend} className="bg-[#00a884] p-2 px-4 rounded-lg">שלח</button>
        </div>
      </div>
    </div>
  );
}
