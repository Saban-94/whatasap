'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase"; 
import { collection, onSnapshot, query, orderBy, addDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { MessageSquare, CheckCircle, Trash2, ArrowLeft, Clock, BellRing } from 'lucide-react';
import Link from 'next/link';

export default function WhatsAppOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "whatsapp_orders"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkAndAlert = () => {
      const now = new Date().getTime();
      let hasPendingOrder = false;
      orders.forEach(order => {
        if (order.status === 'חדש' && order.timestamp) {
          const orderTime = order.timestamp.toDate().getTime();
          if (now - orderTime > 60000) hasPendingOrder = true;
        }
      });
      if (hasPendingOrder) {
        new Audio('/notification.mp3').play().catch(() => {});
      }
    };
    const interval = setInterval(checkAndAlert, 60000);
    return () => clearInterval(interval);
  }, [orders]);

  const approveOrder = async (order: any) => {
    try {
      const flowUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA";
      const taskData = {
        client: order.sender || "לקוח וואטסאפ",
        address: "נא לעדכן כתובת", 
        items: order.text,
        phone: "972508861080", 
        status: "🆕 ממתין",
        timestamp: serverTimestamp()
      };
      await fetch(flowUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...taskData, date: new Date().toLocaleDateString('he-IL') }) });
      await addDoc(collection(db, "tasks"), taskData);
      await deleteDoc(doc(db, "whatsapp_orders", order.id));
      alert("הזמנה סונכרנה בהצלחה! ✅");
    } catch (e) { alert("שגיאה בסנכרון"); }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f0f2f5] p-4 font-sans">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-6 bg-white p-5 rounded-2xl border-b-4 border-[#25D366]">
        <div>
          <h1 className="text-2xl font-black text-[#075E54] flex items-center gap-2">הזמנות וואטסאפ <BellRing className="text-orange-500 animate-pulse" /></h1>
          <p className="text-sm text-gray-500">ח. סבן - ניהול לוגיסטי</p>
        </div>
        <Link href="/admin"><button className="bg-gray-100 p-2 px-4 rounded-xl font-bold flex items-center gap-2"><ArrowLeft size={18}/> חזרה</button></Link>
      </header>
      <div className="max-w-4xl mx-auto space-y-4">
        {orders.map(o => {
          const isLate = o.status === 'חדש' && (new Date().getTime() - (o.timestamp?.toDate().getTime() || 0) > 60000);
          return (
            <div key={o.id} className={`bg-white p-6 rounded-3xl border-2 transition-all ${isLate ? 'border-red-400 animate-pulse' : 'border-transparent'}`}>
              <div className="flex justify-between items-center">
                <div className="text-right">
                  <span className="bg-[#dcf8c6] text-[#075e54] text-xs font-bold px-3 py-1 rounded-full">👤 {o.sender}</span>
                  <p className="text-gray-800 font-bold text-lg mt-2">{o.text}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveOrder(o)} className="bg-[#25D366] text-white p-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#128C7E]"><CheckCircle size={20}/> אשר</button>
                  <button onClick={() => deleteDoc(doc(db, "whatsapp_orders", o.id))} className="bg-red-50 text-red-500 p-4 rounded-2xl"><Trash2 size={20}/></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
