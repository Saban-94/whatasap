'use client';
import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useParams } from 'next/navigation';
import { MapPin, Truck, FileText, PhoneCall, Loader2, Clock } from 'lucide-react';

export default function SmartContainerApp() {
  const { id } = useParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "container_contracts", id as string), (docSnap) => {
      if (docSnap.exists()) setTask(docSnap.data());
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  if (loading) return <LoadingScreen />;

  // מצב המתנה: ראמי עוד לא לחץ "הפעל"
  if (task?.status === "SCHEDULED_PLACEMENT") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center" dir="rtl">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-50 animate-pulse"></div>
          <img src="/logo.png" className="relative h-20 w-auto opacity-80" alt="Saban" />
        </div>
        <h1 className="text-2xl font-black text-gray-800 italic">ההזמנה נקלטה! 🚛</h1>
        <p className="text-gray-500 mt-3 font-bold">המכולה בדרך אליך לעינב 4. ברגע שהיא תוצב בשטח, האפליקציה תתעורר לניהול מלא.</p>
        <div className="mt-8 flex items-center gap-2 text-blue-600 font-black text-sm">
            <Clock className="animate-spin-slow" size={18} /> ממתין לאישור הצבה מראמי...
        </div>
      </div>
    );
  }

  // מצב פעיל: המעגל סגור, הספירה החלה
  return (
    <main className="min-h-screen bg-[#FDFBF7] p-4 text-right" dir="rtl">
      {/* כאן מופיע ה-UI היוקרתי עם המפה והכפתורים שעיצבנו */}
      <div className="bg-white rounded-[45px] shadow-2xl p-6 border-t-[10px] border-[#1976D2]">
         <div className="text-center mb-6">
            <img src="/logo.png" className="h-10 mx-auto mb-4" />
            <h2 className="text-xl font-black italic">המכולה של {task.customer_name} פעילה</h2>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest italic">יום {task.current_day} מתוך 10</p>
         </div>
         
         {/* מפה וחומרי ניהול... */}
         <div className="w-full h-48 bg-gray-50 rounded-[35px] mb-6 overflow-hidden border-2 border-gray-100">
            <iframe width="100%" height="100%" frameBorder="0" src={`http://googleusercontent.com/maps.google.com/3{encodeURIComponent(task.address)}&hl=he&output=embed`}></iframe>
         </div>

         {/* כפתורי השער הגדולים */}
         <div className="grid grid-cols-2 gap-4">
            <button className="bg-[#1976D2] text-white aspect-square rounded-[35px] shadow-lg flex flex-col items-center justify-center gap-2 active:scale-95 transition-all">
                <Truck size={32} />
                <span className="font-black text-xs">הזמנת החלפה</span>
            </button>
            <button className="bg-orange-500 text-white aspect-square rounded-[35px] shadow-lg flex flex-col items-center justify-center gap-2 active:scale-95 transition-all">
                <FileText size={32} />
                <span className="font-black text-xs uppercase tracking-tighter">היתר {task.city}</span>
            </button>
         </div>
      </div>
    </main>
  );
}

function LoadingScreen() {
    return <div className="min-h-screen bg-white flex items-center justify-center font-black italic text-blue-600">SABAN LOGISTICS...</div>;
}
