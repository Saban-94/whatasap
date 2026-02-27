'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from 'lucide-react';

export default function SabanOrdersDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    // הגדרת סוג מפורש (payload: any) כדי למנוע שגיאת Build
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'orders' }, 
        (payload: any) => {
          setOrders((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    setOrders(data || []);
    setLoading(false);
  }

  const approveOrder = async (id: string) => {
    await supabase.from('orders').update({ status: 'APPROVED' }).eq('id', id);
    fetchOrders();
  };

  if (loading) {
    return <div className="p-6 bg-[#0b141a] min-h-screen text-white text-center">טוען נתונים...</div>;
  }

  return (
    <div className="p-6 bg-[#0b141a] min-h-screen text-white font-sans" dir="rtl">
      <header className="mb-8 flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#00a884]">ניהול הזמנות - ח. סבן</h1>
          <p className="text-gray-400">מעקב הזמנות ווטסאפ ואישורי מנהל</p>
        </div>
        <div className="flex gap-4">
          <Badge className="bg-orange-600 p-2 text-white">
            ממתין לראמי: {orders.filter(o => o.status === 'WAITING_FOR_RAMI').length}
          </Badge>
          <Badge className="bg-blue-600 p-2 text-white">
            הזמנות חדשות: {orders.filter(o => o.status === 'PENDING').length}
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <div key={order.id} className={`p-4 rounded-xl border ${order.status === 'WAITING_FOR_RAMI' ? 'border-orange-500 bg-[#202c33]' : 'border-gray-800 bg-[#111b21]'}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg">{order.client_name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleString('he-IL')}
                  </span>
                </div>
                <p className="text-sm text-gray-300 italic mb-3">"{order.ai_metadata?.raw_message}"</p>
                
                <div className="space-y-1">
                   {order.items && Array.isArray(order.items) && order.items.map((item: any, i: number) => (
                     <div key={i} className="text-sm bg-gray-800/50 p-1 px-2 rounded inline-block ml-2">
                       {item.qty} x {item.name}
                     </div>
                   ))}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {order.status === 'WAITING_FOR_RAMI' ? (
                  <button 
                    onClick={() => approveOrder(order.id)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                  >
                    <AlertTriangle size={18}/> אשר חריגה (ראמי)
                  </button>
                ) : (
                  <Badge className="bg-[#00a884] text-white">סטטוס: {order.status}</Badge>
                )}
                <button className="text-xs text-gray-400 hover:text-white transition-colors">צפה בלוג שיחה מלא</button>
              </div>
            </div>
            
            {order.ai_metadata?.insight && (
              <div className="mt-4 p-2 bg-blue-900/20 border-r-2 border-blue-500 text-xs text-blue-300">
                <strong>תובנת גימני:</strong> {order.ai_metadata.insight}
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center text-gray-500 mt-10">אין הזמנות חדשות במערכת.</div>
        )}
      </div>
    </div>
  );
}
