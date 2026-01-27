'use client';
import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useParams } from 'next/navigation';
import { MapPin, Truck, FileText, PhoneCall, Info, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ArtisticContainerPortal() {
  const { id } = useParams();
  const [taskData, setTaskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "container_contracts", id as string), (docSnap) => {
      if (docSnap.exists()) {
        setTaskData(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#1976D2] mb-4" size={48} />
        <p className="font-black text-[#1976D2] italic text-lg">מעבד נתונים לוגיסטיים...</p>
      </div>
    );
  }

  if (!taskData) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-10 text-center">
        <AlertTriangle className="text-red-500 mb-4" size={64} />
        <h1 className="text-2xl font-black text-gray-800">הלינק לא תקין</h1>
        <p className="text-gray-500 mt-2">המכולה לא נמצאה. וודא שראמי יצר את החוזה ב-Firebase.</p>
      </div>
    );
  }

  // בניית כתובת המפה בבטחה - רק אם יש קואורדינטות
  const mapUrl = taskData.lat && taskData.lng 
    ? `https://maps.google.com/maps?q=${taskData.lat},${taskData.lng}&hl=he&z=17&output=embed`
    : null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-3">
      {/* מסגרת כחולה עמוקה - המעטפת של ח. סבן */}
      <div className="min-h-[96vh] border-[12px] border-[#1976D2] rounded-[55px] bg-white relative overflow-hidden flex flex-col shadow-2xl">
        
        {/* לוגו ח. סבן מרכזי */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-[#1976D2] px-8 py-4 rounded-b-[30px] shadow-lg border-x-[4px] border-b-[4px] border-white">
            <h2 className="text-white font-black text-2xl tracking-tighter">ח. סבן</h2>
          </div>
        </div>

        <main className="flex-1 p-6 pt-24 space-y-6 overflow-y-auto" dir="rtl">
          {/* כותרת דף ומיקום */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-gray-800 italic leading-none">
              ניהול מכולה: {taskData.customer_name || 'לקוח מזדמן'}
            </h1>
            <p className="text-sm font-bold text-blue-600 flex items-center justify-center gap-1">
              <MapPin size={16} /> {taskData.address || 'כתובת לא הוזנה'}
            </p>
          </div>

          {/* מפה חיה עם סיכה - נטען רק אם יש נתונים */}
          <div className="w-full h-64 rounded-[40px] overflow-hidden border-4 border-gray-50 shadow-inner relative bg-gray-100">
            {mapUrl ? (
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                src={mapUrl}
                allowFullScreen
              ></iframe>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                <MapPin size={40} className="opacity-20" />
                <p className="text-xs font-bold italic">ממתין לסיכת מיקום מהנהג...</p>
              </div>
            )}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-blue-50">
               <p className="text-[10px] font-black text-[#1976D2]">מיקום נוכחי בשטח 📍</p>
            </div>
          </div>

          {/* כפתורי שער גדולים - Grid של כוח לוגיסטי */}
          <div className="grid grid-cols-2 gap-5 pt-2">
            <MenuButton 
                icon={<Truck size={36} />} 
                label="הזמנת החלפה" 
                sub="מלאה בריקה"
                color="bg-[#1976D2]" 
            />
            <MenuButton 
                icon={<FileText size={36} />} 
                label="היתר עירוני" 
                sub="מגן קנסות"
                color="bg-orange-500" 
            />
            <MenuButton 
                icon={<PhoneCall size={36} />} 
                label="צור קשר" 
                sub="מוקד לוגיסטי"
                color="bg-gray-900" 
            />
            <MenuButton 
                icon={<ShieldCheck size={36} />} 
                label="אישורי פינוי" 
                sub="לטופס 4"
                color="bg-teal-600" 
            />
          </div>

          {/* פס התקדמות ימים (המוח של 10 הימים) */}
          <div className="pt-4">
             <div className="flex justify-between text-[10px] font-black text-gray-400 mb-2 px-2">
                <span>יום {taskData.current_day || 1}</span>
                <span>יעד: 10 ימים</span>
             </div>
             <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-1000"
                  style={{ width: `${((taskData.current_day || 1) / 10) * 100}%` }}
                />
             </div>
          </div>
        </main>

        <footer className="p-4 text-center">
            <p className="text-[10px] font-black text-gray-200 tracking-[0.3em] uppercase">Saban Systems Executive</p>
        </footer>
      </div>
    </div>
  );
}

function MenuButton({ icon, label, sub, color }: any) {
  return (
    <button className={`${color} text-white aspect-square rounded-[40px] flex flex-col items-center justify-center gap-2 shadow-xl active:scale-95 transition-all p-5`}>
      <div className="bg-white/15 p-3 rounded-2xl mb-1">{icon}</div>
      <div className="text-center">
        <p className="font-black text-sm leading-tight">{label}</p>
        <p className="text-[9px] font-medium opacity-60 uppercase tracking-tighter">{sub}</p>
      </div>
    </button>
  );
}
