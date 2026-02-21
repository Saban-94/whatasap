'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { 
  Truck, Trash2, Bell, MessageSquare, Sun, Moon, 
  Coffee, AlertTriangle, Clock, MapPin, Home, History 
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";

export default function SabanLiveDashboard() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [greeting, setGreeting] = useState({ text: '', sub: '', icon: <Coffee /> });
  const [loading, setLoading] = useState(true);
  const userName = "שחר שאול";

  useEffect(() => {
    // 1. המוח של הברכות - מותאם אישית לשחר
    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: `בוקר טוב ${userName}`, sub: 'הזמנה שתשלח עכשיו תגיע עוד היום!', icon: <Sun className="text-yellow-500" /> });
    else if (hour < 18) setGreeting({ text: `צהריים טובים ${userName}`, sub: 'צריכים השלמות לאתר?', icon: <Coffee className="text-orange-400" /> });
    else setGreeting({ text: `ערב טוב ${userName}`, sub: 'סוגרים סידור למחר?', icon: <Moon className="text-blue-400" /> });

    // 2. משיכת נהגים בזמן אמת (הניטור החדש)
    const fetchDrivers = async () => {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('status', { ascending: true });
      
      if (!error) setDrivers(data || []);
      setLoading(false);
    };

    fetchDrivers();

    const channel = supabase.channel('live-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, fetchDrivers)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone?.replace(/\D/g, '');
    if (!cleanPhone) return alert("מספר נהג חסר");
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent('היי ' + name + ', קיבלת משימה חדשה משחר. נא לאשר.')}`, '_blank');
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#F8FAFC] pb-32 font-sans text-right">
      {/* Header מודרני - שחר שאול */}
      <header className="p-8 bg-white rounded-b-[50px] shadow-sm border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900 leading-none">{greeting.text}</h1>
            <span className="text-2xl">{greeting.icon}</span>
          </div>
          <p className="text-sm text-slate-500 font-medium italic">{greeting.sub}</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-2xl text-slate-600 relative">
          <Bell size={24} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </div>
      </header>

      <main className="p-6 space-y-8 max-w-2xl mx-auto">
        
        {/* כרטיס מכולה חריגה - העיצוב החדש והחכם */}
        <section className="bg-white rounded-[40px] p-6 shadow-xl shadow-red-500/5 border-2 border-red-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-red-50 p-3 rounded-2xl text-red-500"><AlertTriangle size={24} /></div>
            <span className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full animate-pulse">חריגת זמן ⚠️</span>
          </div>
          <h3 className="text-xl font-black text-slate-800">מכולה ב-ויצמן 5</h3>
          <p className="text-sm text-slate-400 mb-6">יום 10 מתוך 10. הזמן החלפה למניעת חיוב.</p>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white h-14 rounded-2xl font-black shadow-lg transition-transform active:scale-95">החלפה</button>
            <button className="bg-slate-100 text-slate-600 h-14 rounded-2xl font-black hover:bg-slate-200">פינוי</button>
          </div>
        </section>

        {/* כותרת מדור נהגים ח חיים */}
        <div className="flex items-center justify-between px-2">
           <h2 className="text-lg font-black text-slate-800">ניטור נהגים בזמן אמת</h2>
           <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">LIVE</span>
        </div>

        {/* רשימת נהגים בפריסה של דשבורד מודרני */}
        <div className="space-y-4">
          {drivers.slice(0, 3).map((driver) => (
            <motion.div 
              key={driver.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-4 rounded-[30px] shadow-sm border border-slate-100 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${driver.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-orange-500'}`}></div>
                <div>
                  <h4 className="font-bold text-slate-800">{driver.full_name}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MapPin size={10} /> {driver.location || 'בנסיעה'}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => sendWhatsApp(driver.phone, driver.full_name)}
                className="bg-[#25D366] p-3 rounded-2xl text-white shadow-md hover:bg-[#128C7E] transition-all"
              >
                <MessageSquare size={20} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* קיצורי דרך גדולים (כמו ששחר אוהבת) */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/order" className="bg-white p-6 rounded-[40px] border border-slate-100 flex flex-col items-center gap-4 shadow-sm hover:bg-blue-50/50 transition-all">
            <div className="bg-blue-100 p-5 rounded-[25px] text-blue-600 shadow-inner"><Truck size={35} /></div>
            <span className="font-black text-slate-800 uppercase tracking-tight text-sm text-center">חומרי בניין</span>
          </Link>
          <Link href="/container" className="bg-white p-6 rounded-[40px] border border-slate-100 flex flex-col items-center gap-4 shadow-sm hover:bg-green-50/50 transition-all">
            <div className="bg-green-100 p-5 rounded-[25px] text-green-600 shadow-inner"><Trash2 size={35} /></div>
            <span className="font-black text-slate-800 uppercase tracking-tight text-sm text-center">מכולות</span>
          </Link>
        </div>
      </main>

      {/* Navigation בר צף ומודרני */}
      <nav className="fixed bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-xl rounded-[35px] shadow-2xl p-3 flex justify-around items-center z-30">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 py-3 px-6 rounded-[25px] bg-blue-600 text-white shadow-lg scale-105 transition-all">
          <Home size={22} />
          <span className="text-[10px] font-black">ראשי</span>
        </Link>
        <Link href="/order" className="flex flex-col items-center gap-1 p-3 text-slate-400 hover:text-white transition-colors">
          <Truck size={22} />
          <span className="text-[10px] font-black">חומרים</span>
        </Link>
        <Link href="/container" className="flex flex-col items-center gap-1 p-3 text-slate-400 hover:text-white transition-colors">
          <Trash2 size={22} />
          <span className="text-[10px] font-black">מכולה</span>
        </Link>
        <Link href="/track" className="flex flex-col items-center gap-1 p-3 text-slate-400 hover:text-white transition-colors">
          <History size={22} />
          <span className="text-[10px] font-black">היסטוריה</span>
        </Link>
      </nav>
    </div>
  );
}
