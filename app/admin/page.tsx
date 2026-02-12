'use client'
import React, { useState, useEffect } from 'react';
import { dbCRM, dbClient } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Users, Activity, Database, RefreshCw } from 'lucide-react';

export default function GlobalAdmin() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    // האזנה למאגר הניהולי
    const q = query(collection(dbCRM, 'customer_memory'), orderBy('lastUpdate', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setCustomers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsSynced(true);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#075E54] text-white p-6 rounded-[30px] shadow-lg flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Database size={32} className={isSynced ? 'text-green-400' : 'text-red-400'} />
            <h1 className="text-2xl font-black">ניהול מוחות משולב - סבן</h1>
          </div>
          <div className="flex items-center gap-2 text-xs bg-white/10 px-3 py-1 rounded-full">
            <RefreshCw size={12} className="animate-spin" />
            סנכרון פעיל: CRM ↔ Whatasap
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {customers.map(c => (
            <div key={c.id} className="bg-white p-6 rounded-[25px] shadow-md border-b-4 border-[#25D366]">
              <div className="flex items-center gap-3 mb-4">
                <img src={c.profileImage} className="w-12 h-12 rounded-full border" />
                <div>
                  <h2 className="font-bold">{c.name}</h2>
                  <p className="text-[10px] text-gray-400">פרויקט: {c.project}</p>
                </div>
              </div>
              <div className="text-xs bg-gray-50 p-3 rounded-xl">
                <p className="font-bold text-[#075E54]">סטטוס מוח:</p>
                <p>הצלבה פעילה. מזהה הזמנות אחרונות מה-CRM.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
