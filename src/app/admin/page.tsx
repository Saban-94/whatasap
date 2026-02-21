'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // חיבור אחוד ומהיר
import { 
  Users, Activity, Database, RefreshCw, Layers, 
  ShieldCheck, Brain, Zap, Search, ChevronLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function GlobalAdmin() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isSynced, setIsSynced] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // משיכת נתונים ממאגר הלקוחות המאוחד ב-Supabase
    const fetchCustomers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('last_update', { ascending: false });

      if (!error && data) {
        setCustomers(data);
        setIsSynced(true);
      } else {
        console.error("Sync Error:", error);
        setIsSynced(false);
      }
      setLoading(false);
    };

    fetchCustomers();

    // האזנה לשינויים צולבים בזמן אמת
    const channel = supabase
      .channel('global-admin-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, fetchCustomers)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // פילטר חיפוש חכם
  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.acc_num?.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 lg:p-10 text-right font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header פרימיום - Control Center */}
        <header className="bg-[#0F172A] text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#38bdf8,transparent)]"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="bg-blue-500/20 p-4 rounded-3xl backdrop-blur-md border border-white/10">
                <Layers size={40} className={isSynced ? 'text-blue-400 animate-pulse' : 'text-red-400'} />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">ניהול מוחות סבן</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-blue-300 border-blue-500/30 bg-blue-500/10">
                    סנכרון פעיל: CRM ↔ Whatasap
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono italic">v2.0 מאוחדת</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
              <div className="px-4 py-2 text-center">
                <p className="text-[10px] text-slate-400 uppercase">לקוחות פעילים</p>
                <p className="text-xl font-black">{customers.length}</p>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <RefreshCw className={isSynced ? "animate-spin text-blue-400 mx-4" : "opacity-20 mx-4"} size={24} />
            </div>
          </div>
        </header>

        {/* Toolbar חיפוש וכלים */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="חפש לקוח, ח"פ או מספר חשבון..." 
              className="pr-12 h-14 rounded-2xl border-none shadow-sm bg-white text-lg focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 mr-auto">
            <Button variant="outline" className="rounded-xl h-14 px-6 bg-white border-none shadow-sm font-bold gap-2">
              <Database size={18} /> גיבוי מאגר
            </Button>
            <Button className="rounded-xl h-14 px-6 bg-blue-600 hover:bg-blue-700 font-bold gap-2">
              <Zap size={18} /> הרץ ניתוח מוח
            </Button>
          </div>
        </div>

        {/* גריד לקוחות - תצוגת כרטיסים חכמה */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredCustomers.map((c, index) => (
              <motion.div 
                key={c.id} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[40px] shadow-sm hover:shadow-xl transition-all border border-slate-100 group overflow-hidden"
              >
                {/* Header כרטיס */}
                <div className="p-6 pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                       <img 
                        src={c.profile_image || 'https://via.placeholder.com/150'} 
                        className="w-16 h-16 rounded-3xl border-2 border-slate-50 object-cover shadow-inner group-hover:scale-105 transition-transform" 
                      />
                      <div className="absolute -bottom-1 -left-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 leading-tight">{c.name}</h2>
                      <p className="text-xs font-mono text-blue-600 font-bold">#ACC-{c.acc_num}</p>
                    </div>
                  </div>
                  <ChevronLeft className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>

                {/* Content - ניתוח "המוח" */}
                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                      <Brain size={14} /> תובנת AI סבן
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      {c.ai_insight || "המערכת מנתחת היסטוריית רכישות... זיהוי פוטנציאל לחידוש מלאי חומרי בניין בסוף החודש."}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">פעילות אחרונה</span>
                      <span className="text-xs font-bold text-slate-700">לפני 4 דקות</span>
                    </div>
                    <div className="flex -space-x-2 space-x-reverse">
                      <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600"><Users size={14} /></div>
                      <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-green-600"><ShieldCheck size={14} /></div>
                    </div>
                  </div>
                </div>

                {/* Footer כרטיס - פעולות מהירות */}
                <div className="bg-slate-50/50 p-4 flex gap-2 border-t border-slate-50">
                   <Button variant="ghost" className="flex-1 rounded-2xl text-xs font-bold hover:bg-white">פרופיל CRM</Button>
                   <Button variant="ghost" className="flex-1 rounded-2xl text-xs font-bold hover:bg-white text-blue-600">הצלבת נתונים</Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
