'use client';
import React, { useState, useEffect, useRef } from 'react';
import { db } from "@/lib/firebase";
import { 
  collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp 
} from "firebase/firestore";
import { 
  Truck, Play, Eye, RefreshCw, Trash2, MapPin, 
  AlertTriangle, BellRing, CheckCircle, Clock 
} from 'lucide-react';

export default function RamiEmergencyDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // האזנה לשינויים והפעלת אזעקה
  useEffect(() => {
    const q = query(collection(db, "container_contracts"), orderBy("created_at", "desc"));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const currentTasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // בדיקה אם יש בקשת החלפה חדשה שדורשת "צעקה"
      const hasEmergency = currentTasks.some(t => t.status === "SCHEDULED_SWAP");
      if (hasEmergency && audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio block by browser"));
      }
      
      setTasks(currentTasks);
    });
    
    return () => unsub();
  }, []);

  const confirmSwap = async (taskId: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, "container_contracts", taskId);
      await updateDoc(docRef, {
        status: "IN_FIELD",
        current_day: 1, // איפוס מונה ימים
        last_swap_at: serverTimestamp(),
        requested_arrival_time: null // ניקוי הבקשה
      });
      alert("החלפה אושרה! הטיימר של הלקוח התחיל מחדש.");
    } catch (err) {
      alert("שגיאה באישור ההחלפה.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#F0F2F5] p-8 font-sans text-right">
      {/* אלמנט אודיו נסתר לאזעקה */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />

      <header className="flex justify-between items-center mb-12 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-4xl font-black text-gray-900 italic uppercase">קוקפיט לוגיסטי - ח. סבן</h1>
          <p className="text-blue-600 font-bold text-xs tracking-[0.3em]">REAL-TIME FLEET MONITORING</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black flex items-center gap-2 animate-pulse">
                <AlertTriangle size={20} />
                <span>{tasks.filter(t => t.status === "SCHEDULED_SWAP").length} בקשות דחופות</span>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tasks.map((task) => {
          const isEmergency = task.status === "SCHEDULED_SWAP";
          
          return (
            <div 
              key={task.id} 
              className={`relative bg-white rounded-[55px] p-8 transition-all duration-500 shadow-xl border-[4px] 
                ${isEmergency ? 'border-red-500 shadow-red-200 animate-bounce-subtle' : 'border-transparent'}`}
            >
              {/* תגית "צעקה" ויזואלית */}
              {isEmergency && (
                <div className="absolute -top-4 -right-4 bg-red-600 text-white p-4 rounded-full shadow-2xl animate-spin-slow">
                  <BellRing size={24} />
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-none">{task.customer_name}</h3>
                  <p className="text-gray-400 font-bold text-sm mt-2 flex items-center gap-1">
                    <MapPin size={14} /> {task.address}
                  </p>
                </div>
                <div className={`p-3 rounded-2xl ${task.last_seen ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-200'}`}>
                  <Eye size={24} />
                </div>
              </div>

              {/* אזור הדרישה של הלקוח */}
              {isEmergency ? (
                <div className="bg-red-50 rounded-[35px] p-6 mb-6 border-2 border-red-100">
                  <div className="flex items-center gap-3 text-red-700 font-black mb-2">
                    <Truck size={24} />
                    <span>דרישה להחלפה דחופה!</span>
                  </div>
                  <p className="text-sm font-bold text-red-600 italic">שעת הגעה מבוקשת: {task.requested_arrival_time || "בהקדם"}</p>
                  
                  <button 
                    onClick={() => confirmSwap(task.id)}
                    className="w-full bg-red-600 text-white py-5 rounded-[25px] font-black text-lg mt-6 shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} /> אשר שליחת נהג
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-[35px] p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">סטטוס ימים</span>
                    <span className="text-2xl font-black italic text-gray-800">{task.current_day || 0}/10</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${(task.current_day / 10) * 100}%` }}></div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-auto">
                <button className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase italic tracking-tighter">
                  פרטי חוזה
                </button>
                <button className="bg-white border-2 border-gray-100 p-4 rounded-2xl text-gray-400 hover:text-blue-600 transition-colors">
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
