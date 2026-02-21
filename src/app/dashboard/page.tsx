'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { 
  Truck, Package, MapPin, Clock, CheckCircle2, 
  AlertCircle, MessageSquare, Bell, Sun, Coffee, Moon 
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

export default function SabanLiveDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [greeting, setGreeting] = useState({ text: '', sub: '' });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    // משיכת משימות פעילות (לא כולל מה שהסתיים)
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .neq('status', 'completed')
      .order('created_at', { ascending: false });

    // משיכת נהגים
    const { data: driversData } = await supabase.from('drivers').select('*');

    setTasks(tasksData || []);
    setDrivers(driversData || []);
    setLoading(false);
  };

  useEffect(() => {
    // הגדרת ברכה לפי שעה
    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: 'בוקר טוב שחר שאול', sub: 'הזמנה שתשלח עכשיו תגיע עוד היום!' });
    else if (hour < 18) setGreeting({ text: 'צהריים טובים שחר', sub: 'כל הנהגים בתנועה?' });
    else setGreeting({ text: 'ערב טוב שחר', sub: 'מסכמים יום עבודה מוצלח.' });

    fetchData();

    // האזנה חיה לשינויים ב-tasks (זה הקסם!)
    const channel = supabase.channel('dashboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-[#F8FAFC] pb-32 text-right font-sans">
      {/* Header זהה לתמונה ששלחת */}
      <header className="p-8 bg-white rounded-b-[50px] shadow-sm border-b border-slate-100">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{greeting.text} ☀️</h1>
            <p className="text-sm text-slate-400 mt-1 italic">{greeting.sub}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl text-slate-400"><Bell size={24} /></div>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto space-y-8">
        
        {/* סקשן משימות חיות - כאן יופיע מה ששלחת ב-/order */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Package className="text-blue-600" size={20} /> משימות חיות במערכת
            </h2>
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold">LIVE</span>
          </div>

          <AnimatePresence>
            {tasks.length === 0 ? (
              <p className="text-center text-slate-400 py-10 text-sm">אין משימות פתוחות כרגע...</p>
            ) : (
              tasks.map((task) => (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-5 rounded-[35px] shadow-md border border-slate-50 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-800">{task.client_name}</h3>
                      <div className="flex items-center gap-1 text-blue-600 text-xs font-bold">
                        <Truck size={14} /> {task.item}
                      </div>
                    </div>
                    <Badge color={task.status} />
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-sm mb-4 bg-slate-50 p-3 rounded-2xl">
                    <MapPin size={16} className="text-red-400" />
                    <span className="font-medium">{task.location}</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <div className="flex items-center gap-1">
                      <Clock size={12} /> {new Date(task.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {task.ai_insight && (
                      <div className="flex items-center gap-1 text-purple-500 bg-purple-50 px-2 py-1 rounded-lg">
                        <AlertCircle size={12} /> {task.ai_insight}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </section>

        {/* שאר הכפתורים שראינו בתמונה (מכולה, חומרי בניין וכו') */}
        <div className="grid grid-cols-2 gap-4 pt-4">
           {/* כפתורים זהים לעיצוב בתמונה */}
        </div>
      </main>
    </div>
  );
}

// רכיב עזר לסטטוס
function Badge({ color }: { color: string }) {
  const styles: any = {
    pending: "bg-orange-100 text-orange-600",
    in_progress: "bg-blue-100 text-blue-600",
    completed: "bg-green-100 text-green-600"
  };
  const text: any = { pending: "ממתין", in_progress: "בביצוע", completed: "בוצע" };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${styles[color] || styles.pending}`}>
      {text[color] || "בבדיקה"}
    </span>
  );
}
