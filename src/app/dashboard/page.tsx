'use client';
import React, { useState } from 'react';
import { Truck, Trash2, Bell, MessageCircle, Info } from 'lucide-react';

export default function SabanCleanDashboard() {
  const [isAlert, setIsAlert] = useState(true); // הדמיה של מכולה חריגה

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] p-4 text-right">
      {/* Header יוקרתי */}
      <header className="flex justify-between items-center mb-8 px-2">
        <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
          <Bell size={24} />
        </div>
        <h1 className="text-xl font-black text-gray-800">שלום, שחר שאול 👋</h1>
      </header>

      {/* כרטיס מכולה - במידה ויש חריגה הוא מהבהב באדום */}
      <section className={`saban-card mb-6 ${isAlert ? 'alert-mode' : ''}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="bg-red-100 p-2 rounded-xl text-red-600"><Trash2 size={24} /></div>
          <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full animate-pulse">חריגת זמן!</span>
        </div>
        <h2 className="text-2xl font-black mb-1 text-gray-800">מכולה בויצמן 5</h2>
        <p className="text-gray-500 text-sm font-medium mb-4">השכירות הסתיימה אתמול (10/10 ימים)</p>
        
        <div className="flex gap-2">
          <button className="flex-1 bg-[#1976D2] text-white py-4 rounded-xl font-bold">החלפה מהירה</button>
          <button className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl font-bold">פינוי</button>
        </div>
      </section>

      {/* כפתורי שער - מגושמים וברורים */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button className="saban-card flex flex-col items-center justify-center gap-3 bg-blue-50 border-blue-100">
          <div className="text-blue-600"><Truck size={32} /></div>
          <span className="font-black text-blue-900">חומרי בניין</span>
        </button>
        
        <button className="saban-card flex flex-col items-center justify-center gap-3 bg-green-50 border-green-100">
          <div className="text-green-600"><MessageCircle size={32} /></div>
          <span className="font-black text-green-900">צ'אט צוות</span>
        </button>
      </div>

      {/* פס מעקב הזמנה חיה - צבע משתנה לפי סטטוס */}
      <div className="saban-card bg-white border-l-8 border-blue-400">
        <h3 className="text-sm font-bold text-gray-400 mb-2">הזמנה בדרך 🚛</h3>
        <p className="font-black text-lg text-gray-800">הנהג חכמת נמצא כרגע ברעננה</p>
        <div className="mt-4 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div className="bg-blue-400 h-full w-[70%]"></div>
        </div>
      </div>
    </div>
  );
}
