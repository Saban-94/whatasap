'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase"; // שימוש בהגדרות הקיימות שלך
import { collection, onSnapshot, query, orderBy, addDoc, doc, deleteDoc } from "firebase/firestore";
import { MessageSquare, CheckCircle, Trash2, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

export default function WhatsAppOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. האזנה להודעות וואטסאפ שנכנסו ל-Firebase בזמן אמת
  useEffect(() => {
    const q = query(collection(db, "whatsapp_orders"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. פונקציית אישור הזמנה - הופכת הודעת טקסט למשימה ב-365 ובמערכת המשימות
  const approveOrder = async (order: any) => {
    try {
      // שליחה לאוטומציה הקיימת שלך ב-Power Automate
      const flowUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA";

      await fetch(flowUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: order.sender || "לקוח מקבוצת וואטסאפ",
          items: order.text,
          status: "אושר מוואטסאפ",
          timestamp: new Date()
        })
      });

      // הוספה לאוסף המשימות הכללי של המערכת (tasks)
      await addDoc(collection(db, "tasks"), {
        client: order.sender || "לקוח חדש",
        items: order.text,
        status: "חדש",
        createdAt: new Date(),
        source: "WhatsApp"
      });

      // מחיקה מרשימת ההמתנה של וואטסאפ לאחר אישור
      await deleteDoc(doc(db, "whatsapp_orders", order.id));
      alert("ההזמנה אושרה וסונכרנה ל-365 ולנהגים!");
    } catch (error) {
      console.error("Error approving order:", error);
      alert("שגיאה בסנכרון ההזמנה");
    }
  };

  const deleteOrder = async (id: string) => {
    if (confirm("למחוק את ההודעה?")) {
      await deleteDoc(doc(db, "whatsapp_orders", id));
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f0f2f5] p-6 font-sans">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border-b-4 border-[#25D366]">
        <div>
          <h1 className="text-2xl font-black text-[#075E54]">הזמנות וואטסאפ</h1>
          <p className="text-sm text-gray-500">הודעות הממתינות לעיבוד ב-Saban Logistics</p>
        </div>
        <Link href="/admin">
          <button className="flex items-center gap-2 bg-gray-100 p-2 px-4 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-all">
            <ArrowLeft size={18} /> חזרה לניהול
          </button>
        </Link>
      </header>

      {loading ? (
        <div className="text-center p-10 font-bold text-[#075E54]">מחבר תקשורת לקבוצה...</div>
      ) : (
        <div className="grid gap-4 max-w-4xl mx-auto">
          {orders.length === 0 && (
            <div className="bg-white p-12 rounded-3xl text-center shadow-sm">
              <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">אין הודעות חדשות בקבוצת ההזמנות</p>
            </div>
          )}

          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#dcf8c6] text-[#075e54] text-xs font-bold px-3 py-1 rounded-full">
                    {order.sender || "לא מזוהה"}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {order.timestamp?.toDate().toLocaleString('he-IL')}
                  </span>
                </div>
                <p className="text-gray-800 font-medium text-lg">{order.text}</p>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => approveOrder(order)}
                  className="flex-1 md:flex-none bg-[#25D366] text-white p-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all shadow-lg shadow-green-100"
                >
                  <CheckCircle size={18} /> אשר ושלח ל-365
                </button>
                <button 
                  onClick={() => deleteOrder(order.id)}
                  className="bg-red-50 text-red-500 p-3 rounded-2xl hover:bg-red-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="mt-12 text-center text-gray-400 text-xs">
        SABAN LOGISTICS CONNECT v2.0 | מסונכרן עם OneSignal & Microsoft 365
      </footer>
    </div>
  );
}
