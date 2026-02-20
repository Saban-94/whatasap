'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, Calendar, Package, FileText, ChevronLeft } from 'lucide-react';

// נתונים לדוגמה - בחיבור אמיתי נשתמש ב-useEffect מול Firebase
const MOCK_ORDERS = [
  { id: 'ORD-8821', date: '2025-08-28', project: 'אבן יהודה', address: 'האתרוג 44', itemsCount: 12, status: 'סופק', total: '₪4,200' },
  { id: 'ORD-8815', date: '2025-08-25', project: 'כפר מונש', address: 'הרימון 5', itemsCount: 4, status: 'בדרך', total: '₪1,150' },
  { id: 'ORD-8790', date: '2025-08-20', project: 'אבן יהודה', address: 'האתרוג 44', itemsCount: 1, status: 'סופק', total: '₪450' },
];

export default function OrderHistoryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-[#0b141a] text-white p-4 md:p-8 text-right" dir="rtl">
      {/* Header */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-[#202c33] rounded-full transition-all">
          <ArrowRight size={24} className="text-[#C9A227]" />
        </button>
        <h1 className="text-2xl font-black text-white border-b-2 border-[#C9A227] pb-1">היסטוריית הזמנות</h1>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-4 top-3.5 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="חפש לפי פרויקט או מספר הזמנה..."
            className="w-full bg-[#111b21] border border-[#202c33] rounded-2xl py-3 pr-12 pl-4 outline-none focus:border-[#C9A227] transition-all text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {MOCK_ORDERS.filter(o => o.project.includes(searchTerm) || o.id.includes(searchTerm)).map((order) => (
            <div key={order.id} className="bg-[#111b21] border border-[#202c33] rounded-[2rem] p-6 hover:border-[#C9A227]/50 transition-all group">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-4">
                  <div className="bg-[#C9A227]/10 p-4 rounded-2xl h-fit">
                    <Package className="text-[#C9A227]" size={28} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] bg-[#202c33] px-2 py-0.5 rounded text-gray-400 font-mono">{order.id}</span>
                       <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${order.status === 'סופק' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>
                         {order.status}
                       </span>
                    </div>
                    <h3 className="font-bold text-lg">פרויקט {order.project}</h3>
                    <p className="text-xs text-gray-500">{order.address}</p>
                  </div>
                </div>

                <div className="flex justify-between items-end md:items-start md:flex-col md:text-left gap-2">
                   <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Calendar size={14} />
                      <span>{order.date}</span>
                   </div>
                   <p className="text-[#C9A227] font-black text-lg">{order.total}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#202c33] flex justify-between items-center">
                 <span className="text-xs text-gray-400">{order.itemsCount} מוצרים בהזמנה זו</span>
                 <button 
                  onClick={() => router.push(`/shahar/track?id=${order.id}`)}
                  className="flex items-center gap-2 text-xs font-bold text-white hover:text-[#C9A227] transition-colors"
                 >
                   פרטי מעקב <ChevronLeft size={16} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
