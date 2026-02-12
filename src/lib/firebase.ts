'use client'
import React, { useState, useEffect } from 'react';
import { dbCRM, dbClient } from '@/lib/firebase'; // הייבוא עכשיו יעבוד
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Users, Activity, Database, RefreshCw, Layers } from 'lucide-react';

export default function GlobalAdmin() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    // האזנה למאגר ה-CRM הראשי
    const q = query(collection(dbCRM, 'customer_memory'), orderBy('lastUpdate', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setCustomers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsSynced(true);
    }, (error) => {
      console.error("Firebase Sync Error:", error);
      setIsSynced(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-4 md:p-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header עם אינדיקטור צילוב */}
        <div className="bg-[#075E54] text-white p-6 rounded-[30px] shadow-lg flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-full">
              <Layers size={32} className={isSynced ? 'text-green-400' : 'text-red-400'} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase">ניהול מוחות סבן - מערכת צולבת</h1>
              <p className="text-[10px] text-green-200">סינכרון פעיל בין 2 בסיסי נתונים</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/10">
            <RefreshCw size={14} className={isSynced ? "animate-spin" : ""} />
            <span className="text-xs font-mono tracking-tighter">SYNC: CRM ↔ CLIENT</span>
          </div>
        </div>

        {/* תצוגת לקוחות מצולבת */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map(c => (
            <div key={c.id} className="bg-white p-6 rounded-[35px] shadow-xl border-t-8 border-[#075E54] hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-4 mb-4">
                <img src={c.profileImage} className="w-16 h-16 rounded-full border-2 border-gray-100 object-cover shadow-sm" />
                <div>
                  <h2 className="text-lg font-black text-gray-800">{c.name}</h2>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold">VIP ID: {c.accNum}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-[#075E54] mb-1 font-bold text-xs">
                    <Database size={14} />
                    <span>סטטוס מוח משולב:</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    המוח מזהה היסטוריית CRM עבור פרויקט **{c.project}**. 
                    הצלבה פעילה עם מאגר השיפוצים של Whatasap.
                  </p>
                </div>
                
                <div className="flex justify-between items-center px-2">
                  <span className="text-[9px] text-gray-400 italic">עדכון אחרון: {new Date(c.lastUpdate).toLocaleTimeString('he-IL')}</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-75"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
