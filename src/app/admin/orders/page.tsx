'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Truck, Package, User, Calendar, Info } from 'lucide-react';

export default function OrdersDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // משיכת כל הניתוחים הלוגיסטיים שגימני ביצע מה-DB
    const q = query(collection(db, 'logistic_orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="mb-10 flex justify-between items-center border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-500">ניהול הזמנות ח. סבן</h1>
          <p className="text-gray-400">מעקב ניתוחי AI ולוגיסטיקה בזמן אמת</p>
        </div>
        <div className="bg-[#202c33] p-3 rounded-lg border border-gray-700">
          <span className="text-sm font-bold font-mono">סה"כ הזמנות: {orders.length}</span>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#111b21] border border-gray-800 rounded-xl p-5 hover:border-green-600 transition-all">
              <div className="flex flex-wrap justify-between items-start gap-4">
                {/* פרטי לקוח */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  <div className="p-3 bg-green-900/30 rounded-full">
                    <User className="text-green-500 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{order.customerName || 'לקוח כללי'}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} /> {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString('he-IL') : 'תאריך לא ידוע'}
                    </p>
                  </div>
                </div>

                {/* ניתוח לוגיסטי */}
                <div className="flex gap-6 items-center">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${order.logistics?.needsCrane ? 'bg-red-900/30 text-red-400 border border-red-800 shadow-[0_0_10px_rgba(220,38,38,0.2)]' : 'bg-blue-900/30 text-blue-400 border border-blue-800'}`}>
                    <Truck size={16} />
                    {order.logistics?.truckType || 'טנדר'}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">משקל כולל:</span>
                    <span className="font-mono text-green-400 ml-2 font-bold">{order.logistics?.totalWeightKg || 0} ק"ג</span>
                  </div>
                </div>
              </div>

              {/* רשימת פריטים מומלצים */}
              <div className="mt-6 pt-4 border-t border-gray-800">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2 tracking-wider">
                  <Package size={14} /> פריטים לליקוט לפי גימני:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {order.recommendations?.map((item: any, idx: number) => (
                    <span key={idx} className="bg-[#202c33] px-3 py-1 rounded text-sm border border-gray-700 hover:border-green-500 transition-colors">
                      {item.name} <strong className="text-green-500 ml-1">x{item.qty}</strong>
                    </span>
                  )) || <span className="text-gray-600 italic text-sm">לא זוהו פריטים ספציפיים</span>}
                </div>
              </div>

              {/* הבקשה המקורית של הלקוח */}
              <div className="mt-4 p-3 bg-black/40 rounded-lg text-sm text-gray-400 italic flex gap-2">
                <Info size={16} className="shrink-0 mt-0.5 text-gray-600" />
                <span>"{order.originalPrompt}"</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
