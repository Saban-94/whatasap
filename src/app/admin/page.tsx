'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, Layers, RefreshCw, MessageSquare, 
  Truck, Brain, Search, MapPin, Phone, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GlobalAdmin() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isSynced, setIsSynced] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // פונקציה מאוחדת למשיכת כל הנתונים (נהגים + לקוחות)
  const fetchData = async () => {
    setLoading(true);
    
    // משיכת לקוחות
    const { data: custData } = await supabase.from('customers').select('*').order('name');
    // משיכת נהגים (הכלי החדש!)
    const { data: drivData } = await supabase.from('drivers').select('*').order('full_name');

    setCustomers(custData || []);
    setDrivers(drivData || []);
    setIsSynced(true);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // האזנה לשינויים בזמן אמת לשני המאגרים
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
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8 text-right font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header - מרכז בקרה מאוחד */}
        <header className="bg-slate-900 text-white p-6 rounded-[35px] shadow-xl flex justify-between items-center border-b-4 border-blue-500">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-2xl backdrop-blur-sm">
              <Layers size={32} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic">SABAN CONTROL CENTER</h1>
              <p className="text-[10px] text-blue-300 font-bold tracking-widest uppercase">ניהול צולב: נהגים ↔ לקוחות ↔ CRM</p>
            </div>
          </div>
          <RefreshCw className={isSynced ? "animate-spin text-blue-400" : ""} size={20} />
        </header>

        <Tabs defaultValue="drivers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white border rounded-2xl p-1 h-16 shadow-sm">
            <TabsTrigger value="drivers" className="rounded-xl font-bold text-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <Truck className="ml-2" size={20} /> ניטור נהגים (חדש)
            </TabsTrigger>
            <TabsTrigger value="customers" className="rounded-xl font-bold text-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
              <Users className="ml-2" size={20} /> ניהול לקוחות ומוח
            </TabsTrigger>
          </TabsList>

          {/* טאב נהגים - הכלי החדש שהטמענו */}
          <TabsContent value="drivers">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.map(driver => (
                <motion.div key={driver.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-5 rounded-[30px] shadow-sm border border-slate-100 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <Badge className={driver.status === 'active' ? 'bg-green-100 text-green-600 border-none' : 'bg-orange-100 text-orange-600 border-none'}>
                      {driver.status === 'active' ? '● פנוי' : '● עסוק'}
                    </Badge>
                    <div className="text-left">
                      <h3 className="font-black text-slate-800">{driver.full_name}</h3>
                      <p className="text-[11px] text-slate-400">{driver.vehicle_type}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-5 bg-slate-50 p-3 rounded-2xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">{driver.location || 'לא ידוע'}</span>
                      <MapPin size={14} className="text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{new Date(driver.last_update).toLocaleTimeString('he-IL')}</span>
                      <span className="font-medium">עדכון אחרון</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => sendWhatsApp(driver.phone, driver.full_name)}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl font-bold gap-2 py-6"
                  >
                    <MessageSquare size={18} /> וואטסאפ מהיר
                  </Button>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* טאב לקוחות - המוח וההצלבה */}
          <TabsContent value="customers">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customers.map(c => (
                <div key={c.id} className="bg-white p-6 rounded-[35px] shadow-sm border-r-8 border-blue-900 flex gap-4 items-center">
                  <div className="bg-slate-100 p-4 rounded-3xl text-blue-900"><Brain size={32} /></div>
                  <div className="flex-1">
                    <h2 className="text-xl font-black">{c.name}</h2>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">לקוח: {c.acc_num}</Badge>
                      <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-none">זיהוי מוח: פוטנציאל הזמנה</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" className="rounded-full w-12 h-12 p-0"><Phone size={20} className="text-slate-400" /></Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
