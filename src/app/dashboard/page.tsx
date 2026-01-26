'use client';
import React, { useState, useEffect } from 'react';
import { 
  Home, Truck, Trash2, History, MessageCircle, 
  Info, X, CheckCircle, Apple, Smartphone, Zap
} from 'lucide-react';

export default function ClientVipDashboard() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [orderStatus, setOrderStatus] = useState('blue'); // blue, yellow, green, red
  const [isUrgent, setIsUrgent] = useState(false);

  // הברקה המקצועית - צבעים לפי סטטוס
  const statusColors: any = {
    yellow: 'bg-yellow-100 border-yellow-400 text-yellow-800 animate-pulse',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    red: 'bg-red-50 border-red-400 text-red-800 animate-bounce'
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FFF8EE] pb-24 font-sans text-right relative">
      
      {/* 1. Popup הדרכה מקצועי (Onboarding) */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7EC7E6]/10 rounded-full -mr-16 -mt-16"></div>
            
            <h2 className="text-2xl font-black text-[#1F2937] mb-2">ברוך הבא שחר שאול 🎉</h2>
            <p className="text-gray-500 text-sm mb-6">בוא נהפוך את האתר שלך לחכם ומסודר יותר.</p>
            
            <div className="space-y-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 items-center">
                <Apple className="text-gray-700" />
                <p className="text-xs"><b>אייפון:</b> לחץ 'שתף' ו-'הוסף למסך הבית'</p>
              </div>
              <div className="bg-green-50 p-4 rounded-2xl flex gap-3 items-center">
                <Smartphone className="text-gray-700" />
                <p className="text-xs"><b>אנדרואיד:</b> לחץ על ה-3 נקודות ו-'התקן אפליקציה'</p>
              </div>
            </div>

            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 accent-[#7EC7E6]" />
              <span className="text-xs font-bold text-gray-600">קראתי את המדריך, אל תציג שוב ☑️</span>
            </label>

            <button onClick={() => setShowOnboarding(false)} className="w-full bg-[#7EC7E6] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-blue-100">
              מאשר וממשיך
            </button>
          </div>
        </div>
      )}

      {/* 2. Header & Branding */}
      <header className="p-6 flex justify-between items-center">
        <div className="bg-white p-3 rounded-2xl shadow-sm">
          <img src="/logo.png" className="h-8" alt="Saban" />
        </div>
        <div className="text-left">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">VIP Member</p>
          <p className="text-sm font-black text-[#4AA9D6]">שחר שאול</p>
        </div>
      </header>

      {/* 3. דף ראשי - כרטיסים מהבהבים */}
      <main className="px-6 space-y-4">
        <div className={`p-6 rounded-[35px] border-2 transition-all duration-1000 ${statusColors[orderStatus]}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-black text-xl">הזמנה חיה: גלגל המזלות</h3>
            <Zap size={20} className={orderStatus === 'yellow' ? 'animate-spin' : ''} />
          </div>
          <p className="text-sm font-medium opacity-80">
            {orderStatus === 'blue' ? 'הנהג בדרך לאתר 🚛' : 'ממתין לעלייה למערכת ⏳'}
          </p>
        </div>

        {/* מכולה (אדום מהבהב אם יש חריגה) */}
        <div className={`p-6 rounded-[35px] bg-white shadow-sm border-2 border-transparent ${isUrgent ? 'border-red-500 animate-pulse bg-red-50' : ''}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-lg flex items-center gap-2"><Trash2 size={20} /> ניהול מכולה</h3>
            <span className="bg-gray-100 text-[10px] font-bold px-2 py-1 rounded-full italic">ויצמן 5, רעננה</span>
          </div>
          <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2">
            החלפה / פינוי מהיר
          </button>
        </div>
      </main>

      {/* 4. ניווט תחתון "קבלני" (כפתורי ענק) */}
      <nav className="fixed bottom-6 left-6 right-6 bg-white border border-gray-100 rounded-[30px] shadow-2xl p-2 flex justify-around items-center z-50">
        <button className="flex flex-col items-center gap-1 p-3 text-[#7EC7E6]"><Home size={28} /><span className="text-[9px] font-bold">ראשי</span></button>
        <button className="flex flex-col items-center gap-1 p-3 text-gray-400"><Truck size={28} /><span className="text-[9px] font-bold">חומרים</span></button>
        <button className="flex flex-col items-center gap-1 p-3 text-gray-400"><Trash2 size={28} /><span className="text-[9px] font-bold">מכולה</span></button>
        <button className="flex flex-col items-center gap-1 p-3 text-gray-400"><History size={28} /><span className="text-[9px] font-bold">היסטוריה</span></button>
        <button className="flex flex-col items-center gap-1 p-3 text-[#25D366]"><MessageCircle size={28} /><span className="text-[9px] font-bold">וואטסאפ</span></button>
      </nav>
    </div>
  );
}
