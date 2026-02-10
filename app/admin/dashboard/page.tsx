"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Clock, Package, Calendar, Share2, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
  const [trials, setTrials] = useState<any[]>([]);
  const businessId = "rami_demo_1"; // זה יימשך מה-Auth בעתיד

  useEffect(() => {
    // האזנה חיה למאגר הלינקים (Trials)
    const q = query(collection(db, "trials"), where("businessId", "==", businessId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trialsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrials(trialsData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-right" dir="rtl">
      <header className="mb-12">
        <h1 className="text-3xl font-black dark:text-white">לוח בקרה - RamiOS</h1>
        <p className="text-slate-500">נהל את העסק שלך ואת תקופות הניסיון של הלקוחות</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex justify-between items-start">
            <Clock className="text-cyan-500" />
            <span className="text-2xl font-black dark:text-white">{trials.length}</span>
          </div>
          <p className="mt-2 text-sm font-bold text-slate-500">לינקים פעילים</p>
        </div>
        {/* עוד כרטיסי סטטיסטיקה כאן */}
      </div>

      <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          <h2 className="text-xl font-bold dark:text-white">מעקב תקופות ניסיון (10 ימים)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="text-slate-400 text-xs uppercase bg-slate-50 dark:bg-transparent">
                <th className="p-4 font-bold">לקוח</th>
                <th className="p-4 font-bold">תאריך יצירה</th>
                <th className="p-4 font-bold">ימים שנותרו</th>
                <th className="p-4 font-bold">סטטוס</th>
                <th className="p-4 font-bold">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {trials.map((trial) => (
                <tr key={trial.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold dark:text-white">{trial.customerPhone}</td>
                  <td className="p-4 text-slate-500 text-sm">{new Date(trial.createdAt.seconds * 1000).toLocaleDateString('he-IL')}</td>
                  <td className="p-4">
                     <span className="px-3 py-1 bg-cyan-500/10 text-cyan-500 rounded-full text-xs font-black">
                        {Math.max(0, 10 - Math.floor((Date.now() - trial.createdAt.seconds * 1000) / (1000 * 60 * 60 * 24)))} ימים
                     </span>
                  </td>
                  <td className="p-4">
                    {trial.status === 'active' ? (
                      <span className="text-emerald-500 text-xs font-bold flex items-center gap-1"><ShieldCheck size={14}/> פעיל</span>
                    ) : (
                      <span className="text-rose-500 text-xs font-bold">פג תוקף</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button className="text-xs bg-slate-900 dark:bg-white dark:text-black text-white px-4 py-2 rounded-xl font-bold">פתח גישה</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
