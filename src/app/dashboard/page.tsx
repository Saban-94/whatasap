'use client';
import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { Truck, Trash2, Bell, MessageCircle, Sun, Moon, Coffee, ShieldCheck, Home, History } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion"
export default function SabanLiveDashboard() {
  const [activeTask, setActiveTask] = useState<any>(null);
  const [greeting, setGreeting] = useState({ text: '', sub: '', icon: <Coffee /> });
  const userName = "שחר שאול"; // המערכת תזהה את המשתמש לפי ה-Login

  useEffect(() => {
    // 1. המוח של הברכות 🧠
    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: `בוקר טוב ${userName}`, sub: 'הזמנה שתשלח עכשיו תגיע עוד היום!', icon: <Sun className="text-yellow-500" /> });
    else if (hour < 18) setGreeting({ text: `צהריים טובים ${userName}`, sub: 'צריכים השלמות לאתר?', icon: <Coffee className="text-orange-400" /> });
    else setGreeting({ text: `ערב טוב ${userName} 🌙`, sub: 'סוגרים סידור למחר? המחסן מחכה לך.', icon: <Moon className="text-blue-400" /> });

    // 2. חיבור חי ל-Firebase למשימה הכי רלוונטית
    const q = query(
      collection(db, "tasks"),
      where("client", "==", userName),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setActiveTask({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
    });

    return () => unsubscribe();
  }, [userName]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pb-28 font-sans text-right">
      <header className="p-6 bg-white rounded-b-[45px] shadow-sm border-b border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-800">{greeting.text} {greeting.icon}</h1>
          <p className="text-sm text-gray-500 font-medium">{greeting.sub}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Bell size={24} /></div>
      </header>

      <main className="p-6 space-y-6">
        {/* כרטיס מכולה חכם - מזהה אם קיימת מכולה באתר */}
        {activeTask?.items?.includes("מכולה") && (
          <section className="saban-card alert-mode border-2 border-red-400">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-red-50 p-3 rounded-2xl text-red-500"><Trash2 size={24} /></div>
              <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse">חריגת זמן ⚠️</span>
            </div>
            <h3 className="text-xl font-black text-gray-800">מכולה ב-ויצמן 5</h3>
            <p className="text-sm text-gray-400 mb-5">יום 10 מתוך 10. הזמן החלפה עכשיו כדי למנוע חיובי יתר.</p>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-[#1976D2] text-white py-4 rounded-2xl font-black text-sm">החלפה</button>
              <button className="bg-gray-100 text-gray-600 py-4 rounded-2xl font-black text-sm">פינוי</button>
            </div>
          </section>
        )}

        {/* כרטיס סטטוס משאית - חיבור לאיתורן (דוגמה לסטטוס) */}
        <section className="saban-card border-l-[12px] border-blue-400">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-blue-500 uppercase">הזמנה בדרך 🚛</span>
            <span className="text-[10px] text-gray-400">צפי: 15 דק'</span>
          </div>
          <p className="text-lg font-black text-gray-800">חכמת הנהג בדרך ל-גלגל המזלות 73</p>
          <div className="mt-4 w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div className="bg-blue-400 h-full w-[80%] animate-pulse"></div>
          </div>
        </section>

        {/* קיצורי דרך מהירים */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/order" className="saban-card flex flex-col items-center gap-4 bg-blue-50/30">
            <div className="bg-blue-100 p-4 rounded-3xl text-blue-600"><Truck size={32} /></div>
            <span className="font-black text-gray-800">חומרי בניין</span>
          </Link>
          <Link href="/container" className="saban-card flex flex-col items-center gap-4 bg-green-50/30">
            <div className="bg-green-100 p-4 rounded-3xl text-green-600"><Trash2 size={32} /></div>
            <span className="font-black text-gray-800">מכולה</span>
          </Link>
        </div>
      </main>

      <nav className="fixed bottom-8 left-6 right-6 bg-white/80 backdrop-blur-2xl border border-gray-100 rounded-[35px] shadow-2xl p-3 flex justify-around items-center">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 p-2 px-4 rounded-2xl bg-[#1976D2] text-white shadow-lg"><Home size={22} /><span className="text-[10px] font-black">ראשי</span></Link>
        <Link href="/order" className="flex flex-col items-center gap-1 p-2 text-gray-400"><Truck size={22} /><span className="text-[10px] font-black">חומרים</span></Link>
        <Link href="/container" className="flex flex-col items-center gap-1 p-2 text-gray-400"><Trash2 size={22} /><span className="text-[10px] font-black">מכולה</span></Link>
        <Link href="/track" className="flex flex-col items-center gap-1 p-2 text-gray-400"><History size={22} /><span className="text-[10px] font-black">עבר</span></Link>
      </nav>
    </div>
  );
}
