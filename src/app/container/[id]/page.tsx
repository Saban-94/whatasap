'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Trash2, RefreshCw, ShieldAlert, FileText, ExternalLink, MapPin, CheckCircle, Send, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ShaharContainerPage() {
  const [city, setCity] = useState('');
  const [mode, setMode] = useState<'הצבה' | 'החלפה' | 'פינוי'>('הצבה');
  const [loading, setLoading] = useState(false);

  // מוח רגולטורי מוטמע - מגן קנסות
  const cityRules: any = {
    'הרצליה': {
      warning: "חובה לפנות מכולה עד שישי ב-14:00! הצבה בסופ\"ש גוררת קנס.",
      link: "https://www.herzliya.muni.il/forms/waste-container/"
    },
    'רעננה': {
      warning: "חובה להשאיר 1.30 מ' מדרכה פנויה ולשים מחזירי אור בפינות.",
      link: "https://www.raanana.muni.il/ConstructionAndPlanning/Pages/WasteContainer.aspx"
    },
    'הוד השרון': {
      warning: "חודש ראשון ללא אגרה. מעל גובה 3 מטר חובה להשתמש בשרוול.",
      link: "https://www.hod-hasharon.muni.il/158/"
    }
  };

  const handleOrder = async () => {
    if (!city) return alert("בחר עירייה להמשך");
    setLoading(true);
    try {
      await addDoc(collection(db, "tasks"), {
        client: "שחר שאול",
        project: "גלגל המזלות 73",
        city: city,
        action: mode,
        status: "חדש",
        timestamp: serverTimestamp(),
      });
      alert(`בקשת ${mode} נשלחה! זכור להגיש היתר בלינק המצורף.`);
    } catch (e) { alert("שגיאה בשליחה"); }
    finally { setLoading(false); }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#FDFBF7] pb-32 font-sans text-right">
      <header className="bg-white p-6 rounded-b-[45px] shadow-sm flex justify-between items-center border-b border-gray-100">
        <Link href="/dashboard" className="text-gray-400 p-2"><ArrowRight size={24} /></Link>
        <div className="text-center">
          <h1 className="text-xl font-black text-gray-800">מחלקת מכולות – ח. סבן</h1>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest italic text-center">שירות VIP לשחר שאול</p>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="p-6 space-y-6 text-right">
        {/* בחירת עירייה */}
        <div className="saban-card bg-white border border-gray-100">
          <label className="text-xs font-black text-gray-400 mb-2 block">בחר עיריית פרויקט:</label>
          <select 
            className="w-full p-4 rounded-2xl bg-[#FDFBF7] border-none font-bold text-lg"
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">בחר עיר...</option>
            <option value="הרצליה">הרצליה</option>
            <option value="רעננה">רעננה</option>
            <option value="הוד השרון">הוד השרון</option>
          </select>
        </div>

        {/* מגן קנסות - מופיע רק כשנבחרת עיר */}
        {city && (
          <div className="bg-red-50 p-6 rounded-[35px] border-2 border-red-200 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <ShieldAlert size={24} />
              <span className="font-black">אזהרת פיקוח: {city}</span>
            </div>
            <p className="text-sm text-red-800 font-bold leading-relaxed">{cityRules[city].warning}</p>
            <a href={cityRules[city].link} target="_blank" className="mt-4 flex items-center justify-center gap-2 bg-white text-red-600 p-3 rounded-2xl text-xs font-black shadow-sm">
              <ExternalLink size={16} /> לחץ כאן להגשת היתר עירוני
            </a>
          </div>
        )}

        {/* בחירת פעולה */}
        <div className="grid grid-cols-1 gap-4">
           <button onClick={() => setMode('הצבה')} className={`saban-card flex items-center gap-4 border-2 ${mode === 'הצבה' ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white'}`}>
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Trash2 /></div>
              <div className="text-right"><p className="font-black text-gray-800 text-sm">הצבת מכולה</p><p className="text-[10px] text-gray-400">10 ימי שכירות כלולים</p></div>
           </button>
           <button onClick={() => setMode('החלפה')} className={`saban-card flex items-center gap-4 border-2 ${mode === 'החלפה' ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white'}`}>
              <div className="bg-green-100 p-3 rounded-xl text-green-600"><RefreshCw /></div>
              <div className="text-right"><p className="font-black text-gray-800 text-sm">החלפה (מלאה בטובה)</p><p className="text-[10px] text-gray-400">החלפת מכולה מלאה בריקה</p></div>
           </button>
        </div>

        {/* כפתור שליחה */}
        <button 
          onClick={handleOrder}
          disabled={loading}
          className="btn-huge bg-[#1976D2] text-white shadow-blue-200 mt-4"
        >
          {loading ? "מעבד בקשה..." : <><Send size={22} /> אשר שליחת {mode}</>}
        </button>

        {/* צ'ק ליסט לטופס 4 */}
        <div className="bg-white p-6 rounded-[35px] border border-gray-100">
          <h4 className="font-black text-gray-800 mb-4 flex items-center gap-2 text-sm"><FileText size={18} className="text-blue-500" /> הכנה לטופס 4:</h4>
          <ul className="space-y-3">
             <li className="flex items-center gap-2 text-[11px] font-bold text-gray-500"><CheckCircle size={14} className="text-green-500" /> המערכת שומרת אישורי שקילה אוטומטית</li>
             <li className="flex items-center gap-2 text-[11px] font-bold text-gray-500"><CheckCircle size={14} className="text-green-500" /> סנכרון מול מטמנה מורשת (ח. סבן)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
