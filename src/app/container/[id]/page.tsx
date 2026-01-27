'use client';
import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { useParams } from 'next/navigation';
import { 
  Truck, FileText, PhoneCall, ShieldCheck, MapPin, 
  Clock, Calendar, Trash2, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';

export default function SabanVipPortal() {
  const { id } = useParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestedTime, setRequestedTime] = useState('08:00');
  const [isRequesting, setIsRequesting] = useState(false);

  // האזנה בזמן אמת לנתוני המכולה ב-Firebase
  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "container_contracts", id as string), (docSnap) => {
      if (docSnap.exists()) {
        setTask(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  // פונקציה לשליחת בקשת החלפה/פינוי עם שעה מבוקשת
  const handleActionRequest = async (type: 'SWAP' | 'REMOVAL') => {
    setIsRequesting(true);
    try {
      const docRef = doc(db, "container_contracts", id as string);
      await updateDoc(docRef, {
        status: type === 'SWAP' ? "SCHEDULED_SWAP" : "SCHEDULED_REMOVAL",
        requested_arrival_time: requestedTime,
        last_request_at: serverTimestamp(),
      });
      alert(`הבקשה נשלחה! ראמי עודכן להגעה ב-${requestedTime}`);
    } catch (err) {
      console.error(err);
      alert("שגיאה בתקשורת. נסה שוב מאוחר יותר.");
    } finally {
      setIsRequesting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <RefreshCw className="text-blue-600 animate-spin mb-4" size={48} />
      <span className="font-black italic text-blue-600">SABAN LOGISTICS VIP...</span>
    </div>
  );

  if (!task) return <div className="p-20 text-center font-black">החוזה לא נמצא במערכת.</div>;

  // הגדרות עירייה דינמיות (מגן קנסות)
  const getCityStyle = (city: string) => {
    const cities: any = {
      'הרצליה': { color: 'bg-[#0055A4]', url: 'https://www.herzliya.muni.il/forms/waste-container/' },
      'רעננה': { color: 'bg-[#FF4500]', url: 'https://www.raanana.muni.il/ConstructionAndPlanning/Pages/WasteContainer.aspx' },
      'הוד השרון': { color: 'bg-[#008080]', url: 'https://www.hod-hasharon.muni.il/158/' },
      'תל אביב': { color: 'bg-[#333333]', url: 'https://www.tel-aviv.gov.il/Forms/ConstructionWaste' }
    };
    return cities[city] || { color: 'bg-blue-600', url: '#' };
  };

  const cityStyle = getCityStyle(task.city);
  const encodedAddress = encodeURIComponent(`${task.address}, ${task.city}`);
  // מפה חינמית, מאובטחת (HTTPS) ותומכת עברית (hl=he)
  const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed&hl=he`;

  return (
    <div className="min-h-screen bg-[#F2F4F7] text-right font-sans pb-10" dir="rtl">
      
      {/* Header סמכותי */}
      <header className="bg-white px-6 py-5 shadow-sm sticky top-0 z-50 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[18px] font-black italic text-gray-900 leading-none tracking-tighter">ח. סבן</span>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Premium Logistics</span>
        </div>
        <div className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full border border-green-100 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[11px] font-black uppercase italic">מחובר לראמי</span>
        </div>
      </header>

      <main className="p-5 max-w-2xl mx-auto space-y-6">
        
        {/* כרטיס סטטוס לקוח */}
        <section className="bg-white rounded-[45px] p-8 shadow-xl border border-gray-50 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-gray-900 italic mb-1">שלום, {task.customer_name}</h2>
            <p className="text-gray-400 font-bold text-sm flex items-center gap-1 mb-6">
              <MapPin size={16} className="text-blue-500" /> {task.address}, {task.city}
            </p>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-tighter">ניצול זמן מכולה</span>
                <span className="text-4xl font-black italic text-gray-900">{task.current_day || 0}/10 <span className="text-sm">ימים</span></span>
              </div>
              <div className="h-4 w-full bg-gray-100 rounded-full p-1 shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${task.current_day > 8 ? 'bg-red-500' : 'bg-blue-600'}`}
                  style={{ width: `${(task.current_day / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* מפה מאובטחת - HTTPS */}
        <section className="rounded-[40px] overflow-hidden shadow-2xl border-4 border-white h-64 bg-gray-200 relative">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            src={mapUrl}
            className="contrast-[1.1]"
            allowFullScreen
          ></iframe>
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl shadow-md">
            <span className="text-[10px] font-black italic text-blue-700">מיקום מכולה חי בשטח</span>
          </div>
        </section>

        {/* לוח בקרה ושעות הגעה - סמכות הלקוח */}
        <section className="bg-[#1C1C1E] rounded-[45px] p-8 text-white shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="text-blue-400" />
            <h3 className="text-xl font-black italic">תזמון הגעת נהג</h3>
          </div>
          
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 text-center">בחר חלון זמן מועדף להחלפה</p>
          
          <div className="grid grid-cols-4 gap-2 mb-8">
            {['08:00', '10:00', '12:00', '14:00'].map((time) => (
              <button
                key={time}
                onClick={() => setRequestedTime(time)}
                className={`py-4 rounded-2xl font-black transition-all ${requestedTime === time ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
              >
                {time}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleActionRequest('SWAP')}
              disabled={isRequesting}
              className="bg-white text-black py-6 rounded-3xl font-black flex flex-col items-center gap-2 active:scale-95 transition-all shadow-lg"
            >
              <Truck size={28} />
              <span className="text-sm">הזמן החלפה</span>
            </button>
            <button 
              onClick={() => handleActionRequest('REMOVAL')}
              disabled={isRequesting}
              className="bg-white/10 text-white border border-white/10 py-6 rounded-3xl font-black flex flex-col items-center gap-2 active:scale-95 transition-all"
            >
              <CheckCircle2 size={28} className="text-red-400" />
              <span className="text-sm text-red-400 font-black">פינוי סופי</span>
            </button>
          </div>
        </section>

        {/* היתר עירוני - "מגן קנסות" */}
        <button 
          onClick={() => window.open(cityStyle.url, '_blank')}
          className={`w-full ${cityStyle.color} p-8 rounded-[40px] shadow-lg flex justify-between items-center text-white active:scale-95 transition-all group`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl group-hover:rotate-12 transition-transform">
              <FileText size={32} />
            </div>
            <div className="text-right">
              <h4 className="text-xl font-black italic leading-none text-white">היתר עיריית {task.city}</h4>
              <p className="text-[10px] font-bold opacity-70 uppercase mt-1">לחץ להגשת בקשה או הורדת טופס</p>
            </div>
          </div>
          <ShieldCheck size={40} className="opacity-20" />
        </button>

        {/* מוקד שירות */}
        <a 
          href="tel:972508860896"
          className="w-full bg-white border-2 border-gray-100 p-6 rounded-[35px] flex items-center justify-center gap-3 font-black text-gray-800 shadow-sm active:scale-95 transition-all"
        >
          <PhoneCall size={20} className="text-green-500" />
          שיחה ישירה עם הלוגיסטיקה
        </a>

      </main>

      {/* קרדיט וגרסה */}
      <footer className="text-center p-4">
        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">SabanOS Studio v2.0 - Encrypted Connection</span>
      </footer>
    </div>
  );
}
