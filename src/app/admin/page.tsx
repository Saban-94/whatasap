'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, Activity, Database, RefreshCw, Layers, 
  ShieldCheck, Brain, Zap, Search, ChevronLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function GlobalAdmin() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isSynced, setIsSynced] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    const channel = supabase
      .channel('global-admin-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, fetchCustomers)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.acc_num?.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 lg:p-10 text-right font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="bg-[#0F172A] text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
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
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
              <div className="px-4 py-2 text-center">
                <p className="text-[10px] text-slate-400 uppercase">לקוחות פעילים</p>
                <p className="text-xl font-black">{customers.length}</p>
              </div>
              <RefreshCw className={isSynced ? "animate-spin text-blue-400 mx-4" : "opacity-20 mx-4"} size={24} />
            </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="חפש לקוח, ח'פ או מספר חשבון..." 
              className="pr-12 h-14 rounded-2xl border-none shadow-sm bg-white text-lg focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredCustomers.map((c, index) => (
              <motion.div 
                key={c.id} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[40px] shadow-sm hover:shadow-xl transition-all border border-slate-100 group overflow-hidden"
              >
                <div className="p-6 pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={c.profile_image || 'https://via.placeholder.com/150'} 
                      className="w-16 h-16 rounded-3xl border-2 border-slate-50 object-cover shadow-inner" 
                    />
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 leading-tight">{c.name}</h2>
                      <p className="text-xs font-mono text-blue-600 font-bold">#ACC-{c.acc_num}</p>
                    </div>
                  </div>
                  <ChevronLeft className="text-slate-300 group-hover:text-blue-500" />
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                      <Brain size={14} /> תובנת AI סבן
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      {c.ai_insight || "המערכת מנתחת היסטוריית רכישות..."}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
