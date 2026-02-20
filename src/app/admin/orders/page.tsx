'use client';
import React, { useState, useEffect } from 'react';
import { Bell, Truck, CheckCircle, Printer, Clock } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  // אפקט צלצול כשמגיעה הזמנה חדשה
  useEffect(() => {
    const audio = new Audio('/sounds/notification.mp3'); // תוודא שיש לך קובץ כזה
    // כאן תבוא לוגיקת האזנה ל-Firebase Realtime DB
    // audio.play();
  }, [orders]);

  const updateStatus = (orderId: string, newStatus: string) => {
    // עדכון ב-Firebase ושליחת פוש לשחר
    console.log(`עדכון הזמנה ${orderId} לסטטוס: ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8" dir="rtl">
      <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-5">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Bell className="text-yellow-500 animate-swing" /> חמ"ל הזמנות ח.סבן
        </h1>
        <div className="flex gap-4">
           <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-xs font-bold">4 נהגים מחוברים</span>
        </div>
      </div>

      <div className="grid gap-6">
        {/* כרטיס הזמנה לדוגמה */}
        <div className="bg-gray-800 border-r-4 border-yellow-500 p-6 rounded-xl shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">שחר שאול - אבן יהודה</h3>
              <p className="text-gray-400 text-sm">הזמנה #8829 | 10:45</p>
            </div>
            <span className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-[10px] font-black italic">ממתין לשיבוץ נהג</span>
          </div>

          <div className="my-6 space-y-2">
            <div className="flex justify-between text-sm border-b border-gray-700 pb-2">
              <span>סיקה 107 אפור</span>
              <span className="font-bold underline">10 יחידות</span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => updateStatus('1', 'בדרך לאתר')} className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all">
              <Truck size={18} /> יצא לדרך
            </button>
            <button className="bg-white text-black p-3 rounded-lg hover:bg-gray-200 transition-all">
              <Printer size={18} />
            </button>
            <button onClick={() => updateStatus('1', 'סופק')} className="bg-green-600 p-3 rounded-lg hover:bg-green-700">
              <CheckCircle size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
