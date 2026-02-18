'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Truck, Package, User, Calendar } from 'lucide-react';

export default function OrdersDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // משיכת הניתוחים הלוגיסטיים של ח. סבן
    const q = query(collection(db, 'logistic_orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-10 text-white bg-black h-screen">טוען נתונים...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans" dir="rtl">
      <h1 className="text-2xl font-bold text-green-500 mb-6">לוח בקרה - ח. סבן</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-[#111b21] p-4 rounded-xl border border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold flex items-center gap-2"><User size={16}/> {order.customerName}</span>
              <span className="text-xs text-gray-500">{order.logistics?.truckType}</span>
            </div>
            <div className="text-sm text-gray-400 mb-3 italic">"{order.originalPrompt}"</div>
            <div className="flex flex-wrap gap-2">
              {order.recommendations?.map((item: any, i: number) => (
                <span key={i} className="text-[11px] bg-gray-800 px-2 py-1 rounded border border-gray-700">
                  {item.name} x{item.qty}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
