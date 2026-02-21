'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, Layers, RefreshCw, MessageSquare, 
  Truck, Brain, MapPin, Phone, ShieldCheck, Search
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalAdmin() {
  const [activeTab, setActiveTab] = useState<'drivers' | 'customers'>('drivers');
  const [customers, setCustomers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isSynced, setIsSynced] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data: custData } = await supabase.from('customers').select('*').order('name');
    const { data: drivData } = await supabase.from('drivers').select('*').order('full_name');
    setCustomers(custData || []);
    setDrivers(drivData || []);
    setIsSynced(true);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sendWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone?.replace(/\D/g, '');
    if (!cleanPhone) return alert("אין מספר טלפון תקין");
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent('היי ' + name + ', יש משימה חדשה לבדיקתך.')}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 text-right font-sans" dir="rtl">
      {/* Header - Control Center */}
      <header className="bg-slate-900 text-white p-6 shadow-2xl flex justify-between items-center border-b-4 border-blue-600">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500/20 p-3 rounded-2xl backdrop-blur-sm">
            <Layers size={32} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tight">SABAN ADMIN CENTER</h1>
            <p className="text-[10px] text-blue-300 font-bold tracking-widest uppercase">מערכת צולבת: נהגים ↔ לקוחות ↔ CRM</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            {isSynced && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold">LIVE SYNC ON</span>}
            <RefreshCw className={loading ? "animate-spin text-blue-400" : "text-slate-500"} size={20} onClick={fetchData} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
        
        {/* Custom Tabs Navigation */}
        <div className="flex bg-white p-1.5 rounded-2xl border shadow-sm max-w-md mx-auto">
          <button 
            onClick={() => setActiveTab('drivers')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'drivers' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Truck size={20} /> ניטור נהגים
          </button>
          <button 
            onClick={() => setActiveTab('customers')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'customers' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Users size={20} /> המוח והלקוחות
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'drivers' ? (
            <motion.div 
              key="drivers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {drivers.map(driver => (
                <div key={driver.id} className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-100 hover:border-blue-200 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black ${driver.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {driver.status === 'active' ? '● זמין לעבודה' : '● בביצוע משימה'}
                    </span>
                    <div className="text-left">
                      <h3 className="font-black text-slate-800 text-lg">{driver.full_name}</h3>
                      <p className="text-xs text-slate-400 font-bold">{driver.vehicle_type || 'משאית סבן'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-700">{driver.location || 'בדרך ליעד'}</span>
                      <MapPin size={16} className="text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono">{new Date(driver.last_update).toLocaleTimeString('he-IL')}</span>
                      <span className="font-bold uppercase tracking-tighter text-[9px]">עדכון איתורן אחרון</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => sendWhatsApp(driver.phone, driver.full_name)}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl font-bold flex items-center justify-center gap-2 py-4 shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                  >
                    <MessageSquare size={20} />
                    שגר הודעת וואטסאפ
                  </button>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="customers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {customers.map(c => (
                <div key={c.id} className="bg-white p-6 rounded-[35px] shadow-sm border-r-[12px] border-blue-900 flex items-center gap-5">
                  <div className="bg-blue-50 p-4 rounded-3xl text-blue-900 shadow-inner">
                    <Brain size={35} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-slate-800">{c.name}</h2>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-500 border">לקוח: {c.acc_num}</span>
                      <span className="text-[10px] font-bold bg-yellow-100 px-2 py-1 rounded-md text-yellow-700">הצלבת מוח: חידוש מלאי</span>
                    </div>
                  </div>
                  <button className="bg-slate-100 p-3 rounded-2xl text-slate-400 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                    <Phone size={20} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
