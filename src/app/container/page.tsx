'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { Trash2, RefreshCw, LogOut, Plus, MapPin, Calendar, Clock, Send, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ContainerPage() {
  const [mode, setMode] = useState<'הצבה' | 'החלפה' | 'הוצאה'>('הצבה');
  const [loading, setLoading] = useState(false);
  const [userName] = useState('שחר שאול'); // המוח יזהה לפי ה-Login
  const [projectAddress, setProjectAddress] = useState('ויצמן 5, רעננה');

  // פונקציית שליחה שסוגרת מעגל מול ה-365 וה-Firebase
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. שמירה ב-Firebase - פותח טיימר שכירות של 10 ימים
      await addDoc(collection(db, "tasks"), {
        client: userName,
        address: projectAddress,
        item: "מכולה 8 קוב",
        action: mode,
        status: "חדש",
        timestamp: serverTimestamp(),
        expiryDate: mode === 'הוצאה' ? null : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      });

      // 2. שליחה ל-365 (Power Automate)
      const flowUrl = "https://defaultae1f0547569d471693f95b9524aa2b.31.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/0828f74ee7e44228b96c93eab728f280/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=lgdg1Hw--Z35PWOK6per2K02fql76m_WslheLXJL-eA";
      
      await fetch(flowUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: userName,
          action: `מכולה - ${mode}`,
          address: projectAddress,
          details: `פעולת ${mode} למכולה 8 קוב`
        })
      });

      alert(`בקשת ${mode} נשלחה בהצלחה! ראמי יעקוב אחרי הביצוע.`);
    } catch (err) {
      alert("שגיאה בתקשורת. נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pb-24 font-sans text-right">
      {/* Header */}
      <header className="bg-white p-6 rounded-b-[40px] shadow-sm flex justify-between items-center border-b border-gray-100">
        <Link href="/dashboard" className="text-gray-400"><ArrowRight size={24} /></Link>
        <h1 className="text-xl font-black text-gray-800">ניהול מכולה - ח. סבן</h1>
        <div className="w-6"></div>
      </header>

      <main className="p-6 space-y-6">
        {/* בחירת סוג פעולה - כפתורי ענק */}
        <div className="grid grid-cols-1 gap-4">
          <ActionButton 
            active={mode === 'הצבה'} 
            onClick={() => setMode('הצבה')}
            icon={<Plus size={28} />}
            title="הצבת מכולה"
            desc="מכולה חדשה ל-10 ימי שכירות"
          />
          <ActionButton 
            active={mode === 'החלפה'} 
            onClick={() => setMode('החלפה')}
            icon={<RefreshCw size={28} />}
            title="החלפה (מלאה בטובה)"
            desc="לוקחים מלאה ומביאים ריקה"
          />
          <ActionButton 
            active={mode === 'הוצאה'} 
            onClick={() => setMode('הוצאה')}
            icon={<LogOut size={28} />}
            title="הוצאת מכולה"
            desc="סיום עבודה ופינוי מהאתר"
          />
        </div>

        {/* פרטי האתר */}
        <section className="saban-card bg-white space-y-4">
          <div className="flex items-center gap-3 text-gray-700">
            <MapPin className="text-blue-500" size={20} />
            <input 
              className="flex-1 bg-transparent border-none font-bold focus:ring-0" 
              value={projectAddress}
              onChange={(e) => setProjectAddress(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 text-gray-400 border-t pt-4 border-gray-50 text-sm">
            <Calendar size={18} />
            <span>שכירות סטנדרטית: 10 ימים</span>
          </div>
        </section>

        {/* כפתור שליחה */}
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className={`btn-huge shadow-xl text-white ${mode === 'הוצאה' ? 'bg-orange-500' : 'bg-[#1976D2]'}`}
        >
          {loading ? "מעבד בקשה..." : <><Send size={24} /> אשר שליחת {mode}</>}
        </button>

        {/* מידע טכני מהמוח 🧠 */}
        <div className="bg-blue-50 p-5 rounded-[30px] border border-blue-100">
           <p className="text-xs font-black text-blue-800 mb-1 flex items-center gap-1"><Info size={14} /> מידע לוגיסטי:</p>
           <p className="text-xs text-blue-600 leading-relaxed">
             מכולת פסולת בניין 8 קוב. חריגה מעל 10 ימים תגרור עלות יומית נוספת. 
             במידה והמכולה מלאה בחומרים אסורים (צמיגים, חומרים מסוכנים), יחול חיוב נוסף.
           </p>
        </div>
      </main>
    </div>
  );
}

// רכיב כפתור פעולה פנימי
function ActionButton({ active, onClick, icon, title, desc }: any) {
  return (
    <button 
      onClick={onClick}
      className={`saban-card flex items-center gap-5 transition-all border-2 text-right ${
        active ? 'border-[#1976D2] bg-blue-50' : 'border-gray-50 bg-white'
      }`}
    >
      <div className={`p-4 rounded-2xl ${active ? 'bg-[#1976D2] text-white' : 'bg-gray-100 text-gray-400'}`}>
        {icon}
      </div>
      <div>
        <h4 className={`font-black ${active ? 'text-[#1976D2]' : 'text-gray-800'}`}>{title}</h4>
        <p className="text-xs text-gray-400 font-medium">{desc}</p>
      </div>
    </button>
  );
}

function Info({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
    </svg>
  );
}
