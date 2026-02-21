'use client';
import React, { useState } from 'react';
import { Bell, Check, X, User, MessageCircle } from 'lucide-react';

export default function RamiControl() {
  const [alerts, setAlerts] = useState([
    { id: 1, user: 'שחר שאול', msg: 'ביקש מנוף 15 מטר לאבן יהודה', time: '13:26' }
  ]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-6 font-sans" dir="rtl">
      <header className="bg-[#202c33] text-white p-6 rounded-3xl flex justify-between items-center shadow-xl mb-10">
        <div>
          <h1 className="text-2xl font-black">חמ"ל ראמי מסארוה</h1>
          <p className="text-xs text-[#00a884]">ניהול חריגות והזמנות VIP</p>
        </div>
        <Bell className="text-yellow-500 animate-bounce" />
      </header>

      <div className="max-w-2xl mx-auto space-y-4">
        {alerts.map(a => (
          <div key={a.id} className="bg-white p-6 rounded-[2rem] shadow-lg border-r-8 border-[#C9A227] animate-in slide-in-from-right">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gray-200 p-2 rounded-full"><User size={24}/></div>
              <div>
                <h3 className="font-bold">{a.user}</h3>
                <span className="text-[10px] text-red-500 font-bold">חריגת מנוף - דורש אישור סדרן</span>
              </div>
              <span className="mr-auto text-[10px] opacity-40 text-black">{a.time}</span>
            </div>
            <p className="bg-gray-50 p-4 rounded-2xl italic mb-6 text-black border">"{a.msg}"</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-[#00a884] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Check size={18}/> אשר</button>
              <button className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><X size={18}/> דחה</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
