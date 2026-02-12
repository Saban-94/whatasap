'use client'
import React, { useState, useEffect } from 'react';
import { dbCRM, dbClient } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Users, Activity, Database, RefreshCw, Layers } from 'lucide-react';

export default function GlobalAdmin() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    // משיכת נתונים ממאגר ה-CRM הראשי
    const q = query(collection(dbCRM, 'customer_memory'), orderBy('lastUpdate', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setCustomers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsSynced(true);
    }, (error) => {
      console.error("Sync Error:", error);
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
              <h1 className="text-2xl font-black">ניהול מוחות סבן - מערכת צולבת</h1>
              <p className="text-[10px] text-green-200">סנכרון פעיל: CRM ↔ Whatasap</p>
            </div>
          </div>
          <RefreshCw className={isSynced ? "animate-spin opacity-50" : "opacity-20"} size={20} />
        </div>

        {/* הצלבת נתונים ללקוחות (למשל שחר לוי) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {customers.map(c => (
            <div key={c.id} className="bg-white p-6 rounded-[35px] shadow-xl border-t-8 border-[#075E54]">
              <div className="flex items-center gap-4 mb-4">
                <img src={c.profileImage} className="w-14 h-14 rounded-full border-2 object-cover shadow-sm" />
                <div>
                  <h2 className="text-lg font-bold">{c.name}</h2>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                    לקוח: {c.accNum}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[11px] text-gray-500 italic">
                  המוח מזהה צרכי שיפוץ ומצליב עם היסטוריה ממאגר ה-CRM.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
