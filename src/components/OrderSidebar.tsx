// src/app/shahar/components/OrderSidebar.tsx
'use client';
import React from 'react';

// הגדרת ה-Props עבור TypeScript
interface OrderSidebarProps {
  orderItems: any[];
  onUpdateQty: (id: string, delta: number) => void;
}

export default function OrderSidebar({ orderItems, onUpdateQty }: OrderSidebarProps) {
  return (
    <div className="bg-[#111b21] p-4 rounded-xl border border-gray-800 h-full overflow-y-auto">
      <h3 className="text-[#00a884] font-bold mb-4 border-b border-gray-800 pb-2 flex justify-between items-center">
        <span>סל הזמנה (זיהוי AI)</span>
        <span className="bg-[#00a884] text-white text-[10px] px-2 py-0.5 rounded-full">{orderItems.length}</span>
      </h3>
      
      <div className="space-y-3">
        {orderItems.map((item, i) => (
          <div key={i} className="bg-[#202c33] p-3 rounded-lg border-r-4 border-[#00a884]">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-bold">{item.name}</span>
              <span className="text-xs text-gray-500">{item.price}₪</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => onUpdateQty(item.id, -1)} className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">-</button>
                <span className="text-sm font-mono">{item.qty}</span>
                <button onClick={() => onUpdateQty(item.id, 1)} className="w-6 h-6 bg-[#00a884] rounded-full flex items-center justify-center">+</button>
              </div>
            </div>
          </div>
        ))}
        {orderItems.length === 0 && (
          <p className="text-gray-500 text-xs text-center mt-10">הצ'אט סורק מוצרים... <br/>נסה לכתוב "12 שקי סיקה"</p>
        )}
      </div>
    </div>
  );
}
