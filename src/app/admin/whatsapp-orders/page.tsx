'use client';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase"; 
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { MessageSquare, CheckCircle, Trash2, ArrowLeft, Clock, Truck, Package, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function WhatsAppOrdersDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // האזנה בזמן אמת להזמנות מוואטסאפ (דרך Firebase)
  useEffect(() => {
    const q = query(collection(db, "whatsapp_orders"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // מערכת התראה קולית להזמנות תקועות
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const hasLateOrder = orders.some(o => 
        o.status === 'חדש' && o.timestamp && (now - o.timestamp.toDate().getTime() > 60000)
      );
      if (hasLateOrder) {
        new Audio('/notification.mp3').play().catch(() => {});
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [orders]);

  const approveOrder = async (order: any) => {
    await updateDoc(doc(db, "whatsapp_orders", order.id), { status: 'בטיפול' });
  };

  const deleteOrder = async (id: string) => {
    if(confirm("למחוק את ההזמנה?")) await deleteDoc(doc(db, "whatsapp_orders", id));
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold">טוען מערכת ניהול...</div>;

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-4 md:p-8" dir="rtl">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div className="text-right">
          <h1 className="text-3xl font-black text-[#075e54] flex items-center gap-3">
            <MessageSquare size={32} /> ניהול הזמנות WhatsApp
          </h1>
          <p className="text-gray-600 font-medium">מרכז לוגיסטי - ה. סבן</p>
        </div>
        <Link href="/admin">
          <button className="bg-white p-3 px-6 rounded-2xl font-bold shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-all">
            <ArrowLeft size={20} /> חזרה לתפריט
          </button>
        </Link>
      </header>

      {/* Orders Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-6">
        {orders.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl text-center shadow-inner border-2 border-dashed">
             <Package size={60} className="mx-auto text-gray-300 mb-4" />
             <p className="text-xl text-gray-400 font-bold">אין הזמנות חדשות כרגע</p>
          </div>
        ) : (
          orders.map(order => {
            const orderTime = order.timestamp?.toDate();
            const isLate = order.status === 'חדש' && (new Date().getTime() - (orderTime?.getTime() || 0) > 60000);

            return (
              <div key={order.id} className={`bg-white rounded-3xl shadow-sm border-2 transition-all overflow-hidden ${isLate ? 'border-red-500 animate-pulse' : 'border-transparent'}`}>
                <div className="flex flex-col md:flex-row">
                  
                  {/* פרטי הלקוח והטקסט */}
                  <div className="p-6 flex-1 border-l">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-[#dcf8c6] text-[#075e54] px-4 py-1 rounded-full text-xs font-bold uppercase">
                        {order.status}
                      </span>
                      <span className="text-gray-400 text-xs flex items-center gap-1">
                        <Clock size={14} /> {orderTime?.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">{order.sender || "לקוח לא מזוהה"}</h3>
                    <div className="bg-gray-50 p-4 rounded-2xl text-lg text-gray-700 leading-relaxed italic border-r-4 border-[#075e54]">
                      "{order.text}"
                    </div>
                  </div>

                  {/* ניתוח לוגיסטי (הזרקת ידע) */}
                  <div className="p-6 bg-gray-50 md:w-80 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-500 mb-3 flex items-center gap-2">
                        <CheckCircle size={16} /> פיענוח לוגיסטי:
                      </h4>
                      {/* כאן גימני מציג את תוצאות ההצלבה מהמלאי */}
                      <div className="space-y-2">
                        {order.analysis?.items?.map((item: any, i: number) => (
                          <div key={i} className="bg-white p-2 rounded-xl text-sm border flex justify-between">
                            <span className="font-bold">{item.name}</span>
                            <span className="text-[#075e54]">x{item.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                      <button 
                        onClick={() => approveOrder(order)}
                        className="flex-1 bg-[#25D366] text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#1ebd59]"
                      >
                        <Truck size={18} /> אשר ושלח
                      </button>
                      <button 
                        onClick={() => deleteOrder(order.id)}
                        className="bg-red-50 text-red-500 p-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
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
