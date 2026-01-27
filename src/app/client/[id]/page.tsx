'use client';
import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { useParams } from 'next/navigation';
import { 
  Truck, FileText, PhoneCall, ShieldCheck, MapPin, 
  Clock, Calendar, AlertCircle, Loader2, Check 
} from 'lucide-react';

export default function LuxuryCustomerPortal() {
  const { id } = useParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestedTime, setRequestedTime] = useState('08:00');
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "container_contracts", id as string), (docSnap) => {
      if (docSnap.exists()) setTask(docSnap.data());
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const handleActionRequest = async (type: 'SWAP' | 'REMOVAL') => {
    setIsRequesting(true);
    try {
      const docRef = doc(db, "container_contracts", id as string);
      await updateDoc(docRef, {
        status: type === 'SWAP' ? "SCHEDULED_SWAP" : "SCHEDULED_REMOVAL",
        requested_arrival_time: requestedTime,
        request_timestamp: serverTimestamp(),
      });
      alert(`בקשת ה${type === 'SWAP' ? 'החלפה' : 'פינוי'} לשעה ${requestedTime} נשלחה לראמי.`);
    } catch (err) {
      alert("שגיאה בתקשורת עם המערכת");
    } finally {
      setIsRequesting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-black italic text-[#1976D2] animate-pulse">SABAN VIP LOADING...</div>;
  if (!task) return <div className="p-20 text-center font-black">החוזה לא נמצא.</div>;

  // לוגיקת היתר עירוני דינמית מהמוח
  const getCityConfig = (city: string) => {
    const configs: any = {
      'הרצליה': { color: 'bg-[#0055A4]', url: 'https://www.herzliya.muni.il/forms/waste-container/' },
      'רעננה': { color: 'bg-[#FF4500]', url: 'https://www.raanana.muni.il/ConstructionAndPlanning/Pages/WasteContainer.aspx' },
      'הוד השרון': { color: 'bg-[#008080]', url: 'https://www.hod-hasharon.muni.il/158/' }
    };
    return configs[city] || configs['הרצליה'];
  };

  const cityConfig = getCityConfig(task.city);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-right font-sans pb-20" dir="rtl">
      {/* Top Identity Bar */}
      <div className="bg-white px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <img src="/logo.png" className="h-8" alt="Saban" />
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black text-blue-700 uppercase italic">Live Contract</span>
        </div>
      </div>

      <main className="p-5 space-y-6 max-w-xl mx-auto">
        {/* Welcome Card */}
        <section className="bg-white rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-50">
            <h1 className="text-3xl font-black text-gray-800 italic tracking-tight mb-1">שלום, {task.customer_name}</h1>
            <p className="text-gray-400 font-medium flex items-center gap-1 text-sm"><MapPin size={14} /> {task.address}</p>
            
            {/* Hourglass Progress */}
            <div className="mt-8 space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-gray-400 uppercase">ניצול ימי שכירות</span>
                    <span className="text-3xl font-black text-gray-800 italic">{task.current_day || 0}/10 ימים</span>
                </div>
                <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden p-1 shadow-inner">
                    <div 
                        className="h-full rounded-full transition-all duration-1000 bg-gradient-to-l from-[#1976D2] to-blue-400"
                        style={{ width: `${(task.current_day / 10) * 100}%` }}
                    />
                </div>
            </div>
        </section>

        {/* Scheduling Power - סמכות הלקוח */}
        <section className="bg-[#1C1C1E] rounded-[40px] p-8 text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
                <Calendar className="text-blue-400" size={24} />
                <h3 className="text-xl font-black italic">תזמון הגעת נהג</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4 font-bold uppercase tracking-widest">בחר שעת הגעה מבוקשת (הערכה):</p>
            <div className="grid grid-cols-4 gap-2 mb-6">
                {['08:00', '10:00', '12:00', '14:00'].map(time => (
                    <button 
                        key={time}
                        onClick={() => setRequestedTime(time)}
                        className={`py-3 rounded-2xl font-black text-sm transition-all ${requestedTime === time ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        {time}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => handleActionRequest('SWAP')}
                    disabled={isRequesting}
                    className="bg-white text-black py-5 rounded-3xl font-black flex flex-col items-center gap-2 hover:bg-blue-50 active:scale-95 transition-all shadow-xl"
                >
                    <Truck size={24} /> <span className="text-sm">בקש החלפה</span>
                </button>
                <button 
                    onClick={() => handleActionRequest('REMOVAL')}
                    disabled={isRequesting}
                    className="bg-white/10 text-white py-5 rounded-3xl font-black flex flex-col items-center gap-2 border border-white/10 active:scale-95 transition-all"
                >
                    <Trash2 size={24} className="text-red-400" /> <span className="text-sm text-red-400">בקש פינוי</span>
                </button>
            </div>
        </section>

        {/* Municipal Authority Button - היתר עירוני */}
        <button 
            onClick={() => window.open(cityConfig.url, '_blank')}
            className={`w-full ${cityConfig.color} p-8 rounded-[40px] shadow-lg flex justify-between items-center text-white group active:scale-95 transition-all`}
        >
            <div className="flex items-center gap-4 text-right">
                <div className="bg-white/20 p-3 rounded-2xl group-hover:rotate-12 transition-transform">
                    <FileText size={32} />
                </div>
                <div>
                    <h4 className="text-xl font-black italic leading-none">היתר עיריית {task.city}</h4>
                    <p className="text-[10px] font-bold opacity-70 uppercase mt-1">לחץ להורדה או הגשת בקשה</p>
                </div>
            </div>
            <ShieldCheck size={40} className="opacity-30" />
        </button>

        {/* Contact Support */}
        <button className="w-full bg-white border-2 border-gray-100 p-6 rounded-[35px] flex items-center justify-center gap-4 font-black text-gray-800 shadow-sm active:scale-95 transition-all">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><PhoneCall size={20} /></div>
            צור קשר עם מוקד הלוגיסטיקה
        </button>
      </main>
    </div>
  );
}

function Trash2({ size, className }: any) { return <div className={className}><Truck size={size} /></div>; } // Placeholder
