'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { 
  Trash2, RefreshCw, MapPin, Clock, CheckCircle, 
  AlertTriangle, Phone, User, Calendar, Search 
} from 'lucide-react';

// הגדרת טיפוס הנתונים למניעת שגיאות Build
interface ContainerTask {
  id: string;
  client?: string;
  address?: string;
  action?: 'הצבה' | 'החלפה' | 'פינוי';
  status?: 'חדש' | 'בטיפול' | 'הושלם' | 'SCHEDULED_SWAP';
  city?: string;
  timestamp?: any;
  expiryDate?: any;
}

export default function AdminContainersPage() {
  const [tasks, setTasks] = useState<ContainerTask[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // חיבור חי ל-Firebase
  useEffect(() => {
    const q = query(collection(db, "tasks"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContainerTask[];
      
      setTasks(tasksData);

      // לוגיקת "צעקה" - התראה קולית על החלפה דחופה
      const hasEmergency = tasksData.some(t => t.status === "SCHEDULED_SWAP");
      if (hasEmergency && audioRef.current) {
        audioRef.current.play().catch(() => console.log("Audio waiting for user interaction"));
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
    <div dir="rtl" className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans text-right">
      {/* אלמנט אודיו להתראות דחופות */}
      <audio ref={audioRef} src="/emergency.mp3" preload="auto" />

      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 italic">ניהול צי מכולות – ח. סבן</h1>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-1">מערכת שליטה מרכזית לראמי</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="חפש לקוח, כתובת או פרויקט..." 
            className="w-full p-4 pr-12 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* עמודת משימות חדשות / דחופות */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-black text-gray-700 flex items-center gap-2 mb-4">
            <Clock className="text-blue-500" /> בקשות פתוחות מהשטח
          </h2>
          
          {filteredTasks.length === 0 && (
            <div className="bg-white p-10 rounded-[35px] text-center text-gray-400 font-bold border-2 border-dashed border-gray-200">
              אין בקשות חדשות כרגע. השטח שקט.
            </div>
          )}

          {filteredTasks.map((task) => (
            <div key={task.id} className={`bg-white rounded-[35px] p-6 shadow-sm border-r-[12px] transition-all ${
              task.status === 'SCHEDULED_SWAP' ? 'border-red-500 animate-pulse' : 'border-blue-400'
            }`}>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      task.action === 'החלפה' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {task.action}
                    </span>
                    <span className="text-gray-300 text-xs">|</span>
                    <span className="text-gray-500 text-xs font-bold">{task.city || 'ללא עיר'}</span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                    <User size={20} className="text-gray-400" /> {task.client}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-gray-600 font-bold">
                    <MapPin size={18} className="text-red-400" /> {task.address}
                  </div>
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
                    className="bg-gray-50 text-gray-400 p-3 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* עמודת סטטיסטיקה וסיכום רגולטורי */}
        <div className="space-y-6">
          <section className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <AlertTriangle className="text-orange-500" /> חריגות שכירות
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-xs font-black text-red-400 uppercase">חריגה קריטית</p>
                <p className="text-sm font-bold text-red-800">שחר שאול - ויצמן 6</p>
                <p className="text-[10px] text-red-600 mt-1 italic">יום 11 מתוך 10 ימי היתר</p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <p className="text-xs font-black text-orange-400 uppercase">מסיימים מחר</p>
                <p className="text-sm font-bold text-orange-800">בר אודי כהן - הסתדרות 28</p>
              </div>
            </div>
          </section>

          <section className="bg-[#1976D2] rounded-[40px] p-8 shadow-lg text-white">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <RefreshCw /> סיכום יומי
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-3xl">
                <p className="text-2xl font-black">{tasks.length}</p>
                <p className="text-[10px] font-bold opacity-70 italic">סך הזמנות</p>
              </div>
              <div className="bg-white/10 p-4 rounded-3xl">
                <p className="text-2xl font-black">{tasks.filter(t => t.action === 'החלפה').length}</p>
                <p className="text-[10px] font-bold opacity-70 italic">החלפות דחופות</p>
              </div>
            </div>
          </section>

          {/* לינקים מהירים לרשויות */}
          <div className="p-4 bg-gray-100 rounded-[30px] flex flex-col gap-2">
            <p className="text-[10px] font-black text-gray-400 px-2 uppercase tracking-widest">לינקים להיתרים:</p>
            <a href="https://www.herzliya.muni.il" className="text-xs font-bold text-blue-600 hover:underline px-2 italic">עיריית הרצליה</a>
            <a href="https://www.raanana.muni.il" className="text-xs font-bold text-blue-600 hover:underline px-2 italic">עיריית רעננה</a>
          </div>
        </div>
      </main>
    </div>
  );
}
