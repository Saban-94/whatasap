'use client';
import React, { useState } from 'react';
import { SABAN_AI_STUDIO_CONFIG } from '@/lib/saban-ai-training';
import { Badge } from "@/components/ui/badge";
import { Save, Brain, ShieldCheck, Users } from 'lucide-react';

export default function SabanAIStudio() {
  const [config, setConfig] = useState(SABAN_AI_STUDIO_CONFIG);

  return (
    <div className="p-8 bg-[#0b141a] min-h-screen text-white font-sans" dir="rtl">
      <header className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#00a884] flex items-center gap-3">
            <Brain size={32} /> SABAN AI STUDIO
          </h1>
          <p className="text-gray-400 mt-2">מרכז שליטה ואימון למוח הלוגיסטי של סבן הנדסה</p>
        </div>
        <button className="bg-[#00a884] hover:bg-[#06cf9c] px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#00a884]/20">
          <Save size={20} /> שמור חוקים חדשים
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* כרטיסיית חוקי לוגיסטיקה */}
        <div className="bg-[#111b21] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-orange-400">
            <ShieldCheck /> חוקי ברזל (Logistics)
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#202c33] p-4 rounded-lg">
              <span>גובה מנוף לאישור ראמי</span>
              <input 
                type="number" 
                value={config.logistics_rules.requires_rami_approval}
                className="bg-transparent border-b border-[#00a884] w-12 text-center font-bold outline-none"
              />
            </div>
            <div className="flex justify-between items-center bg-[#202c33] p-4 rounded-lg">
              <span>באפר זמן פריקה (דק')</span>
              <input 
                type="number" 
                value={config.logistics_rules.standard_delivery_buffer}
                className="bg-transparent border-b border-[#00a884] w-12 text-center font-bold outline-none"
              />
            </div>
          </div>
        </div>
// תוספת לרכיב ה-SabanAIStudio הקיים
<div className="grid grid-cols-1 gap-8 mt-8">
  <div className="bg-[#111b21] p-6 rounded-2xl border border-gray-800 shadow-xl">
    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-400">
      <Users /> אימון מבוסס היסטוריית ווטסאפ (Data Mining)
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-[#202c33] p-4 rounded-lg border-r-4 border-blue-500">
        <h4 className="font-bold text-sm">פרופילי לקוח שחולצו</h4>
        <p className="text-2xl font-black mt-2">12</p>
        <p className="text-xs text-gray-500">מתוך קובץ הגיבוי האחרון</p>
      </div>
      <div className="bg-[#202c33] p-4 rounded-lg border-r-4 border-green-500">
        <h4 className="font-bold text-sm">זיהוי מוצרים חכם (NLP)</h4>
        <p className="text-xs text-gray-400 mt-2">ה-AI למד לזהות: "שפכטל אמרקאי", "פיבה קרטון", "מכשיר לסיקה נקניק"</p>
      </div>
      <div className="bg-[#202c33] p-4 rounded-lg border-r-4 border-orange-500">
        <h4 className="font-bold text-sm">התראת "תוספת להזמנה"</h4>
        <p className="text-xs text-gray-400 mt-2">מופעל אוטומטית כאשר לקוח שולח הודעה נוספת תוך 30 דקות</p>
      </div>
    </div>
    
    <div className="mt-6 flex gap-4">
      <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold">
        סרוק מחדש קובץ גיבוי
      </button>
      <button className="bg-[#202c33] border border-gray-700 px-4 py-2 rounded-lg text-sm font-bold">
        ייצא פרופילים ל-CRM
      </button>
    </div>
  </div>
</div>
        {/* כרטיסיית אימון NLP */}
        <div className="bg-[#111b21] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#00a884]">
            <Brain /> אימון שפה (Training)
          </h3>
          <div className="space-y-4">
            <div className="bg-[#202c33] p-4 rounded-lg">
              <label className="text-xs text-gray-500 block mb-2">זהות המערכת</label>
              <textarea 
                className="bg-transparent w-full outline-none text-sm resize-none h-20"
                value={config.training_instructions.identity}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
