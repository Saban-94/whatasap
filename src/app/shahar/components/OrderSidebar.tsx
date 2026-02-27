'use client';
import React from 'react';

interface OrderSidebarProps {
  orderItems?: any[];
  onUpdateQty?: (id: string, delta: number) => void;
}

export default function OrderSidebar({ orderItems = [], onUpdateQty }: OrderSidebarProps) {
  // הגנה: וודא ש-orderItems הוא תמיד מערך, גם אם הגיע undefined
  const items = Array.isArray(orderItems) ? orderItems : [];

  // חישוב בטוח: שימוש ב-0 כברירת מחדל ו-parseFloat למניעת שגיאות חישוב
  const total = items.reduce((acc, item) => {
    const price = parseFloat(item?.price) || 0;
    const qty = parseInt(item?.qty) || 0;
    return acc + (price * qty);
  }, 0);

  return (
    <div className="bg-[#111b21] p-4 rounded-2xl border border-gray-800 h-full flex flex-col shadow-2xl">
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <h3 className="text-[#00a884] font-black text-lg">סל הזמנה חכם</h3>
        <div className="text-left">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">סה"כ לתשלום</p>
          <p className="text-xl font-black text-white">₪{total.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
        {items.length > 0 ? (
          items.map((item, i) => (
            <div key={item.id || i} className="bg-[#202c33] p-3 rounded-xl border-r-4 border-[#00a884] shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-white leading-tight w-2/3">{item.name}</span>
                <span className="text-xs font-mono text-[#00a884]">₪{item.price}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4 bg-[#111b21] rounded-full px-3 py-1">
                  <button 
                    onClick={() => onUpdateQty?.(item.id, -1)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >-</button>
                  <span className="text-sm font-bold min-w-[20px] text-center">{item.qty}</span>
                  <button 
                    onClick={() => onUpdateQty?.(item.id, 1)}
                    className="text-[#00a884] hover:text-[#06cf9c] transition-colors"
                  >+</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
            <div className="w-12 h-12 border-2 border-dashed border-gray-500 rounded-full mb-2"></div>
            <p className="text-xs text-center">ה-AI מחכה להודעה<br/>כדי לזהות מוצרים</p>
          </div>
        )}
      </div>
      
      <button className="w-full bg-[#00a884] hover:bg-[#06cf9c] text-white py-3 rounded-xl font-bold mt-4 transition-all shadow-lg shadow-[#00a884]/20 active:scale-95">
        שלח למחלקת הזמנות
      </button>
    </div>
  );
}
