'use client';

import React, { useState, useEffect } from 'react';
import { SABAN_AI_STUDIO_CONFIG } from '@/lib/saban-ai-training';
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  Brain, 
  ShieldCheck, 
  Users, 
  MessageSquare, 
  Database, 
  TrendingUp 
} from 'lucide-react';

export default function SabanAIStudio() {
  const [config, setConfig] = useState(SABAN_AI_STUDIO_CONFIG);
  const [isSaving, setIsSaving] = useState(false);

  // פונקציה לשמירת החוקים המעודכנים
  const handleSave = async () => {
    setIsSaving(true);
    // כאן תתבצע קריאת API לשמירת ה-config החדש ב-DB או בשרת
    setTimeout(() => {
      setIsSaving(false);
      alert('החוקים והאימון נשמרו בהצלחה!');
    }, 1000);
  };

  return (
    <div className="p-8 bg-[#0b141a] min-h-screen text-white font-sans" dir="rtl">
      {/* Header */}
      <header className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#00a884] flex items-center gap-3">
            <Brain size={32} /> SABAN AI STUDIO
          </h1>
          <p className="text-gray-400 mt-2">מרכז שליטה ואימון למוח הלוגיסטי של סבן הנדסה</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#00a884] hover:bg-[#06cf9c] px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#00a884]/20 disabled:opacity-50"
        >
          {isSaving ? 'שומר...' : <><Save size={20} /> שמור חוקים חדשים</>}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* כרטיסיית חוקי לוגיסטיקה (Logistics Rules) */}
        <div className="bg-[#111b21] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-orange-400">
            <ShieldCheck /> חוקי ברזל (Logistics)
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#202c33] p-4 rounded-lg">
              <span className="text-sm">גובה מנוף לאישור ראמי</span>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={config.logistics_rules.requires_rami_approval}
                  onChange={(e) => setConfig({...config, logistics_rules: {...config.logistics_rules, requires_rami_approval: parseInt(e.target.value)}})}
                  className="bg-transparent border-b border-[#00a884] w-12 text-center font-bold outline-none"
                />
                <span className="text-xs text-gray-500">מטר</span>
              </div>
            </div>
            <div className="flex justify-between items-center bg-[#202c33] p-4 rounded-lg">
              <span className="text-sm">באפר זמן פריקה חריג</span>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={config.logistics_rules.standard_delivery_buffer}
                  onChange={(e) => setConfig({...config, logistics_rules: {...config.logistics_rules, standard_delivery_buffer: parseInt(e.target.value)}})}
                  className="bg-transparent border-b border-[#00a884] w-12 text-center font-bold outline-none"
                />
                <span className="text-xs text-gray-500">דקות</span>
              </div>
            </div>
          </div>
        </div>

        {/* כרטיסיית אימון שפה (NLP & Training) */}
        <div className="bg-[#111b21] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#00a884]">
            <Brain /> אימון שפה וזהות (NLP)
          </h3>
          <div className="space-y-4">
            <div className="bg-[#202c33] p-4 rounded-lg">
              <label className="text-xs text-gray-500 block mb-2 font-bold">זהות המערכת (Identity)</label>
              <textarea 
                className="bg-transparent w-full outline-none text-sm resize-none h-24 leading-relaxed"
                value={config.training_instructions.identity}
                onChange={(e) => setConfig({...config, training_instructions: {...config.training_instructions, identity: e.target.value}})}
              />
            </div>
            <div className="bg-[#202c33] p-4 rounded-lg">
              <label className="text-xs text-gray-500 block mb-2 font-bold">הנחיות מכירה משלימה (Upsell)</label>
              <textarea 
                className="bg-transparent w-full outline-none text-sm resize-none h-16"
                value={config.training_instructions.upsell}
                onChange={(e) => setConfig({...config, training_instructions: {...config.training_instructions, upsell: e.target.value}})}
              />
            </div>
          </div>
        </div>

        {/* כרטיסיית אימון מבוסס היסטוריה (WhatsApp Data Mining) */}
        <div className="lg:col-span-2 bg-[#111b21] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-blue-400">
              <Database size={24} /> אימון מבוסס היסטוריית ווטסאפ (Data)
            </h3>
            <Badge className="bg-blue-600">קובץ גיבוי פעיל: הזמנות_ח_סבן.csv</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#202c33] p-5 rounded-xl border-r-4 border-blue-500">
              <div className="flex justify-between items-center mb-3">
                <Users className="text-blue-500" />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active Profiles</span>
              </div>
              <p className="text-3xl font-black">12</p>
              <p className="text-xs text-gray-400 mt-2">לקוחות מזוהים מההיסטוריה (זאיד, בר, לירן)</p>
            </div>

            <div className="bg-[#202c33] p-5 rounded-xl border-r-4 border-green-500">
              <div className="flex justify-between items-center mb-3">
                <TrendingUp className="text-green-500" />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">NLP Recognition</span>
              </div>
              <p className="text-3xl font-black">94%</p>
              <p className="text-xs text-gray-400 mt-2">דיוק בזיהוי סלנג מקצועי (שפכטל אמרקאי, פיבה)</p>
            </div>

            <div className="bg-[#202c33] p-5 rounded-xl border-r-4 border-orange-500">
              <div className="flex justify-between items-center mb-3">
                <MessageSquare className="text-orange-500" />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Order Habits</span>
              </div>
              <p className="text-3xl font-black">AUTO</p>
              <p className="text-xs text-gray-400 mt-2">זיהוי אוטומטי של "תוספת להזמנה" פעיל</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-sm transition-all">
              סרוק היסטוריה חדשה ועדכן CRM
            </button>
            <button className="flex-1 bg-[#2a3942] hover:bg-[#374954] py-3 rounded-xl font-bold text-sm border border-gray-700 transition-all">
              ייצא פרופילים ומוצרים מועדפים
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
