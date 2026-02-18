'use client';
import React, { useState } from 'react';
import { Plus, Minus, RefreshCw, Send } from 'lucide-react';

// ממשק רשימת המצרכים מצד ימין
const OrderSidebar = ({ items, onUpdate, onReplace }: any) => (
  <div className="w-80 bg-[#202c33] border-l border-gray-700 p-4 flex flex-col h-full shadow-2xl">
    <h3 className="text-xl font-bold text-[#e9edef] mb-6 flex items-center gap-2">
      <span className="bg-[#00a884] w-2 h-6 rounded-full"></span>
      רשימת מצרכים
    </h3>
    
    <div className="flex-1 overflow-y-auto space-y-4">
      {items.map((item: any) => (
        <div key={item.id} 
             className="bg-[#2a3942] rounded-xl p-4 border-r-4 transition-all hover:scale-[1.02]"
             style={{ borderColor: item.color }}>
          <div className="flex justify-between items-start mb-3">
            <span className="font-bold text-sm text-gray-100">{item.name}</span>
            <button onClick={() => onReplace(item.id)} className="text-[#00a884] text-xs flex items-center gap-1 hover:underline">
              <RefreshCw size={12} /> החלף
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-[#202c33] rounded-lg p-1">
              <button onClick={() => onUpdate(item.id, -1)} className="p-1 hover:text-red-400"><Minus size={16}/></button>
              <span className="px-4 font-mono text-lg">{item.qty}</span>
              <button onClick={() => onUpdate(item.id, 1)} className="p-1 hover:text-green-400"><Plus size={16}/></button>
            </div>
            <span className="text-xs text-gray-400 font-medium">{item.price}</span>
          </div>
        </div>
      ))}
    </div>

    <button className="mt-6 bg-[#00a884] text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-[#06cf9c] transition-colors flex items-center justify-center gap-2">
      <Send size={20} /> שליחה להזמנות
    </button>
  </div>
);

export default function WhatsAppChat() {
  // ... לוגיקת הודעות קיימת ...
  // ב-Return של הקומפוננטה, עוטפים את הכל ב-flex ומוסיפים את ה-Sidebar
  return (
    <div className="flex h-screen w-full bg-[#0b141a] overflow-hidden" dir="rtl">
      <OrderSidebar items={currentOrder} onUpdate={updateQty} onReplace={handleReplace} />
      <div className="flex-1 flex flex-col relative">
        {/* תוכן הצ'אט הקיים */}
      </div>
    </div>
  );
}
