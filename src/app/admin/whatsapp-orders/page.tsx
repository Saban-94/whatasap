'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase"; 
import { collection, onSnapshot, query, orderBy, addDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { MessageSquare, CheckCircle, Trash2, ArrowLeft, Clock, BellRing } from 'lucide-react';
import Link from 'next/link';

export default function WhatsAppOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. האזנה להודעות וואטסאפ בזמן אמת
  useEffect(() => {
    const q = query(collection(db, "whatsapp_orders"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. מנגנון "נודניק" - צלצול כל דקה על הודעות "חדש" שלא קיבלו התייחסות
  useEffect(() => {
    const checkAndAlert = () => {
      const now = new Date().getTime();
      let hasPendingOrder = false;

      orders.forEach(order => {
        if (order.status === 'חדש' && order.timestamp) {
          const orderTime = order.timestamp.toDate().getTime();
          // אם עברה יותר מדקה (60,000 מילישניות)
          if (now - orderTime > 60000) {
            hasPendingOrder = true;
          }
        }
      });

      if (hasPendingOrder) {
        const audio = new Audio('/notification.mp3'); // שימוש בקובץ הקיים במאגר
        audio.play().catch(e => console.log("ממתין לאינטראקציה ראשונה להפעלת סאונד"));
      }
    };

    const interval = setInterval(checkAndAlert, 60000); // בדיקה כל דקה
    return () => clearInterval(interval);
  }, [orders]);

  // 3. פונקציית אישור הזמנה וסנכרון ל-365 ול-Tasks
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

      // שליחה ל-Microsoft 365
      await fetch(flowUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskData, date: new Date().toLocaleDateString('he-IL') })
      });

      // הוספה לאוסף המשימות הראשי
      await addDoc(collection(db, "tasks"), taskData);

      // מחיקה מרשימת הוואטסאפ
      await deleteDoc(doc(db, "whatsapp_orders", order.id));
      
      alert("ההזמנה אושרה וסונכרנה! ✅");
    } catch (error) {
      alert("שגיאה בסנכרון ל-365");
    }
  };

  const deleteOrder = async (id: string) => {
    if (confirm("למחוק את ההודעה?")) {
      await deleteDoc(doc(db, "whatsapp_orders", id));
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f0f2f5] p-4 font-sans">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-6 bg-white p-5 rounded-2xl shadow-sm border-b-4 border-[#25D366]">
        <div>
          <h1 className="text-2xl font-black text-[#075E54] flex items-center gap-2">
            הזמנות וואטסאפ <BellRing className="text-orange-500 animate-pulse" size={20} />
          </h1>
          <p className="text-sm text-gray-500">מרכז בקרה - ח. סבן</p>
        </div>
        <Link href="/admin">
          <button className="flex items-center gap-2 bg-gray-100 p-2 px-4 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-all">
            <ArrowLeft size={18} /> חזרה
          </button>
        </Link>
      </header>

      <div className="max-w-4xl mx-auto space-y-4">
        {loading ? (
          <p className="text-center font-bold text-gray-400">טוען הודעות...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-dashed border-gray-300">
            <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">אין הודעות חדשות</p>
          </div>
        ) : (
          orders.map((order) => {
            const isLate = order.status === 'חדש' && (new Date().getTime() - (order.timestamp?.toDate().getTime() || 0) > 60000);
            return (
              <div key={order.id} className={`bg-white p-6 rounded-3xl shadow-sm border-2 transition-all ${isLate ? 'border-red-400 animate-pulse' : 'border-transparent'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-[#dcf8c6] text-[#075e54] text-xs font-bold px-3 py-1 rounded-full">
                        👤 {order.sender}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {order.timestamp?.toDate().toLocaleString('he-IL')}
                      </span>
                      {isLate && <span className="text-red-500 text-[10px] font-bold">⚠️ דורש התייחסות!</span>}
                    </div>
                    <p className="text-gray-800 font-bold text-lg leading-relaxed">{order.text}</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => approveOrder(order)} className="flex-1 md:flex-none bg-[#25D366] text-white p-4 px-6 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-all">
                      <CheckCircle size={20} /> אשר
                    </button>
                    <button onClick={() => deleteOrder(order.id)} className="bg-red-50 text-red-500 p-4 rounded-2xl hover:bg-red-100 transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
