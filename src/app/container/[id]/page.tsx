'use client';
import React, { useState } from 'react';
import { Calculator, Clock, ShieldCheck, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';

export default function CustomerMagicLinkPortal({ taskData }: { taskData: any }) {
  const [actionLocked, setActionLocked] = useState(taskData.current_day >= 10);

  const getProgressColor = (day: number) => {
    if (day >= 10) return "#E74C3C"; // אדום
    if (day >= 7) return "#F1C40F";  // צהוב
    return "#2ECC71";               // ירוק
  };

  const progressPercent = (taskData.current_day / 10) * 100;

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] p-6 font-sans text-right">
      {/* Overlay חוסם ביום 10 */}
      {actionLocked && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <AlertTriangle size={48} />
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">תקופת השכירות הסתיימה!</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                כדי למנוע חיובים נוספים וקנסות מהפיקוח העירוני ב{taskData.city}, <br/>
                חובה לבחור כעת את המשך הטיפול במכולה:
            </p>
            <div className="w-full space-y-4">
                <button className="w-full bg-[#1976D2] text-white py-6 rounded-[30px] font-black text-xl shadow-xl flex items-center justify-center gap-3">
                    <RefreshCw /> הזמנת החלפה (מלאה בריקה)
                </button>
                <button className="w-full bg-white text-gray-800 border-2 border-gray-100 py-6 rounded-[30px] font-black text-xl flex items-center justify-center gap-3">
                    <Trash2 className="text-red-500" /> פינוי סופי של המכולה
                </button>
            </div>
        </div>
      )}

      <header className="mb-10 text-center">
        <h1 className="text-2xl font-black text-gray-800 italic">המכולה שלך ב{taskData.address}</h1>
        <p className="text-sm text-blue-600 font-bold uppercase tracking-widest">סטטוס השכירות - ח. סבן</p>
      </header>

      {/* שעון החול הדיגיטלי / פס התקדמות */}
      <section className="bg-white rounded-[45px] p-8 shadow-sm border border-gray-100 mb-10 text-center">
        <div className="flex justify-between items-center mb-6 px-2">
            <span className="text-xs font-black text-gray-400 uppercase">התחלה: {taskData.start_date}</span>
            <span className="text-xs font-black text-red-400 uppercase tracking-tighter">סיום משוער: יום 10</span>
        </div>
        
        <div className="relative w-full h-12 bg-gray-50 rounded-full overflow-hidden mb-6 border-4 border-white shadow-inner">
            <div 
                className="h-full transition-all duration-1000 ease-out"
                style={{ 
                    width: `${progressPercent}%`, 
                    backgroundColor: getProgressColor(taskData.current_day)
                }}
            >
                {/* אפקט חלקיקים של "פסולת" בתוך הפס */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pave.png')]"></div>
            </div>
        </div>

        <h2 className="text-5xl font-black text-gray-800 mb-2 italic">{taskData.current_day}<span className="text-xl text-gray-400">/10</span></h2>
        <p className="text-sm font-bold text-gray-400">ימי שכירות פעילים</p>
      </section>

      {/* היתר עירוני מחובר למוח */}
      <div className="bg-blue-50 p-6 rounded-[35px] border border-blue-100 flex items-center gap-4 mb-8">
        <div className="bg-white p-3 rounded-2xl shadow-sm text-blue-600"><ShieldCheck size={24} /></div>
        <div>
            <p className="text-xs font-black text-blue-800 uppercase">מגן קנסות עירוני</p>
            <p className="text-xs text-blue-600 font-medium leading-snug">ההיתר ב{taskData.city} בתוקף. זכור: חובה לכסות את המכולה בסוף יום העבודה!</p>
        </div>
      </div>
    </div>
  );
}
