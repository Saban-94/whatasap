'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase"; 
import { collection, onSnapshot, query, orderBy, addDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { MessageSquare, CheckCircle, Trash2, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

export default function WhatsAppOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // האזנה להודעות וואטסאפ חדשות שנכנסו ל-Firebase
  useEffect(() => {
    const q = query(collection(db, "whatsapp_orders"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // פונקציית אישור הזמנה - סנכרון ל-365 והוספה ל-Tasks
  const approveOrder = async (order: any) => {
    try {
      // הלינק לאוטומציה מהקובץ src/app/page.tsx שלך
      const flowUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA";

      // הכנת הנתונים בדיוק לפי המבנה ב-Firestore (תמונה 2)
      const taskData = {
        client: order.sender || "לקוח וואטסאפ",
        address: "נא לעדכן כתובת", // שדה חובה באוטומציה
        items: order.text,
        phone: "972508861080", // מספר תואם לדוגמה בתמונה
        status: "🆕 ממתין",
        timestamp: serverTimestamp()
      };

      // 1. שליחה ל-Power Automate (Microsoft 365)
      await fetch(flowUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          date: new Date().toLocaleDateString('he-IL')
        })
      });

      // 2. הוספה לאוסף ה-tasks ב-Firestore (תמונה 2)
      await addDoc(collection(db, "tasks"), taskData);

      // 3. מחיקה מרשימת הממתינים של וואטסאפ
      await deleteDoc(doc(db, "whatsapp_orders", order.id));
      
      alert("ההזמנה אושרה, נשלחה ל-365 והתווספה לרשימת המשימות! ✅");
    } catch (error) {
      console.error("Approval error:", error);
      alert("שגיאה בסנכרון. וודא שחיבור האינטרנט תקין.");
    }
  };

  const deleteOrder = async (id: string) => {
    if (confirm("למחוק את הודעת הוואטסאפ הזו?")) {
      await deleteDoc(doc(db, "whatsapp_orders", id));
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f0f2f5] p-4 font-sans text-right">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-6 bg-white p-5 rounded-2xl shadow-sm border-b-4 border-[#25D366]">
        <div>
          <h1 className="text-2xl font-black text-[#075E54]">הזמנות וואטסאפ</h1>
          <p className="text-sm text-gray-500 font-medium">ניהול הודעות נכנסות מ-Green-API</p>
        </div>
        <Link href="/admin">
          <button className="flex items-center gap-2 bg-gray-100 p-2 px-4 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-all">
            <ArrowLeft size={18} /> חזרה לניהול
          </button>
        </Link>
      </header>

      {loading ? (
        <div className="text-center p-10 font-bold text-[#075E54]">טוען הודעות...</div>
      ) : (
        <div className="grid gap-4 max-w-4xl mx-auto">
          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-dashed border-gray-300">
              <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium text-lg">אין הודעות חדשות שממתינות לאישור</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 w-full text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#dcf8c6] text-[#075e54] text-xs font-bold px-3 py-1 rounded-full">
                      👤 {order.sender || "לקוח"}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock size={10} />
                      {order.timestamp?.toDate ? order.timestamp.toDate().toLocaleString('he-IL') : 'זה עתה'}
                    </span>
                  </div>
                  <p className="text-gray-800 font-bold text-lg leading-relaxed">{order.text}</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <button 
                    onClick={() => approveOrder(order)}
                    className="flex-1 md:flex-none bg-[#25D366] text-white p-4 px-6 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#128C7E] active:scale-95 transition-all shadow-lg shadow-green-100"
                  >
                    <CheckCircle size={20} /> אשר ושלח ל-365
                  </button>
                  <button 
                    onClick={() => deleteOrder(order.id)}
                    className="bg-red-50 text-red-500 p-4 rounded-2xl hover:bg-red-100 active:scale-95 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
