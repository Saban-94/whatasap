'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
// תיקון הייבוא - הוספנו Truck וסידרנו את השאר
import { 
  Trash2, RefreshCw, MapPin, Clock, CheckCircle, 
  AlertTriangle, Search, Truck, User 
} from 'lucide-react';

// הגדרת טיפוס הנתונים למניעת שגיאות TypeScript
interface ContainerTask {
  id: string;
  client?: string;
  address?: string;
  action?: 'הצבה' | 'החלפה' | 'פינוי';
  status?: 'חדש' | 'בטיפול' | 'הושלם' | 'SCHEDULED_SWAP';
  city?: string;
  timestamp?: any;
}

export default function AdminContainersPage() {
  const [tasks, setTasks] = useState<ContainerTask[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const q = query(collection(db, "tasks"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContainerTask[];
      
      setTasks(tasksData);

      // לוגיקת התראה קולית על החלפה דחופה
      const hasEmergency = tasksData.some(t => t.status === "SCHEDULED_SWAP");
      if (hasEmergency && audioRef.current) {
        audioRef.current.play().catch(() => console.log("Audio play blocked"));
      }
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "tasks", id), { status: newStatus });
  };

  const removeTask = async (id: string) => {
    if (confirm("האם למחוק את הרשומה?")) {
      await deleteDoc(doc(db, "tasks", id));
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.client?.includes(searchTerm) || t.address?.includes(searchTerm)
  );

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans text-right text-gray-900">
      <audio ref={audioRef} src="/emergency.mp3" preload="auto" />

      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black italic">ניהול מכולות – ח. סבן</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">לוח פיקוד לוגיסטי</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="חפש לקוח או כתובת..." 
            className="w-full p-4 pr-12 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {filteredTasks.map((task) => (
            <div key={task.id} className={`bg-white rounded-[35px] p-6 shadow-sm border-r-[12px] transition-all ${
              task.status === 'SCHEDULED_SWAP' ? 'border-red-500 animate-pulse' : 'border-blue-400'
            }`}>
              <div className="flex flex-col sm:flex-row justify-between gap-4 text-right">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                      {task.action || 'משימה'}
                    </span>
                    <span className="text-gray-400 text-xs font-bold">{task.city}</span>
                  </div>
                  <h3 className="text-2xl font-black flex items-center gap-2">
                    <User size={20} className="text-gray-400" /> {task.client}
                  </h3>
                  <p className="flex items-center gap-2 text-gray-600 font-bold italic">
                    <MapPin size={18} className="text-red-400" /> {task.address}
                  </p>
                </div>

                <div className="flex flex-row sm:flex-col gap-2 justify-end">
                  <button 
                    onClick={() => updateStatus(task.id, 'בטיפול')}
                    className="bg-blue-50 text-blue-600 p-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    title="שלח נהג"
                  >
                    <Truck size={24} />
                  </button>
                  <button 
                    onClick={() => updateStatus(task.id, 'הושלם')}
                    className="bg-green-50 text-green-600 p-3 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                    title="סמן כבוצע"
                  >
                    <CheckCircle size={24} />
                  </button>
                  <button 
                    onClick={() => removeTask(task.id)}
                    className="bg-red-50 text-red-300 p-3 rounded-2xl hover:text-red-600 transition-all"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <AlertTriangle className="text-orange-500" /> חריגות בשטח
            </h3>
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 mb-4">
              <p className="text-xs font-black text-red-400 uppercase tracking-tighter">חריגת היתר</p>
              <p className="text-sm font-bold text-red-800 italic">שחר שאול - גלגל המזלות</p>
              <p className="text-[10px] text-red-600 mt-1">יום 11 - חובה לפנות!</p>
            </div>
          </section>

          <section className="bg-blue-600 rounded-[40px] p-8 shadow-xl text-white">
            <h3 className="text-xl font-black mb-4">סטטוס יומי</h3>
            <div className="flex justify-between items-center bg-white/10 p-4 rounded-3xl">
              <span className="text-xs font-bold">סך מכולות בשטח:</span>
              <span className="text-2xl font-black">{tasks.length}</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
