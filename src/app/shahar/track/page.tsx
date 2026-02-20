'use client';
import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Truck, Clock, MapPin, Phone, Loader2 } from 'lucide-react';

// רכיב התוכן שמשתמש ב-Params
function TrackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'ORD-8815';

  const steps = [
    { title: 'הזמנה התקבלה', time: '09:00', completed: true, active: false },
    { title: 'הועמס על המשאית', time: '11:30', completed: true, active: false },
    { title: 'בדרך אליך', time: '12:45', completed: false, active: true },
    { title: 'סופק באתר', time: '--:--', completed: false, active: false },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header בתוך התוכן */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-[#202c33] rounded-full">
          <ArrowRight size={24} className="text-[#C9A227]" />
        </button>
        <div className="text-left">
          <h1 className="text-xl font-black text-white">מעקב הזמנה</h1>
          <p className="text-[10px] text-gray-500 font-mono">{orderId}</p>
        </div>
      </div>

      {/* Delivery Card */}
      <div className="bg-gradient-to-br from-[#202c33] to-[#111b21] rounded-[2.5rem] p-8 border border-[#C9A227]/20 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute -left-10 top-10 opacity-5 rotate-12 text-white">
          <Truck size={200} />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-[#C9A227] rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(201,162,39,0.3)]">
             <Truck size={40} className="text-black" />
          </div>
          <h2 className="text-2xl font-black mb-1 text-white">הסחורה בדרך!</h2>
          <p className="text-sm text-gray-400">נהג: אבי כהן (ח.סבן לוגיסטיקה)</p>
          <button className="mt-6 flex items-center gap-2 bg-[#00a884] px-6 py-2 rounded-full text-xs font-bold hover:scale-105 transition-transform text-white">
            <Phone size={14} /> התקשר לנהג
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-[#111b21] rounded-[2rem] p-8 border border-[#202c33]">
        <h3 className="font-bold mb-8 flex items-center gap-2 text-white">
          <Clock size={18} className="text-[#C9A227]" /> סטטוס משלוח
        </h3>
        <div className="space-y-0 relative text-right">
          <div className="absolute right-4 top-2 bottom-2 w-0.5 bg-[#202c33]" />
          {steps.map((step, idx) => (
            <div key={idx} className="relative pr-12 pb-10 last:pb-0">
              <div className={`absolute right-1.5 top-1 w-6 h-6 rounded-full border-4 border-[#111b21] z-10 
                ${step.completed ? 'bg-[#00a884]' : step.active ? 'bg-[#C9A227] animate-pulse' : 'bg-[#202c33]'}`} 
              />
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm font-bold ${step.active ? 'text-[#C9A227]' : step.completed ? 'text-white' : 'text-gray-600'}`}>
                    {step.title}
                  </p>
                  <p className="text-[10px] text-gray-500 italic">סבן לוגיסטיקה - מרכז הפצה</p>
                </div>
                <span className="text-[10px] font-mono text-gray-500">{step.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// הדף הראשי שעוטף ב-Suspense
export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-[#0b141a] p-4 md:p-8 text-right" dir="rtl">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <Loader2 className="animate-spin text-[#C9A227]" size={40} />
          <p className="text-white font-bold">טוען נתוני מעקב...</p>
        </div>
      }>
        <TrackContent />
      </Suspense>
    </div>
  );
}
