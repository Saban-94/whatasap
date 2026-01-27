'use client';
import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useParams } from 'next/navigation';
import { Calculator, Clock, ShieldCheck, RefreshCw, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export default function CustomerMagicLinkPortal() {
  const { id } = useParams(); // קבלת ה-ID מהכתובת
  const [taskData, setTaskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // האזנה בזמן אמת למכולה הספציפית ב-Firebase
    const unsub = onSnapshot(doc(db, "container_contracts", id as string), (docSnap) => {
      if (docSnap.exists()) {
        setTaskData(docSnap.data());
      } else {
        console.error("המכולה לא נמצאה במסד הנתונים");
      }
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

  // הגנה: אם המערכת בטעינה
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="font-black text-gray-800 italic">טוען את המכולה של ח. סבן...</p>
      </div>
    );
  }

  // הגנה: אם ה-ID לא קיים ב-Firebase
  if (!taskData) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="text-red-500 mb-4" size={64} />
        <h1 className="text-2xl font-black text-gray-800">אופס! הלינק לא תקין</h1>
        <p className="text-gray-500 mt-2">המכולה לא נמצאה או שהחוזה הסתיים. צור קשר עם ראמי.</p>
      </div>
    );
  }

  const actionLocked = taskData.current_day >= 10;
  const progressPercent = Math.min((taskData.current_day / 10) * 100, 100);

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] p-6 font-sans text-right">
      {/* כאן נכנס כל ה-UI של המכולה שעיצבנו קודם */}
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-black text-gray-800 italic uppercase tracking-tighter">המכולה של {taskData.customer_name}</h1>
        <p className="text-sm text-blue-600 font-bold tracking-widest">{taskData.address}</p>
      </header>

      {/* פס התקדמות פסיכולוגי */}
      <section className="bg-white rounded-[45px] p-8 shadow-sm border border-gray-100 mb-10 text-center relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-black text-gray-400 uppercase">יום הצבה: {new Date(taskData.created_at?.seconds * 1000).toLocaleDateString('he-IL')}</span>
            <span className="text-[10px] font-black text-red-500 uppercase">יעד פינוי: 10 ימים</span>
        </div>
        
        <div className="w-full h-10 bg-gray-100 rounded-full overflow-hidden mb-4 border-4 border-white shadow-inner relative">
            <div 
                className="h-full transition-all duration-1000 ease-out"
                style={{ 
                    width: `${progressPercent}%`, 
                    backgroundColor: taskData.current_day >= 10 ? '#E74C3C' : taskData.current_day >= 7 ? '#F1C40F' : '#2ECC71'
                }}
            />
        </div>
        <h2 className="text-6xl font-black text-gray-800 italic">{taskData.current_day}<span className="text-xl text-gray-400">/10</span></h2>
      </section>

      {/* אזהרת יום 10 חוסמת */}
      {actionLocked && (
        <div className="fixed inset-0 z-[200] bg-white p-10 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="text-red-600 mb-6 animate-pulse" size={80} />
            <h2 className="text-3xl font-black text-gray-800 mb-4">נגמר הזמן!</h2>
            <p className="text-gray-500 mb-8 font-bold">תקופת השכירות הסתיימה. חובה לבחור פעולה כדי למנוע קנסות מעיריית {taskData.city}.</p>
            <div className="w-full space-y-4">
                <button className="w-full bg-[#1976D2] text-white py-6 rounded-[25px] font-black text-xl shadow-xl flex items-center justify-center gap-2">
                    <RefreshCw /> הזמן החלפה
                </button>
                <button className="w-full bg-red-50 text-red-600 py-6 rounded-[25px] font-black text-xl border-2 border-red-100">
                    בקש פינוי סופי
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
