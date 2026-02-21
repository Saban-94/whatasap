'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase"; // עברנו ל-Supabase
import { 
  Truck, Trash2, Bell, MessageSquare, Sun, Moon, 
  Coffee, ShieldCheck, Home, History, AlertTriangle, 
  Clock, MapPin 
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SabanLiveDashboard() {
  const [activeTask, setActiveTask] = useState<any>(null);
  const [greeting, setGreeting] = useState({ text: '', sub: '', icon: <Coffee /> });
  const [loading, setLoading] = useState(true);
  const userName = "שחר שאול";

  useEffect(() => {
    // 1. המוח של הברכות 🧠
    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: `בוקר טוב ${userName}`, sub: 'הזמנה שתשלח עכשיו תגיע עוד היום!', icon: <Sun className="text-yellow-500" /> });
    else if (hour < 18) setGreeting({ text: `צהריים טובים ${userName}`, sub: 'צריכים השלמות לאתר?', icon: <Coffee className="text-orange-400" /> });
    else setGreeting({ text: `ערב טוב ${userName}`, sub: 'סוגרים סידור למחר? המחסן מחכה לך.', icon: <Moon className="text-blue-400" /> });

    // 2. משיכת משימה פעילה מ-Supabase (במקום Firebase)
    const fetchLatestTask = async () => {
      const { data, error } = await supabase
        .from('tasks') // וודא שיש טבלת tasks או שנה ל-orders
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setActiveTask(data);
      }
      setLoading(false);
    };

    fetchLatestTask();

    // האזנה לשינויים בזמן אמת
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchLatestTask)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-[#F8FAFC] pb-32 font-sans text-right">
      {/* Header מעוצב מחדש */}
      <header className="p-8 bg-white rounded-b-[50px] shadow-sm border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-slate-900">{greeting.text}</h1>
            <span className="text-2xl">{greeting.icon}</span>
          </div>
          <p className="text-sm text-slate-500 font-medium">{greeting.sub}</p>
        </div>
        <div className="relative bg-slate-50 p-3 rounded-2xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer">
          <Bell size={24} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-2xl mx-auto">
        
        {/* כרטיס מכולה חריגה - Alert Mode */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[35px] p-6 shadow-xl shadow-red-500/5 border-2 border-red-50/50 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-red-50 p-3 rounded-2xl text-red-500"><AlertTriangle size={24} /></div>
            <Badge className="bg-red-500 hover:bg-red-600 text-white animate-pulse border-none px-4">חריגת זמן ⚠️</Badge>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">מכולה ב-ויצמן 5</h3>
          <p className="text-sm text-slate-400 mb-6">יום 10 מתוך 10. הזמן החלפה עכשיו למניעת קנס.</p>
          <div className="grid grid-cols-2 gap-4">
            <Button className="bg-[#1976D2] hover:bg-[#1565C0] text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95">החלפה</Button>
            <Button variant="outline" className="border-slate-200 text-slate-600 h-14 rounded-2xl font-bold text-lg hover:bg-slate-50">פינוי</Button>
          </div>
        </motion.section>

        {/* כרטיס סטטוס משאית - Live Track */}
        <section className="bg-white rounded-[35px] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
          <div className="flex justify-between items-center mb-4">
            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none font-bold italic">הזמנה בדרך 🚛</Badge>
            <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
              <Clock size={14} />
              צפי: 15 דק׳
            </div>
          </div>
          <p className="text-lg font-bold text-slate-800 mb-4 leading-tight">חכמת הנהג בדרך ל-גלגל המזלות 73</p>
          <div className="space-y-2">
             <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>יעד</span>
                <span>יוצא מהמחסן</span>
             </div>
             <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "80%" }}
                  className="bg-blue-500 h-full rounded-full"
                ></motion.div>
             </div>
          </div>
        </section>

        {/* קיצורי דרך מהירים - Grid מעוצב */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/order" className="bg-white p-6 rounded-[35px] border border-slate-100 flex flex-col items-center gap-3 hover:bg-blue-50/50 transition-colors group shadow-sm">
            <div className="bg-blue-100 p-5 rounded-3xl text-blue-600 group-hover:scale-110 transition-transform"><Truck size={32} /></div>
            <span className="font-bold text-slate-700">חומרי בניין</span>
          </Link>
          <Link href="/container" className="bg-white p-6 rounded-[35px] border border-slate-100 flex flex-col items-center gap-3 hover:bg-green-50/50 transition-colors group shadow-sm">
            <div className="bg-green-100 p-5 rounded-3xl text-green-600 group-hover:scale-110 transition-transform"><Trash2 size={32} /></div>
            <span className="font-bold text-slate-700">מכולה</span>
          </Link>
        </div>
      </main>

      {/* Navigation Bar - הציפה */}
      <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border border-slate-200/50 rounded-[35px] shadow-2xl p-3 flex justify-around items-center z-20">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 py-3 px-6 rounded-[25px] bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105 transition-all">
          <Home size={22} />
          <span className="text-[10px] font-bold">ראשי</span>
        </Link>
        <Link href="/order" className="flex flex-col items-center gap-1 p-3 text-slate-400 hover:text-slate-600 transition-colors">
          <Truck size={22} />
          <span className="text-[10px] font-bold">חומרים</span>
        </Link>
        <Link href="/container" className="flex flex-col items-center gap-1 p-3 text-slate-400 hover:text-slate-600 transition-colors">
          <Trash2 size={22} />
          <span className="text-[10px] font-bold">מכולה</span>
        </Link>
        <Link href="/track" className="flex flex-col items-center gap-1 p-3 text-slate-400 hover:text-slate-600 transition-colors">
          <History size={22} />
          <span className="text-[10px] font-bold">עבר</span>
        </Link>
      </nav>
    </div>
  );
}
