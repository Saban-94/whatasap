'use client';
import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { Truck, Eye, MapPin, AlertCircle, RefreshCw, Trash2, CheckCircle } from 'lucide-react';

const WAREHOUSES = [
  { id: 30, name: "שארק", code: "SHARK_30", color: "blue" },
  { id: 32, name: "כראדי", code: "KARADI_32", color: "purple" },
  { id: 40, name: "שי שרון", code: "SHAYSHARON40", color: "indigo" }
];

export default function RamiContainerControl() {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "container_contracts"));
    const unsub = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const getStatusColor = (days: number) => {
    if (days >= 10) return "bg-red-500 border-red-600 animate-pulse";
    if (days >= 7) return "bg-yellow-400 border-yellow-500";
    return "bg-green-500 border-green-600";
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] p-6 font-sans">
      <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-[35px] shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-800">מרכז בקרת מכולות 🚦</h1>
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">ח. סבן לוגיסטיקה</p>
        </div>
        <div className="flex gap-4">
            {WAREHOUSES.map(w => (
                <div key={w.id} className="text-center px-4 py-2 bg-white rounded-2xl shadow-sm border">
                    <p className="text-[10px] font-black text-gray-400">{w.name}</p>
                    <p className="text-lg font-black text-blue-600">30/50</p>
                </div>
            ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-[40px] p-6 shadow-sm border border-gray-100 relative overflow-hidden transition-all hover:shadow-xl">
            {/* פס צבע הסטטוס בצד */}
            <div className={`absolute left-0 top-0 bottom-0 w-3 ${getStatusColor(task.current_day)}`}></div>
            
            <div className="flex justify-between items-start mb-4 pr-2">
              <div>
                <h3 className="text-xl font-black text-gray-800 leading-tight">{task.customer_name}</h3>
                <p className="text-xs text-gray-400 font-bold">{task.address}</p>
              </div>
              <div className={`p-3 rounded-2xl ${task.last_seen ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-300'}`}>
                <Eye size={24} className={task.last_seen ? 'animate-pulse' : ''} />
              </div>
            </div>

            <div className="bg-[#FDFBF7] p-4 rounded-3xl mb-6 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">קבלן מבצע (קבוע)</p>
                <p className="font-black text-blue-800">{WAREHOUSES.find(w => w.id === task.sticky_warehouse_id)?.name}</p>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-400 uppercase">יום שכירות</p>
                <p className="text-2xl font-black text-gray-800 italic">{task.current_day}/10</p>
              </div>
            </div>

            {/* פעולות ראמי - שליחה לווצאף נהג */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 bg-green-50 text-green-700 py-3 rounded-2xl font-black text-sm active:scale-95 transition-all">
                <RefreshCw size={18} /> החלפה
              </button>
              <button className="flex items-center justify-center gap-2 bg-red-50 text-red-700 py-3 rounded-2xl font-black text-sm active:scale-95 transition-all">
                <Trash2 size={18} /> פינוי
              </button>
            </div>
            
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${task.lat},${task.lng}`}
              target="_blank"
              className="mt-4 flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100"
            >
              <MapPin size={20} /> ניווט לנהג
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
